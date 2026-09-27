import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createHelpdeskMcpServer } from "../mcp/server.ts";
import { describeError, type Alerter } from "../core/alerts.ts";
import type { CustomerReply } from "../core/reply.ts";
import type { OpsData } from "../core/report.ts";
import { createSupportDesk, summarizeTickets } from "../core/support.ts";
import type { Ticket, TicketStatus, TicketStore } from "../core/tickets.ts";
import { REASON_LABEL } from "../core/triage.ts";
import type { Answer, Usage } from "../core/types.ts";
import { failureEntry, toEntry, type UsageKind, type UsageLog } from "../core/usage.ts";
import type { EscalationNotifier } from "./notify.ts";
import type { AnswerStore, Quota } from "./stores.ts";

export type ApiDeps = {
  copilot: { ask(question: string): Promise<Answer>; askWithVector(question: string): Promise<{ answer: Answer; vector: number[] }> };
  replyWriter: { write(question: string, answer: Answer): Promise<CustomerReply> };
  answers: AnswerStore;
  quota: Quota;
  ops(): Promise<OpsData>;
  policyDocs(): Promise<{ id: string; title: string; status: string; updatedAt: string; body: string }[]>;
  /** DB 일시정지 방지용 가벼운 조회 + 오래된 제한 기록 정리 */
  keepalive(): Promise<void>;
  limits: {
    questionMaxChars: number;
    perIpPerMinute: number;
    perIpDailyModelCalls: number;
    dailyModelCalls: number;
    answerCacheHours: number;
    dailyBudgetUsd: number;
    budgetAlertRatio: number;
  };
  /** 모델 호출 기록 (비용·지연·대체·실패) */
  usage: UsageLog;
  alerts: Alerter;
  /** 실패 기록에 남길 기본 모델 id */
  generationModel: string;
  /** 저장소에 닿는지, 검색할 조각이 있는지. 닿지 못하면 던짐 */
  health(): Promise<{ chunks: number; syncedAt: string | null }>;
  /** Vercel Cron이 Authorization 헤더로 보내는 값. 없으면 keepalive 거부 */
  cronSecret?: string;
  /** 자동 응대 (docs/auto-response-design.md). 없으면 티켓 경로 비활성 */
  tickets?: {
    store: TicketStore;
    docTitles(): Promise<Record<string, string>>;
    notify: EscalationNotifier;
    /** 상담원 대기가 이 시간을 넘으면 SLA 초과 */
    slaMinutes: number;
    /** SLA 알림 재알림 간격 */
    remindEveryMinutes: number;
    /** n8n → API 호출 인증 (x-helpdesk-secret). 없으면 n8n 전용 경로 거부 */
    n8nSecret?: string;
  };
  now?: () => Date;
};

type Handler = (req: Request) => Promise<Response>;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const fail = (status: number, code: string, error: string) => json({ code, error }, status);

