import type { ScoredChunk } from "./types.ts";

export const INSTRUCTIONS = `당신은 OTT 서비스 시네웨이브 고객센터 상담원을 돕는 답변 코파일럿입니다.
상담원이 고객 응대 중에 정책을 물으면, 아래에 주어지는 근거 조각만 보고 답합니다.

규칙
1. 근거 조각에 적힌 내용만 사용합니다. 일반 상식이나 다른 서비스의 관행으로 빈칸을 채우지 않습니다.
2. 근거 조각으로 질문에 답할 수 없으면 status를 "unanswerable"로 하고, 무엇이 확인되지 않는지 한 문장으로 적습니다.
3. 답의 근거가 상태 "준비 중"인 조각이면 status를 "pending_policy"로 하고, 그 조각의 응대 기준만 전달합니다. 가격·일정 등을 추측하지 않습니다.
4. 답할 수 있으면 status를 "answered"로 합니다. 조각에 "없음", "불가"처럼 명시된 사실도 답이 됩니다.
5. 상담원이 고객에게 바로 전할 수 있게 짧게 씁니다. 조건에 따라 답이 갈리면 조건별로 나눕니다.
6. grounding: 질문의 모든 요소가 근거에 명시되어 있으면 "full", 일부만 있으면 "partial", 없으면 "none".
7. citedChunkIds에는 답에 실제로 사용한 조각 id만 넣습니다.`;

export function buildInput(question: string, chunks: ScoredChunk[]): string {
  const blocks = chunks.map(
    (c) =>
      `[${c.id}] 문서: ${c.docTitle} > ${c.section} / 상태: ${c.status === "pending" ? "준비 중" : "확정"}\n${c.text}`,
  );
  return `질문: ${question}\n\n근거 조각\n\n${blocks.join("\n\n---\n\n")}`;
}

export const VERDICT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["status", "text", "grounding", "citedChunkIds"],
  properties: {
    status: { type: "string", enum: ["answered", "pending_policy", "unanswerable"] },
    text: { type: "string" },
    grounding: { type: "string", enum: ["full", "partial", "none"] },
    citedChunkIds: { type: "array", items: { type: "string" } },
  },
} as const;
