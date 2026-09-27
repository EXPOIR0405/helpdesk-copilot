/** 호출 제한(429)·서버 오류(5xx)·네트워크 오류만 다시 시도. 400대 요청 오류는 다시 해도 같으므로 바로 실패 */
export function isRetryable(e: unknown): boolean {
  const status = (e as { status?: unknown })?.status;
  if (typeof status !== "number") return true;
  return status === 429 || status >= 500;
}

export type RetryOptions = {
  attempts: number;
  baseDelayMs: number;
  sleep?: (ms: number) => Promise<void>;
};

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** 지수 백오프 + 지터. 같은 순간에 몰린 요청이 같은 순간에 다시 몰리지 않게 */
export function withRetry<A extends unknown[], R>(fn: (...args: A) => Promise<R>, opts: RetryOptions): (...args: A) => Promise<R> {
  const sleep = opts.sleep ?? defaultSleep;
  return async (...args) => {
    for (let attempt = 1; ; attempt++) {
      try {
        return await fn(...args);
      } catch (e) {
        if (attempt >= opts.attempts || !isRetryable(e)) throw e;
        const delay = opts.baseDelayMs * 2 ** (attempt - 1);
        await sleep(delay / 2 + Math.random() * (delay / 2));
      }
    }
  };
}
