import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { chunkDoc, embeddingText } from "./chunk.ts";
import type { DocStatus, Embedder, IndexedChunk, PolicyDoc } from "./types.ts";

export type DocIndex = {
  embeddingModel: string;
  syncedAt: string;
  docs: Record<string, { hash: string; title: string; status: DocStatus; updatedAt: string; body: string }>;
  chunks: IndexedChunk[];
};

export type SyncStats = { added: string[]; updated: string[]; removed: string[]; unchanged: string[] };

const hash = (s: string) => createHash("sha256").update(s).digest("hex");

/** 바뀐 문서만 다시 조각내고 임베딩. 임베딩 모델이 바뀌면 전부 다시 처리 */
export async function syncIndex(input: {
  docs: PolicyDoc[];
  previous: DocIndex | null;
  embed: Embedder;
  embeddingModel: string;
  maxChars: number;
  now?: Date;
}): Promise<{ index: DocIndex; stats: SyncStats }> {
  const prev = input.previous?.embeddingModel === input.embeddingModel ? input.previous : null;
  const stats: SyncStats = { added: [], updated: [], removed: [], unchanged: [] };
  const chunks: IndexedChunk[] = [];
  const docs: DocIndex["docs"] = {};

  for (const doc of input.docs) {
    const h = hash(doc.raw);
    docs[doc.id] = { hash: h, title: doc.title, status: doc.status, updatedAt: doc.updatedAt, body: doc.body };
    const before = prev?.docs[doc.id];

    if (before?.hash === h) {
      stats.unchanged.push(doc.id);
      chunks.push(...prev!.chunks.filter((c) => c.docId === doc.id));
      continue;
    }
    (before ? stats.updated : stats.added).push(doc.id);
    const fresh = chunkDoc(doc, input.maxChars);
    const vectors = fresh.length ? await input.embed(fresh.map(embeddingText)) : [];
    fresh.forEach((c, i) => chunks.push({ ...c, embedding: vectors[i] }));
  }

  if (prev) {
    for (const id of Object.keys(prev.docs)) if (!docs[id]) stats.removed.push(id);
  }

  return {
    index: {
      embeddingModel: input.embeddingModel,
      syncedAt: (input.now ?? new Date()).toISOString(),
      docs,
      chunks,
    },
    stats,
  };
}

/** 인덱스 저장소. 로컬은 JSON 파일, 배포는 Supabase */
export type IndexRepo = {
  load(): Promise<DocIndex | null>;
  /** stats를 보고 바뀐 문서만 쓰는 구현도 있으므로 함께 넘김 */
  save(index: DocIndex, stats: SyncStats): Promise<void>;
};

export function fileIndexRepo(path: string): IndexRepo {
  return { load: () => loadIndex(path), save: (index) => saveIndex(path, index) };
}

export async function loadIndex(path: string): Promise<DocIndex | null> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as DocIndex;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
}

export async function saveIndex(path: string, index: DocIndex): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(index));
}
