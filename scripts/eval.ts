import { mkdir, readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { config } from "../src/config.ts";
import { PRICES_CHECKED_AT, modelSpec } from "../src/core/models.ts";
import { summarizeEval, summarizeUsage, type EvalRow } from "../src/core/report.ts";
import type { Answer, Usage } from "../src/core/types.ts";
import { memoryUnansweredLog } from "../src/core/unanswered.ts";
import { createRuntime } from "../src/runtime.ts";

// npm run eval -- --model gemini-3.8-flash --concurrency 2
const { values: args } = parseArgs({
  options: {
    model: { type: "string", default: config.models.generation },
    concurrency: { type: "string", default: "4" },
  },
});
const model = modelSpec(args.model).id;

type EvalQuestion = EvalRow["q"] & { note: string };

const questions: EvalQuestion[] = (await readFile("data/synthetic/eval/questions.jsonl", "utf8"))
  .split("\n")
  .filter(Boolean)
  .map((l) => JSON.parse(l));

// 평가 질문이 운영 미답변 리포트에 섞이지 않게 메모리 로그 사용
const { copilot } = await createRuntime({ log: memoryUnansweredLog(), generationModel: model });

// 재시도까지 실패한 호출. 틀린 답은 아니지만 상태 정확도에서는 오답으로 셈 (운영에서 답을 못 준 것과 같음)
const errors: { id: string; message: string }[] = [];
const failed = (message: string): Answer => ({
  status: "unanswerable",
  text: `호출 실패: ${message}`,
  confidence: "low",
  citations: [],
  trace: { topScore: 0, grounding: "none", retrieved: [] },
});

const results: EvalRow[] = [];
const queue = [...questions];
await Promise.all(
  Array.from({ length: Number(args.concurrency) }, async () => {
    for (let q = queue.shift(); q; q = queue.shift()) {
      try {
        results.push({ q, a: await copilot.ask(q.question) });
      } catch (e) {
        const message = e instanceof Error ? e.message.slice(0, 200) : String(e);
        errors.push({ id: q.id, message });
        results.push({ q, a: failed(message) });
      }
    }
  }),
);
results.sort((x, y) => x.q.id.localeCompare(y.q.id));

const pct = (n: number, d: number) => (d ? `${((n / d) * 100).toFixed(1)}% (${n}/${d})` : "-");
const summary = summarizeEval(results, new Date());
const usage = summarizeUsage(
  results.map((r) => r.a.trace.usage).filter((u): u is Usage => !!u),
  results.length,
);

console.log(`모델: ${model} / ${config.models.embedding}`);
console.log(`임계값: minScore ${config.retrieval.minScore}, high ${config.confidence.high}, medium ${config.confidence.medium}\n`);
console.log(`| 지표 | 값 |\n|---|---|`);
console.log(`| 검색 적중률 (top ${config.retrieval.topK}) | ${pct(summary.retrievalHit.n, summary.retrievalHit.d)} |`);
console.log(`| 상태 정확도 | ${pct(summary.statusAccuracy.n, summary.statusAccuracy.d)} |`);
console.log(`| 잘못된 답변률 (답하면 안 되는 질문에 답함) | ${pct(summary.wrongAnswer.n, summary.wrongAnswer.d)} |`);
console.log(`| 과잉 거절률 (답할 수 있는데 거절) | ${pct(summary.overRefusal.n, summary.overRefusal.d)} |`);
console.log(`| 호출 실패 (재시도 후) | ${errors.length} |`);
console.log(`| 비용 (질문 1,000건, 가격 ${PRICES_CHECKED_AT} 기준) | $${usage.costPer1kQuestionsUsd.toFixed(3)} |`);
console.log(`| 응답 시간 p50 / p95 | ${usage.latencyP50Ms}ms / ${usage.latencyP95Ms}ms |`);

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
if (errors.length) {
  console.log(`\n호출 실패`);
  for (const e of errors) console.log(`- ${e.id}: ${e.message}`);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
await mkdir("data/logs", { recursive: true });
const out = `data/logs/eval-${model}-${stamp}.json`;
await writeFile(out, JSON.stringify(results, null, 2));

// 모델 비교표(npm run compare)의 입력. 저장소에 커밋
await mkdir("data/eval-models", { recursive: true });
const modelOut = `data/eval-models/${model}.json`;
const missIds = misses.map((r) => ({ id: r.q.id, expected: r.q.expected_status, actual: r.a.status }));
await writeFile(modelOut, JSON.stringify({ model, pricesCheckedAt: PRICES_CHECKED_AT, ...summary, errors: errors.length, usage, misses: missIds }, null, 2) + "\n");

// 운영 화면 품질 지표는 실제 서비스 모델의 결과만
if (model === config.models.generation) {
  await writeFile("data/eval-summary.json", JSON.stringify(summary, null, 2) + "\n");
}
console.log(`\n상세 결과: ${out}\n모델 요약: ${modelOut}`);
