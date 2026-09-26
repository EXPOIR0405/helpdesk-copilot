import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { OpsDoc } from "../core/report.ts";
import type { DocIndex, IndexRepo } from "../core/sync.ts";
import type { DocStatus, Search } from "../core/types.ts";
import type { UnansweredEntry, UnansweredLog } from "../core/unanswered.ts";
import { questionKey, type AnswerStore, type Quota } from "./stores.ts";

// 스키마: supabase/migrations/0001_init.sql
// 서버 전용 secret 키로만 접근. 모든 테이블은 RLS를 켜고 정책을 두지 않아 공개 키로는 읽을 수 없음

export function supabaseFromEnv(env: NodeJS.ProcessEnv = process.env): SupabaseClient | null {
  // 대시보드 Data API 화면의 주소(…/rest/v1/)를 그대로 붙여 넣어도 동작하게 기본 주소만 남김
  const url = env.SUPABASE_URL?.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  const key = env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** supabase-js는 에러를 반환값으로 줌. 조용히 넘어가지 않게 던짐 */
function must<T>(res: { data: T; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`Supabase ${what} 실패: ${res.error.message}`);
  return res.data;
}

export function supabaseSearch(db: SupabaseClient): Search {
  return async (vector, { topK, minScore }) => {
    const rows = must(
      await db.rpc("match_chunks", { query_embedding: vector, match_count: topK, min_score: minScore }),
      "검색",
    ) as { id: string; doc_id: string; doc_title: string; section: string; status: DocStatus; text: string; score: number }[];
    return rows.map((r) => ({
      id: r.id,
      docId: r.doc_id,
      docTitle: r.doc_title,
      section: r.section,
      status: r.status,
      text: r.text,
      score: r.score,
    }));
  };
}

export function supabaseIndexRepo(db: SupabaseClient): IndexRepo {
  return {
    // 문서 해시만 읽음. 바뀌지 않은 문서의 조각은 DB에 그대로 있으므로 임베딩까지 내려받을 필요 없음
    async load() {
      const meta = must(await db.from("meta").select("key, value"), "메타 조회") as { key: string; value: string }[];
      const get = (k: string) => meta.find((m) => m.key === k)?.value;
      const embeddingModel = get("embedding_model");
      if (!embeddingModel) return null;
      const docs = must(await db.from("docs").select("id, title, status, updated_at, hash, body"), "문서 조회") as {
        id: string; title: string; status: DocStatus; updated_at: string; hash: string; body: string;
      }[];
      return {
        embeddingModel,
        syncedAt: get("synced_at") ?? "",
        docs: Object.fromEntries(docs.map((d) => [d.id, { hash: d.hash, title: d.title, status: d.status, updatedAt: d.updated_at, body: d.body }])),
        chunks: [],
      } satisfies DocIndex;
    },

    // 문서 행(메타·원문)은 매번 전부 upsert: 수십 행이라 싸고, 컬럼이 늘어도 다음 동기화에 채워짐
    // 조각은 바뀐 문서만: 추가·수정 문서는 지우고 다시 넣고, 사라진 문서는 삭제(조각은 cascade)
    async save(index, stats) {
      const changed = [...stats.added, ...stats.updated];
      if (stats.removed.length) must(await db.from("docs").delete().in("id", stats.removed), "문서 삭제");
      must(
        await db.from("docs").upsert(
          Object.entries(index.docs).map(([id, d]) => ({
            id, title: d.title, status: d.status, updated_at: d.updatedAt, hash: d.hash, body: d.body,
          })),
        ),
        "문서 저장",
      );
      if (changed.length) {
        must(await db.from("chunks").delete().in("doc_id", changed), "조각 삭제");
        const rows = index.chunks
          .filter((c) => changed.includes(c.docId))
          .map((c) => ({ id: c.id, doc_id: c.docId, doc_title: c.docTitle, section: c.section, status: c.status, text: c.text, embedding: c.embedding }));
        if (rows.length) must(await db.from("chunks").insert(rows), "조각 저장");
      }
      must(
        await db.from("meta").upsert([
          { key: "embedding_model", value: index.embeddingModel },
          { key: "synced_at", value: index.syncedAt },
        ]),
        "메타 저장",
      );
    },
  };
}

type UnansweredRow = { at: string; question: string; status: UnansweredEntry["status"]; confidence: UnansweredEntry["confidence"]; top_score: number; nearest_doc_id: string | null };

export function supabaseUnansweredLog(db: SupabaseClient, listLimit = 200): UnansweredLog {
  return {
    async append(e) {
      must(
        await db.from("unanswered").insert({
          at: e.at, question: e.question, status: e.status, confidence: e.confidence, top_score: e.topScore, nearest_doc_id: e.nearestDocId,
        }),
        "미답변 기록",
      );
    },
    async list() {
      const rows = must(
        await db.from("unanswered").select("at, question, status, confidence, top_score, nearest_doc_id").order("at", { ascending: false }).limit(listLimit),
        "미답변 조회",
      ) as UnansweredRow[];
      return rows.map((r) => ({
        at: r.at, question: r.question, status: r.status, confidence: r.confidence, topScore: r.top_score, nearestDocId: r.nearest_doc_id,
      }));
    },
  };
}

export function supabaseAnswerStore(db: SupabaseClient): AnswerStore {
  const cols = "id, question, answer, reply, created_at";
  type Row = { id: string; question: string; answer: never; reply: never; created_at: string };
  const toStored = (r: Row) => ({ id: r.id, question: r.question, answer: r.answer, reply: r.reply, createdAt: r.created_at });
  return {
    async save(question, answer) {
      const row = must(await db.from("answers").insert({ question, question_key: questionKey(question), answer }).select("id").single(), "답변 저장") as { id: string };
      return row.id;
    },
    async get(id) {
      // uuid 형식이 아니면 DB가 에러를 내므로 먼저 거름
      if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
      const row = must(await db.from("answers").select(cols).eq("id", id).maybeSingle(), "답변 조회") as Row | null;
      return row && toStored(row);
    },
    async findRecent(question, since) {
      const row = must(
        await db.from("answers").select(cols).eq("question_key", questionKey(question)).gte("created_at", since.toISOString())
          .order("created_at", { ascending: false }).limit(1).maybeSingle(),
        "캐시 조회",
      ) as Row | null;
      return row && toStored(row);
    },
    async saveReply(id, reply) {
      must(await db.from("answers").update({ reply }).eq("id", id), "답장 저장");
    },
  };
}

export function supabaseQuota(db: SupabaseClient): Quota {
  return {
    async take(key, windowSeconds, limit) {
      return must(await db.rpc("take_quota", { p_key: key, p_window_seconds: windowSeconds, p_limit: limit }), "호출 제한") as boolean;
    },
  };
}

export async function supabaseOpsDocs(db: SupabaseClient): Promise<{ docs: OpsDoc[]; syncedAt: string | null }> {
  const [docs, chunks, meta] = await Promise.all([
    db.from("docs").select("id, title, status, updated_at"),
    db.from("chunks").select("doc_id"),
    db.from("meta").select("value").eq("key", "synced_at").maybeSingle(),
  ]);
  const counts = new Map<string, number>();
  for (const c of must(chunks, "조각 수 조회") as { doc_id: string }[]) counts.set(c.doc_id, (counts.get(c.doc_id) ?? 0) + 1);
  return {
    docs: (must(docs, "문서 조회") as { id: string; title: string; status: DocStatus; updated_at: string }[]).map((d) => ({
      id: d.id, title: d.title, status: d.status, updatedAt: d.updated_at, chunks: counts.get(d.id) ?? 0,
    })),
    syncedAt: (must(meta, "메타 조회") as { value: string } | null)?.value ?? null,
  };
}

export type PolicyDocView = { id: string; title: string; status: DocStatus; updatedAt: string; body: string };

export async function supabasePolicyDocs(db: SupabaseClient): Promise<PolicyDocView[]> {
  const rows = must(await db.from("docs").select("id, title, status, updated_at, body").order("id"), "문서 원문 조회") as {
    id: string; title: string; status: DocStatus; updated_at: string; body: string;
  }[];
  return rows.map((d) => ({ id: d.id, title: d.title, status: d.status, updatedAt: d.updated_at, body: d.body }));
}

/** 하루 한 번 Cron이 호출. 조회로 DB를 깨워 두고, 지난 제한 기록을 정리 */
export async function supabaseKeepalive(db: SupabaseClient): Promise<void> {
  must(await db.from("docs").select("id").limit(1), "keepalive 조회");
  must(await db.rpc("cleanup_quota"), "제한 기록 정리");
}
