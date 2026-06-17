-- Scout sweep runs — live status + diagnostics for the rebuilt agentic sweep.
--
-- The sweep now runs a real research loop (web_search + web_fetch, many steps)
-- in the background via after(), so the button can't see the result inline. It
-- polls a row here instead: the background job stamps its phase + counts as it
-- works, the final status when it lands, and a `log` trail so any failure is
-- one click away from its detailed reason — no digging through platform logs.
-- Same posture as the other partner tables — RLS on, NO public policies; only
-- the service role (the admin route) reads or writes this.
--
-- Additive and idempotent — safe to re-run. The app degrades gracefully until
-- this is applied (status writes are best-effort; the button falls back to a
-- timed "running… → done" with no live counts).

create table if not exists scout_sweep_runs (
  id                uuid primary key default gen_random_uuid(),
  sweep             text not null,                    -- communities | newsletters_podcasts | practitioners
  status            text not null default 'running',  -- running | done | empty | failed
  phase             text,                             -- live human-readable progress line
  searches          int  not null default 0,          -- web_search calls observed
  pages_read        int  not null default 0,          -- web_fetch calls observed
  candidates_found  int  not null default 0,          -- CLEAN rows inserted to the pipeline
  seen              int  not null default 0,          -- total surfaced (incl. dupes / unverified)
  log               jsonb not null default '[]'::jsonb, -- diagnostic trail, shown behind "why?"
  error             text,                             -- one-line headline reason on failure
  triggered_by      text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  finished_at       timestamptz
);

create index if not exists ssr_sweep_idx
  on scout_sweep_runs (sweep, created_at desc);

alter table scout_sweep_runs enable row level security;
