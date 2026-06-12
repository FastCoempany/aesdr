-- Candidate timeline + structured dossier brief — the data the candidate room
-- renders. Same posture as the other partner tables: RLS on, NO public
-- policies; only the service role touches these.
--
-- Additive and idempotent — safe to re-run. The app degrades gracefully until
-- this is applied: event appends are best-effort no-ops, and the room renders
-- the brief from the legacy why_fit text trail.

-- ─── partner_events ───  (every agent action + operator gesture, in order)
-- One row per thing that happened to a candidate. The room's timeline reads
-- this; actions and crons append fire-and-forget.
create table if not exists partner_events (
  id           uuid primary key default gen_random_uuid(),
  pipeline_id  uuid not null references partner_pipeline(id) on delete cascade,
  at           timestamptz not null default now(),
  actor        text not null,   -- operator email | scout | dossier | scribe | courier | sentinel
  kind         text not null,   -- sourced | promoted | rejected | brief_written | drafted | draft_edited | approved | held | released | sent | send_failed | contacted
  detail       jsonb not null default '{}'::jsonb
);
create index if not exists pe_pipeline_idx
  on partner_events (pipeline_id, at desc);
alter table partner_events enable row level security;

-- ─── dossier_brief ───  (the brief as a document, not a text blob)
-- Dossier still appends its verdict line to why_fit (the raw trail), but the
-- room renders this structured copy.
alter table partner_pipeline add column if not exists dossier_brief jsonb;
