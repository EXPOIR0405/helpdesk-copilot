import { createRuntime } from "../src/runtime.ts";

const question = process.argv.slice(2).join(" ");
if (!question) {
  console.error('사용법: npm run ask -- "환불 기준이 뭐예요?"');
  process.exit(1);
}

const { copilot } = await createRuntime();
const answer = await copilot.ask(question);

console.log(`[${answer.status} / 확신도 ${answer.confidence}]`);
console.log(answer.text);
for (const c of answer.citations) console.log(`  근거: ${c.title} > ${c.section} (${c.chunkId})`);
console.log(`  최고 유사도 ${answer.trace.topScore.toFixed(3)}, 근거 판단 ${answer.trace.grounding}`);
