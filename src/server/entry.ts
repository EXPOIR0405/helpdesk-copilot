import { config } from "../config.ts";
import { createRuntime } from "../runtime.ts";
import { createApi } from "./api.ts";
import { toNodeHandler } from "./node-adapter.ts";

// 따뜻한 인스턴스에서는 런타임을 재사용
// 값이 아니라 Promise를 저장: 콜드 스타트에 동시 요청이 와도 런타임(메모리 저장소 포함)은 하나만 생김
let api: Promise<ReturnType<typeof createApi>> | null = null;

function getApi() {
  api ??= createRuntime().then((runtime) =>
    createApi({
      copilot: runtime.copilot,
      replyWriter: runtime.replyWriter,
      answers: runtime.backend.answers,
      quota: runtime.backend.quota,
      ops: runtime.ops,
      policyDocs: runtime.policyDocs,
      keepalive: runtime.backend.keepalive,
      limits: config.limits,
      cronSecret: process.env.CRON_SECRET,
    }),
  );
  // 초기화가 실패하면 다음 요청에서 다시 시도
  api.catch(() => (api = null));
  return api;
}

/** Vercel 함수 진입점 (scripts/build.ts가 번들) */
export default toNodeHandler(async (req) => (await getApi())(req));
