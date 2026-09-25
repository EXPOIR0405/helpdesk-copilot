import OpenAI from "openai";
import { config } from "./config.ts";
import { createCopilot } from "./core/copilot.ts";
import { openAIEmbedder, openAIGenerator, openAIReplyGenerator } from "./core/openai.ts";
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
  supabaseQuota,
  supabaseSearch,
  supabaseUnansweredLog,
} from "./server/supabase.ts";
import evalSummary from "../data/eval-summary.json" with { type: "json" };

type Backend = {
  name: "supabase" | "local";
  indexRepo: IndexRepo;
  search(): Promise<Search>;
  log: UnansweredLog;
  answers: AnswerStore;
  quota: Quota;
  opsDocs(): Promise<Awaited<ReturnType<typeof supabaseOpsDocs>>>;
  keepalive(): Promise<void>;
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
      keepalive: () => supabaseKeepalive(db),
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
    keepalive: async () => {},
  };
}

/** 스크립트·API가 공통으로 쓰는 조립 지점 */
export async function createRuntime(opts: { log?: UnansweredLog } = {}) {
  const backend = selectBackend();
  const client = new OpenAI();
  const log = opts.log ?? backend.log;
  const copilot = createCopilot({
    search: await backend.search(),
    embed: openAIEmbedder(client, config.models.embedding),
    generate: openAIGenerator(client, config.models.generation),
    log,
    retrieval: config.retrieval,
    confidence: config.confidence,
  });
  const replyWriter = createReplyWriter(openAIReplyGenerator(client, config.models.generation));

  async function ops() {
    const [{ docs, syncedAt }, entries] = await Promise.all([backend.opsDocs(), backend.log.list()]);
    return buildOps({
      docs,
      syncedAt,
      models: config.models,
      unansweredEntries: entries,
      eval: evalSummary as EvalSummary,
    });
  }

  return { backend, log, copilot, replyWriter, ops };
}
