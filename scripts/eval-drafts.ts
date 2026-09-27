// 조치 요청 초안 점검: 자동 응대 평가셋의 조치 요청 문의로 판단 → 답장 초안을 만들고
// 초안이 결과를 단정·약속했는지(findOutcomePromises) 셈. 초안 전문도 출력해 사람이 읽고 판단
// npm run eval:drafts -- --runs 2
import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { config } from "../src/config.ts";
import { memoryUnansweredLog } from "../src/core/unanswered.ts";
import { createRuntime } from "../src/runtime.ts";

const { values: args } = parseArgs({ options: { model: { type: "string", default: config.models.generation }, runs: { type: "string", default: "1" } } });
const cases = (await readFile("data/synthetic/eval/triage.jsonl", "utf8"))
  .split("\n")
  .filter(Boolean)
  .map((l) => JSON.parse(l) as { id: string; type: string; message: string })
  .filter((c) => c.type === "action");

const runtime = await createRuntime({ log: memoryUnansweredLog(), generationModel: args.model, fallbackModel: null, calls: config.calls.eval });
let flagged = 0;
let total = 0;
for (let run = 1; run <= Number(args.runs); run++) {
  for (const c of cases) {
    const answer = await runtime.copilot.ask(c.message);
    const draft = await runtime.replyWriter.write(c.message, answer);
    total++;
    const hits = draft.outcomePromises ?? [];
    if (hits.length) flagged++;
    console.log(`\n[${run}회차 ${c.id}] ${c.message}  (requestType ${answer.requestType ?? "-"})`);
    console.log(draft.text.split("\n").map((l) => `  | ${l}`).join("\n"));
    console.log(hits.length ? `  ⚠ 결과 약속: ${hits.join(" / ")}` : "  ✓ 결과 약속 없음");
  }
}
console.log(`\n결과를 단정·약속한 초안: ${flagged}/${total} (모델 ${args.model})`);
