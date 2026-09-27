import { describe, expect, it, vi } from "vitest";
import type { CustomerReply } from "../src/core/reply.ts";
import type { Answer } from "../src/core/types.ts";
import { createApi, type ApiDeps } from "../src/server/api.ts";
import type { Alert } from "../src/core/alerts.ts";
import { memoryUsageLog } from "../src/core/usage.ts";
import { memoryAnswerStore, memoryQuota, questionKey } from "../src/server/stores.ts";

const answer: Answer = {
  status: "answered",
  text: "쿠폰은 1장만 적용됩니다.",
  confidence: "high",
  citations: [],
  trace: { topScore: 0.6, grounding: "full", retrieved: [] },
};

function setup(over: Partial<ApiDeps["limits"]> & { cronSecret?: string; health?: ApiDeps["health"] } = {}) {
  const { cronSecret, health, ...limits } = over;
  let t = new Date("2026-09-26T00:00:00Z");
  const now = () => t;
  const ask = vi.fn(async () => answer);
  const write = vi.fn(async (): Promise<CustomerReply> => ({ text: "안녕하세요. 1장만 됩니다.", unsupportedNumbers: [] }));
  const keepalive = vi.fn(async () => {});
  const usage = memoryUsageLog();
  const alerts: Alert[] = [];
  const handle = createApi({
    copilot: { ask },
    replyWriter: { write },
    answers: memoryAnswerStore(now),
    quota: memoryQuota(now),
    ops: async () => ({ syncedAt: null, models: { embedding: "e", generation: "g" }, docs: [], unanswered: [], eval: null }),
    policyDocs: async () => [{ id: "refund", title: "환불 정책", status: "confirmed", updatedAt: "2026-09-02", body: "## 기준" }],
    keepalive,
    limits: {
      questionMaxChars: 20,
      perIpPerMinute: 100,
      perIpDailyModelCalls: 100,
      dailyModelCalls: 100,
      answerCacheHours: 24,
      dailyBudgetUsd: 1,
      budgetAlertRatio: 0.8,
      ...limits,
    },
    usage,
    alerts: { notify: async (a) => void alerts.push(a) },
    generationModel: "gpt-5.4-mini",
    health: health ?? (async () => ({ chunks: 30, syncedAt: "2026-09-26T00:00:00Z" })),
    cronSecret,
    now,
  });
  const call = async (method: string, path: string, body?: unknown, headers: Record<string, string> = {}) => {
    const res = await handle(
      new Request(`http://x${path}`, { method, headers: { "content-type": "application/json", ...headers }, body: body === undefined ? undefined : JSON.stringify(body) }),
    );
    return { status: res.status, body: await res.json() };
  };
  return { call, ask, write, keepalive, usage, alerts, advance: (ms: number) => (t = new Date(t.getTime() + ms)) };
}

