import { randomUUID } from "node:crypto";
import { cosine } from "./copilot.ts";
import type { CustomerReply } from "./reply.ts";
import type { EscalationReason } from "./triage.ts";
import type { Answer } from "./types.ts";

export type TicketStatus = "auto_replied" | "escalated" | "resolved";

/** 넘길 때 상담원이 다른 화면을 찾지 않아도 되게 모으는 맥락 (docs/auto-response-design.md 4절) */
export type TicketContext = {
  /** 검색 상위 문서 (문서별 최고 점수) */
  nearestDocs: { docId: string; title: string; score: number }[];
  /** 질문 의미가 비슷한 처리 완료 티켓 (질문 벡터 코사인, SIMILAR_MIN_SCORE 이상) */
  similar: { id: string; question: string; finalReply: string; resolvedAt: string; score: number }[];
};

export type Ticket = {
  id: string;
  createdAt: string;
  updatedAt: string;
  channel: "web";
  /** 개인정보를 가린 고객 문의 */
  question: string;
  status: TicketStatus;
  /** 자동 응답이면 null */
  reason: EscalationReason | null;
  /** 모델 호출이 실패했으면 null */
  answer: Answer | null;
  /** 답장 초안 (자동 응답이면 실제 보낸 답장) */
  draft: CustomerReply | null;
  context: TicketContext;
  /** 고객에게 나간 최종 답장 */
  finalReply: string | null;
  resolvedAt: string | null;
  /** 자동 응답 사후 검수 */
  review: "ok" | "wrong" | null;
  /** 가장 가까운 문서 */
  nearestDocId: string | null;
  /** 질문 벡터. 비슷한 과거 티켓 찾기용, API 응답에는 넣지 않음. 모델 호출 실패면 null */
  embedding: number[] | null;
};

/**
 * 비슷한 과거 티켓 기준. 실측(text-embedding-3-small): 같은 뜻 0.56~0.80, 다른 주제 0.10~0.44
 * 처음엔 "가장 가까운 문서가 같은 티켓"으로 찾았는데, 근거 없는 문의는 가까운 문서가 엉뚱해서(해외 시청 → 쿠폰 0.27) 맥락이 가장 필요한 곳에서 실패
 */
export const SIMILAR_MIN_SCORE = 0.5;

export type TicketEventType =
  | "created"
  | "auto_replied"
  | "escalated"
  | "notified"
  | "notify_failed"
  | "agent_replied"
  | "reviewed"
  | "sla_reminded";

export type TicketEvent = { ticketId: string; at: string; type: TicketEventType; detail: Record<string, unknown> };

export type TicketStore = {
  create(ticket: Ticket): Promise<void>;
  get(id: string): Promise<Ticket | null>;
  update(id: string, patch: Partial<Ticket>): Promise<void>;
  /** 최신순 */
  list(opts: { status?: TicketStatus; limit: number }): Promise<Ticket[]>;
  /** 질문 벡터가 비슷한 처리 완료 티켓, 유사도 높은 순 */
  similarResolved(vector: number[], limit: number, minScore: number): Promise<(Ticket & { score: number })[]>;
  addEvent(e: TicketEvent): Promise<void>;
  events(ticketId: string): Promise<TicketEvent[]>;
  /** since 이후 생성된 티켓 (운영 탭 집계) */
  since(since: Date): Promise<Ticket[]>;
  /** 가장 최근 이벤트 시각 (SLA 알림 중복 방지) */
  lastEvent(ticketId: string, type: TicketEventType): Promise<string | null>;
};

export function newTicket(input: {
  question: string;
  answer: Answer | null;
  draft: CustomerReply | null;
  reason: EscalationReason | null;
  context: TicketContext;
  embedding: number[] | null;
  now: Date;
}): Ticket {
  const at = input.now.toISOString();
  const auto = input.reason === null;
  return {
    id: randomUUID(),
    createdAt: at,
    updatedAt: at,
    channel: "web",
    question: input.question,
    status: auto ? "auto_replied" : "escalated",
    reason: input.reason,
    answer: input.answer,
    draft: input.draft,
    context: input.context,
    // 자동 응답은 초안이 곧 보낸 답장
    finalReply: auto ? (input.draft?.text ?? null) : null,
    resolvedAt: null,
    review: null,
    nearestDocId: input.answer?.trace.retrieved[0]?.docId ?? null,
    embedding: input.embedding,
  };
}

/** 검색 결과를 문서별 최고 점수로 묶음. 조각 여러 개가 같은 문서면 하나로 */
export function nearestDocs(answer: Answer | null, titles: Record<string, string>, limit = 3): TicketContext["nearestDocs"] {
  if (!answer) return [];
  const best = new Map<string, number>();
  for (const h of answer.trace.retrieved) best.set(h.docId, Math.max(best.get(h.docId) ?? 0, h.score));
  return [...best]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([docId, score]) => ({ docId, title: titles[docId] ?? docId, score }));
}

export function memoryTicketStore(): TicketStore & { tickets: Ticket[]; log: TicketEvent[] } {
  const tickets: Ticket[] = [];
  const log: TicketEvent[] = [];
  const newest = (a: Ticket, b: Ticket) => b.createdAt.localeCompare(a.createdAt);
  return {
    tickets,
    log,
    async create(t) {
      tickets.push(structuredClone(t));
    },
    async get(id) {
      const t = tickets.find((x) => x.id === id);
      return t ? structuredClone(t) : null;
    },
    async update(id, patch) {
      const t = tickets.find((x) => x.id === id);
      if (t) Object.assign(t, structuredClone(patch));
    },
    async list({ status, limit }) {
      return tickets.filter((t) => !status || t.status === status).sort(newest).slice(0, limit).map((t) => structuredClone(t));
    },
    async similarResolved(vector, limit, minScore) {
      return tickets
        .filter((t) => t.status === "resolved" && t.finalReply && t.embedding)
        .map((t) => ({ ...structuredClone(t), score: cosine(vector, t.embedding!) }))
        .filter((t) => t.score >= minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    },
    async addEvent(e) {
      log.push(structuredClone(e));
    },
    async events(ticketId) {
      return log.filter((e) => e.ticketId === ticketId).sort((a, b) => a.at.localeCompare(b.at));
    },
    async since(since) {
      const s = since.toISOString();
      return tickets.filter((t) => t.createdAt >= s).map((t) => structuredClone(t));
    },
    async lastEvent(ticketId, type) {
      const es = log.filter((e) => e.ticketId === ticketId && e.type === type).map((e) => e.at).sort();
      return es.at(-1) ?? null;
    },
  };
}
