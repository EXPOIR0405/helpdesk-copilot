import { describeError, type Alerter } from "../core/alerts.ts";
import type { CustomerReply } from "../core/reply.ts";
import type { OpsData } from "../core/report.ts";
import type { Answer, Usage } from "../core/types.ts";
import { failureEntry, toEntry, type UsageKind, type UsageLog } from "../core/usage.ts";
import type { AnswerStore, Quota } from "./stores.ts";

export type ApiDeps = {
  copilot: { ask(question: string): Promise<Answer> };
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

  const routes: Record<string, Handler> = {
    "POST /api/ask": async (req) => {
      const body = await readJson(req);
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
  };

  return async (req) => {
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
}
