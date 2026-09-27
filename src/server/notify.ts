import type { Alerter } from "../core/alerts.ts";
import type { Ticket } from "../core/tickets.ts";
import { REASON_LABEL } from "../core/triage.ts";

export type EscalationNotifier = (ticket: Ticket) => Promise<{ via: string; ok: boolean; error?: string }>;

/** n8n이 받는 넘김 이벤트. 워크플로우: n8n/escalation-notify.json */
export function escalationPayload(ticket: Ticket, baseUrl: string) {
  return {
    event: "ticket.escalated",
    ticket: {
      id: ticket.id,
      question: ticket.question,
      reason: ticket.reason,
      reasonLabel: ticket.reason ? REASON_LABEL[ticket.reason] : null,
      createdAt: ticket.createdAt,
      nearestDoc: ticket.context.nearestDocs[0]?.title ?? null,
      url: `${baseUrl}/#/inbox/${ticket.id}`,
    },
  };
}

/**
 * 넘김 알림: n8n webhook이 있으면 n8n으로 (Slack 메시지·이후 채널 확장은 n8n이 맡음)
 * n8n이 없거나 실패하면 운영 알림(Slack)으로 직접 → 알림이 사라지지 않게
 */
export function createEscalationNotifier(opts: {
  n8nWebhookUrl?: string;
  /** n8n webhook의 Header Auth 값 */
  n8nSecret?: string;
  baseUrl: string;
  alerts: Alerter;
  fetchImpl?: typeof fetch;
}): EscalationNotifier {
  const fetchImpl = opts.fetchImpl ?? fetch;

  const direct = async (ticket: Ticket, why: string) => {
    const p = escalationPayload(ticket, opts.baseUrl).ticket;
    await opts.alerts.notify({
      level: "info",
      // 티켓마다 한 번
      key: `escalated:${ticket.id}`,
      title: `상담원 확인 필요 · ${p.reasonLabel}`,
      detail: { 문의: p.question.slice(0, 200), 가까운_문서: p.nearestDoc ?? "-", 열기: p.url },
    });
    return why;
  };

  return async (ticket) => {
    if (!opts.n8nWebhookUrl) {
      await direct(ticket, "no_n8n");
      return { via: "slack", ok: true };
    }
    try {
      const res = await fetchImpl(opts.n8nWebhookUrl, {
        method: "POST",
        headers: { "content-type": "application/json", ...(opts.n8nSecret ? { "x-helpdesk-secret": opts.n8nSecret } : {}) },
        body: JSON.stringify(escalationPayload(ticket, opts.baseUrl)),
        signal: AbortSignal.timeout(5_000),
      });
      if (!res.ok) throw new Error(`n8n ${res.status}`);
      return { via: "n8n", ok: true };
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      await direct(ticket, "n8n_failed");
      // n8n은 실패했지만 Slack으로는 보냄 → 접수·알림 모두 살아 있음. 실패는 이벤트로 남김
      return { via: "slack(n8n 실패)", ok: false, error };
    }
  };
}
