import { describe, expect, it, vi } from "vitest";
import { createAlerter, describeError, slackPayload, slackSink, type Alert } from "../src/core/alerts.ts";
import { classifyFailure, withFallback, type ModelCalls } from "../src/core/fallback.ts";
import type { ModelVerdict, Usage } from "../src/core/types.ts";
import { failureEntry, memoryUsageLog, summarizeDaily, toEntry } from "../src/core/usage.ts";
import { memoryQuota } from "../src/server/stores.ts";

const usage = (model: string): Usage => ({ model, inputTokens: 100, cachedInputTokens: 0, outputTokens: 10, latencyMs: 500 });
const verdict: ModelVerdict = { status: "answered", text: "답", grounding: "full", citedChunkIds: ["a#0"], requestType: "question" };
const err = (status?: number, message = "x") => Object.assign(new Error(message), { status });

function model(id: string, fail?: unknown): ModelCalls {
  return {
    id,
    generate: vi.fn(async () => {
      if (fail) throw fail;
      return { ...verdict, usage: usage(id) };
    }),
    reply: vi.fn(async () => {
      if (fail) throw fail;
      return { text: `${id} 답장`, usage: usage(id) };
    }),
  };
}

describe("withFallback", () => {
  it("기본 모델이 되면 대체 모델은 부르지 않음", async () => {
    const primary = model("gpt-5.4-mini");
    const secondary = model("gemini-3.8-flash");
    const onFallback = vi.fn();
    const r = await withFallback(primary, secondary, onFallback).generate("q", []);
    expect(r.usage).toEqual(usage("gpt-5.4-mini"));
    expect(secondary.generate).not.toHaveBeenCalled();
    expect(onFallback).not.toHaveBeenCalled();
  });

  it("일시 오류(429·5xx·타임아웃)면 대체 모델로, 기록에 fallbackFrom", async () => {
    const onFallback = vi.fn();
    const m = withFallback(model("gemini-3.8-flash", err(429)), model("gpt-5.4-mini"), onFallback);
    const r = await m.generate("q", []);
    expect(r.usage).toMatchObject({ model: "gpt-5.4-mini", fallbackFrom: "gemini-3.8-flash" });
    expect(onFallback).toHaveBeenCalledWith(expect.objectContaining({ from: "gemini-3.8-flash", to: "gpt-5.4-mini", kind: "verdict", failure: "transient" }));

    const reply = await m.reply("i", "input");
    expect(reply).toMatchObject({ text: "gpt-5.4-mini 답장", usage: { fallbackFrom: "gemini-3.8-flash" } });
  });

  it("요청 오류(400·422)는 넘기지 않음 — 코드 버그를 대체 모델이 가리지 않게", async () => {
    for (const status of [400, 422]) {
      const secondary = model("gpt-5.4-mini");
      const m = withFallback(model("gemini-3.8-flash", err(status, "schema")), secondary, vi.fn());
      await expect(m.generate("q", [])).rejects.toThrow("schema");
      expect(secondary.generate).not.toHaveBeenCalled();
    }
  });

  it("키·권한·모델 종료(401·403·404)는 provider 실패로 넘김", async () => {
    const onFallback = vi.fn();
    const retired = err(404, "no longer available to new users");
    const r = await withFallback(model("gemini-2.5-flash-lite", retired), model("gpt-5.4-mini"), onFallback).generate("q", []);
    expect(r.usage?.model).toBe("gpt-5.4-mini");
    expect(onFallback).toHaveBeenCalledWith(expect.objectContaining({ failure: "provider" }));
    expect(classifyFailure(err(401))).toBe("provider");
    expect(classifyFailure(err(503))).toBe("transient");
    expect(classifyFailure(new Error("ETIMEDOUT"))).toBe("transient");
  });

  it("알림이 실패해도 대체 모델 응답은 반환, 둘 다 실패하면 대체 모델 오류를 던짐", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const noisy = vi.fn(async () => {
      throw new Error("slack down");
    });
    const ok = withFallback(model("a", err(503)), model("gpt-5.4-mini"), noisy);
    await expect(ok.generate("q", [])).resolves.toMatchObject({ status: "answered" });

    const both = withFallback(model("a", err(503)), model("b", err(500, "also down")), vi.fn());
    await expect(both.generate("q", [])).rejects.toThrow("also down");
  });
});

