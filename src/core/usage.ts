import { costUsd } from "./models.ts";
import type { Usage } from "./types.ts";

export type UsageKind = "verdict" | "reply";

/** 모델 호출 한 번. 두 모델 모두 실패한 호출도 error와 함께 남김 (토큰 0) */
export type UsageEntry = Usage & { at: string; kind: UsageKind; costUsd: number; error?: string };

/** 운영 탭용 일별·모델별 집계 */
export type UsageDay = {
  day: string;
  model: string;
  calls: number;
  costUsd: number;
  fallbacks: number;
  failures: number;
  p95LatencyMs: number;
};

export type UsageLog = {
  append(entry: UsageEntry): Promise<void>;
  /** since 이후 비용 합계 (예산 확인용) */
  costSince(since: Date): Promise<number>;
  /** 최근 days일 일별·모델별 집계, 최신 날짜 먼저 */
  daily(days: number, now: Date): Promise<UsageDay[]>;
};

export function toEntry(usage: Usage, kind: UsageKind, at: Date): UsageEntry {
  return { ...usage, at: at.toISOString(), kind, costUsd: costUsd(usage) };
}

export function failureEntry(model: string, kind: UsageKind, at: Date, error: string): UsageEntry {
  return { model, inputTokens: 0, cachedInputTokens: 0, outputTokens: 0, latencyMs: 0, at: at.toISOString(), kind, costUsd: 0, error };
}

/** 집계는 DB 함수(usage_daily)와 같은 규칙: UTC 날짜 기준, 비용은 NaN(미등록 모델)을 0으로 */
export function summarizeDaily(entries: UsageEntry[], days: number, now: Date): UsageDay[] {
  const from = new Date(now.getTime() - (days - 1) * 86_400_000).toISOString().slice(0, 10);
  const groups = new Map<string, UsageEntry[]>();
  for (const e of entries) {
    const day = e.at.slice(0, 10);
    if (day < from) continue;
    const key = `${day}|${e.model}`;
    groups.set(key, [...(groups.get(key) ?? []), e]);
  }
  return [...groups]
    .map(([key, es]) => {
      const [day, model] = key.split("|");
      const latencies = es.filter((e) => !e.error).map((e) => e.latencyMs).sort((a, b) => a - b);
      return {
        day,
        model,
        calls: es.length,
        costUsd: es.reduce((s, e) => s + (Number.isFinite(e.costUsd) ? e.costUsd : 0), 0),
        fallbacks: es.filter((e) => e.fallbackFrom).length,
        failures: es.filter((e) => e.error).length,
        p95LatencyMs: latencies.length ? latencies[Math.ceil(0.95 * latencies.length) - 1] : 0,
      };
    })
    .sort((a, b) => b.day.localeCompare(a.day) || b.calls - a.calls);
}

export function memoryUsageLog(): UsageLog & { entries: UsageEntry[] } {
  const entries: UsageEntry[] = [];
  return {
    entries,
    async append(e) {
      entries.push(e);
    },
    async costSince(since) {
      const s = since.toISOString();
      return entries.filter((e) => e.at >= s).reduce((sum, e) => sum + (Number.isFinite(e.costUsd) ? e.costUsd : 0), 0);
    },
    async daily(days, now) {
      return summarizeDaily(entries, days, now);
    },
  };
}
