import { describe, expect, it } from "vitest";
import { chunkDoc, embeddingText } from "../src/core/chunk.ts";
import { loadDocs, parseDoc } from "../src/core/docs.ts";
import { md } from "./helpers.ts";

describe("parseDoc", () => {
  it("frontmatter를 읽고 본문을 분리", () => {
    const doc = parseDoc(md({ id: "refund", title: "환불 정책", status: "confirmed", updated_at: "2026-09-02" }, "# 환불\n본문"), "x");
    expect(doc).toMatchObject({ id: "refund", title: "환불 정책", status: "confirmed", updatedAt: "2026-09-02" });
    expect(doc.body.trim()).toBe("# 환불\n본문");
  });

  it("알 수 없는 status는 confirmed로, id가 없으면 파일명 사용", () => {
    const doc = parseDoc(md({ status: "draft" }, "본문"), "fallback");
    expect(doc.status).toBe("confirmed");
    expect(doc.id).toBe("fallback");
  });
});

describe("chunkDoc", () => {
  const doc = parseDoc(
    md({ id: "d", title: "문서", status: "pending" }, "# 문서\n\n## 첫 섹션\n\n가나다\n\n### 하위\n\n라마바\n\n## 빈 섹션\n\n## 둘째\n\n사아자"),
    "d",
  );

  it("## 단위로 나누고 ### 는 섹션에 포함, 빈 섹션은 버림", () => {
    const chunks = chunkDoc(doc, 1000);
    expect(chunks.map((c) => c.section)).toEqual(["첫 섹션", "둘째"]);
    expect(chunks[0].text).toContain("### 하위");
    expect(chunks.every((c) => c.status === "pending")).toBe(true);
    expect(chunks.map((c) => c.id)).toEqual(["d#0", "d#1"]);
  });

  it("긴 섹션은 문단 단위로 다시 나눔", () => {
    const long = parseDoc(md({ id: "l", title: "긴 문서" }, `## 섹션\n\n${"가".repeat(40)}\n\n${"나".repeat(40)}\n\n${"다".repeat(40)}`), "l");
    const chunks = chunkDoc(long, 90);
    expect(chunks).toHaveLength(2);
    expect(chunks.every((c) => c.section === "섹션")).toBe(true);
  });

  it("임베딩 텍스트에 문서·섹션 제목을 붙임", () => {
    expect(embeddingText(chunkDoc(doc, 1000)[1])).toBe("문서 > 둘째\n사아자");
  });
});

describe("합성 문서", () => {
  it("12개 모두 id·title·status를 갖고, 준비 중은 광고형 요금제뿐", async () => {
    const docs = await loadDocs("data/synthetic/docs");
    expect(docs).toHaveLength(12);
    for (const d of docs) expect(d.title).not.toBe(d.id);
    expect(docs.filter((d) => d.status === "pending").map((d) => d.id)).toEqual(["ad-plan"]);
    for (const d of docs) expect(chunkDoc(d, 700).length).toBeGreaterThan(0);
  });
});
