import type { CustomerReply } from "./reply.ts";
import type { Answer } from "./types.ts";

/** 상담원에게 넘기는 사유. 자동 발송 기준에서 처음 걸린 것 */
export type EscalationReason =
  | "action_request"
  | "unanswerable"
  | "pending_policy"
  | "low_confidence"
  | "unsupported_numbers"
  | "error";

export type Route = { route: "auto" } | { route: "escalate"; reason: EscalationReason };

export const REASON_LABEL: Record<EscalationReason, string> = {
  action_request: "개인 처리 요청",
  unanswerable: "근거 없음",
  pending_policy: "준비 중 정책",
  low_confidence: "저확신",
  unsupported_numbers: "근거 밖 숫자",
  error: "처리 실패",
};

/**
 * 자동 발송 기준. 모두 만족할 때만 사람 확인 없이 고객에게 보냄 (docs/auto-response-design.md 3절)
 * 순서가 곧 사유 우선순위: 조치 요청은 답이 맞아도 사람이 처리해야 하므로 가장 먼저
 */
export function decideRoute(answer: Answer, reply: CustomerReply): Route {
  if (answer.requestType === "action") return { route: "escalate", reason: "action_request" };
  if (answer.status === "unanswerable") return { route: "escalate", reason: "unanswerable" };
  // 준비 중 정책은 가격·출시일처럼 불만이 큰 주제 → 1차는 사람이 확인
  if (answer.status === "pending_policy") return { route: "escalate", reason: "pending_policy" };
  if (answer.confidence !== "high") return { route: "escalate", reason: "low_confidence" };
  if (reply.unsupportedNumbers.length) return { route: "escalate", reason: "unsupported_numbers" };
  return { route: "auto" };
}

// 공개 데모라 방문자가 입력한 문의가 다른 방문자에게 보이고, 모델(무료 티어)에도 들어감
// → 저장·모델 호출 전에 흔한 개인정보 형태를 가림
const PII: [RegExp, string][] = [
  [/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, "[이메일]"],
  // 주민등록번호(13자리)는 카드 번호 규칙에도 걸리므로 먼저
  [/\b\d{6}[ -]?[1-4]\d{6}\b/g, "[주민등록번호]"],
  // 카드 번호: 13~16자리 (공백·하이픈 허용)
  [/\b(?:\d[ -]?){12,15}\d\b/g, "[카드번호]"],
  [/\b01[016789][ -]?\d{3,4}[ -]?\d{4}\b/g, "[전화번호]"],
];

export function maskPII(text: string): string {
  return PII.reduce((t, [re, label]) => t.replace(re, label), text);
}
