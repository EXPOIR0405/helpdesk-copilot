import OpenAI from "openai";
import { buildInput, INSTRUCTIONS, VERDICT_SCHEMA } from "./prompt.ts";
import type { ReplyGenerator } from "./reply.ts";
import type { Embedder, Generator, ModelVerdict, Usage } from "./types.ts";

export function openAIEmbedder(client: OpenAI, model: string): Embedder {
  return async (texts) => {
    const res = await client.embeddings.create({ model, input: texts });
    return res.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
  };
}

// 추론 모델만 effort low. 비추론 모델(gpt-4.1·4o)에 보내면 400
const reasoningFor = (reasoning: boolean) => (reasoning ? { reasoning: { effort: "low" as const } } : {});

export function openAIGenerator(client: OpenAI, model: string, opts = { reasoning: true }): Generator {
  return async (question, chunks) => {
    const started = Date.now();
    const res = await client.responses.create({
      model,
      instructions: INSTRUCTIONS,
      input: buildInput(question, chunks),
      ...reasoningFor(opts.reasoning),
      text: {
        format: { type: "json_schema", name: "verdict", strict: true, schema: VERDICT_SCHEMA },
      },
    });
    const usage: Usage = {
      model,
      inputTokens: res.usage?.input_tokens ?? 0,
      cachedInputTokens: res.usage?.input_tokens_details?.cached_tokens ?? 0,
      // reasoning 토큰은 output_tokens에 이미 포함
      outputTokens: res.usage?.output_tokens ?? 0,
      latencyMs: Date.now() - started,
    };
    return { ...(JSON.parse(res.output_text) as ModelVerdict), usage };
  };
}

export function openAIReplyGenerator(client: OpenAI, model: string, opts = { reasoning: true }): ReplyGenerator {
  return async (instructions, input) => {
    const res = await client.responses.create({ model, instructions, input, ...reasoningFor(opts.reasoning) });
    return res.output_text;
  };
}
