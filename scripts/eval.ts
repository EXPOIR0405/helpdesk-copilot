import { mkdir, readFile, writeFile } from "node:fs/promises";
import { config } from "../src/config.ts";
import type { Answer, AnswerStatus } from "../src/core/types.ts";
import { memoryUnansweredLog } from "../src/core/unanswered.ts";
import { createRuntime } from "../src/runtime.ts";

type EvalQuestion = {
  id: string;
  type: string;
  question: string;
  expected_status: AnswerStatus;
  expected_docs: string[];
  note: string;
};

const questions: EvalQuestion[] = (await readFile("data/synthetic/eval/questions.jsonl", "utf8"))
  .split("\n")
  .filter(Boolean)
  .map((l) => JSON.parse(l));

// 평가 질문이 운영 미답변 리포트에 섞이지 않게 메모리 로그 사용
const { copilot } = await createRuntime({ log: memoryUnansweredLog() });

const results: { q: EvalQuestion; a: Answer }[] = [];
const queue = [...questions];
await Promise.all(
  Array.from({ length: 4 }, async () => {
    for (let q = queue.shift(); q; q = queue.shift()) results.push({ q, a: await copilot.ask(q.question) });
  }),
);
results.sort((x, y) => x.q.id.localeCompare(y.q.id));

const pct = (n: number, d: number) => (d ? `${((n / d) * 100).toFixed(1)}% (${n}/${d})` : "-");
const withDocs = results.filter((r) => r.q.expected_docs.length);
const retrievalHits = withDocs.filter((r) => r.a.trace.retrieved.some((h) => r.q.expected_docs.includes(h.docId)));
const statusOk = results.filter((r) => r.a.status === r.q.expected_status);
const shouldNotAnswer = results.filter((r) => r.q.expected_status !== "answered");
const wrongAnswers = shouldNotAnswer.filter((r) => r.a.status === "answered");
const shouldAnswer = results.filter((r) => r.q.expected_status === "answered");
const overRefusals = shouldAnswer.filter((r) => r.a.status === "unanswerable");

console.log(`모델: ${config.models.generation} / ${config.models.embedding}`);
console.log(`임계값: minScore ${config.retrieval.minScore}, high ${config.confidence.high}, medium ${config.confidence.medium}\n`);
console.log(`| 지표 | 값 |\n|---|---|`);
console.log(`| 검색 적중률 (top ${config.retrieval.topK}) | ${pct(retrievalHits.length, withDocs.length)} |`);
console.log(`| 상태 정확도 | ${pct(statusOk.length, results.length)} |`);
console.log(`| 잘못된 답변률 (답하면 안 되는 질문에 답함) | ${pct(wrongAnswers.length, shouldNotAnswer.length)} |`);
console.log(`| 과잉 거절률 (답할 수 있는데 거절) | ${pct(overRefusals.length, shouldAnswer.length)} |`);

const byType = new Map<string, { ok: number; n: number }>();
for (const r of results) {
  const t = byType.get(r.q.type) ?? { ok: 0, n: 0 };
  t.n++;
  if (r.a.status === r.q.expected_status) t.ok++;
  byType.set(r.q.type, t);
}
console.log(`\n| 유형 | 상태 정확도 |\n|---|---|`);
for (const [type, t] of byType) console.log(`| ${type} | ${pct(t.ok, t.n)} |`);

const misses = results.filter((r) => r.a.status !== r.q.expected_status);
if (misses.length) {
  console.log(`\n틀린 질문`);
  for (const { q, a } of misses) {
    console.log(`- ${q.id} [${q.type}] ${q.question}`);
    console.log(`  기대 ${q.expected_status} → 실제 ${a.status} (확신도 ${a.confidence}, 최고 유사도 ${a.trace.topScore.toFixed(3)})`);
  }
}

await mkdir("data/logs", { recursive: true });
const out = `data/logs/eval-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
await writeFile(out, JSON.stringify(results, null, 2));
console.log(`\n상세 결과: ${out}`);
