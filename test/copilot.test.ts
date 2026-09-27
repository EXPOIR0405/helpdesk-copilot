import { describe, expect, it, vi } from "vitest";
import { createCopilot, NOT_FOUND_TEXT } from "../src/core/copilot.ts";
import { parseDoc } from "../src/core/docs.ts";
import { memorySearch } from "../src/core/retrieve.ts";
import { syncIndex } from "../src/core/sync.ts";
import type { Generator, ModelVerdict } from "../src/core/types.ts";
import { groupByNearestDoc, memoryUnansweredLog } from "../src/core/unanswered.ts";
import { keywordEmbedder, md } from "./helpers.ts";

const KEYWORDS = ["환불", "광고", "해지"];

async function setup(verdict: Partial<ModelVerdict> | ((ids: string[]) => Partial<ModelVerdict>)) {
  const { embed } = keywordEmbedder(KEYWORDS);
  const docs = [
    parseDoc(md({ id: "refund", title: "환불 정책", status: "confirmed" }, "## 기준\n환불은 7일 이내"), "refund"),
    parseDoc(md({ id: "ad-plan", title: "광고형 요금제", status: "pending" }, "## 현재 상태\n광고 요금제 미정"), "ad-plan"),
  ];
  const { index } = await syncIndex({ docs, previous: null, embed, embeddingModel: "m", maxChars: 700 });
  const generate = vi.fn<Generator>(async (_q, chunks) => {
    const ids = chunks.map((c) => c.id);
    const v = typeof verdict === "function" ? verdict(ids) : verdict;
    return { status: "answered", text: "답", grounding: "full", citedChunkIds: ids.slice(0, 1), ...v };
  });
  const log = memoryUnansweredLog();
  const copilot = createCopilot({
    search: memorySearch(index.chunks),
    embed,
    generate,
    log,
    retrieval: { topK: 3, minScore: 0.5 },
    confidence: { high: 0.9, medium: 0.6 },
    now: () => new Date("2026-09-26T00:00:00Z"),
  });
  return { copilot, generate, log };
}

describe("copilot.ask", () => {
  it("근거가 있으면 답변과 인용을 반환", async () => {
    const { copilot, log } = await setup({});
    const a = await copilot.ask("환불 되나요?");
    expect(a).toMatchObject({ status: "answered", text: "답", confidence: "high" });
    expect(a.citations).toEqual([expect.objectContaining({ docId: "refund", section: "기준" })]);
    expect(log.entries).toHaveLength(0);
  });

  it("모델 호출 기록을 trace에 남김 (비용·지연 집계용)", async () => {
    const usage = { model: "gpt-5.4-mini", inputTokens: 900, cachedInputTokens: 0, outputTokens: 120, latencyMs: 800 };
    const { copilot } = await setup({ usage } as Partial<ModelVerdict>);
    expect((await copilot.ask("환불 되나요?")).trace.usage).toEqual(usage);
    expect((await copilot.ask("학생 할인 있나요?")).trace.usage).toBeUndefined();
  });

  it("검색 결과가 없으면 모델을 부르지 않고 거절, 미답변 기록", async () => {
    const { copilot, generate, log } = await setup({});
    const a = await copilot.ask("학생 할인 있나요?");
    expect(a.status).toBe("unanswerable");
    expect(a.text).toBe(NOT_FOUND_TEXT);
    expect(generate).not.toHaveBeenCalled();
    expect(log.entries[0]).toMatchObject({ question: "학생 할인 있나요?", nearestDocId: null });
  });

  it("모델이 answered라도 근거 판단이 none이면 거절로 바꿈", async () => {
    const { copilot, log } = await setup({ grounding: "none" });
    const a = await copilot.ask("환불 되나요?");
    expect(a).toMatchObject({ status: "unanswerable", confidence: "low", citations: [] });
    expect(log.entries[0].nearestDocId).toBe("refund");
  });

  it("인용한 조각이 없으면 거절로 바꿈", async () => {
    const { copilot } = await setup({ citedChunkIds: [] });
    expect((await copilot.ask("환불 되나요?")).status).toBe("unanswerable");
  });

  it("준비 중 문서를 근거로 answered를 내면 pending_policy로 바꿈", async () => {
    const { copilot } = await setup({});
    const a = await copilot.ask("광고 요금제 얼마예요?");
    expect(a.status).toBe("pending_policy");
    expect(a.citations[0].docId).toBe("ad-plan");
  });

  it("모델이 없는 조각 id를 인용하면 무시", async () => {
    const { copilot } = await setup((ids) => ({ citedChunkIds: [...ids, "ghost#9"] }));
    const a = await copilot.ask("환불 되나요?");
    expect(a.citations.map((c) => c.chunkId)).not.toContain("ghost#9");
  });

  it("partial 근거는 medium 확신도, 미답변으로 기록하지 않음", async () => {
    const partial = await setup({ grounding: "partial" });
    expect((await partial.copilot.ask("환불 되나요?")).confidence).toBe("medium");
    expect(partial.log.entries).toHaveLength(0);
  });
});

describe("groupByNearestDoc", () => {
  it("가까운 문서별로 묶어 건수 순 정렬", () => {
    const e = (question: string, nearestDocId: string | null) => ({
      at: "",
      question,
      status: "unanswerable" as const,
      confidence: "low" as const,
      topScore: 0,
      nearestDocId,
    });
    const groups = groupByNearestDoc([e("a", "refund"), e("b", null), e("c", "refund")]);
    expect(groups).toEqual([
      { docId: "refund", count: 2, questions: ["a", "c"] },
      { docId: null, count: 1, questions: ["b"] },
    ]);
  });
});
