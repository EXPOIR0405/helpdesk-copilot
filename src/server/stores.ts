import { randomUUID } from "node:crypto";
import type { CustomerReply } from "../core/reply.ts";
import type { Answer } from "../core/types.ts";

export type StoredAnswer = {
  id: string;
  question: string;
  answer: Answer;
  reply: CustomerReply | null;
  createdAt: string;
};

/** 답변 보관. 답장 요청을 answerId로만 받고, 같은 질문은 캐시로 재사용하기 위함 */
export type AnswerStore = {
  save(question: string, answer: Answer): Promise<string>;
  get(id: string): Promise<StoredAnswer | null>;
  findRecent(question: string, since: Date): Promise<StoredAnswer | null>;
  saveReply(id: string, reply: CustomerReply): Promise<void>;
};

/** 고정 창 호출 수 제한. 창 안에서 limit을 넘으면 false */
export type Quota = {
  take(key: string, windowSeconds: number, limit: number): Promise<boolean>;
};

/** 캐시 키. 띄어쓰기·끝 문장부호 차이는 같은 질문으로 봄 */
export const questionKey = (q: string) => q.trim().replace(/\s+/g, " ").replace(/[?？.!。\s]+$/, "");

export function memoryAnswerStore(now: () => Date = () => new Date()): AnswerStore {
  const rows = new Map<string, StoredAnswer>();
  return {
    async save(question, answer) {
      const id = randomUUID();
      rows.set(id, { id, question, answer, reply: null, createdAt: now().toISOString() });
      return id;
    },
    async get(id) {
      return rows.get(id) ?? null;
    },
    async findRecent(question, since) {
      const key = questionKey(question);
      const hits = [...rows.values()].filter((r) => questionKey(r.question) === key && r.createdAt >= since.toISOString());
      return hits.at(-1) ?? null;
    },
    async saveReply(id, reply) {
      const row = rows.get(id);
      if (row) row.reply = reply;
    },
  };
}

export function memoryQuota(now: () => Date = () => new Date()): Quota {
  const windows = new Map<string, { start: number; count: number }>();
  return {
    async take(key, windowSeconds, limit) {
      const t = now().getTime();
      const w = windows.get(key);
      if (!w || t - w.start >= windowSeconds * 1000) {
        windows.set(key, { start: t, count: 1 });
        return 1 <= limit;
      }
      w.count++;
      return w.count <= limit;
    },
  };
}
