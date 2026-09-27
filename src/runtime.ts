import OpenAI from "openai";
import { config } from "./config.ts";
import { createCopilot } from "./core/copilot.ts";
import { openAIEmbedder } from "./core/openai.ts";
import { createGenerationModel, type CallProfile } from "./providers.ts";
import { createReplyWriter } from "./core/reply.ts";
import { buildOps, type EvalSummary } from "./core/report.ts";
import { memorySearch } from "./core/retrieve.ts";
import { fileIndexRepo, type IndexRepo } from "./core/sync.ts";
import type { Search } from "./core/types.ts";
import { jsonlUnansweredLog, type UnansweredLog } from "./core/unanswered.ts";
import { memoryAnswerStore, memoryQuota, type AnswerStore, type Quota } from "./server/stores.ts";
import {
  supabaseAnswerStore,
  supabaseFromEnv,
  supabaseIndexRepo,
  supabaseKeepalive,
  supabaseOpsDocs,
  supabasePolicyDocs,
  type PolicyDocView,
  supabaseQuota,
  supabaseSearch,
  supabaseUnansweredLog,
  supabaseUsageLog,
  supabaseHealth,
} from "./server/supabase.ts";
import { consoleSink, createAlerter, describeError, slackSink } from "./core/alerts.ts";
import { withFallback } from "./core/fallback.ts";
import { memoryUsageLog, type UsageLog } from "./core/usage.ts";
import { memoryTicketStore, type TicketStore } from "./core/tickets.ts";
import { supabaseTicketStore } from "./server/tickets-supabase.ts";
import evalSummary from "../data/eval-summary.json" with { type: "json" };

type Backend = {
  name: "supabase" | "local";
  indexRepo: IndexRepo;
  search(): Promise<Search>;
  log: UnansweredLog;
  answers: AnswerStore;
  quota: Quota;
  opsDocs(): Promise<Awaited<ReturnType<typeof supabaseOpsDocs>>>;
  /** 정책 문서 탭용 원문. 검색 인덱스와 같은 동기화 결과에서 읽음 */
  policyDocs(): Promise<PolicyDocView[]>;
  keepalive(): Promise<void>;
  usage: UsageLog;
  tickets: TicketStore;
  /** 헬스체크용: 검색할 조각 수와 마지막 동기화 시각. 저장소에 닿지 못하면 던짐 */
  health(): Promise<{ chunks: number; syncedAt: string | null }>;
};

/** SUPABASE_URL·SUPABASE_SECRET_KEY가 있으면 Supabase, 없으면 로컬 파일 */
export function selectBackend(): Backend {
  const db = supabaseFromEnv();
  if (db) {
    return {
      name: "supabase",
      indexRepo: supabaseIndexRepo(db),
      search: async () => supabaseSearch(db),
      log: supabaseUnansweredLog(db),
      answers: supabaseAnswerStore(db),
      quota: supabaseQuota(db),
      opsDocs: () => supabaseOpsDocs(db),
      policyDocs: () => supabasePolicyDocs(db),
      keepalive: () => supabaseKeepalive(db),
      usage: supabaseUsageLog(db),
      tickets: supabaseTicketStore(db),
      health: () => supabaseHealth(db),
    };
  }
  const indexRepo = fileIndexRepo(config.indexPath);
  const loadIndex = async () => {
    const index = await indexRepo.load();
    if (!index) throw new Error(`인덱스가 없습니다. 먼저 npm run sync 를 실행하세요 (${config.indexPath})`);
    return index;
  };
  return {
    name: "local",
    indexRepo,
    search: async () => memorySearch((await loadIndex()).chunks),
    log: jsonlUnansweredLog(config.unansweredLogPath),
    answers: memoryAnswerStore(),
    quota: memoryQuota(),
    async opsDocs() {
      const index = await loadIndex();
      const counts = new Map<string, number>();
      for (const c of index.chunks) counts.set(c.docId, (counts.get(c.docId) ?? 0) + 1);
      return {
        docs: Object.entries(index.docs).map(([id, d]) => ({ id, title: d.title, status: d.status, updatedAt: d.updatedAt, chunks: counts.get(id) ?? 0 })),
        syncedAt: index.syncedAt,
      };
    },
    async policyDocs() {
      const index = await loadIndex();
      return Object.entries(index.docs)
        .map(([id, d]) => ({ id, title: d.title, status: d.status, updatedAt: d.updatedAt, body: d.body ?? "" }))
        .sort((a, b) => a.id.localeCompare(b.id));
    },
    keepalive: async () => {},
    usage: memoryUsageLog(),
    tickets: memoryTicketStore(),
    async health() {
      const index = await loadIndex();
      return { chunks: index.chunks.length, syncedAt: index.syncedAt };
    },
  };
}

