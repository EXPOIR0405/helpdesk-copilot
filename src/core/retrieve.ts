import type { IndexedChunk, ScoredChunk } from "./types.ts";

export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

export function retrieve(
  queryVector: number[],
  chunks: IndexedChunk[],
  opts: { topK: number; minScore: number },
): ScoredChunk[] {
  return chunks
    .map(({ embedding, ...chunk }) => ({ ...chunk, score: cosine(queryVector, embedding) }))
    .filter((c) => c.score >= opts.minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, opts.topK);
}
