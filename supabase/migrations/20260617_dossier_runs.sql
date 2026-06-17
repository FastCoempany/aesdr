-- Dossier runs — live status + diagnostics for the rebuilt "Run brief" flow.
--
-- The brief now runs a two-phase research loop (search + fetch, then a
-- guaranteed write-up) in the background via after(), off a route handler —
-- instead of a Server Action that the platform could kill mid-call (the same
-- fix applied to sweeps). The candidate room polls a row here for the live
-- phase + the one-click "why?" reason. Mirrors scout_sweep_runs.
--
-- RLS on, NO public policies — service role only. Additive + idempotent. The
-- room degrades to a timed refresh until this is applied.

create table if not exists dossier_runs (
  id            uuid primary key default gen_random_uuid(),
  pipeline_id   uuid not null references partner_pipeline(id) on delete cascade,
  status        text not null default 'running',  -- running | done | failed
  phase         text,
  searches      int  not null default 0,
  pages_read    int  not null default 0,
  verdict       text,                              -- reach_out | skip | needs_research
  log           jsonb not null default '[]'::jsonb,
  error         text,
  triggered_by  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  finished_at   timestamptz
);

create index if not exists dr_pipeline_idx
  on dossier_runs (pipeline_id, created_at desc);

alter table dossier_runs enable row level security;