/** Vercel은 x-forwarded-for 첫 값에 실제 클라이언트 IP를 넣음 */
function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function createApi(deps: ApiDeps): Handler {
  const now = deps.now ?? (() => new Date());
  const { limits } = deps;

  const perIp = (req: Request) => deps.quota.take(`ip:${clientIp(req)}`, 60, limits.perIpPerMinute);
  const RATE_LIMITED = () => fail(429, "rate_limited", "요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.");

  // 모델을 실제로 부르기 직전에만 셈. 캐시 적중은 하루 상한에 포함하지 않음
  // IP별 상한을 먼저 확인해서, 한 방문자에게 막힌 요청이 전체 한도를 깎지 않게 함
  async function dailyCap(req: Request): Promise<Response | null> {
    const day = now().toISOString().slice(0, 10);
    if (!(await deps.quota.take(`day:${day}:ip:${clientIp(req)}`, 86_400, limits.perIpDailyModelCalls))) {
      return fail(429, "daily_cap", "이 네트워크에서 오늘 쓸 수 있는 데모 호출을 모두 썼습니다.");
    }
    if (!(await deps.quota.take(`day:${day}`, 86_400, limits.dailyModelCalls))) {
      return fail(429, "daily_cap", "오늘 데모 호출 한도를 모두 썼습니다.");
    }
    return null;
  }

  // 기록·알림은 부가 기능: 실패해도 응답은 그대로 (서버리스라 끝나기 전에 await로 마침)
  async function recordUsage(usage: Usage | undefined, kind: UsageKind) {
    if (!usage) return;
    try {
      await deps.usage.append(toEntry(usage, kind, now()));
      await checkBudget();
    } catch (e) {
      console.error("사용량 기록 실패", e);
    }
  }

  async function checkBudget() {
    const day = now().toISOString().slice(0, 10);
    const spent = await deps.usage.costSince(new Date(`${day}T00:00:00Z`));
    if (spent < limits.dailyBudgetUsd * limits.budgetAlertRatio) return;
    await deps.alerts.notify({
      level: "warn",
      key: `budget:${day}`,
      title: `오늘 모델 비용이 예산의 ${Math.round(limits.budgetAlertRatio * 100)}%를 넘음`,
      detail: { 사용: `$${spent.toFixed(3)}`, 예산: `$${limits.dailyBudgetUsd}`, 날짜: day },
      // 날짜별 key라 하루 한 번
      windowSeconds: 86_400,
    });
  }

  /** 모델 호출. 실패하면 실패 기록을 남기고 그대로 던짐 (알림은 500 처리에서) */
  async function callModel<T>(kind: UsageKind, fn: () => Promise<T>, usageOf: (t: T) => Usage | undefined): Promise<T> {
    let result: T;
    try {
      result = await fn();
    } catch (e) {
      await deps.usage
        .append(failureEntry(deps.generationModel, kind, now(), describeError(e)))
        .catch((err) => console.error("실패 기록 실패", err));
      throw e;
    }
    await recordUsage(usageOf(result), kind);
    return result;
  }

  /** 질문 본문 검사. 문제가 있으면 오류 응답 */
  function readQuestion(body: Record<string, unknown> | null): string | Response {
    const question = typeof body?.question === "string" ? body.question.trim() : "";
    if (!question) return fail(400, "bad_request", "질문을 입력해 주세요.");
    // UTF-8이 아닌 본문(예: Windows curl의 CP949)은 깨진 문자(U+FFFD)로 들어옴
    // 그대로 받으면 엉뚱한 검색 → "근거 없음" → 미답변 리포트가 깨진 질문으로 오염됨
    if (question.includes("�")) {
      return fail(400, "bad_encoding", "질문 인코딩을 읽을 수 없습니다. UTF-8로 보내 주세요.");
    }
    if (question.length > limits.questionMaxChars) {
      return fail(400, "too_long", `질문은 ${limits.questionMaxChars}자까지 입력할 수 있습니다.`);
    }
    return question;
  }

  const desk =
    deps.tickets &&
    createSupportDesk({
      ask: (q) => callModel("verdict", () => deps.copilot.askWithVector(q), (r) => r.answer.trace.usage),
      writeReply: (q, a) => callModel("reply", () => deps.replyWriter.write(q, a), (r) => r.usage),
      store: deps.tickets.store,
      docTitles: deps.tickets.docTitles,
      notifyEscalated: deps.tickets.notify,
      now,
    });
  const NO_TICKETS = () => fail(404, "not_found", "자동 응대가 설정되지 않았습니다.");
  const TICKET_STATUSES: TicketStatus[] = ["auto_replied", "escalated", "resolved"];
  const n8nAuthorized = (req: Request) => !!deps.tickets?.n8nSecret && req.headers.get("x-helpdesk-secret") === deps.tickets.n8nSecret;
  const minutesSince = (iso: string) => Math.floor((now().getTime() - Date.parse(iso)) / 60_000);
  /** 목록용 요약. 상세(맥락·초안)는 /api/ticket */
  const summary = (t: Ticket) => ({
    id: t.id,
    createdAt: t.createdAt,
    question: t.question,
    status: t.status,
    reason: t.reason,
    reasonLabel: t.reason ? REASON_LABEL[t.reason] : null,
    review: t.review,
    waitingMinutes: t.status === "escalated" ? minutesSince(t.createdAt) : null,
  });

  const routes: Record<string, Handler> = {
    "POST /api/ask": async (req) => {
      const question = readQuestion(await readJson(req));
      if (question instanceof Response) return question;
      if (!(await perIp(req))) return RATE_LIMITED();

      const since = new Date(now().getTime() - limits.answerCacheHours * 3_600_000);
      const cached = await deps.answers.findRecent(question, since);
      if (cached) return json({ answer: cached.answer, answerId: cached.id, cached: true });

      const capped = await dailyCap(req);
      if (capped) return capped;
      const answer = await callModel("verdict", () => deps.copilot.ask(question), (a) => a.trace.usage);
      const answerId = await deps.answers.save(question, answer);
      return json({ answer, answerId, cached: false });
    },

    "POST /api/reply": async (req) => {
      const body = await readJson(req);
      const answerId = typeof body?.answerId === "string" ? body.answerId : "";
      if (!answerId) return fail(400, "bad_request", "answerId가 필요합니다.");
      if (!(await perIp(req))) return RATE_LIMITED();

      // 클라이언트가 보낸 텍스트가 아니라 서버에 저장된 답변으로만 답장을 만듦
      const stored = await deps.answers.get(answerId);
      if (!stored) return fail(404, "not_found", "답변을 찾지 못했습니다. 질문을 다시 보내 주세요.");
      if (stored.reply && body?.fresh !== true) return json(stored.reply);

      const capped = await dailyCap(req);
      if (capped) return capped;
      const reply = await callModel("reply", () => deps.replyWriter.write(stored.question, stored.answer), (r) => r.usage);
      await deps.answers.saveReply(answerId, reply);
      return json(reply);
    },

    // 고객 문의 접수 → 자동 응답 또는 상담원에게 넘김. 모델 호출 2번(판단·답장)이라 하루 상한도 2번 셈
    "POST /api/tickets": async (req) => {
      if (!desk) return NO_TICKETS();
      const question = readQuestion(await readJson(req));
      if (question instanceof Response) return question;
      if (!(await perIp(req))) return RATE_LIMITED();
      const capped = (await dailyCap(req)) ?? (await dailyCap(req));
      if (capped) return capped;
      const t = await desk.submit(question);
      // 고객에게는 결과만: 자동 답장 또는 접수 안내
      return json({ ...summary(t), reply: t.status === "auto_replied" ? t.finalReply : null });
    },

    "GET /api/tickets": async (req) => {
      if (!desk) return NO_TICKETS();
      const status = new URL(req.url).searchParams.get("status") as TicketStatus | null;
      if (status && !TICKET_STATUSES.includes(status)) return fail(400, "bad_request", "알 수 없는 상태입니다.");
      return json((await desk.list({ status: status ?? undefined, limit: 50 })).map(summary));
    },

    "GET /api/ticket": async (req) => {
      if (!desk) return NO_TICKETS();
      const found = await desk.get(new URL(req.url).searchParams.get("id") ?? "");
      if (!found) return fail(404, "not_found", "티켓을 찾지 못했습니다.");
      // 질문 벡터(1536개 숫자)는 응답에서 뺌
      const { embedding: _, ...ticket } = found.ticket;
      return json({ ...found, ticket: { ...ticket, ...summary(found.ticket) } });
    },

    "POST /api/ticket-reply": async (req) => {
      if (!desk) return NO_TICKETS();
      const body = await readJson(req);
      const id = typeof body?.id === "string" ? body.id : "";
      const text = typeof body?.text === "string" ? body.text.trim() : "";
      if (!id || !text) return fail(400, "bad_request", "id와 답장이 필요합니다.");
      if (text.length > 2000) return fail(400, "too_long", "답장은 2000자까지 보낼 수 있습니다.");
      if (!(await perIp(req))) return RATE_LIMITED();
      const r = await desk.agentReply(id, text);
      if (r === "not_found") return fail(404, "not_found", "티켓을 찾지 못했습니다.");
      if (r === "not_escalated") return fail(409, "not_escalated", "상담원 대기 중인 티켓이 아닙니다.");
      return json(summary(r));
    },

    "POST /api/ticket-review": async (req) => {
      if (!desk) return NO_TICKETS();
      const body = await readJson(req);
      const id = typeof body?.id === "string" ? body.id : "";
      const verdict = body?.verdict;
      if (!id || (verdict !== "ok" && verdict !== "wrong")) return fail(400, "bad_request", "id와 verdict(ok·wrong)가 필요합니다.");
      if (!(await perIp(req))) return RATE_LIMITED();
      const r = await desk.review(id, verdict);
      if (r === "not_found") return fail(404, "not_found", "티켓을 찾지 못했습니다.");
      if (r === "not_auto") return fail(409, "not_auto", "자동 응답한 티켓만 검수합니다.");
      return json(summary(r));
    },

    "GET /api/tickets-stats": async () => {
      if (!desk || !deps.tickets) return NO_TICKETS();
      const since = new Date(now().getTime() - 7 * 86_400_000);
      return json({ days: 7, slaMinutes: deps.tickets.slaMinutes, ...summarizeTickets(await deps.tickets.store.since(since), now(), deps.tickets.slaMinutes) });
    },

    // n8n 전용: SLA 초과 티켓 조회 (10분마다)
    "GET /api/tickets-overdue": async (req) => {
      if (!desk || !deps.tickets) return NO_TICKETS();
      if (!n8nAuthorized(req)) return fail(401, "unauthorized", "인증이 필요합니다.");
      const due = await desk.overdue(deps.tickets.slaMinutes, deps.tickets.remindEveryMinutes);
      return json(due.map((t) => ({ ...summary(t), url: `${new URL(req.url).origin}/#/inbox/${t.id}` })));
    },

    // n8n 전용: 알림 결과 기록
    "POST /api/ticket-event": async (req) => {
      if (!desk) return NO_TICKETS();
      if (!n8nAuthorized(req)) return fail(401, "unauthorized", "인증이 필요합니다.");
      const body = await readJson(req);
      const id = typeof body?.id === "string" ? body.id : "";
      if (!id || body?.type !== "sla_reminded") return fail(400, "bad_request", "id와 type(sla_reminded)이 필요합니다.");
      if (!(await desk.get(id))) return fail(404, "not_found", "티켓을 찾지 못했습니다.");
      await desk.markReminded(id, typeof body?.via === "string" ? body.via : "n8n");
      return json({ ok: true });
    },

    "GET /api/ops": async () => json(await deps.ops()),

    "GET /api/docs": async () => json(await deps.policyDocs()),

    // 외부 가동 시간 모니터가 주기적으로 호출. 모델은 부르지 않음 (호출마다 비용이 들어서)
    "GET /api/health": async (req) => {
      if (!(await perIp(req))) return RATE_LIMITED();
      try {
        const { chunks, syncedAt } = await deps.health();
        if (chunks === 0) throw new Error("검색할 조각이 0개 (동기화 필요)");
        return json({ ok: true, chunks, syncedAt, model: deps.generationModel, at: now().toISOString() });
      } catch (e) {
        await deps.alerts.notify({ level: "error", key: "health", title: "헬스체크 실패", detail: { 오류: describeError(e) } });
        // 내부 오류 메시지는 알림으로만. 공개 응답에는 상태만
        return json({ ok: false, at: now().toISOString() }, 503);
      }
    },

    "GET /api/keepalive": async (req) => {
      if (!deps.cronSecret || req.headers.get("authorization") !== `Bearer ${deps.cronSecret}`) {
        return fail(401, "unauthorized", "인증이 필요합니다.");
      }
      await deps.keepalive();
      return json({ ok: true, at: now().toISOString() });
    },

    // 원격 MCP (Streamable HTTP, 무상태): 도구 정의는 stdio와 같고, 도구가 이 API를 내부에서 그대로 호출
    // → 호출 제한·입력 검사·사용량 기록을 우회하지 않음. 호출자 IP를 넘겨 IP별 제한도 그대로
    "POST /api/mcp": async (req) => {
      const forwarded = Object.fromEntries(
        ["x-forwarded-for", "x-real-ip"].flatMap((h) => (req.headers.get(h) ? [[h, req.headers.get(h)!]] : [])),
      );
      const server = createHelpdeskMcpServer((path, init) =>
        handle(new Request(`http://internal${path}`, { ...init, headers: { ...forwarded, ...(init?.headers as Record<string, string>) } })),
      );
      const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
      await server.connect(transport);
      return transport.handleRequest(req);
    },
    // 무상태라 서버→클라이언트 스트림(GET)·세션 종료(DELETE)는 없음
    "GET /api/mcp": async () => MCP_METHOD_NOT_ALLOWED(),
    "DELETE /api/mcp": async () => MCP_METHOD_NOT_ALLOWED(),
  };

  const handle: Handler = async (req) => {
    const route = routes[`${req.method} ${new URL(req.url).pathname}`];
    if (!route) return fail(404, "not_found", "없는 경로입니다.");
    try {
      return await route(req);
    } catch (e) {
      console.error(e);
      const path = new URL(req.url).pathname;
      await deps.alerts.notify({
        level: "error",
        key: `server_error:${path}`,
        title: "요청 처리 실패 (500)",
        detail: { 경로: path, 모델: deps.generationModel, 오류: describeError(e) },
      });
      return fail(500, "server_error", "서버 오류가 발생했습니다.");
    }
  };
  return handle;
}

const MCP_METHOD_NOT_ALLOWED = () =>
  new Response(JSON.stringify({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed (stateless server)" }, id: null }), {
    status: 405,
    headers: { "content-type": "application/json", allow: "POST" },
  });
