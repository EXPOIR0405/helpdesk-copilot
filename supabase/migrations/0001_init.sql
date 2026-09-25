-- helpdesk-copilot 초기 스키마
-- Supabase SQL Editor에 그대로 붙여 넣어 실행
-- 접근은 서버의 secret 키로만. 모든 테이블 RLS 켜고 정책 없음 → 공개(anon) 키로는 읽기·쓰기 불가

-- Supabase 관례대로 extensions 스키마에 설치 (기본 search_path에 포함돼 있음)
create extension if not exists vector with schema extensions;

-- 동기화 상태 (임베딩 모델, 마지막 동기화 시각)
create table meta (
  key   text primary key,
  value text not null
);

create table docs (
  id         text primary key,
  title      text not null,
  status     text not null check (status in ('confirmed', 'pending')),
  updated_at date not null,
  hash       text not null
);

-- text-embedding-3-small = 1536차원
create table chunks (
  id        text primary key,
  doc_id    text not null references docs(id) on delete cascade,
  doc_title text not null,
  section   text not null,
  status    text not null check (status in ('confirmed', 'pending')),
  text      text not null,
  embedding vector(1536) not null
);
create index chunks_doc_id_idx on chunks (doc_id);
-- 조각 수십 개 규모라 벡터 인덱스 없이 전수 비교. 수천 개를 넘으면 hnsw 인덱스 추가

create table unanswered (
  id             bigint generated always as identity primary key,
  at             timestamptz not null default now(),
  question       text not null,
  status         text not null,
  confidence     text not null,
  top_score      real not null,
  nearest_doc_id text
);
create index unanswered_at_idx on unanswered (at desc);

-- 답장 요청은 answerId로만 받음 + 같은 질문 캐시
create table answers (
  id           uuid primary key default gen_random_uuid(),
  question     text not null,
  question_key text not null,
  answer       jsonb not null,
  reply        jsonb,
  created_at   timestamptz not null default now()
);
create index answers_cache_idx on answers (question_key, created_at desc);

-- 고정 창 호출 제한 (IP별 분당, 하루 전체)
create table quota (
  key          text primary key,
  window_start timestamptz not null,
  count        int not null
);

alter table meta       enable row level security;
alter table docs       enable row level security;
alter table chunks     enable row level security;
alter table unanswered enable row level security;
alter table answers    enable row level security;
alter table quota      enable row level security;

-- 코사인 유사도 = 1 - 코사인 거리. 로컬 메모리 검색(src/core/retrieve.ts)과 같은 계산
create function match_chunks(query_embedding vector(1536), match_count int, min_score float)
returns table (id text, doc_id text, doc_title text, section text, status text, text text, score float)
language sql stable
set search_path = public, extensions
as $$
  select c.id, c.doc_id, c.doc_title, c.section, c.status, c.text,
         1 - (c.embedding <=> query_embedding) as score
  from chunks c
  where 1 - (c.embedding <=> query_embedding) >= min_score
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

-- 원자적으로 1 증가시키고 한도 안인지 반환. 창이 지났으면 새 창으로 시작
create function take_quota(p_key text, p_window_seconds int, p_limit int)
returns boolean
language plpgsql
set search_path = public
as $$
declare
  v_count int;
begin
  insert into quota as q (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update set
    window_start = case when q.window_start <= now() - make_interval(secs => p_window_seconds) then now() else q.window_start end,
    count        = case when q.window_start <= now() - make_interval(secs => p_window_seconds) then 1 else q.count + 1 end
  returning count into v_count;
  return v_count <= p_limit;
end;
$$;

-- keepalive에서 호출. 이틀 지난 제한 기록 삭제
create function cleanup_quota()
returns void
language sql
set search_path = public
as $$
  delete from quota where window_start < now() - interval '2 days';
$$;

-- 함수는 기본으로 anon에게도 실행 권한이 열리므로 서버 역할만 남김
revoke execute on function match_chunks(vector, int, float) from public, anon, authenticated;
revoke execute on function take_quota(text, int, int)       from public, anon, authenticated;
revoke execute on function cleanup_quota()                  from public, anon, authenticated;
grant  execute on function match_chunks(vector, int, float) to service_role;
grant  execute on function take_quota(text, int, int)       to service_role;
grant  execute on function cleanup_quota()                  to service_role;
