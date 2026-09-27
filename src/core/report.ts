import { groupByNearestDoc, type UnansweredEntry } from "./unanswered.ts";
import { costUsd } from "./models.ts";
import type { Answer, AnswerStatus, DocStatus, Usage } from "./types.ts";
import type { UsageDay } from "./usage.ts";

export type EvalRow = {
  q: { id: string; type: string; question: string; expected_status: AnswerStatus; expected_docs: string[] };
  a: Answer;
};

type Ratio = { n: number; d: number };

export type EvalSummary = {
  at: string;
  total: number;
  retrievalHit: Ratio;
  statusAccuracy: Ratio;
  /** 답하면 안 되는 질문에 답한 비율. 가장 중요한 지표 */
  wrongAnswer: Ratio;
  /** 답할 수 있는데 거절한 비율 */
  overRefusal: Ratio;
};

export function summarizeEval(rows: EvalRow[], at: Date): EvalSummary {
  const ratio = (subset: EvalRow[], ok: (r: EvalRow) => boolean): Ratio => ({ n: subset.filter(ok).length, d: subset.length });
  const shouldNotAnswer = rows.filter((r) => r.q.expected_status !== "answered");
  const shouldAnswer = rows.filter((r) => r.q.expected_status === "answered");
  return {
    at: at.toISOString(),
    total: rows.length,
    retrievalHit: ratio(
      rows.filter((r) => r.q.expected_docs.length),
      (r) => r.a.trace.retrieved.some((h) => r.q.expected_docs.includes(h.docId)),
    ),
    statusAccuracy: ratio(rows, (r) => r.a.status === r.q.expected_status),
    wrongAnswer: ratio(shouldNotAnswer, (r) => r.a.status === "answered"),
    overRefusal: ratio(shouldAnswer, (r) => r.a.status === "unanswerable"),
  };
}

/** 같은 평가셋을 여러 번 돌렸을 때 회차마다 상태가 달라진 문항. 한 번 실행한 결과만 믿으면 안 되는 곳 */
export function findUnstable(runs: EvalRow[][]): { id: string; statuses: AnswerStatus[] }[] {
  const byId = new Map<string, AnswerStatus[]>();
  for (const run of runs) for (const r of run) byId.set(r.q.id, [...(byId.get(r.q.id) ?? []), r.a.status]);
  return [...byId]
    .filter(([, s]) => new Set(s).size > 1)
    .map(([id, statuses]) => ({ id, statuses }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export type UsageStats = {
  calls: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  /** 질문 1,000건 비용. 검색 결과가 없어 모델을 안 부른 질문도 분모에 포함 → 실제 운영 단가 */
  costPer1kQuestionsUsd: number;
  latencyP50Ms: number;
  latencyP95Ms: number;
};

export function summarizeUsage(usages: Usage[], questions: number): UsageStats {
  const sum = (f: (u: Usage) => number) => usages.reduce((s, u) => s + f(u), 0);
  const latencies = usages.map((u) => u.latencyMs).sort((a, b) => a - b);
  const pct = (p: number) => (latencies.length ? latencies[Math.min(latencies.length - 1, Math.ceil(p * latencies.length) - 1)] : 0);
  const cost = sum(costUsd);
  return {
    calls: usages.length,
    inputTokens: sum((u) => u.inputTokens),
    outputTokens: sum((u) => u.outputTokens),
    costUsd: cost,
    costPer1kQuestionsUsd: questions ? (cost / questions) * 1000 : 0,
    latencyP50Ms: pct(0.5),
    latencyP95Ms: pct(0.95),
  };
}

export type OpsDoc = { id: string; title: string; status: DocStatus; updatedAt: string; chunks: number };

export type OpsData = {
  syncedAt: string | null;
  models: { embedding: string; generation: string; fallback?: string | null };
  docs: OpsDoc[];
  unanswered: (ReturnType<typeof groupByNearestDoc>[number] & { entries: UnansweredEntry[] })[];
  eval: EvalSummary | null;
  /** 최근 7일 모델 호출 집계. 목업 데이터에는 없음 */
  usage?: UsageDay[];
  budget?: { dailyUsd: number; spentTodayUsd: number };
};

/** 운영 화면 데이터. 목업 생성과 API가 같은 계산을 씀 */
export function buildOps(input: Omit<OpsData, "unanswered"> & { unansweredEntries: UnansweredEntry[] }): OpsData {
  // 저장소마다 반환 순서가 달라서 최신순으로 통일
  const unansweredEntries = [...input.unansweredEntries].sort((a, b) => b.at.localeCompare(a.at));
  const { unansweredEntries: _, ...rest } = input;
  return {
    ...rest,
    docs: [...input.docs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    unanswered: groupByNearestDoc(unansweredEntries).map((g) => ({
      ...g,
      entries: unansweredEntries.filter((e) => e.nearestDocId === g.docId),
    })),
  };
}
