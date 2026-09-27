-- 모델 호출 기록: 비용·지연·대체 모델 전환·실패를 운영 탭과 예산 알림에 씀
-- 판단(verdict)·답장(reply) 호출마다 한 행. 두 모델 모두 실패한 요청도 error와 함께 남김

create table usage (
  id                  bigint generated always as identity primary key,
  at                  timestamptz not null default now(),
  kind                text not null check (kind in ('verdict', 'reply')),
  model               text not null,
  input_tokens        int not null,
  cached_input_tokens int not null,
  output_tokens       int not null,
  latency_ms          int not null,
  -- 미등록 모델은 앱에서 NaN → null로 저장
  cost_usd            double precision,
  fallback_from       text,
  error               text
);
create index usage_at_idx on usage (at desc);

alter table usage enable row level security;

-- 운영 탭 집계. src/core/usage.ts summarizeDaily와 같은 규칙 (UTC 날짜, 비용 null은 0)
create function usage_daily(p_days int)
returns table (day date, model text, calls bigint, cost_usd double precision, fallbacks bigint, failures bigint, p95_latency_ms double precision)
language sql stable
set search_path = public
as $$
  select (at at time zone 'utc')::date as day,
         model,
         count(*) as calls,
         coalesce(sum(cost_usd), 0) as cost_usd,
         count(fallback_from) as fallbacks,
         count(error) as failures,
         coalesce(percentile_disc(0.95) within group (order by latency_ms) filter (where error is null), 0) as p95_latency_ms
  from usage
  where at >= ((now() at time zone 'utc')::date - (p_days - 1))::timestamp at time zone 'utc'
  group by 1, 2
  order by 1 desc, 3 desc;
$$;

-- 예산 확인: since 이후 비용 합계
create function usage_cost_since(p_since timestamptz)
returns double precision
language sql stable
set search_path = public
as $$
  select coalesce(sum(cost_usd), 0) from usage where at >= p_since;
$$;

-- 90일 지난 기록 정리 (keepalive에서 호출)
create function cleanup_usage()
returns void
language sql
set search_path = public
as $$
  delete from usage where at < now() - interval '90 days';
$$;

revoke execute on function usage_daily(int)             from public, anon, authenticated;
revoke execute on function usage_cost_since(timestamptz) from public, anon, authenticated;
revoke execute on function cleanup_usage()              from public, anon, authenticated;
grant  execute on function usage_daily(int)             to service_role;
grant  execute on function usage_cost_since(timestamptz) to service_role;
grant  execute on function cleanup_usage()              to service_role;
