import type { Chunk, PolicyDoc } from "./types.ts";

/**
 * `##` 제목 단위로 나누고, 긴 섹션은 문단 단위로 다시 나눔.
 * `###` 하위 제목은 섹션 본문에 포함.
 */
export function chunkDoc(doc: PolicyDoc, maxChars: number): Chunk[] {
  const sections: { section: string; text: string }[] = [];
  let current: { section: string; lines: string[] } | null = null;

  for (const line of doc.body.split("\n")) {
    if (line.startsWith("## ")) {
      if (current) sections.push({ section: current.section, text: current.lines.join("\n").trim() });
      current = { section: line.slice(3).trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
    // 첫 `##` 앞(문서 제목 `#`)은 버림. 제목은 조각마다 따로 붙음
  }
  if (current) sections.push({ section: current.section, text: current.lines.join("\n").trim() });

  const chunks: Chunk[] = [];
  for (const { section, text } of sections) {
    if (!text) continue;
    for (const piece of splitLong(text, maxChars)) {
      chunks.push({
        id: `${doc.id}#${chunks.length}`,
        docId: doc.id,
        docTitle: doc.title,
        section,
        status: doc.status,
        text: piece,
      });
    }
  }
  return chunks;
}

function splitLong(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const pieces: string[] = [];
  let buf = "";
  for (const para of text.split(/\n\s*\n/)) {
    if (buf && buf.length + para.length + 2 > maxChars) {
      pieces.push(buf);
      buf = para;
    } else {
      buf = buf ? `${buf}\n\n${para}` : para;
    }
  }
  if (buf) pieces.push(buf);
  return pieces;
}

/** 짧은 조각도 어떤 문서의 어떤 섹션인지 알 수 있게 제목을 붙여 임베딩 */
export function embeddingText(chunk: Chunk): string {
  return `${chunk.docTitle} > ${chunk.section}\n${chunk.text}`;
}
