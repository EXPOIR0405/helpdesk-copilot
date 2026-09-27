import type { ReplyGenerator } from "./reply.ts";
import type { Generator } from "./types.ts";

/** 한 모델의 판단·답장 호출 묶음 */
export type ModelCalls = { id: string; generate: Generator; reply: ReplyGenerator };

/**
 * - transient: 429·5xx·타임아웃·네트워크. 기다리면 풀림
 * - provider: 401·403·404. 키 폐기·권한·모델 종료 등 제공사 쪽 설정 문제, 사람이 조치해야 함
 *   (gemini-2.5-flash-lite가 "no longer available to new users" 404를 낸 게 실제 사례)
 */
export type FailureKind = "transient" | "provider";

export type FallbackEvent = { from: string; to: string; kind: "verdict" | "reply"; failure: FailureKind; error: unknown };

/** 대체 모델로 넘길 실패인지. 400·422는 요청 자체가 잘못된 것(대개 코드·스키마 버그) → 넘기면 원인을 가림 */
export function classifyFailure(e: unknown): FailureKind | null {
  const status = (e as { status?: unknown })?.status;
  if (typeof status !== "number") return "transient";
  if (status === 429 || status >= 500) return "transient";
  if (status === 401 || status === 403 || status === 404) return "provider";
  return null;
}

/**
 * 기본 모델이 실패하면 대체 모델로 한 번 더
 * - 알림(onFallback)이 실패해도 응답은 계속
 * - 대체 모델도 실패하면 대체 모델 오류를 던짐 (500 처리에서 알림)
 */
export function withFallback(
  primary: ModelCalls,
  secondary: ModelCalls,
  onFallback: (e: FallbackEvent) => Promise<void> | void,
): ModelCalls {
  async function run<R extends { usage?: { fallbackFrom?: string } }>(
    kind: FallbackEvent["kind"],
    first: () => Promise<R>,
    second: () => Promise<R>,
  ): Promise<R> {
    try {
      return await first();
    } catch (error) {
      const failure = classifyFailure(error);
      if (!failure) throw error;
      try {
        await onFallback({ from: primary.id, to: secondary.id, kind, failure, error });
      } catch (e) {
        console.error("fallback 알림 실패", e);
      }
      const result = await second();
      return result.usage ? { ...result, usage: { ...result.usage, fallbackFrom: primary.id } } : result;
    }
  }

  return {
    id: primary.id,
    generate: (q, chunks) => run("verdict", () => primary.generate(q, chunks), () => secondary.generate(q, chunks)),
    reply: (instructions, input) => run("reply", () => primary.reply(instructions, input), () => secondary.reply(instructions, input)),
  };
}