describe("createAlerter", () => {
  const alert: Alert = { level: "warn", key: "fallback:gpt", title: "t", detail: {} };

  it("같은 key는 창 안에서 한 번만, 창이 지나면 다시", async () => {
    let t = new Date("2026-09-27T00:00:00Z");
    const quota = memoryQuota(() => t);
    const sent: Alert[] = [];
    const alerter = createAlerter({ sink: async (a) => void sent.push(a), gate: (k, w) => quota.take(k, w, 1), windowSeconds: 1800 });
    await alerter.notify(alert);
    await alerter.notify(alert);
    await alerter.notify({ ...alert, key: "health" });
    expect(sent.map((a) => a.key)).toEqual(["fallback:gpt", "health"]);
    t = new Date(t.getTime() + 1801_000);
    await alerter.notify(alert);
    expect(sent).toHaveLength(3);
  });

  it("전송·중복 확인이 실패해도 던지지 않음", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const broken = createAlerter({
      sink: async () => {
        throw new Error("slack 500");
      },
      gate: async () => true,
      windowSeconds: 60,
    });
    await expect(broken.notify(alert)).resolves.toBeUndefined();
    const gateDown = createAlerter({ sink: vi.fn(), gate: async () => Promise.reject(new Error("db")), windowSeconds: 60 });
    await expect(gateDown.notify(alert)).resolves.toBeUndefined();
  });
});

describe("Slack", () => {
  it("웹훅에 제목·상세를 mrkdwn으로, 실패 응답은 오류", async () => {
    const fetchImpl = vi.fn(async () => new Response("ok"));
    await slackSink("https://hooks.slack.test/x", "helpdesk-copilot", fetchImpl as unknown as typeof fetch)({
      level: "error",
      key: "health",
      title: "헬스체크 실패",
      detail: { 오류: "db" },
    });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://hooks.slack.test/x");
    expect(JSON.parse(init.body as string).text).toBe(":rotating_light: [helpdesk-copilot] 헬스체크 실패");

    const failing = vi.fn(async () => new Response("no", { status: 404 }));
    await expect(slackSink("u", "s", failing as unknown as typeof fetch)({ level: "warn", key: "k", title: "t", detail: {} })).rejects.toThrow("404");
  });

  it("상세가 없으면 섹션 하나", () => {
    expect(slackPayload({ level: "warn", key: "k", title: "t", detail: {} }, "s").blocks).toHaveLength(1);
  });

  it("describeError: 상태 코드와 메시지, 300자로 자름", () => {
    expect(describeError(err(429, "rate"))).toBe("429 rate");
    expect(describeError("x".repeat(400))).toHaveLength(300);
  });
});

describe("usage", () => {
  it("일별·모델별 집계: 비용 합계, 대체·실패 수, 실패는 지연 계산에서 제외, 기간 밖 제외", async () => {
    const log = memoryUsageLog();
    const at = (iso: string) => new Date(iso);
    await log.append(toEntry(usage("gpt-5.4-mini"), "verdict", at("2026-09-27T01:00:00Z")));
    await log.append(toEntry({ ...usage("gpt-5.4-mini"), latencyMs: 2000, fallbackFrom: "gemini-3.8-flash" }, "reply", at("2026-09-27T02:00:00Z")));
    await log.append(failureEntry("gpt-5.4-mini", "verdict", at("2026-09-27T03:00:00Z"), "503"));
    await log.append(toEntry(usage("gpt-5.4-mini"), "verdict", at("2026-09-10T00:00:00Z")));

    const [day, ...rest] = await log.daily(7, at("2026-09-27T12:00:00Z"));
    expect(rest).toHaveLength(0);
    expect(day).toMatchObject({ day: "2026-09-27", model: "gpt-5.4-mini", calls: 3, fallbacks: 1, failures: 1, p95LatencyMs: 2000 });
    expect(day.costUsd).toBeCloseTo(2 * ((100 * 0.75 + 10 * 4.5) / 1e6));
    expect(await log.costSince(at("2026-09-27T00:00:00Z"))).toBeCloseTo(day.costUsd);
  });

  it("미등록 모델 비용(NaN)은 합계에서 0으로", () => {
    const rows = summarizeDaily([toEntry(usage("unknown"), "verdict", new Date("2026-09-27T00:00:00Z"))], 1, new Date("2026-09-27T01:00:00Z"));
    expect(rows[0].costUsd).toBe(0);
  });
});
