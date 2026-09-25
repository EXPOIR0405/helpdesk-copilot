import { describe, expect, it, vi } from "vitest";
import { buildReplyInput, createReplyWriter, findUnsupportedNumbers, type ReplyGenerator } from "../src/core/reply.ts";
import type { Answer } from "../src/core/types.ts";

const answer = (over: Partial<Answer> = {}): Answer => ({
  status: "answered",
  text: "결제 후 7일 이내이고 시청 이력이 없으면 전액 환불됩니다.",
  confidence: "high",
  citations: [
    { chunkId: "refund#0", docId: "refund", title: "환불 정책", section: "기준", excerpt: "- 결제 후 7일 이내, 1분 이상 시청 없음 → 전액 환불\n- 13,900원 요금제 포함" },
  ],
  trace: { topScore: 0.6, grounding: "full", retrieved: [] },
  ...over,
});

describe("findUnsupportedNumbers", () => {
  it("근거에 있는 숫자는 통과, 쉼표 표기 차이는 같은 숫자로 봄", () => {
    expect(findUnsupportedNumbers("7일 안에 1분 미만 시청이면 13900원 전액 환불돼요.", answer())).toEqual([]);
  });

  it("근거에 없는 숫자를 찾아냄", () => {
    expect(findUnsupportedNumbers("14일 이내 환불되며 3~5일 걸립니다.", answer())).toEqual(["14", "3", "5"]);
  });

  it("번호 목록 머리는 숫자로 보지 않음", () => {
    expect(findUnsupportedNumbers("1. 앱을 여세요\n2. 7일 이내인지 확인하세요", answer())).toEqual([]);
  });
});

describe("buildReplyInput", () => {
  it("상태와 근거 발췌를 함께 넘김", () => {
    const input = buildReplyInput("환불돼요?", answer({ status: "pending_policy" }));
    expect(input).toContain("상태: 준비 중");
    expect(input).toContain("1분 이상 시청 없음");
  });

  it("근거가 없으면 (없음)으로 표시", () => {
    expect(buildReplyInput("학생 할인?", answer({ status: "unanswerable", citations: [] }))).toContain("근거:\n(없음)");
  });
});

describe("replyWriter", () => {
  it("모델 출력을 다듬고 근거 밖 숫자를 표시", async () => {
    const generate = vi.fn<ReplyGenerator>(async () => "  안녕하세요.  \n30일 이내 환불됩니다.  ");
    const reply = await createReplyWriter(generate).write("환불돼요?", answer());
    expect(reply).toEqual({ text: "안녕하세요.\n30일 이내 환불됩니다.", unsupportedNumbers: ["30"] });
    expect(generate.mock.calls[0][1]).toContain("상담원 메모: 환불돼요?");
  });
});
