-- Affiliate prospect-experience tracking.
--
-- Powers the ISOLATED affiliate-experience environment (the Leponeus gate
-- -> forced landing -> kit flow that lives under app/(affiliate-experience)/).
-- This is NOT part of the production aesdr.com funnel; it backs the
-- founder-only "Affiliate Analytics" tab in that environment's own admin.
--
-- Two tables:
--   affiliate_prospects        — registry of who each ?p=<slug> link is for
--   affiliate_prospect_events  — one row per behavioral event in the flow
--
-- Writes come from the service-role client (utils/supabase/admin.ts) in the
-- /x/track route. RLS is enabled with NO public policies, so the anon key
-- cannot read or write — only the service role (which bypasses RLS) can.

-- ─── affiliate_prospects ───
-- The unique link a prospect receives is aesdr-experience/x/welcome?p=<slug>.
-- A row here gives that slug a friendly name for the dashboard roster.
-- Auto-created on first event if the slug is unknown.
create table if not exists affiliate_prospects (
  slug text primary key,
  display_name text,
  note text,
  first_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ─── affiliate_prospect_events ───
-- One row per behavioral event. `name` is the event (link_opened,
-- animation_started, role_picked, landing_completed, timer_started,
-- timer_stopped, directed_to_kit, kit_viewed, request_conversation_clicked,
-- …). `props` carries event-specific detail (e.g. the picked role).
create table if not exists affiliate_prospect_events (
  id uuid primary key default gen_random_uuid(),
  prospect_slug text not null,
  session_id text,
  name text not null,
  props jsonb not null default '{}'::jsonb,
  path text,
  referrer text,
  country text,
  device text,
  ip_hash text,
  created_at timestamptz not null default now()
);
create index if not exists affiliate_prospect_events_slug_idx
  on affiliate_prospect_events (prospect_slug);
create index if not exists affiliate_prospect_events_name_idx
  on affiliate_prospect_events (name);
create index if not exists affiliate_prospect_events_created_idx
  on affiliate_prospect_events (created_at desc);

-- Lock both tables to the service role only.
alter table affiliate_prospects enable row level security;
alter table affiliate_prospect_events enable row level security;
-- (No policies on purpose: anon/auth roles get nothing; service role bypasses RLS.)
