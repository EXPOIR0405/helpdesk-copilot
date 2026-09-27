-- 자동 응대: 고객 문의(티켓)와 상태 변화 기록
-- 설계: docs/auto-response-design.md

create table tickets (
  id             uuid primary key,
  created_at     timestamptz not null,
  updated_at     timestamptz not null,
  channel        text not null default 'web',
  -- 개인정보를 가린 문의
  question       text not null,
  status         text not null check (status in ('auto_replied', 'escalated', 'resolved')),
  reason         text check (reason in ('action_request', 'unanswerable', 'pending_policy', 'low_confidence', 'unsupported_numbers', 'error')),
  answer         jsonb,
  draft          jsonb,
  context        jsonb not null,
  final_reply    text,
  resolved_at    timestamptz,
  review         text check (review in ('ok', 'wrong')),
  nearest_doc_id text,
  -- 질문 벡터 (text-embedding-3-small). 비슷한 과거 티켓 찾기용
  embedding      vector(1536)
);
create index tickets_created_idx on tickets (created_at desc);
create index tickets_status_idx on tickets (status, created_at desc);

create table ticket_events (
  id        bigint generated always as identity primary key,
  ticket_id uuid not null references tickets(id) on delete cascade,
  at        timestamptz not null,
  type      text not null,
  detail    jsonb not null default '{}'
);
create index ticket_events_ticket_idx on ticket_events (ticket_id, at);

alter table tickets       enable row level security;
alter table ticket_events enable row level security;

-- 질문 의미가 비슷한 처리 완료 티켓 (src/core/tickets.ts memoryTicketStore와 같은 코사인 계산)
-- 티켓 수백 건 규모라 전수 비교. 수천 건을 넘으면 hnsw 인덱스 추가
create function match_resolved_tickets(query_embedding vector(1536), match_count int, min_score float)
returns table (
  id uuid, created_at timestamptz, updated_at timestamptz, channel text, question text, status text, reason text,
  answer jsonb, draft jsonb, context jsonb, final_reply text, resolved_at timestamptz, review text, nearest_doc_id text,
  score float
)
language sql stable
set search_path = public, extensions
as $$
  select t.id, t.created_at, t.updated_at, t.channel, t.question, t.status, t.reason,
         t.answer, t.draft, t.context, t.final_reply, t.resolved_at, t.review, t.nearest_doc_id,
         1 - (t.embedding <=> query_embedding) as score
  from tickets t
  where t.status = 'resolved'
    and t.final_reply is not null
    and t.embedding is not null
    and 1 - (t.embedding <=> query_embedding) >= min_score
  order by t.embedding <=> query_embedding
  limit match_count;
$$;

revoke execute on function match_resolved_tickets(vector, int, float) from public, anon, authenticated;
grant  execute on function match_resolved_tickets(vector, int, float) to service_role;
