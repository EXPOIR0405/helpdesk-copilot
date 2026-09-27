import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import type { ModelCalls } from "./core/fallback.ts";
import { geminiGenerator, geminiReplyGenerator } from "./core/gemini.ts";
import { modelSpec } from "./core/models.ts";
import { openAIGenerator, openAIReplyGenerator } from "./core/openai.ts";
import { withRetry } from "./core/retry.ts";

/** 호출 한 번의 시간 예산. config.calls.serving / eval */
export type CallProfile = { timeoutMs: number; attempts: number; baseDelayMs: number };

/** 모델 id(src/core/models.ts)로 제공사를 골라 판단·답장 호출을 만듦 */
export function createGenerationModel(id: string, call: CallProfile): ModelCalls {
  const spec = modelSpec(id);
  if (spec.provider === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error(`${id}를 쓰려면 .env에 GEMINI_API_KEY가 필요합니다`);
    const client = new GoogleGenAI({ apiKey, httpOptions: { timeout: call.timeoutMs } });
    // Gemini SDK는 기본 재시도가 없어서 OpenAI SDK(maxRetries)와 같은 횟수로 맞춤
    const retry = { attempts: call.attempts, baseDelayMs: call.baseDelayMs };
    return {
      id,
      generate: withRetry(geminiGenerator(client, id), retry),
      reply: withRetry(geminiReplyGenerator(client, id), retry),
    };
  }
  const client = new OpenAI({ timeout: call.timeoutMs, maxRetries: call.attempts - 1 });
  const opts = { reasoning: spec.reasoning !== false };
  return { id, generate: openAIGenerator(client, id, opts), reply: openAIReplyGenerator(client, id, opts) };
}