describe("POST /api/ask", () => {
  it("빈 질문·너무 긴 질문은 모델 호출 없이 400", async () => {
    const { call, ask } = setup();
    expect((await call("POST", "/api/ask", { question: "  " })).status).toBe(400);
    expect((await call("POST", "/api/ask", { question: "가".repeat(21) })).body.code).toBe("too_long");
    expect((await call("POST", "/api/ask", "not json")).status).toBe(400);
    expect(ask).not.toHaveBeenCalled();
  });

  it("같은 질문은 캐시에서 같은 answerId로, 캐시 시간이 지나면 다시 호출", async () => {
    const { call, ask, advance } = setup();
    const first = await call("POST", "/api/ask", { question: "쿠폰 두 장?" });
    const again = await call("POST", "/api/ask", { question: " 쿠폰  두 장 " });
    expect(again.body).toMatchObject({ cached: true, answerId: first.body.answerId });
    expect(ask).toHaveBeenCalledTimes(1);
    advance(25 * 3_600_000);
    expect((await call("POST", "/api/ask", { question: "쿠폰 두 장?" })).body.cached).toBe(false);
    expect(ask).toHaveBeenCalledTimes(2);
  });

  it("IP별 분당 제한, 1분 지나면 풀림", async () => {
    const { call, advance } = setup({ perIpPerMinute: 2 });
    const ip = { "x-forwarded-for": "1.1.1.1, 10.0.0.1" };
    await call("POST", "/api/ask", { question: "a" }, ip);
    await call("POST", "/api/ask", { question: "b" }, ip);
    expect((await call("POST", "/api/ask", { question: "c" }, ip)).body.code).toBe("rate_limited");
    expect((await call("POST", "/api/ask", { question: "c" }, { "x-forwarded-for": "2.2.2.2" })).status).toBe(200);
    advance(60_000);
    expect((await call("POST", "/api/ask", { question: "c" }, ip)).status).toBe(200);
  });

  it("하루 상한은 모델 호출만 셈. 캐시 적중은 상한에 걸려도 응답", async () => {
    const { call } = setup({ dailyModelCalls: 1 });
    await call("POST", "/api/ask", { question: "a" });
    expect((await call("POST", "/api/ask", { question: "b" })).body.code).toBe("daily_cap");
    expect((await call("POST", "/api/ask", { question: "a" })).body.cached).toBe(true);
  });

  it("IP별 하루 상한: 다른 IP는 계속 쓸 수 있고, 막힌 요청은 전체 한도를 깎지 않음", async () => {
    const { call } = setup({ perIpDailyModelCalls: 1, dailyModelCalls: 2 });
    const a = { "x-forwarded-for": "1.1.1.1" };
    const b = { "x-forwarded-for": "2.2.2.2" };
    await call("POST", "/api/ask", { question: "a" }, a);
    expect((await call("POST", "/api/ask", { question: "b" }, a)).body.code).toBe("daily_cap");
    expect((await call("POST", "/api/ask", { question: "b" }, a)).body.code).toBe("daily_cap");
    expect((await call("POST", "/api/ask", { question: "c" }, b)).status).toBe(200);
  });
});

describe("POST /api/reply", () => {
  it("저장된 답변으로만 만들고, 두 번째는 저장된 초안 재사용, fresh면 새로 생성", async () => {
    const { call, write } = setup();
    const { answerId } = (await call("POST", "/api/ask", { question: "쿠폰?" })).body;
    expect((await call("POST", "/api/reply", { answerId })).body.text).toContain("1장");
    await call("POST", "/api/reply", { answerId });
    expect(write).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenCalledWith("쿠폰?", answer);
    await call("POST", "/api/reply", { answerId, fresh: true });
    expect(write).toHaveBeenCalledTimes(2);
  });

  it("없는 answerId는 404, 누락은 400", async () => {
    const { call, write } = setup();
    expect((await call("POST", "/api/reply", { answerId: "nope" })).status).toBe(404);
    expect((await call("POST", "/api/reply", {})).status).toBe(400);
    expect(write).not.toHaveBeenCalled();
  });
});

describe("GET /api/keepalive", () => {
  it("Cron 비밀값이 맞을 때만 실행", async () => {
    const { call, keepalive } = setup({ cronSecret: "s3cret" });
    expect((await call("GET", "/api/keepalive")).status).toBe(401);
    expect((await call("GET", "/api/keepalive", undefined, { authorization: "Bearer wrong" })).status).toBe(401);
    expect((await call("GET", "/api/keepalive", undefined, { authorization: "Bearer s3cret" })).status).toBe(200);
    expect(keepalive).toHaveBeenCalledTimes(1);
  });

  it("비밀값이 설정되지 않았으면 항상 거부", async () => {
    const { call } = setup();
    expect((await call("GET", "/api/keepalive", undefined, { authorization: "Bearer undefined" })).status).toBe(401);
  });
});

