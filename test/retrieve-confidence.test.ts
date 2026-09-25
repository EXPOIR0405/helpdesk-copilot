import { describe, expect, it } from "vitest";
import { decideConfidence } from "../src/core/confidence.ts";
import { cosine, retrieve } from "../src/core/retrieve.ts";
import type { IndexedChunk } from "../src/core/types.ts";

const chunk = (id: string, embedding: number[]): IndexedChunk => ({
  id,
  docId: id.split("#")[0],
  docTitle: id,
  section: "s",
  status: "confirmed",
  text: id,
  embedding,
});

describe("retrieve", () => {
  const chunks = [chunk("a#0", [1, 0]), chunk("b#0", [0.8, 0.6]), chunk("c#0", [0, 1])];

  it("유사도 순으로 topK개, minScore 미만은 제외", () => {
    const hits = retrieve([1, 0], chunks, { topK: 5, minScore: 0.5 });
    expect(hits.map((h) => h.id)).toEqual(["a#0", "b#0"]);
    expect(hits[0].score).toBeCloseTo(1);
    expect(hits[0]).not.toHaveProperty("embedding");
  });

  it("topK 제한", () => {
    expect(retrieve([1, 1], chunks, { topK: 1, minScore: 0 })).toHaveLength(1);
  });

  it("영벡터는 0", () => {
    expect(cosine([0, 0], [1, 0])).toBe(0);
  });
});

describe("decideConfidence", () => {
  const th = { high: 0.55, medium: 0.42 };

  it("두 신호 모두 강하면 high", () => {
    expect(decideConfidence({ topScore: 0.7, grounding: "full" }, th)).toBe("high");
  });

  it("모델이 full이라도 검색 점수가 낮으면 low", () => {
    expect(decideConfidence({ topScore: 0.3, grounding: "full" }, th)).toBe("low");
  });

  it("검색 점수가 높아도 모델이 partial이면 medium", () => {
    expect(decideConfidence({ topScore: 0.9, grounding: "partial" }, th)).toBe("medium");
  });

  it("경계값은 이상(>=)으로 판정", () => {
    expect(decideConfidence({ topScore: 0.42, grounding: "full" }, th)).toBe("medium");
  });
});
