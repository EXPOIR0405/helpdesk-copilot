import { readdir, readFile } from "node:fs/promises";
import type { EvalSummary, UsageStats } from "../src/core/report.ts";

// data/eval-models/*.json(npm run eval -- --model <id> 결과)을 한 표로
type ModelResult = EvalSummary & {
  model: string;
  runs: number;
  promptVersion?: string;
  pricesCheckedAt: string;
  worstWrongAnswer: number;
  errors: number;
  usage: UsageStats;
  unstable: { id: string }[];
};

const dir = "data/eval-models";
const files = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith(".json"));
if (!files.length) {
  console.log(`결과가 없습니다. 먼저 npm run eval -- --model <id> 를 실행하세요`);
  process.exit(0);
}
const rows: ModelResult[] = await Promise.all(files.map(async (f) => JSON.parse(await readFile(`${dir}/${f}`, "utf8"))));

// 지표 우선순위 그대로 정렬: 잘못된 답변(최악 회차 → 합산) → 상태 정확도 → 비용
const rate = (r: { n: number; d: number }) => (r.d ? r.n / r.d : 0);
// 호출 실패가 있는 결과는 실패가 "답하지 않음"으로 채점돼 지표가 좋아 보임 → 맨 뒤로, ⚠ 표시
rows.sort(
  (a, b) =>
    Number(a.errors > 0) - Number(b.errors > 0) ||
    a.worstWrongAnswer - b.worstWrongAnswer ||
    rate(a.wrongAnswer) - rate(b.wrongAnswer) ||
    rate(b.statusAccuracy) - rate(a.statusAccuracy) ||
    a.usage.costPer1kQuestionsUsd - b.usage.costPer1kQuestionsUsd,
);

const pct = (r: { n: number; d: number }) => `${(rate(r) * 100).toFixed(1)}% (${r.n}/${r.d})`;
console.log(`| 모델 | 프롬프트 | 회차 | 잘못된 답변률 | 최악 회차 | 상태 정확도 | 과잉 거절률 | 흔들린 문항 | 호출 실패 | 질문 1,000건 비용 | 응답 p50 / p95 | 평가일 |`);
console.log(`|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|`);
for (const r of rows) {
  console.log(
    `| ${r.errors ? "⚠ " : ""}${r.model} | ${r.promptVersion ?? "-"} | ${r.runs} | ${pct(r.wrongAnswer)} | ${r.worstWrongAnswer}건 | ${pct(r.statusAccuracy)} | ${pct(r.overRefusal)} | ${r.unstable.length} | ${r.errors} | $${r.usage.costPer1kQuestionsUsd.toFixed(2)} | ${(r.usage.latencyP50Ms / 1000).toFixed(1)}s / ${(r.usage.latencyP95Ms / 1000).toFixed(1)}s | ${r.at.slice(0, 10)} |`,
  );
}
console.log(`\n가격 기준일: ${[...new Set(rows.map((r) => r.pricesCheckedAt))].join(", ")} (src/core/models.ts)`);
