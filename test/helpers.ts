import type { Embedder } from "../src/core/types.ts";

/** 키워드 포함 여부로 벡터를 만드는 가짜 임베더. 호출 기록을 남김 */
export function keywordEmbedder(keywords: string[]) {
  const calls: string[][] = [];
  const embed: Embedder = async (texts) => {
    calls.push(texts);
    return texts.map((t) => [...keywords.map((k) => (t.includes(k) ? 1 : 0)), 0.001]);
  };
  return { embed, calls };
}

export function md(meta: Record<string, string>, body: string): string {
  const head = Object.entries(meta)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  return `---\n${head}\n---\n\n${body}`;
}
