import { describe, expect, it, vi } from "vitest";
import type { Alert } from "../src/core/alerts.ts";
import { memoryTicketStore, type Ticket } from "../src/core/tickets.ts";
import type { Answer } from "../src/core/types.ts";
import { memoryUsageLog } from "../src/core/usage.ts";
import { createApi } from "../src/server/api.ts";
import { createEscalationNotifier, escalationPayload } from "../src/server/notify.ts";
import { memoryAnswerStore, memoryQuota } from "../src/server/stores.ts";

const usage = { model: "gemini-3.8-flash", inputTokens: 1000, cachedInputTokens: 0, outputTokens: 100, latencyMs: 800 };
const answered = (over: Partial<Answer> = {}): Answer => ({
  status: "answered",
  text: "프리미엄은 4대까지입니다.",
  confidence: "high",
  requestType: "question",
  citations: [],
  trace: { topScore: 0.7, grounding: "full", retrieved: [{ chunkId: "plans#0", docId: "plans", score: 0.7 }], usage },
  ...over,
});

function setup(opts: { n8nSecret?: string; dailyModelCalls?: number } = {}) {
  let t = new Date("2026-09-27T10:00:00Z");
  const now = () => t;
  const store = memoryTicketStore();
  const usageLog = memoryUsageLog();
  const alerts: Alert[] = [];
  const ask = vi.fn(async (): Promise<Answer> => answered());
  const write = vi.fn(async () => ({ text: "안녕하세요. 시네웨이브입니다.\n4대까지 됩니다.", unsupportedNumbers: [], usage }));
  const notify = vi.fn(async () => ({ via: "n8n", ok: true }));
  const handle = createApi({
    copilot: { ask, askWithVector: async () => ({ answer: await ask(), vector: [1, 0] }) },
    replyWriter: { write },
    answers: memoryAnswerStore(now),
    quota: memoryQuota(now),
    ops: async () => ({ syncedAt: null, models: { embedding: "e", generation: "g" }, docs: [], unanswered: [], eval: null }),
    policyDocs: async () => [],
    keepalive: async () => {},
    limits: {
      questionMaxChars: 300,
      perIpPerMinute: 100,
      perIpDailyModelCalls: 100,
      dailyModelCalls: opts.dailyModelCalls ?? 100,
      answerCacheHours: 24,
      dailyBudgetUsd: 100,
      budgetAlertRatio: 0.8,
    },
    usage: usageLog,
    alerts: { notify: async (a) => void alerts.push(a) },
    generationModel: "gemini-3.8-flash",
    health: async () => ({ chunks: 1, syncedAt: null }),
    tickets: { store, docTitles: async () => ({ plans: "요금제" }), notify, slaMinutes: 30, remindEveryMinutes: 60, n8nSecret: opts.n8nSecret },
    now,
  });
  const call = async (method: string, path: string, body?: unknown, headers: Record<string, string> = {}) => {
    const res = await handle(
      new Request(`http://x${path}`, { method, headers: { "content-type": "application/json", ...headers }, body: body === undefined ? undefined : JSON.stringify(body) }),
    );
    return { status: res.status, body: await res.json() };
  };
  return { call, ask, write, notify, store, usageLog, alerts, advance: (min: number) => (t = new Date(t.getTime() + min * 60_000)) };
}

describe("POST /api/tickets", () => {
  it("자동 응답이면 고객에게 답장까지, 판단·답장 호출 모두 사용량 기록", async () => {
    const { call, usageLog, notify } = setup();
    const r = await call("POST", "/api/tickets", { question: "프리미엄 몇 대?" });
    expect(r.body).toMatchObject({ status: "auto_replied", reason: null, reply: expect.stringContaining("4대") });
    expect(usageLog.entries.map((e) => e.kind)).toEqual(["verdict", "reply"]);
    expect(notify).not.toHaveBeenCalled();
  });

  it("넘기면 답장 없이 접수 안내, 사유 표시, 상담원 알림", async () => {
    const { call, ask, notify } = setup();
    ask.mockResolvedValueOnce(answered({ requestType: "action" }));
    const r = await call("POST", "/api/tickets", { question: "환불해 주세요" });
    expect(r.body).toMatchObject({ status: "escalated", reason: "action_request", reasonLabel: "개인 처리 요청", reply: null, waitingMinutes: 0 });
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it("모델 실패도 200으로 접수(처리 실패로 넘김), 실패는 사용량에 기록", async () => {
    const { call, ask, usageLog } = setup();
    ask.mockRejectedValueOnce(Object.assign(new Error("overloaded"), { status: 503 }));
    const r = await call("POST", "/api/tickets", { question: "프리미엄 몇 대?" });
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ status: "escalated", reason: "error" });
    expect(usageLog.entries[0]).toMatchObject({ kind: "verdict", error: "503 overloaded" });
  });

  it("질문 검사는 /api/ask와 같음, 하루 상한은 호출 2번으로 셈", async () => {
    const { call, ask } = setup({ dailyModelCalls: 3 });
    expect((await call("POST", "/api/tickets", { question: "" })).status).toBe(400);
    expect((await call("POST", "/api/tickets", { question: "�" })).body.code).toBe("bad_encoding");
    expect((await call("POST", "/api/tickets", { question: "가".repeat(301) })).body.code).toBe("too_long");
    expect(ask).not.toHaveBeenCalled();
    expect((await call("POST", "/api/tickets", { question: "하나" })).status).toBe(200); // 2 사용
    expect((await call("POST", "/api/tickets", { question: "둘" })).body.code).toBe("daily_cap"); // 3번째에서 막힘
  });
});

