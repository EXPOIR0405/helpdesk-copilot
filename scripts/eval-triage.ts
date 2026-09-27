// 자동 응대 평가: 고객 문의를 실제 파이프라인(개인정보 가림 → 판단 → 답장 → 자동 발송 기준)에 넣고
// 자동/넘김 경로가 기대와 맞는지 봄. 가장 중요한 지표는 "잘못된 자동 발송" (넘겨야 하는데 자동으로 보냄)
// npm run eval:triage -- --model gemini-3.8-flash --runs 3
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { config } from "../src/config.ts";
import { modelSpec } from "../src/core/models.ts";
import { INSTRUCTIONS } from "../src/core/prompt.ts";
import { createSupportDesk } from "../src/core/support.ts";
import { memoryTicketStore, type Ticket } from "../src/core/tickets.ts";
import { REASON_LABEL, type EscalationReason } from "../src/core/triage.ts";
import { memoryUnansweredLog } from "../src/core/unanswered.ts";
import { createRuntime } from "../src/runtime.ts";

const { values: args } = parseArgs({
  options: {
    model: { type: "string", default: config.models.generation },
    runs: { type: "string", default: "1" },
    concurrency: { type: "string", default: "2" },
  },
});
const model = modelSpec(args.model).id;
const promptVersion = createHash("sha256").update(INSTRUCTIONS).digest("hex").slice(0, 8);

type Case = {
  id: string;
  type: string;
  message: string;
  expected_route: "auto" | "escalate";
  expected_reason: EscalationReason | null;
  note: string;
};
const cases: Case[] = (await readFile("data/synthetic/eval/triage.jsonl", "utf8")).split("\n").filter(Boolean).map((l) => JSON.parse(l));

const runtime = await createRuntime({ log: memoryUnansweredLog(), generationModel: model, fallbackModel: null, calls: config.calls.eval });

type Row = { c: Case; t: Ticket };
const runs: Row[][] = [];
for (let i = 1; i <= Number(args.runs); i++) {
  // 회차마다 새 저장소: 앞 회차 처리 결과가 "비슷한 과거 티켓"으로 섞이지 않게
  const desk = createSupportDesk({
    ask: (q) => runtime.copilot.askWithVector(q),
    writeReply: (q, a) => runtime.replyWriter.write(q, a),
    store: memoryTicketStore(),
    docTitles: async () => ({}),
    notifyEscalated: async () => ({ via: "eval", ok: true }),
  });
  const rows: Row[] = [];
  const queue = [...cases];
  await Promise.all(
    Array.from({ length: Number(args.concurrency) }, async () => {
      for (let c = queue.shift(); c; c = queue.shift()) rows.push({ c, t: await desk.submit(c.message) });
    }),
  );
  rows.sort((a, b) => a.c.id.localeCompare(b.c.id));
  runs.push(rows);
  const wrong = rows.filter((r) => r.c.expected_route === "escalate" && r.t.status === "auto_replied").length;
  console.log(`${i}회차: 자동 ${rows.filter((r) => r.t.status === "auto_replied").length}/${rows.length}, 잘못된 자동 발송 ${wrong}`);
}

const all = runs.flat();
const ratio = (rows: Row[], ok: (r: Row) => boolean) => ({ n: rows.filter(ok).length, d: rows.length });
const shouldEscalate = all.filter((r) => r.c.expected_route === "escalate");
const shouldAuto = all.filter((r) => r.c.expected_route === "auto");
const summary = {
  model,
  runs: runs.length,
  promptVersion,
  at: new Date().toISOString(),
  /** 넘겨야 하는데 자동으로 보낸 비율. 0이어야 함 */
  wrongAuto: ratio(shouldEscalate, (r) => r.t.status === "auto_replied"),
  /** 자동으로 답해도 되는 문의 중 실제 자동 처리 */
  autoRate: ratio(shouldAuto, (r) => r.t.status === "auto_replied"),
  /** 넘긴 건의 사유가 기대와 같은 비율 */
  reasonMatch: ratio(shouldEscalate, (r) => r.t.reason === r.c.expected_reason),
  /** 조치 요청 분류: action 문의를 action으로 */
  actionRecall: ratio(all.filter((r) => r.c.type === "action"), (r) => r.t.answer?.requestType === "action"),
  /** 정책 질문을 action으로 잘못 분류하지 않음 */
  questionPrecision: ratio(all.filter((r) => r.c.type !== "action" && r.t.answer), (r) => r.t.answer?.requestType === "question"),
  errors: all.filter((r) => r.t.reason === "error").length,
};

const pct = ({ n, d }: { n: number; d: number }) => (d ? `${((n / d) * 100).toFixed(1)}% (${n}/${d})` : "-");
console.log(`\n모델 ${model}, ${runs.length}회, 프롬프트 ${promptVersion}\n`);
console.log(`| 지표 | 값 |\n|---|---|`);
console.log(`| 잘못된 자동 발송 (넘겨야 하는데 자동) | ${pct(summary.wrongAuto)} |`);
console.log(`| 자동 처리율 (자동 가능한 문의 중) | ${pct(summary.autoRate)} |`);
console.log(`| 넘김 사유 일치 | ${pct(summary.reasonMatch)} |`);
console.log(`| 조치 요청 분류 (action 재현율) | ${pct(summary.actionRecall)} |`);
console.log(`| 정책 질문을 조치로 오분류 안 함 | ${pct(summary.questionPrecision)} |`);
console.log(`| 처리 실패 | ${summary.errors} |`);

// 문항별로 기대와 다르게 간 회차
const misses = new Map<string, { c: Case; got: string[] }>();
for (const { c, t } of all) {
  const got = t.status === "auto_replied" ? "auto" : `escalate:${t.reason}`;
  const want = c.expected_route === "auto" ? "auto" : `escalate:${c.expected_reason}`;
  if (got === want) continue;
  const m = misses.get(c.id) ?? { c, got: [] };
  m.got.push(got);
  misses.set(c.id, m);
}
if (misses.size) {
  console.log(`\n기대와 다른 문항 (틀린 회차 / 전체)`);
  for (const [id, { c, got }] of [...misses].sort()) {
    const label = (g: string) => (g === "auto" ? "자동" : `넘김(${REASON_LABEL[g.split(":")[1] as EscalationReason]})`);
    const want = c.expected_route === "auto" ? "자동" : `넘김(${REASON_LABEL[c.expected_reason!]})`;
    console.log(`- ${id} ${c.message} — ${got.length}/${runs.length}, 기대 ${want} → ${[...new Set(got)].map(label).join("·")}`);
  }
}

await mkdir("data/logs", { recursive: true });
await writeFile(`data/logs/triage-${model}-${summary.at.replace(/[:.]/g, "-")}.json`, JSON.stringify(runs, null, 2));
await mkdir("data/eval-triage", { recursive: true });
const missList = [...misses].map(([id, m]) => ({ id, expected: m.c.expected_route === "auto" ? "auto" : m.c.expected_reason, got: m.got }));
await writeFile(`data/eval-triage/${model}.json`, JSON.stringify({ ...summary, misses: missList }, null, 2) + "\n");
console.log(`\n요약: data/eval-triage/${model}.json`);
