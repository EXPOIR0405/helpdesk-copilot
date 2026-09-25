import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { AnswerStatus, Confidence } from "./types.ts";

export type UnansweredEntry = {
  at: string;
  question: string;
  status: AnswerStatus;
  confidence: Confidence;
  topScore: number;
  /** 가장 가까웠던 문서. 검색 결과가 없으면 null */
  nearestDocId: string | null;
};

export type UnansweredLog = {
  append(entry: UnansweredEntry): Promise<void>;
  list(): Promise<UnansweredEntry[]>;
};

export function jsonlUnansweredLog(path: string): UnansweredLog {
  return {
    async append(entry) {
      await mkdir(dirname(path), { recursive: true });
      await appendFile(path, JSON.stringify(entry) + "\n");
    },
    async list() {
      try {
        const raw = await readFile(path, "utf8");
        return raw.split("\n").filter(Boolean).map((l) => JSON.parse(l) as UnansweredEntry);
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
        throw e;
      }
    },
  };
}

export function memoryUnansweredLog(): UnansweredLog & { entries: UnansweredEntry[] } {
  const entries: UnansweredEntry[] = [];
  return {
    entries,
    async append(entry) {
      entries.push(entry);
    },
    async list() {
      return [...entries];
    },
  };
}

/** 가장 가까운 문서 기준으로 묶음 → "어느 문서를 보강할지"가 건수 순으로 보임 */
export function groupByNearestDoc(entries: UnansweredEntry[]) {
  const groups = new Map<string | null, UnansweredEntry[]>();
  for (const e of entries) {
    const list = groups.get(e.nearestDocId) ?? [];
    list.push(e);
    groups.set(e.nearestDocId, list);
  }
  return [...groups.entries()]
    .map(([docId, items]) => ({ docId, count: items.length, questions: items.map((i) => i.question) }))
    .sort((a, b) => b.count - a.count);
}
