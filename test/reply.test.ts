import { describe, expect, it, vi } from "vitest";
import { buildReplyInput, createReplyWriter, findOutcomePromises, findUnsupportedNumbers, GREETING, withGreeting, type ReplyGenerator } from "../src/core/reply.ts";
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

describe("withGreeting", () => {
  it("이미 인사말로 시작하면 한 줄로 떼어 둠", () => {
    expect(withGreeting(`${GREETING} 환불됩니다.`)).toBe(`${GREETING}\n환불됩니다.`);
    expect(withGreeting(`${GREETING}\n\n환불됩니다.`)).toBe(`${GREETING}\n환불됩니다.`);
  });

  it("다른 인사로 시작하면 걷어 내고 인사말로 바꿈", () => {
    expect(withGreeting("안녕하세요, 고객님. 환불됩니다.")).toBe(`${GREETING}\n환불됩니다.`);
    expect(withGreeting("안녕하세요! 시네웨이브입니다. 환불됩니다.")).toBe(`${GREETING}\n환불됩니다.`);
  });

  it("인사 뒤에 문장부호 없이 본문이 이어져도 본문은 지우지 않음", () => {
    expect(withGreeting("안녕하세요 환불은 7일 이내 가능합니다.")).toBe(`${GREETING}\n환불은 7일 이내 가능합니다.`);
  });

  it("인사가 없으면 앞에 붙임", () => {
    expect(withGreeting("환불됩니다.")).toBe(`${GREETING}\n환불됩니다.`);
  });
});

describe("replyWriter", () => {
  it("모델 출력을 다듬고 근거 밖 숫자를 표시", async () => {
    const generate = vi.fn<ReplyGenerator>(async () => ({ text: "  안녕하세요.  \n30일 이내 환불됩니다.  " }));
    const reply = await createReplyWriter(generate).write("환불돼요?", answer());
    expect(reply).toEqual({ text: `${GREETING}\n30일 이내 환불됩니다.`, unsupportedNumbers: ["30"], outcomePromises: [] });
    expect(generate.mock.calls[0][1]).toContain("상담원 메모: 환불돼요?");
  });
});

describe("findOutcomePromises (조치 요청 초안 검사)", () => {
  const action = (over: Partial<Answer> = {}): Answer => ({ ...answer(), requestType: "action", ...over });

  // 실제로 나온 초안 (npm run eval:drafts, 수정 전)
  it("결과 단정·처리 약속·진행 중 단정을 잡음", () => {
    const refund =
      "안녕하세요. 시네웨이브입니다.\n결제 후 7일 이내이고 시청 이력이 없으시다면 전액 환불이 가능합니다. 인앱결제가 아닌 일반 결제 건이라면 확인 후 환불을 진행해 드리겠습니다.";
    // "없으시다면 전액 환불이 가능합니다"는 조건 안내라 통과, 문제는 뒤의 처리 약속
    expect(findOutcomePromises(refund, action())).toEqual(["환불을 진행해 드리겠습니다"]);
    const inProgress = "안녕하세요. 시네웨이브입니다.\n현재 말씀해 주신 결제 내역을 확인하고 있습니다. 사실 관계를 살펴보고 있습니다.";
    expect(findOutcomePromises(inProgress, action())).toEqual(["확인하고 있습니다", "살펴보고 있습니다"]);
  });

  it("근거 없이 '고객센터에서 처리할 수 없다'고 하면 잡고, 근거에 있으면 통과", () => {
    const cancel = "안녕하세요. 시네웨이브입니다.\n정기결제 해지는 고객센터에서 직접 처리가 어려워 직접 진행해 주셔야 합니다.";
    expect(findOutcomePromises(cancel, action())).toEqual(["고객센터에서 직접 처리가 어려워"]);
    const grounded = action({ citations: [{ chunkId: "s#1", docId: "account-security", title: "계정 보안", section: "비밀번호", excerpt: "상담원이 비밀번호를 직접 바꾸거나 알려줄 수 없음" }] });
    expect(findOutcomePromises("비밀번호는 고객센터에서 직접 변경해 드리기 어렵습니다.", grounded)).toEqual([]);
  });

  it("정책 조건으로 안내한 문장은 통과, 조건 없이 단정하면 잡음", () => {
    // 수정 후 실제로 나온 초안
    const conditional =
      "안녕하세요. 시네웨이브입니다.\n환불은 결제 후 7일 이내이면서 콘텐츠 시청 이력이 없는 경우에 전액 환불이 가능합니다. 요청해 주신 결제 및 이용 내역을 확인한 뒤 안내해 드리겠습니다.";
    expect(findOutcomePromises(conditional, action())).toEqual([]);
    const asserted = "안녕하세요. 시네웨이브입니다.\n시청 이력이 없어 전액 환불이 가능합니다.";
    expect(findOutcomePromises(asserted, action())).toEqual(["전액 환불이 가능합니다"]);
  });

  it("결과를 미루는 문장은 통과, 조치 요청이 아니면 검사 안 함", () => {
    const ok = "안녕하세요. 시네웨이브입니다.\n결제 후 7일 이내이고 시청 이력이 없는 경우 전액 환불 대상입니다. 요청 내용을 확인한 뒤 처리 결과를 안내드리겠습니다.";
    expect(findOutcomePromises(ok, action())).toEqual([]);
    expect(findOutcomePromises("전액 환불이 가능합니다.", answer())).toEqual([]);
  });

  it("조치 요청이면 답장 입력에 요청 유형을 넘김", () => {
    expect(buildReplyInput("환불해 주세요", action())).toContain("요청 유형: 조치 요청");
    expect(buildReplyInput("환불 돼요?", answer())).not.toContain("요청 유형");
  });
});
