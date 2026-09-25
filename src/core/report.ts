import { groupByNearestDoc, type UnansweredEntry } from "./unanswered.ts";
import type { Answer, AnswerStatus, DocStatus } from "./types.ts";

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

export type OpsDoc = { id: string; title: string; status: DocStatus; updatedAt: string; chunks: number };

export type OpsData = {
  syncedAt: string | null;
  models: { embedding: string; generation: string };
  docs: OpsDoc[];
  unanswered: (ReturnType<typeof groupByNearestDoc>[number] & { entries: UnansweredEntry[] })[];
  eval: EvalSummary | null;
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
