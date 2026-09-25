import OpenAI from "openai";
import { config } from "./config.ts";
import { createCopilot } from "./core/copilot.ts";
import { openAIEmbedder, openAIGenerator } from "./core/openai.ts";
import { loadIndex } from "./core/sync.ts";
import { jsonlUnansweredLog, type UnansweredLog } from "./core/unanswered.ts";

/** 스크립트·어댑터가 공통으로 쓰는 조립 지점 */
export async function createRuntime(opts: { log?: UnansweredLog } = {}) {
  const index = await loadIndex(config.indexPath);
  if (!index) throw new Error(`인덱스가 없습니다. 먼저 npm run sync 를 실행하세요 (${config.indexPath})`);
  const client = new OpenAI();
  const log = opts.log ?? jsonlUnansweredLog(config.unansweredLogPath);
  const copilot = createCopilot({
    index,
    embed: openAIEmbedder(client, config.models.embedding),
    generate: openAIGenerator(client, config.models.generation),
    log,
    retrieval: config.retrieval,
    confidence: config.confidence,
  });
  return { index, log, copilot };
}
