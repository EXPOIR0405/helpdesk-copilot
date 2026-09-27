import type { CustomerReply } from "./reply.ts";
import { newTicket, nearestDocs, SIMILAR_MIN_SCORE, type Ticket, type TicketEvent, type TicketStore } from "./tickets.ts";
import { decideRoute, maskPII, type EscalationReason, type Route } from "./triage.ts";
import type { Answer } from "./types.ts";

export type SupportDeskDeps = {
  /** 코파일럿 판단 + 질문 벡터 (사용량 기록·실패 기록은 호출하는 쪽에서 감쌈) */
  ask(question: string): Promise<{ answer: Answer; vector: number[] }>;
  writeReply(question: string, answer: Answer): Promise<CustomerReply>;
  store: TicketStore;
  /** 문서 id → 제목 (맥락 표시용) */
  docTitles(): Promise<Record<string, string>>;
  /** 넘김 알림 (n8n webhook, 실패하면 Slack 직접). 결과를 이벤트로 남김 */
  notifyEscalated(ticket: Ticket): Promise<{ via: string; ok: boolean; error?: string }>;
  now?: () => Date;
};

const SIMILAR_LIMIT = 3;

export function createSupportDesk(deps: SupportDeskDeps) {
  const now = deps.now ?? (() => new Date());
  const event = (ticketId: string, type: TicketEvent["type"], detail: Record<string, unknown> = {}) =>
    deps.store.addEvent({ ticketId, at: now().toISOString(), type, detail });

  return {
    /**
     * 고객 문의 한 건 처리. 모델이 실패해도 문의는 잃지 않고 "처리 실패"로 상담원에게 넘김
     */
    async submit(rawQuestion: string): Promise<Ticket> {
      const question = maskPII(rawQuestion.trim());
      let answer: Answer | null = null;
      let vector: number[] | null = null;
      let draft: CustomerReply | null = null;
      let route: Route;
      let error: string | undefined;
      try {
        ({ answer, vector } = await deps.ask(question));
        draft = await deps.writeReply(question, answer);
        route = decideRoute(answer, draft);
      } catch (e) {
        error = e instanceof Error ? e.message : String(e);
        route = { route: "escalate", reason: "error" };
      }

      const reason: EscalationReason | null = route.route === "auto" ? null : route.reason;
      const [titles, similar] = await Promise.all([
        deps.docTitles(),
        reason && vector ? deps.store.similarResolved(vector, SIMILAR_LIMIT, SIMILAR_MIN_SCORE) : Promise.resolve([]),
      ]);
      const ticket = newTicket({
        question,
        answer,
        draft,
        reason,
        context: {
          nearestDocs: nearestDocs(answer, titles),
          similar: similar.map((t) => ({ id: t.id, question: t.question, finalReply: t.finalReply ?? "", resolvedAt: t.resolvedAt ?? "", score: t.score })),
        },
        embedding: vector,
        now: now(),
      });

      await deps.store.create(ticket);
      await event(ticket.id, "created", { masked: question !== rawQuestion.trim() });
      if (!reason) {
        await event(ticket.id, "auto_replied");
        return ticket;
      }
      await event(ticket.id, "escalated", { reason, ...(error ? { error: error.slice(0, 300) } : {}) });
      // 알림 실패가 문의 접수를 막지 않게
      try {
        const r = await deps.notifyEscalated(ticket);
        await event(ticket.id, r.ok ? "notified" : "notify_failed", { via: r.via, ...(r.error ? { error: r.error } : {}) });
      } catch (e) {
        await event(ticket.id, "notify_failed", { error: e instanceof Error ? e.message : String(e) });
      }
      return ticket;
    },

    async get(id: string) {
      const ticket = await deps.store.get(id);
      return ticket && { ticket, events: await deps.store.events(id) };
    },

    list: (opts: Parameters<TicketStore["list"]>[0]) => deps.store.list(opts),

    /** 상담원이 답장을 보내고 종결. 상담원 대기 티켓만 */
    async agentReply(id: string, text: string): Promise<Ticket | "not_found" | "not_escalated"> {
      const t = await deps.store.get(id);
      if (!t) return "not_found";
      if (t.status !== "escalated") return "not_escalated";
      const at = now().toISOString();
      const edited = text.trim() !== (t.draft?.text ?? "").trim();
      await deps.store.update(id, { status: "resolved", finalReply: text.trim(), resolvedAt: at, updatedAt: at });
      await event(id, "agent_replied", { editedDraft: edited });
      return (await deps.store.get(id))!;
    },

    /** 자동 응답 사후 검수. 틀림은 평가셋 후보 */
    async review(id: string, verdict: "ok" | "wrong"): Promise<Ticket | "not_found" | "not_auto"> {
      const t = await deps.store.get(id);
      if (!t) return "not_found";
      if (t.status !== "auto_replied") return "not_auto";
      await deps.store.update(id, { review: verdict, updatedAt: now().toISOString() });
      await event(id, "reviewed", { verdict });
      return (await deps.store.get(id))!;
    },

    /**
     * SLA 초과: 상담원 대기가 olderThanMinutes를 넘었고, 최근 remindEveryMinutes 안에 알린 적 없는 티켓
     * n8n이 주기적으로 조회해서 알리고 markReminded로 기록
     */
    async overdue(olderThanMinutes: number, remindEveryMinutes: number): Promise<Ticket[]> {
      const t0 = now().getTime();
      const waiting = (await deps.store.list({ status: "escalated", limit: 200 })).filter(
        (t) => t0 - Date.parse(t.createdAt) >= olderThanMinutes * 60_000,
      );
      const due: Ticket[] = [];
      for (const t of waiting) {
        const last = await deps.store.lastEvent(t.id, "sla_reminded");
        if (!last || t0 - Date.parse(last) >= remindEveryMinutes * 60_000) due.push(t);
      }
      return due.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },

    markReminded: (id: string, via: string) => event(id, "sla_reminded", { via }),
  };
}

