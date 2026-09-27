import { readdir, readFile } from "node:fs/promises";
import type { EvalSummary, UsageStats } from "../src/core/report.ts";

// data/eval-models/*.json(npm run eval -- --model <id> 결과)을 한 표로
type ModelResult = EvalSummary & { model: string; pricesCheckedAt: string; errors: number; usage: UsageStats };

const dir = "data/eval-models";
const files = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith(".json"));
if (!files.length) {
  console.log(`결과가 없습니다. 먼저 npm run eval -- --model <id> 를 실행하세요`);
  process.exit(0);
}
const rows: ModelResult[] = await Promise.all(files.map(async (f) => JSON.parse(await readFile(`${dir}/${f}`, "utf8"))));

// 지표 우선순위 그대로 정렬: 잘못된 답변 → 상태 정확도 → 비용
const rate = (r: { n: number; d: number }) => (r.d ? r.n / r.d : 0);
rows.sort(
  (a, b) =>
    rate(a.wrongAnswer) - rate(b.wrongAnswer) ||
    rate(b.statusAccuracy) - rate(a.statusAccuracy) ||
    a.usage.costPer1kQuestionsUsd - b.usage.costPer1kQuestionsUsd,
);

const pct = (r: { n: number; d: number }) => `${(rate(r) * 100).toFixed(1)}% (${r.n}/${r.d})`;
console.log(`| 모델 | 잘못된 답변률 | 상태 정확도 | 과잉 거절률 | 호출 실패 | 질문 1,000건 비용 | 응답 p50 / p95 | 평가일 |`);
console.log(`|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|`);
for (const r of rows) {
  console.log(
    `| ${r.model} | ${pct(r.wrongAnswer)} | ${pct(r.statusAccuracy)} | ${pct(r.overRefusal)} | ${r.errors} | $${r.usage.costPer1kQuestionsUsd.toFixed(2)} | ${(r.usage.latencyP50Ms / 1000).toFixed(1)}s / ${(r.usage.latencyP95Ms / 1000).toFixed(1)}s | ${r.at.slice(0, 10)} |`,
  );
}
console.log(`\n가격 기준일: ${[...new Set(rows.map((r) => r.pricesCheckedAt))].join(", ")} (src/core/models.ts)`);
