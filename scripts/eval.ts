import { mkdir, readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { config } from "../src/config.ts";
import { PRICES_CHECKED_AT, modelSpec } from "../src/core/models.ts";
import { findUnstable, summarizeEval, summarizeUsage, type EvalRow } from "../src/core/report.ts";
import type { Answer, Usage } from "../src/core/types.ts";
import { memoryUnansweredLog } from "../src/core/unanswered.ts";
import { createRuntime } from "../src/runtime.ts";

// npm run eval -- --model gemini-3.8-flash --runs 3 --concurrency 2
// 같은 설정도 실행마다 판단이 달라짐 → 여러 번 돌려 합산 비율·최악 회차·흔들리는 문항을 봄
const { values: args } = parseArgs({
  options: {
    model: { type: "string", default: config.models.generation },
    runs: { type: "string", default: "1" },
    concurrency: { type: "string", default: "4" },
  },
});
const model = modelSpec(args.model).id;
const runCount = Number(args.runs);

type EvalQuestion = EvalRow["q"] & { note: string };

const questions: EvalQuestion[] = (await readFile("data/synthetic/eval/questions.jsonl", "utf8"))
  .split("\n")
  .filter(Boolean)
  .map((l) => JSON.parse(l));

// 평가 질문이 운영 미답변 리포트에 섞이지 않게 메모리 로그 사용
const { copilot } = await createRuntime({ log: memoryUnansweredLog(), generationModel: model });

// 재시도까지 실패한 호출. 틀린 답은 아니지만 상태 정확도에서는 오답으로 셈 (운영에서 답을 못 준 것과 같음)
const errors: { run: number; id: string; message: string }[] = [];
const failed = (message: string): Answer => ({
  status: "unanswerable",
  text: `호출 실패: ${message}`,
  confidence: "low",
  citations: [],
  trace: { topScore: 0, grounding: "none", retrieved: [] },
});

async function runOnce(run: number): Promise<EvalRow[]> {
  const rows: EvalRow[] = [];
  const queue = [...questions];
  await Promise.all(
    Array.from({ length: Number(args.concurrency) }, async () => {
      for (let q = queue.shift(); q; q = queue.shift()) {
        try {
          rows.push({ q, a: await copilot.ask(q.question) });
        } catch (e) {
          const message = e instanceof Error ? e.message.slice(0, 200) : String(e);
          errors.push({ run, id: q.id, message });
          rows.push({ q, a: failed(message) });
        }
      }
    }),
  );
  return rows.sort((x, y) => x.q.id.localeCompare(y.q.id));
}

// 호출 실패는 "답하지 않음"으로 채점되므로 잘못된 답변률이 0%로 보임 → 실패가 많으면 결과 자체가 무효
// (gemini-2.5-flash-lite가 126건 전부 404인데 잘못된 답변률 0%로 비교표 1위에 오를 뻔함)
const MAX_ERROR_RATE = 0.2;
const errorRate = () => errors.length / (runs.flat().length || 1);
const runs: EvalRow[][] = [];
for (let i = 1; i <= runCount; i++) {
  runs.push(await runOnce(i));
  const s = summarizeEval(runs.at(-1)!, new Date());
  console.log(`${i}회차: 상태 정확도 ${s.statusAccuracy.n}/${s.statusAccuracy.d}, 잘못된 답변 ${s.wrongAnswer.n}/${s.wrongAnswer.d}`);
  if (errorRate() > MAX_ERROR_RATE) break;
}

const all = runs.flat();
const pct = (n: number, d: number) => (d ? `${((n / d) * 100).toFixed(1)}% (${n}/${d})` : "-");
const perRun = runs.map((r) => summarizeEval(r, new Date()));
// 합산 비율: 모든 회차의 분자·분모를 더함
const summary = summarizeEval(all, new Date());
const worstWrongAnswer = Math.max(...perRun.map((s) => s.wrongAnswer.n));
const usage = summarizeUsage(
  all.map((r) => r.a.trace.usage).filter((u): u is Usage => !!u),
  all.length,
);
const unstable = findUnstable(runs);

console.log(`\n모델: ${model} / ${config.models.embedding}, ${runCount}회 실행`);
console.log(`임계값: minScore ${config.retrieval.minScore}, high ${config.confidence.high}, medium ${config.confidence.medium}\n`);
console.log(`| 지표 (${runCount}회 합산) | 값 |\n|---|---|`);
console.log(`| 검색 적중률 (top ${config.retrieval.topK}) | ${pct(summary.retrievalHit.n, summary.retrievalHit.d)} |`);
console.log(`| 상태 정확도 | ${pct(summary.statusAccuracy.n, summary.statusAccuracy.d)} |`);
console.log(`| 잘못된 답변률 (답하면 안 되는 질문에 답함) | ${pct(summary.wrongAnswer.n, summary.wrongAnswer.d)} |`);
console.log(`| 잘못된 답변 최악 회차 | ${worstWrongAnswer}건 |`);
console.log(`| 과잉 거절률 (답할 수 있는데 거절) | ${pct(summary.overRefusal.n, summary.overRefusal.d)} |`);
console.log(`| 호출 실패 (재시도 후) | ${errors.length} |`);
console.log(`| 비용 (질문 1,000건, 가격 ${PRICES_CHECKED_AT} 기준) | $${usage.costPer1kQuestionsUsd.toFixed(3)} |`);
console.log(`| 응답 시간 p50 / p95 | ${usage.latencyP50Ms}ms / ${usage.latencyP95Ms}ms |`);

const byType = new Map<string, { ok: number; n: number }>();
for (const r of all) {
  const t = byType.get(r.q.type) ?? { ok: 0, n: 0 };
  t.n++;
  if (r.a.status === r.q.expected_status) t.ok++;
  byType.set(r.q.type, t);
}
console.log(`\n| 유형 | 상태 정확도 |\n|---|---|`);
for (const [type, t] of byType) console.log(`| ${type} | ${pct(t.ok, t.n)} |`);

// 문항별로 몇 회차 틀렸는지
const missCount = new Map<string, { q: EvalQuestion; actual: string[] }>();
for (const { q, a } of all) {
  if (a.status === q.expected_status) continue;
  const m = missCount.get(q.id) ?? { q: q as EvalQuestion, actual: [] };
  m.actual.push(a.status);
  missCount.set(q.id, m);
}
if (missCount.size) {
  console.log(`\n틀린 질문 (틀린 회차 / 전체 회차)`);
  for (const [id, { q, actual }] of [...missCount].sort()) {
    console.log(`- ${id} [${q.type}] ${q.question} — ${actual.length}/${runCount}, 기대 ${q.expected_status} → 실제 ${[...new Set(actual)].join("·")}`);
  }
}
if (unstable.length) {
  console.log(`\n회차마다 판단이 달라진 문항`);
  for (const u of unstable) console.log(`- ${u.id}: ${u.statuses.join(" / ")}`);
}
if (errors.length) {
  console.log(`\n호출 실패`);
  for (const e of errors) console.log(`- ${e.run}회차 ${e.id}: ${e.message}`);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
await mkdir("data/logs", { recursive: true });
const out = `data/logs/eval-${model}-${stamp}.json`;
await writeFile(out, JSON.stringify(runs, null, 2));

if (errorRate() > MAX_ERROR_RATE) {
  console.error(`\n호출 실패율 ${(errorRate() * 100).toFixed(0)}% → 비교 결과로 쓸 수 없어 저장하지 않음 (첫 오류: ${errors[0]?.message})`);
  process.exit(1);
}

// 모델 비교표(npm run compare)의 입력. 저장소에 커밋
await mkdir("data/eval-models", { recursive: true });
const modelOut = `data/eval-models/${model}.json`;
const misses = [...missCount].map(([id, m]) => ({ id, expected: m.q.expected_status, missedRuns: m.actual.length }));
await writeFile(
  modelOut,
  JSON.stringify({ model, runs: runs.length, pricesCheckedAt: PRICES_CHECKED_AT, ...summary, worstWrongAnswer, errors: errors.length, usage, misses, unstable }, null, 2) + "\n",
);

// 운영 화면 품질 지표는 실제 서비스 모델의 결과만
if (model === config.models.generation) {
  await writeFile("data/eval-summary.json", JSON.stringify(summary, null, 2) + "\n");
}
console.log(`\n상세 결과: ${out}\n모델 요약: ${modelOut}`);
