import { describe, expect, it } from "vitest";
import { parseDoc } from "../src/core/docs.ts";
import { syncIndex } from "../src/core/sync.ts";
import { keywordEmbedder, md } from "./helpers.ts";

const doc = (id: string, body: string) => parseDoc(md({ id, title: id }, body), id);

describe("syncIndex", () => {
  const base = { embeddingModel: "m1", maxChars: 700 };

  it("처음에는 모든 문서를 임베딩", async () => {
    const { embed, calls } = keywordEmbedder(["환불"]);
    const { index, stats } = await syncIndex({ ...base, docs: [doc("a", "## s\n환불"), doc("b", "## s\n해지")], previous: null, embed });
    expect(stats.added).toEqual(["a", "b"]);
    expect(calls).toHaveLength(2);
    expect(index.chunks).toHaveLength(2);
  });

  it("바뀐 문서만 다시 임베딩하고, 사라진 문서는 제거", async () => {
    const first = keywordEmbedder(["환불"]);
    const { index: prev } = await syncIndex({ ...base, docs: [doc("a", "## s\n환불"), doc("b", "## s\n해지")], previous: null, embed: first.embed });

    const second = keywordEmbedder(["환불"]);
    const { index, stats } = await syncIndex({ ...base, docs: [doc("a", "## s\n환불 규정 변경")], previous: prev, embed: second.embed });

    expect(stats).toEqual({ added: [], updated: ["a"], removed: ["b"], unchanged: [] });
    expect(second.calls).toHaveLength(1);
    expect(index.chunks.map((c) => c.docId)).toEqual(["a"]);
  });

  it("변경 없으면 임베딩 호출 없이 기존 조각 재사용", async () => {
    const docs = [doc("a", "## s\n환불")];
    const { index: prev } = await syncIndex({ ...base, docs, previous: null, embed: keywordEmbedder([]).embed });
    const again = keywordEmbedder([]);
    const { index, stats } = await syncIndex({ ...base, docs, previous: prev, embed: again.embed });
    expect(stats.unchanged).toEqual(["a"]);
    expect(again.calls).toHaveLength(0);
    expect(index.chunks).toEqual(prev.chunks);
  });

  it("임베딩 모델이 바뀌면 전부 다시 처리", async () => {
    const docs = [doc("a", "## s\n환불")];
    const { index: prev } = await syncIndex({ ...base, docs, previous: null, embed: keywordEmbedder([]).embed });
    const again = keywordEmbedder([]);
    const { stats } = await syncIndex({ ...base, embeddingModel: "m2", docs, previous: prev, embed: again.embed });
    expect(stats.added).toEqual(["a"]);
    expect(again.calls).toHaveLength(1);
  });
});