export type RuntimeOptions = {
  log?: UnansweredLog;
  generationModel?: string;
  /** null이면 대체 모델 없음 (평가는 한 모델만 재야 하므로) */
  fallbackModel?: string | null;
  /** 서비스는 Vercel 함수 시간 안에, 평가는 완주 우선 */
  calls?: CallProfile;
};

/** 스크립트·API가 공통으로 쓰는 조립 지점 */
export async function createRuntime(opts: RuntimeOptions = {}) {
  const backend = selectBackend();
  const log = opts.log ?? backend.log;
  const calls = opts.calls ?? config.calls.serving;

  // Slack 주소가 없으면 콘솔로. 중복 방지는 호출 제한과 같은 저장소(DB)로 → 인스턴스가 여러 개여도 한 번만
  const webhook = process.env.SLACK_WEBHOOK_URL?.trim();
  const alerts = createAlerter({
    sink: webhook ? slackSink(webhook, "helpdesk-copilot") : consoleSink,
    gate: (key, windowSeconds) => backend.quota.take(key, windowSeconds, 1),
    windowSeconds: config.alertWindowSeconds,
  });

  const primary = createGenerationModel(opts.generationModel ?? config.models.generation, calls);
  const fallbackId = opts.fallbackModel === undefined ? config.models.fallback : opts.fallbackModel;
  const model =
    fallbackId && fallbackId !== primary.id
      ? withFallback(primary, createGenerationModel(fallbackId, calls), (e) =>
          alerts.notify({
            // 제공사 설정 문제(키·권한·모델 종료)는 기다려도 안 풀리므로 error
            level: e.failure === "provider" ? "error" : "warn",
            key: `fallback:${e.from}:${e.failure}`,
            title:
              e.failure === "provider"
                ? `기본 모델 사용 불가 (키·권한·모델 종료 확인) → 대체 모델로 응답 중`
                : `기본 모델 일시 오류 → 대체 모델로 응답`,
            detail: { 기본: e.from, 대체: e.to, 단계: e.kind, 오류: describeError(e.error) },
          }),
        )
      : primary;
  const models = { embedding: config.models.embedding, generation: primary.id, fallback: fallbackId || null };

  // 평가는 넘겨받은 프로필 그대로, 서비스는 임베딩 전용 프로필 (짧게 끊고 한 번 더)
  const embedCalls = opts.calls ?? config.calls.embedding;
  const copilot = createCopilot({
    search: await backend.search(),
    embed: openAIEmbedder(new OpenAI({ timeout: embedCalls.timeoutMs, maxRetries: embedCalls.attempts - 1 }), config.models.embedding),
    generate: model.generate,
    log,
    retrieval: config.retrieval,
    confidence: config.confidence,
  });
  const replyWriter = createReplyWriter(model.reply);

  async function ops() {
    const now = new Date();
    const dayStart = new Date(`${now.toISOString().slice(0, 10)}T00:00:00Z`);
    const [{ docs, syncedAt }, entries, usage, spentToday] = await Promise.all([
      backend.opsDocs(),
      backend.log.list(),
      backend.usage.daily(7, now),
      backend.usage.costSince(dayStart),
    ]);
    return buildOps({
      docs,
      syncedAt,
      models,
      unansweredEntries: entries,
      eval: evalSummary as EvalSummary,
      usage,
      budget: { dailyUsd: config.limits.dailyBudgetUsd, spentTodayUsd: spentToday },
    });
  }

  // 티켓 맥락의 문서 제목. 문서는 동기화 때만 바뀌므로 인스턴스에서 10분 캐시
  let titles: { at: number; value: Promise<Record<string, string>> } | null = null;
  function docTitles() {
    if (!titles || Date.now() - titles.at > 600_000) {
      const value = backend.opsDocs().then(({ docs }) => Object.fromEntries(docs.map((d) => [d.id, d.title])));
      value.catch(() => (titles = null));
      titles = { at: Date.now(), value };
    }
    return titles.value;
  }

  return { backend, log, copilot, replyWriter, ops, policyDocs: backend.policyDocs, alerts, models, docTitles };
}
