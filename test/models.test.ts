import { describe, expect, it, vi } from "vitest";
import { costUsd, modelSpec } from "../src/core/models.ts";
import { findUnstable, summarizeUsage, type EvalRow } from "../src/core/report.ts";
import { isRetryable, withRetry } from "../src/core/retry.ts";
import type { Usage } from "../src/core/types.ts";

const usage = (u: Partial<Usage>): Usage => ({
  model: "gpt-5.4-mini",
  inputTokens: 0,
  cachedInputTokens: 0,
  outputTokens: 0,
  latencyMs: 0,
  ...u,
});

describe("costUsd", () => {
  it("캐시 적중분은 캐시 단가, 나머지는 입력 단가, 출력은 출력 단가", () => {
    // gpt-5.4-mini: 입력 0.75, 캐시 0.075, 출력 4.5 (USD / 100만 토큰)
    const cost = costUsd(usage({ inputTokens: 1_000_000, cachedInputTokens: 400_000, outputTokens: 100_000 }));
    expect(cost).toBeCloseTo(0.6 * 0.75 + 0.4 * 0.075 + 0.1 * 4.5, 10);
  });

  it("등록되지 않은 모델은 0이 아니라 NaN", () => {
    expect(costUsd(usage({ model: "unknown", inputTokens: 10 }))).toBeNaN();
  });
});

describe("modelSpec", () => {
  it("등록된 모델은 제공사와 함께 반환, 없으면 후보를 알려 주며 실패", () => {
    expect(modelSpec("gemini-3.8-flash").provider).toBe("gemini");
    expect(() => modelSpec("gpt-9")).toThrow(/gpt-5.4-mini/);
  });
});

describe("summarizeUsage", () => {
  it("비용은 모델을 안 부른 질문까지 분모에 넣고, 지연은 백분위로", () => {
    const usages = [100, 200, 300, 400].map((latencyMs) => usage({ outputTokens: 1_000_000, latencyMs }));
    const s = summarizeUsage(usages, 8);
    expect(s.calls).toBe(4);
    expect(s.costUsd).toBeCloseTo(18);
    expect(s.costPer1kQuestionsUsd).toBeCloseTo((18 / 8) * 1000);
    expect(s.latencyP50Ms).toBe(200);
    expect(s.latencyP95Ms).toBe(400);
  });

  it("호출이 없으면 0", () => {
    expect(summarizeUsage([], 3)).toMatchObject({ calls: 0, costUsd: 0, latencyP50Ms: 0 });
  });
});

describe("findUnstable", () => {
  it("회차마다 상태가 달라진 문항만", () => {
    const row = (id: string, status: EvalRow["a"]["status"]) =>
      ({ q: { id, expected_status: "answered" }, a: { status } }) as EvalRow;
    const runs = [
      [row("q1", "answered"), row("q2", "answered")],
      [row("q1", "answered"), row("q2", "unanswerable")],
    ];
    expect(findUnstable(runs)).toEqual([{ id: "q2", statuses: ["answered", "unanswerable"] }]);
  });
});

describe("withRetry", () => {
  const noSleep = { attempts: 3, baseDelayMs: 1, sleep: async () => {} };
  const err = (status?: number) => Object.assign(new Error("x"), { status });

  it("429·5xx·네트워크 오류만 재시도 대상", () => {
    expect(isRetryable(err(429))).toBe(true);
    expect(isRetryable(err(503))).toBe(true);
    expect(isRetryable(new Error("ECONNRESET"))).toBe(true);
    expect(isRetryable(err(400))).toBe(false);
  });

  it("일시 오류 뒤 성공하면 결과 반환", async () => {
    const fn = vi.fn().mockRejectedValueOnce(err(429)).mockResolvedValueOnce("ok");
    await expect(withRetry(fn, noSleep)()).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("요청 오류는 바로 실패, 일시 오류는 횟수를 다 쓰고 실패", async () => {
    const bad = vi.fn().mockRejectedValue(err(400));
    await expect(withRetry(bad, noSleep)()).rejects.toThrow();
    expect(bad).toHaveBeenCalledTimes(1);

    const busy = vi.fn().mockRejectedValue(err(503));
    await expect(withRetry(busy, noSleep)()).rejects.toThrow();
    expect(busy).toHaveBeenCalledTimes(3);
  });
});
