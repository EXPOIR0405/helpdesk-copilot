import type { Answer } from "./types.ts";

/** 확인된 답변을 고객에게 보낼 답장 초안으로 바꾸는 모델 호출 */
export type ReplyGenerator = (instructions: string, input: string) => Promise<string>;

export type CustomerReply = {
  text: string;
  /** 근거에 없는 숫자. 있으면 상담원이 보내기 전에 확인해야 함 */
  unsupportedNumbers: string[];
};

export const REPLY_INSTRUCTIONS = `당신은 OTT 서비스 시네웨이브 고객센터의 답장 작성 도우미입니다.
상담원이 이미 확인한 답변을, 고객에게 채팅으로 보낼 답장 초안으로 다시 씁니다.
"상담원 메모"는 상담원이 고객 문의를 옮겨 적은 말이라 "~래요", "고객한테 설명해야 해요" 같은 말투일 수 있습니다.
고객이 실제로 궁금한 것을 파악해, 상담원이 아니라 고객에게 직접 말하듯 씁니다.

사실 규칙
1. "확인된 답변"과 "근거"에 있는 사실만 씁니다. 새 수치·기간·금액·일정·절차를 더하지 않습니다.
2. 확인되지 않은 것을 약속하지 않습니다. "곧", "며칠 안에" 같은 시점 표현도 근거에 없으면 쓰지 않습니다.
3. 상태별로 씁니다.
   - 확정: 고객이 알아야 할 결론을 먼저 말하고, 고객이 할 일이 있으면 순서대로 안내합니다.
   - 준비 중: 아직 확정되지 않았고 확정되면 공지로 안내된다는 점만 전합니다. 가격·출시 시기·사전 신청을 언급하거나 추측하지 않습니다.
   - 근거 없음: 답을 지어내지 않습니다. 문의 내용을 확인한 뒤 다시 안내드리겠다는 보류 답장을 씁니다. 다시 안내할 시점은 약속하지 않습니다.

표현 규칙
4. 고객 관점으로 바꿉니다. 문서 이름, 조각 번호, "근거", "정책 문서", "상담원" 같은 내부 표현은 쓰지 않습니다.
   예: "상담원이 직접 처리할 수 없음" → "고객센터에서 직접 처리해 드리기 어렵습니다"
5. 정중한 존댓말로, 첫 문장에 짧은 인사나 공감을 넣고 바로 본론으로 갑니다. 과한 사과, 이모지, 서명은 넣지 않습니다.
6. 마크다운(굵게, 제목, 표)을 쓰지 않습니다. 단계가 둘 이상이면 "1. 2." 번호 목록만 씁니다.
7. 전체 5문장 안팎으로 짧게 씁니다.

답장 본문만 출력합니다.`;

const STATUS_LABEL: Record<Answer["status"], string> = {
  answered: "확정",
  pending_policy: "준비 중",
  unanswerable: "근거 없음",
};

export function buildReplyInput(question: string, answer: Answer): string {
  const sources = answer.citations.map((c) => `- ${c.title} > ${c.section}\n${c.excerpt}`).join("\n\n");
  return [
    `상담원 메모: ${question}`,
    `상태: ${STATUS_LABEL[answer.status]}`,
    `확인된 답변:\n${answer.text}`,
    `근거:\n${sources || "(없음)"}`,
  ].join("\n\n");
}

// 번호 목록 머리("1. ")는 숫자 검사에서 제외
const LIST_MARKER = /^\s*\d+[.)]\s/gm;
const NUMBER = /\d+(?:[.,]\d+)*/g;
const normalize = (n: string) => n.replace(/,/g, "");

/** 답장에 나온 숫자 중 확인된 답변·근거 어디에도 없는 것 */
export function findUnsupportedNumbers(reply: string, answer: Answer): string[] {
  const source = [answer.text, ...answer.citations.map((c) => c.excerpt)].join("\n");
  const known = new Set((source.match(NUMBER) ?? []).map(normalize));
  const found = reply.replace(LIST_MARKER, "").match(NUMBER) ?? [];
  return [...new Set(found.filter((n) => !known.has(normalize(n))))];
}

export function createReplyWriter(generate: ReplyGenerator) {
  return {
    async write(question: string, answer: Answer): Promise<CustomerReply> {
      const raw = await generate(REPLY_INSTRUCTIONS, buildReplyInput(question, answer));
      const text = raw.replace(/[ \t]+$/gm, "").trim();
      return { text, unsupportedNumbers: findUnsupportedNumbers(text, answer) };
    },
  };
}
