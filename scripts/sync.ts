import OpenAI from "openai";
import { config } from "../src/config.ts";
import { loadDocs } from "../src/core/docs.ts";
import { openAIEmbedder } from "../src/core/openai.ts";
import { loadIndex, saveIndex, syncIndex } from "../src/core/sync.ts";

const docs = await loadDocs(config.docsDir);
const { index, stats } = await syncIndex({
  docs,
  previous: await loadIndex(config.indexPath),
  embed: openAIEmbedder(new OpenAI(), config.models.embedding),
  embeddingModel: config.models.embedding,
  maxChars: config.chunk.maxChars,
});
await saveIndex(config.indexPath, index);

console.log(`문서 ${docs.length}개, 조각 ${index.chunks.length}개`);
for (const [label, ids] of Object.entries(stats)) {
  if (ids.length) console.log(`- ${label}: ${ids.join(", ")}`);
}
