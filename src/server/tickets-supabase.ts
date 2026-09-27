import type { SupabaseClient } from "@supabase/supabase-js";
import type { Ticket, TicketEvent, TicketStore } from "../core/tickets.ts";

// 스키마: supabase/migrations/0004_tickets.sql

type Row = {
  id: string;
  created_at: string;
  updated_at: string;
  channel: "web";
  question: string;
  status: Ticket["status"];
  reason: Ticket["reason"];
  answer: Ticket["answer"];
  draft: Ticket["draft"];
  context: Ticket["context"];
  final_reply: string | null;
  resolved_at: string | null;
  review: Ticket["review"];
  nearest_doc_id: string | null;
  embedding?: number[] | null;
};

// 목록·상세에는 질문 벡터(1536차원)를 가져오지 않음. 유사도 계산은 DB 함수(match_resolved_tickets)가 함
const COLS = "id, created_at, updated_at, channel, question, status, reason, answer, draft, context, final_reply, resolved_at, review, nearest_doc_id";

const toRow = (t: Partial<Ticket>): Partial<Row> => {
  const map: [keyof Ticket, keyof Row][] = [
    ["id", "id"], ["createdAt", "created_at"], ["updatedAt", "updated_at"], ["channel", "channel"], ["question", "question"],
    ["status", "status"], ["reason", "reason"], ["answer", "answer"], ["draft", "draft"], ["context", "context"],
    ["finalReply", "final_reply"], ["resolvedAt", "resolved_at"], ["review", "review"], ["nearestDocId", "nearest_doc_id"], ["embedding", "embedding"],
  ];
  return Object.fromEntries(map.filter(([k]) => k in t).map(([k, col]) => [col, t[k]])) as Partial<Row>;
};

const fromRow = (r: Row): Ticket => ({
  id: r.id,
  createdAt: new Date(r.created_at).toISOString(),
  updatedAt: new Date(r.updated_at).toISOString(),
  channel: r.channel,
  question: r.question,
  status: r.status,
  reason: r.reason,
  answer: r.answer,
  draft: r.draft,
  context: r.context,
  finalReply: r.final_reply,
  resolvedAt: r.resolved_at && new Date(r.resolved_at).toISOString(),
  review: r.review,
  nearestDocId: r.nearest_doc_id,
  embedding: null,
});

function must<T>(res: { data: T; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`Supabase ${what} 실패: ${res.error.message}`);
  return res.data;
}

const isUuid = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

export function supabaseTicketStore(db: SupabaseClient): TicketStore {
  return {
    async create(t) {
      must(await db.from("tickets").insert(toRow(t)), "티켓 저장");
    },
    async get(id) {
      if (!isUuid(id)) return null;
      const row = must(await db.from("tickets").select(COLS).eq("id", id).maybeSingle(), "티켓 조회") as Row | null;
      return row && fromRow(row);
    },
    async update(id, patch) {
      must(await db.from("tickets").update(toRow(patch)).eq("id", id), "티켓 수정");
    },
    async list({ status, limit }) {
      let q = db.from("tickets").select(COLS).order("created_at", { ascending: false }).limit(limit);
      if (status) q = q.eq("status", status);
      return (must(await q, "티켓 목록") as Row[]).map(fromRow);
    },
    async similarResolved(vector, limit, minScore) {
      const rows = must(
        await db.rpc("match_resolved_tickets", { query_embedding: vector, match_count: limit, min_score: minScore }),
        "비슷한 티켓 조회",
      ) as (Row & { score: number })[];
      return rows.map((r) => ({ ...fromRow(r), score: r.score }));
    },
    async addEvent(e) {
      must(await db.from("ticket_events").insert({ ticket_id: e.ticketId, at: e.at, type: e.type, detail: e.detail }), "티켓 이벤트 기록");
    },
    async events(ticketId) {
      if (!isUuid(ticketId)) return [];
      const rows = must(
        await db.from("ticket_events").select("ticket_id, at, type, detail").eq("ticket_id", ticketId).order("at"),
        "티켓 이벤트 조회",
      ) as { ticket_id: string; at: string; type: TicketEvent["type"]; detail: Record<string, unknown> }[];
      return rows.map((r) => ({ ticketId: r.ticket_id, at: new Date(r.at).toISOString(), type: r.type, detail: r.detail }));
    },
    async since(since) {
      const rows = must(
        await db.from("tickets").select(COLS).gte("created_at", since.toISOString()).order("created_at", { ascending: false }).limit(1000),
        "기간 티켓 조회",
      ) as Row[];
      return rows.map(fromRow);
    },
    async lastEvent(ticketId, type) {
      const row = must(
        await db.from("ticket_events").select("at").eq("ticket_id", ticketId).eq("type", type).order("at", { ascending: false }).limit(1).maybeSingle(),
        "티켓 이벤트 조회",
      ) as { at: string } | null;
      return row && new Date(row.at).toISOString();
    },
  };
}
