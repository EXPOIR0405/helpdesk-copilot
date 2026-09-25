import type { CustomerReply } from "../core/reply.ts";
import type { OpsData } from "../core/report.ts";
import type { Answer } from "../core/types.ts";
import type { AnswerStore, Quota } from "./stores.ts";

export type ApiDeps = {
  copilot: { ask(question: string): Promise<Answer> };
  replyWriter: { write(question: string, answer: Answer): Promise<CustomerReply> };
  answers: AnswerStore;
  quota: Quota;
  ops(): Promise<OpsData>;
  /** DB 일시정지 방지용 가벼운 조회 + 오래된 제한 기록 정리 */
  keepalive(): Promise<void>;
  limits: { questionMaxChars: number; perIpPerMinute: number; dailyModelCalls: number; answerCacheHours: number };
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
  // 모델을 실제로 부르기 직전에만 셈. 캐시 적중은 하루 상한에 포함하지 않음
  const daily = () => deps.quota.take(`day:${now().toISOString().slice(0, 10)}`, 86_400, limits.dailyModelCalls);
  const RATE_LIMITED = () => fail(429, "rate_limited", "요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.");
  const DAILY_CAP = () => fail(429, "daily_cap", "오늘 데모 호출 한도를 모두 썼습니다.");

  const routes: Record<string, Handler> = {
    "POST /api/ask": async (req) => {
      const body = await readJson(req);
      const question = typeof body?.question === "string" ? body.question.trim() : "";
      if (!question) return fail(400, "bad_request", "질문을 입력해 주세요.");
      if (question.length > limits.questionMaxChars) {
        return fail(400, "too_long", `질문은 ${limits.questionMaxChars}자까지 입력할 수 있습니다.`);
      }
      if (!(await perIp(req))) return RATE_LIMITED();

      const since = new Date(now().getTime() - limits.answerCacheHours * 3_600_000);
      const cached = await deps.answers.findRecent(question, since);
      if (cached) return json({ answer: cached.answer, answerId: cached.id, cached: true });

      if (!(await daily())) return DAILY_CAP();
      const answer = await deps.copilot.ask(question);
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

      if (!(await daily())) return DAILY_CAP();
      const reply = await deps.replyWriter.write(stored.question, stored.answer);
      await deps.answers.saveReply(answerId, reply);
      return json(reply);
    },

    "GET /api/ops": async () => json(await deps.ops()),

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
      return fail(500, "server_error", "서버 오류가 발생했습니다.");
    }
  };
}
