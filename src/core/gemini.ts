import { type GoogleGenAI, ThinkingLevel } from "@google/genai";
import { buildInput, INSTRUCTIONS, VERDICT_SCHEMA } from "./prompt.ts";
import type { ReplyGenerator } from "./reply.ts";
import type { Generator, ModelVerdict, Usage } from "./types.ts";

/**
 * OpenAI 쪽 reasoning effort low와 맞춤 → 모델 비교에서 추론 설정 차이를 줄임
 * 2.5 세대는 thinkingLevel이 없고 토큰 예산만 받음. 안 주면 동적 추론이라 짧은 질문도 20초 넘게 걸림
 */
export function thinkingConfig(model: string) {
  return model.startsWith("gemini-2.") ? { thinkingBudget: 1024 } : { thinkingLevel: ThinkingLevel.LOW };
}

export function geminiGenerator(client: GoogleGenAI, model: string): Generator {
  return async (question, chunks) => {
    const started = Date.now();
    const res = await client.models.generateContent({
      model,
      contents: buildInput(question, chunks),
      config: {
        systemInstruction: INSTRUCTIONS,
        responseMimeType: "application/json",
        responseJsonSchema: VERDICT_SCHEMA,
        thinkingConfig: thinkingConfig(model),
      },
    });
    if (!res.text) throw new Error(`Gemini 빈 응답 (finishReason: ${res.candidates?.[0]?.finishReason ?? "unknown"})`);
    return { ...(JSON.parse(res.text) as ModelVerdict), usage: geminiUsage(model, res.usageMetadata, started) };
  };
}

export function geminiReplyGenerator(client: GoogleGenAI, model: string): ReplyGenerator {
  return async (instructions, input) => {
    const res = await client.models.generateContent({
      model,
      contents: input,
      config: { systemInstruction: instructions, thinkingConfig: thinkingConfig(model) },
    });
    return res.text ?? "";
  };
}

type GeminiUsageMetadata = {
  promptTokenCount?: number;
  cachedContentTokenCount?: number;
  candidatesTokenCount?: number;
  thoughtsTokenCount?: number;
};

function geminiUsage(model: string, u: GeminiUsageMetadata | undefined, started: number): Usage {
  return {
    model,
    inputTokens: u?.promptTokenCount ?? 0,
    cachedInputTokens: u?.cachedContentTokenCount ?? 0,
    // Gemini는 thinking 토큰을 candidates와 따로 셈. 과금은 둘 다 출력 단가
    outputTokens: (u?.candidatesTokenCount ?? 0) + (u?.thoughtsTokenCount ?? 0),
    latencyMs: Date.now() - started,
  };
}