describe("인박스", () => {
  it("목록 필터·상세(맥락·이벤트)·상담원 답장·검수", async () => {
    const { call, ask } = setup();
    const auto = (await call("POST", "/api/tickets", { question: "프리미엄 몇 대?" })).body;
    ask.mockResolvedValueOnce(answered({ status: "unanswerable", confidence: "low" }));
    const esc = (await call("POST", "/api/tickets", { question: "해외에서 돼요?" })).body;

    expect((await call("GET", "/api/tickets?status=escalated")).body.map((t: Ticket) => t.id)).toEqual([esc.id]);
    expect((await call("GET", "/api/tickets?status=nope")).status).toBe(400);

    const detail = (await call("GET", `/api/ticket?id=${esc.id}`)).body;
    expect(detail.ticket.context.nearestDocs[0]).toMatchObject({ title: "요금제" });
    expect(detail.ticket.draft.text).toContain("4대");
    expect(detail.events.map((e: { type: string }) => e.type)).toEqual(["created", "escalated", "notified"]);

    expect((await call("POST", "/api/ticket-reply", { id: esc.id, text: "확인 후 안내드리겠습니다." })).body.status).toBe("resolved");
    expect((await call("POST", "/api/ticket-reply", { id: esc.id, text: "또" })).status).toBe(409);
    expect((await call("POST", "/api/ticket-review", { id: auto.id, verdict: "ok" })).body.review).toBe("ok");
    expect((await call("POST", "/api/ticket-review", { id: esc.id, verdict: "ok" })).status).toBe(409);
    expect((await call("GET", "/api/ticket?id=nope")).status).toBe(404);
  });

  it("통계: 7일 집계", async () => {
    const { call, ask } = setup();
    await call("POST", "/api/tickets", { question: "a" });
    ask.mockResolvedValueOnce(answered({ requestType: "action" }));
    await call("POST", "/api/tickets", { question: "b" });
    expect((await call("GET", "/api/tickets-stats")).body).toMatchObject({ days: 7, total: 2, autoReplied: 1, escalated: 1, autoRate: 0.5 });
  });
});

describe("n8n 전용 경로", () => {
  it("비밀값 없거나 틀리면 401, 맞으면 SLA 초과 목록과 알림 기록", async () => {
    const { call, ask, advance } = setup({ n8nSecret: "s3cret" });
    ask.mockResolvedValueOnce(answered({ status: "unanswerable" }));
    const esc = (await call("POST", "/api/tickets", { question: "해외?" })).body;
    expect((await call("GET", "/api/tickets-overdue")).status).toBe(401);
    expect((await call("GET", "/api/tickets-overdue", undefined, { "x-helpdesk-secret": "wrong" })).status).toBe(401);

    const auth = { "x-helpdesk-secret": "s3cret" };
    expect((await call("GET", "/api/tickets-overdue", undefined, auth)).body).toEqual([]);
    advance(31);
    const due = (await call("GET", "/api/tickets-overdue", undefined, auth)).body;
    expect(due).toEqual([expect.objectContaining({ id: esc.id, waitingMinutes: 31, url: `http://x/#/inbox/${esc.id}` })]);
    expect((await call("POST", "/api/ticket-event", { id: esc.id, type: "sla_reminded" }, auth)).body).toEqual({ ok: true });
    expect((await call("GET", "/api/tickets-overdue", undefined, auth)).body).toEqual([]);
  });

  it("n8n 비밀값이 설정되지 않았으면 항상 거부", async () => {
    const { call } = setup();
    expect((await call("GET", "/api/tickets-overdue", undefined, { "x-helpdesk-secret": "" })).status).toBe(401);
  });
});

describe("넘김 알림", () => {
  const ticket = { id: "t1", question: "해외?", reason: "unanswerable", createdAt: "2026-09-27T10:00:00Z", context: { nearestDocs: [{ docId: "d", title: "재생 오류", score: 0.4 }], similar: [] } } as unknown as Ticket;

  it("n8n webhook으로 비밀값 헤더와 함께, 실패하면 Slack 직접 + 실패로 기록", async () => {
    const sent: Alert[] = [];
    const alerts = { notify: async (a: Alert) => void sent.push(a) };
    const ok = vi.fn(async () => new Response("{}"));
    const n = createEscalationNotifier({ n8nWebhookUrl: "http://n8n/hook", n8nSecret: "s", baseUrl: "https://demo", alerts, fetchImpl: ok as unknown as typeof fetch });
    expect(await n(ticket)).toEqual({ via: "n8n", ok: true });
    const [, init] = ok.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>)["x-helpdesk-secret"]).toBe("s");
    expect(JSON.parse(init.body as string)).toEqual(escalationPayload(ticket, "https://demo"));
    expect(sent).toHaveLength(0);

    const down = vi.fn(async () => new Response("", { status: 502 }));
    const n2 = createEscalationNotifier({ n8nWebhookUrl: "http://n8n/hook", baseUrl: "https://demo", alerts, fetchImpl: down as unknown as typeof fetch });
    expect(await n2(ticket)).toMatchObject({ via: "slack(n8n 실패)", ok: false, error: "n8n 502" });
    expect(sent[0]).toMatchObject({ level: "info", key: "escalated:t1", detail: { 열기: "https://demo/#/inbox/t1" } });
  });

  it("n8n이 없으면 Slack 직접", async () => {
    const sent: Alert[] = [];
    const n = createEscalationNotifier({ baseUrl: "https://demo", alerts: { notify: async (a) => void sent.push(a) } });
    expect(await n(ticket)).toEqual({ via: "slack", ok: true });
    expect(sent[0].title).toBe("상담원 확인 필요 · 근거 없음");
  });
});
