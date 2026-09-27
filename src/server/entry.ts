import { config } from "../config.ts";
import { createRuntime } from "../runtime.ts";
import { createApi } from "./api.ts";
import { toNodeHandler } from "./node-adapter.ts";
import { createEscalationNotifier } from "./notify.ts";

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
      usage: runtime.backend.usage,
      alerts: runtime.alerts,
      generationModel: runtime.models.generation,
      health: runtime.backend.health,
      cronSecret: process.env.CRON_SECRET,
      tickets: {
        store: runtime.backend.tickets,
        docTitles: runtime.docTitles,
        // N8N_WEBHOOK_URL이 없으면(또는 n8n이 실패하면) Slack으로 직접
        notify: createEscalationNotifier({
          n8nWebhookUrl: process.env.N8N_WEBHOOK_URL?.trim() || undefined,
          n8nSecret: process.env.HELPDESK_N8N_SECRET?.trim() || undefined,
          baseUrl: config.support.publicBaseUrl,
          alerts: runtime.alerts,
        }),
        slaMinutes: config.support.slaMinutes,
        remindEveryMinutes: config.support.remindEveryMinutes,
        n8nSecret: process.env.HELPDESK_N8N_SECRET?.trim() || undefined,
      },
    }),
  );
  // 초기화가 실패하면 다음 요청에서 다시 시도
  api.catch(() => (api = null));
  return api;
}

/** Vercel 함수 진입점 (scripts/build.ts가 번들) */
export default toNodeHandler(async (req) => (await getApi())(req));