it("GET /api/docs: 정책 문서 원문 목록", async () => {
  const { call } = setup();
  const res = await call("GET", "/api/docs");
  expect(res.body[0]).toMatchObject({ id: "refund", body: "## 기준" });
});

it("없는 경로는 404, 처리 중 예외는 500으로 감쌈", async () => {
  const { call, ask } = setup();
  expect((await call("GET", "/api/nope")).status).toBe(404);
  ask.mockRejectedValueOnce(new Error("boom"));
  vi.spyOn(console, "error").mockImplementation(() => {});
  expect((await call("POST", "/api/ask", { question: "x" })).body.code).toBe("server_error");
});

it("questionKey: 띄어쓰기·끝 문장부호 차이 무시", () => {
  expect(questionKey("  환불  돼요??")).toBe(questionKey("환불 돼요"));
});

describe("사용량 기록·알림 (2단계)", () => {
  const modelUsage = { model: "gpt-5.4-mini", inputTokens: 1_000_000, cachedInputTokens: 0, outputTokens: 0, latencyMs: 900 };

  it("모델 호출마다 비용과 함께 기록, 캐시 적중은 기록 안 함", async () => {
    const { call, ask, usage } = setup();
    ask.mockResolvedValue({ ...answer, trace: { ...answer.trace, usage: modelUsage } });
    await call("POST", "/api/ask", { question: "쿠폰?" });
    await call("POST", "/api/ask", { question: "쿠폰?" });
    expect(usage.entries).toHaveLength(1);
    expect(usage.entries[0]).toMatchObject({ kind: "verdict", model: "gpt-5.4-mini", costUsd: 0.75 });
  });

  it("오늘 비용이 예산의 80%를 넘으면 예산 알림 (하루 한 번 창)", async () => {
    const { call, ask, alerts } = setup({ dailyBudgetUsd: 1 });
    ask.mockResolvedValue({ ...answer, trace: { ...answer.trace, usage: modelUsage } }); // 호출당 $0.75
    await call("POST", "/api/ask", { question: "하나" });
    expect(alerts).toHaveLength(0);
    await call("POST", "/api/ask", { question: "둘" });
    expect(alerts).toEqual([expect.objectContaining({ key: "budget:2026-09-26", windowSeconds: 86_400 })]);
  });

  it("모델 호출 실패는 실패 기록 + 500 알림, 사용량 기록이 실패해도 응답은 정상", async () => {
    const { call, ask, usage, alerts } = setup();
    vi.spyOn(console, "error").mockImplementation(() => {});
    ask.mockRejectedValueOnce(Object.assign(new Error("overloaded"), { status: 503 }));
    expect((await call("POST", "/api/ask", { question: "x" })).status).toBe(500);
    expect(usage.entries[0]).toMatchObject({ kind: "verdict", error: "503 overloaded", costUsd: 0 });
    expect(alerts[0]).toMatchObject({ level: "error", key: "server_error:/api/ask" });

    ask.mockResolvedValue({ ...answer, trace: { ...answer.trace, usage: modelUsage } });
    usage.append = async () => {
      throw new Error("db down");
    };
    expect((await call("POST", "/api/ask", { question: "y" })).status).toBe(200);
  });

  it("GET /api/health: 정상이면 200, 저장소 오류·조각 0개면 503 + 알림, 내부 오류는 응답에 안 드러냄", async () => {
    expect((await setup().call("GET", "/api/health")).body).toMatchObject({ ok: true, chunks: 30, model: "gpt-5.4-mini" });

    const down = setup({ health: async () => { throw new Error("secret connection string"); } });
    const res = await down.call("GET", "/api/health");
    expect(res.status).toBe(503);
    expect(JSON.stringify(res.body)).not.toContain("secret");
    expect(down.alerts[0]).toMatchObject({ key: "health", detail: { 오류: "secret connection string" } });

    const empty = setup({ health: async () => ({ chunks: 0, syncedAt: null }) });
    expect((await empty.call("GET", "/api/health")).status).toBe(503);
  });
});
