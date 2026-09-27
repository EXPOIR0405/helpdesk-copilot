import type { Usage } from "./types.ts";

export type Provider = "openai" | "gemini";

export type ModelSpec = {
  provider: Provider;
  /** USD / 100만 토큰. 공식 가격표 기준 (확인일은 PRICES_CHECKED_AT) */
  price: { input: number; cachedInput: number; output: number };
  note?: string;
};

export const PRICES_CHECKED_AT = "2026-09-27";

/**
 * 생성 모델 후보. 새 모델이 나오면 여기에 추가하고 `npm run eval -- --model <id>`로 같은 평가셋을 돌림
 * - OpenAI: https://developers.openai.com/api/docs/pricing
 * - Gemini: https://ai.google.dev/gemini-api/docs/pricing (무료 티어가 있지만 비교는 유료 단가로 환산)
 */
export const MODELS = {
  "gpt-5.4-mini": { provider: "openai", price: { input: 0.75, cachedInput: 0.075, output: 4.5 } },
  "gpt-5.4-nano": { provider: "openai", price: { input: 0.2, cachedInput: 0.02, output: 1.25 } },
  // Gemini 캐시 단가는 비교 목적상 입력 단가로 계산 (암묵적 캐시 할인을 빼서 비용을 낮게 잡지 않음)
  "gemini-3.8-flash": {
    provider: "gemini",
    price: { input: 0.75, cachedInput: 0.75, output: 3.75 },
    note: "2026-12-31까지 할인가, 2027-01-01 인상 예정",
  },
  "gemini-3.5-flash-lite": { provider: "gemini", price: { input: 0.3, cachedInput: 0.3, output: 2.5 } },
  "gemini-3.1-flash-lite": { provider: "gemini", price: { input: 0.25, cachedInput: 0.25, output: 1.5 } },
} as const satisfies Record<string, ModelSpec>;

export type ModelId = keyof typeof MODELS;

export function modelSpec(id: string): ModelSpec & { id: ModelId } {
  if (!(id in MODELS)) {
    throw new Error(`등록되지 않은 모델: ${id} (src/core/models.ts의 MODELS에 추가하세요. 후보: ${Object.keys(MODELS).join(", ")})`);
  }
  return { id: id as ModelId, ...MODELS[id as ModelId] };
}

/** 한 번 호출 비용(USD). 등록되지 않은 모델은 0이 아니라 NaN → 집계에서 바로 드러나게 */
export function costUsd(usage: Usage): number {
  const spec = (MODELS as Record<string, ModelSpec>)[usage.model];
  if (!spec) return Number.NaN;
  const uncached = usage.inputTokens - usage.cachedInputTokens;
  return (uncached * spec.price.input + usage.cachedInputTokens * spec.price.cachedInput + usage.outputTokens * spec.price.output) / 1e6;
}
