import OpenAI from "openai";
import { config } from "../src/config.ts";
import { loadDocs } from "../src/core/docs.ts";
import { openAIEmbedder } from "../src/core/openai.ts";
import { syncIndex } from "../src/core/sync.ts";
import { selectBackend } from "../src/runtime.ts";

// SUPABASE_URL·SUPABASE_SECRET_KEY가 있으면 Supabase로, 없으면 로컬 JSON으로 동기화
const { name, indexRepo } = selectBackend();
const docs = await loadDocs(config.docsDir);
const { index, stats } = await syncIndex({
  docs,
  previous: await indexRepo.load(),
  embed: openAIEmbedder(new OpenAI(), config.models.embedding),
  embeddingModel: config.models.embedding,
  maxChars: config.chunk.maxChars,
});
await indexRepo.save(index, stats);

console.log(`[${name}] 문서 ${docs.length}개 동기화`);
for (const [label, ids] of Object.entries(stats)) {
  if (ids.length) console.log(`- ${label}: ${ids.join(", ")}`);
}
