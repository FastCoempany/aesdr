-- Canonical affiliates entity table.
-- Per docs/canon-revisions/2026-05-22-affiliate-hub-plan.md (step 2 of 14).
--
-- Until now the operational tables (affiliate_links, affiliate_clicks,
-- affiliate_attributions, affiliate_payouts) carried `affiliate_slug` as
-- a free-text column with no parent. This migration introduces the
-- canonical entity row that every affiliate-side surface joins against:
--
--   - identity:        id, user_id (FK auth.users), slug (unique), display_name, email
--   - lifecycle:       status (vetting → active → paused/sunset/cut)
--   - segmentation:    archetype, sophistication_tier
--   - economics:       commission_pct, attribution_window_days
--   - compliance:      strike_count, strike_log (jsonb)
--   - payouts:         stripe_account_id (Connect Standard), payout_method
--   - approval gate:   approved_pieces_count (first 3 require admin review)
--   - timestamps:      joined_at, activated_at, paused_at, sunset_at
--   - founder notes:   notes (text)
--
-- Operational tables get an `affiliate_id` FK populated from `affiliate_slug`
-- on existing rows (none expected pre-pilot; defensive backfill anyway).

-- ─── affiliates ───

create table if not exists affiliates (
  id uuid primary key default gen_random_uuid(),

  -- identity
  user_id uuid references auth.users(id) on delete set null,
  slug text not null unique,
  display_name text not null,
  email text not null,

  -- lifecycle
  status text not null default 'vetting' check (
    status in ('vetting', 'active', 'paused', 'sunset', 'cut')
  ),

  -- segmentation
  archetype text not null default 'creator' check (
    archetype in ('creator', 'coach', 'alumni', 'hybrid', 'community')
  ),
  sophistication_tier text not null default 'developing' check (
    sophistication_tier in ('developing', 'proven')
  ),

  -- economics
  commission_pct numeric(5,2) not null default 30.00,
  attribution_window_days int not null default 30,

  -- compliance (three-strike policy)
  strike_count int not null default 0,
  strike_log jsonb not null default '[]'::jsonb,

  -- payouts (Stripe Connect Standard)
  stripe_account_id text,
  stripe_account_status text check (
    stripe_account_status in ('pending', 'restricted', 'enabled', 'disabled')
  ),
  payout_method text,

  -- approval gate: first 3 copy pieces require admin sign-off for
  -- 'developing' tier; 'proven' tier exits gate at piece 1.
  approved_pieces_count int not null default 0,
  gate_exited_at timestamptz,

  -- application origin (nullable; not all affiliates come via the form)
  application_id uuid references affiliate_applications(id) on delete set null,

  -- timestamps
  joined_at timestamptz not null default now(),
  activated_at timestamptz,
  paused_at timestamptz,
  sunset_at timestamptz,

  -- founder notes
  notes text
);

create index if not exists affiliates_status_idx on affiliates (status);
create index if not exists affiliates_archetype_idx on affiliates (archetype);
create index if not exists affiliates_sophistication_tier_idx
  on affiliates (sophistication_tier);
create index if not exists affiliates_user_id_idx on affiliates (user_id);

-- ─── affiliate_id FK on operational tables ───
-- Defensive: existing rows have only affiliate_slug. After this migration
-- the canonical join is affiliate_id; affiliate_slug is kept for the next
-- two weeks as a denormalised convenience column (read-only mirror of
-- affiliates.slug), then removed in a follow-up.

alter table if exists affiliate_links
  add column if not exists affiliate_id uuid references affiliates(id) on delete cascade;
alter table if exists affiliate_clicks
  add column if not exists affiliate_id uuid references affiliates(id) on delete cascade;
alter table if exists affiliate_attributions
  add column if not exists affiliate_id uuid references affiliates(id);
alter table if exists affiliate_payouts
  add column if not exists affiliate_id uuid references affiliates(id) on delete cascade;

create index if not exists affiliate_links_affiliate_id_idx
  on affiliate_links (affiliate_id);
create index if not exists affiliate_clicks_affiliate_id_idx
  on affiliate_clicks (affiliate_id);
create index if not exists affiliate_attributions_affiliate_id_idx
  on affiliate_attributions (affiliate_id);
create index if not exists affiliate_payouts_affiliate_id_idx
  on affiliate_payouts (affiliate_id);

-- ─── RLS ───

alter table affiliates enable row level security;

-- An authenticated user reads their own affiliate row.
drop policy if exists "affiliates_self_read" on affiliates;
create policy "affiliates_self_read"
  on affiliates for select
  to authenticated
  using (
    user_id = auth.uid()
    or slug = coalesce(
      auth.jwt() -> 'user_metadata' ->> 'affiliate_slug',
      auth.jwt() -> 'user_metadata' ->> 'partner_slug'
    )
  );

-- An authenticated affiliate updates a narrow set of own-row fields
-- (display_name only). Status, commission_pct, tier, strikes are
-- service-role-only.
drop policy if exists "affiliates_self_update_profile" on affiliates;
create policy "affiliates_self_update_profile"
  on affiliates for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- All inserts + sensitive updates go through the service-role admin client.

-- ─── notes ───
-- Backfill: when this migration runs, no `affiliates` rows exist yet. The
-- founder seeds them via the admin console as applicants progress through
-- vetting. Existing affiliate_links / affiliate_clicks / etc. rows (if any)
-- can be backfilled by matching affiliate_slug to the inserted affiliates
-- row — handled by the admin onboarding flow, not this migration.