export type SupportDesk = ReturnType<typeof createSupportDesk>;

export type SupportStats = {
  total: number;
  autoReplied: number;
  escalated: number;
  resolved: number;
  /** 자동 응답 / 전체 */
  autoRate: number;
  reasons: { reason: EscalationReason; count: number }[];
  /** 상담원이 처리한 티켓의 접수 → 종결 시간 중앙값(분) */
  medianResolveMinutes: number | null;
  /** 지금 기다리는 티켓 중 가장 오래된 대기(분) */
  oldestWaitingMinutes: number | null;
  overdue: number;
  review: { ok: number; wrong: number; pending: number };
};

/** 운영 탭: 기간 안에 들어온 티켓 집계 */
export function summarizeTickets(tickets: Ticket[], now: Date, slaMinutes: number): SupportStats {
  const by = (s: Ticket["status"]) => tickets.filter((t) => t.status === s);
  const reasonCounts = new Map<EscalationReason, number>();
  for (const t of tickets) if (t.reason) reasonCounts.set(t.reason, (reasonCounts.get(t.reason) ?? 0) + 1);
  const resolveMinutes = tickets
    .filter((t) => t.status === "resolved" && t.resolvedAt)
    .map((t) => (Date.parse(t.resolvedAt!) - Date.parse(t.createdAt)) / 60_000)
    .sort((a, b) => a - b);
  const waiting = by("escalated").map((t) => (now.getTime() - Date.parse(t.createdAt)) / 60_000);
  const auto = by("auto_replied");
  return {
    total: tickets.length,
    autoReplied: auto.length,
    escalated: waiting.length,
    resolved: by("resolved").length,
    autoRate: tickets.length ? auto.length / tickets.length : 0,
    reasons: [...reasonCounts].map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count),
    medianResolveMinutes: resolveMinutes.length ? resolveMinutes[Math.floor((resolveMinutes.length - 1) / 2)] : null,
    oldestWaitingMinutes: waiting.length ? Math.max(...waiting) : null,
    overdue: waiting.filter((m) => m >= slaMinutes).length,
    review: {
      ok: auto.filter((t) => t.review === "ok").length,
      wrong: auto.filter((t) => t.review === "wrong").length,
      pending: auto.filter((t) => !t.review).length,
    },
  };
}
