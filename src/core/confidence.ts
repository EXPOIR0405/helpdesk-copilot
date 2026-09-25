import type { Confidence, Grounding } from "./types.ts";

const RANK: Confidence[] = ["low", "medium", "high"];

/**
 * 검색 신호와 모델 신호 중 약한 쪽을 따름.
 * 모델이 "근거 충분"이라고 해도 검색 점수가 낮으면 믿지 않음.
 */
export function decideConfidence(
  input: { topScore: number; grounding: Grounding },
  thresholds: { high: number; medium: number },
): Confidence {
  const fromRetrieval: Confidence =
    input.topScore >= thresholds.high ? "high" : input.topScore >= thresholds.medium ? "medium" : "low";
  const fromModel: Confidence =
    input.grounding === "full" ? "high" : input.grounding === "partial" ? "medium" : "low";
  return RANK[Math.min(RANK.indexOf(fromRetrieval), RANK.indexOf(fromModel))];
}
