import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { config } from "./config.ts";
import { geminiGenerator, geminiReplyGenerator } from "./core/gemini.ts";
import { modelSpec } from "./core/models.ts";
import { openAIGenerator, openAIReplyGenerator } from "./core/openai.ts";
import type { ReplyGenerator } from "./core/reply.ts";
import { withRetry } from "./core/retry.ts";
import type { Generator } from "./core/types.ts";

export type GenerationModel = { id: string; generate: Generator; reply: ReplyGenerator };

/** 모델 id(src/core/models.ts)로 제공사를 골라 판단·답장 호출을 만듦 */
export function createGenerationModel(id: string): GenerationModel {
  const spec = modelSpec(id);
  if (spec.provider === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error(`${id}를 쓰려면 .env에 GEMINI_API_KEY가 필요합니다`);
    const client = new GoogleGenAI({ apiKey, httpOptions: { timeout: config.modelTimeoutMs } });
    // OpenAI SDK는 429·5xx를 기본 2회 재시도, Gemini SDK는 기본 재시도가 없어서 맞춰 줌
    // 무료 티어는 분당 호출 제한이 빡빡해 간격을 넉넉하게
    const retry = { attempts: 4, baseDelayMs: 4_000 };
    return {
      id,
      generate: withRetry(geminiGenerator(client, id), retry),
      reply: withRetry(geminiReplyGenerator(client, id), retry),
    };
  }
  const client = new OpenAI({ timeout: config.modelTimeoutMs });
  const opts = { reasoning: spec.reasoning !== false };
  return { id, generate: openAIGenerator(client, id, opts), reply: openAIReplyGenerator(client, id, opts) };
}
