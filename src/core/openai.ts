import OpenAI from "openai";
import { buildInput, INSTRUCTIONS, VERDICT_SCHEMA } from "./prompt.ts";
import type { ReplyGenerator } from "./reply.ts";
import type { Embedder, Generator, ModelVerdict } from "./types.ts";

export function openAIEmbedder(client: OpenAI, model: string): Embedder {
  return async (texts) => {
    const res = await client.embeddings.create({ model, input: texts });
    return res.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
  };
}

export function openAIGenerator(client: OpenAI, model: string): Generator {
  return async (question, chunks) => {
    const res = await client.responses.create({
      model,
      instructions: INSTRUCTIONS,
      input: buildInput(question, chunks),
      reasoning: { effort: "low" },
      text: {
        format: { type: "json_schema", name: "verdict", strict: true, schema: VERDICT_SCHEMA },
      },
    });
    return JSON.parse(res.output_text) as ModelVerdict;
  };
}

export function openAIReplyGenerator(client: OpenAI, model: string): ReplyGenerator {
  return async (instructions, input) => {
    const res = await client.responses.create({ model, instructions, input, reasoning: { effort: "low" } });
    return res.output_text;
  };
}
