-- Server-side event log.
-- Mirrors PostHog at low fidelity for the operational queries that
-- need to live in Postgres next to our purchases / progress data
-- (at-risk dashboard, win-back cron, course-completion aggregation).
-- Per audit H.10 (Phase 3).
--
-- Insert-only from app code. Admin reads via service-role queries.

create table if not exists events (
  id bigserial primary key,
  user_id uuid,                  -- null for anonymous visitor events
  email text,                    -- denormalised for admin grep without a join
  event_type text not null,
  props jsonb not null default '{}'::jsonb,
  ip_hash text,
  user_agent text,
  occurred_at timestamptz not null default now()
);

create index if not exists events_user_id_idx on events (user_id);
create index if not exists events_event_type_idx on events (event_type);
create index if not exists events_occurred_at_idx on events (occurred_at desc);
create index if not exists events_user_type_idx on events (user_id, event_type, occurred_at desc);

alter table events enable row level security;
-- No public policies; writes go through service-role admin client.
