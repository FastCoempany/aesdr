-- ═══════════════════════════════════════════════════════════════════
-- AFFILIATE HUB — combined migration bundle (2026-05-22)
-- ═══════════════════════════════════════════════════════════════════
--
-- One-paste application of the 5 affiliate-related migrations in order.
-- Every statement is idempotent (IF NOT EXISTS / IF EXISTS guards), so
-- re-running is safe.
--
-- Order:
--   1. 20260519_affiliate_backend.sql      (operational tables)
--   2. 20260522_affiliate_slug_rename.sql  (partner_slug → affiliate_slug)
--   3. 20260522_affiliates_entity.sql      (canonical entity table)
--   4. 20260522_affiliate_copy_submissions (brand-conformance gate)
--   5. 20260522_affiliate_metrics_view     (admin metrics view)
--
-- Apply via Supabase SQL Editor (paste + Run) or `supabase db push`.

-- ═══════════════════════════════════════════════════════════════════
-- § 1 — affiliate operational backend (originally 20260519)
-- ═══════════════════════════════════════════════════════════════════

create table if not exists affiliate_links (
  id uuid primary key default gen_random_uuid(),
  partner_slug text not null,
  slug text not null unique,
  destination_url text not null default 'https://aesdr.com/',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  label text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);
create index if not exists affiliate_links_partner_slug_idx
  on affiliate_links (partner_slug);
create index if not exists affiliate_links_active_idx
  on affiliate_links (active, expires_at);

create table if not exists affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references affiliate_links(id) on delete cascade,
  partner_slug text not null,
  ip_hash text,
  user_agent text,
  referrer text,
  visitor_id text,
  clicked_at timestamptz not null default now()
);
create index if not exists affiliate_clicks_link_id_idx
  on affiliate_clicks (link_id);
create index if not exists affiliate_clicks_partner_slug_idx
  on affiliate_clicks (partner_slug);
create index if not exists affiliate_clicks_clicked_at_idx
  on affiliate_clicks (clicked_at desc);

create table if not exists affiliate_attributions (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references affiliate_links(id),
  partner_slug text not null,
  click_id uuid references affiliate_clicks(id),
  purchase_id uuid not null references purchases(id) on delete cascade,
  user_email text not null,
  gross_amount_cents bigint not null,
  commission_rate numeric not null default 0.30,
  commission_amount_cents bigint not null,
  status text not null default 'pending'
    check (status in ('pending', 'cleared', 'paid', 'refunded')),
  attributed_at timestamptz not null default now(),
  attribution_window_closes_at timestamptz not null,
  refund_window_closes_at timestamptz not null,
  cleared_at timestamptz,
  paid_at timestamptz,
  refunded_at timestamptz
);
create unique index if not exists affiliate_attributions_purchase_idx
  on affiliate_attributions (purchase_id);
create index if not exists affiliate_attributions_partner_slug_idx
  on affiliate_attributions (partner_slug);
create index if not exists affiliate_attributions_status_window_idx
  on affiliate_attributions (status, refund_window_closes_at);

create table if not exists affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  partner_slug text not null,
  period_start date not null,
  period_end date not null,
  total_commission_cents bigint not null,
  attribution_ids uuid[] not null,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'paid', 'failed')),
  payment_method text,
  payment_reference text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  note text
);
create index if not exists affiliate_payouts_partner_slug_idx
  on affiliate_payouts (partner_slug);
create index if not exists affiliate_payouts_status_idx
  on affiliate_payouts (status);

alter table affiliate_links        enable row level security;
alter table affiliate_clicks       enable row level security;
alter table affiliate_attributions enable row level security;
alter table affiliate_payouts      enable row level security;

-- (§2 below recreates these policies against the renamed column —
--  the initial policies are dropped before reinstatement.)

-- ═══════════════════════════════════════════════════════════════════
-- § 2 — column rename: partner_slug → affiliate_slug + table rename
-- ═══════════════════════════════════════════════════════════════════

alter table if exists affiliate_links
  rename column partner_slug to affiliate_slug;
alter table if exists affiliate_clicks
  rename column partner_slug to affiliate_slug;
alter table if exists affiliate_attributions
  rename column partner_slug to affiliate_slug;
alter table if exists affiliate_payouts
  rename column partner_slug to affiliate_slug;

drop index if exists affiliate_links_partner_slug_idx;
drop index if exists affiliate_clicks_partner_slug_idx;
drop index if exists affiliate_attributions_partner_slug_idx;
drop index if exists affiliate_payouts_partner_slug_idx;

create index if not exists affiliate_links_affiliate_slug_idx
  on affiliate_links (affiliate_slug);
create index if not exists affiliate_clicks_affiliate_slug_idx
  on affiliate_clicks (affiliate_slug);
create index if not exists affiliate_attributions_affiliate_slug_idx
  on affiliate_attributions (affiliate_slug);
create index if not exists affiliate_payouts_affiliate_slug_idx
  on affiliate_payouts (affiliate_slug);

alter table if exists partner_applications
  rename to affiliate_applications;

drop policy if exists "affiliate_links_self_read"        on affiliate_links;
drop policy if exists "affiliate_clicks_self_read"       on affiliate_clicks;
drop policy if exists "affiliate_attributions_self_read" on affiliate_attributions;
drop policy if exists "affiliate_payouts_self_read"      on affiliate_payouts;

create policy "affiliate_links_self_read"
  on affiliate_links for select
  to authenticated
  using (
    affiliate_slug = coalesce(
      auth.jwt() -> 'user_metadata' ->> 'affiliate_slug',
      auth.jwt() -> 'user_metadata' ->> 'partner_slug'
    )
  );

create policy "affiliate_clicks_self_read"
  on affiliate_clicks for select
  to authenticated
  using (
    affiliate_slug = coalesce(
      auth.jwt() -> 'user_metadata' ->> 'affiliate_slug',
      auth.jwt() -> 'user_metadata' ->> 'partner_slug'
    )
  );

create policy "affiliate_attributions_self_read"
  on affiliate_attributions for select
  to authenticated
  using (
    affiliate_slug = coalesce(
      auth.jwt() -> 'user_metadata' ->> 'affiliate_slug',
      auth.jwt() -> 'user_metadata' ->> 'partner_slug'
    )
  );

create policy "affiliate_payouts_self_read"
  on affiliate_payouts for select
  to authenticated
  using (
    affiliate_slug = coalesce(
      auth.jwt() -> 'user_metadata' ->> 'affiliate_slug',
      auth.jwt() -> 'user_metadata' ->> 'partner_slug'
    )
  );

-- ═══════════════════════════════════════════════════════════════════
-- § 3 — canonical affiliates entity table
-- ═══════════════════════════════════════════════════════════════════

create table if not exists affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  slug text not null unique,
  display_name text not null,
  email text not null,
  status text not null default 'vetting' check (
    status in ('vetting', 'active', 'paused', 'sunset', 'cut')
  ),
  archetype text not null default 'creator' check (
    archetype in ('creator', 'coach', 'alumni', 'hybrid', 'community')
  ),
  sophistication_tier text not null default 'developing' check (
    sophistication_tier in ('developing', 'proven')
  ),
  commission_pct numeric(5,2) not null default 30.00,
  attribution_window_days int not null default 30,
  strike_count int not null default 0,
  strike_log jsonb not null default '[]'::jsonb,
  stripe_account_id text,
  stripe_account_status text check (
    stripe_account_status in ('pending', 'restricted', 'enabled', 'disabled')
  ),
  payout_method text,
  approved_pieces_count int not null default 0,
  gate_exited_at timestamptz,
  application_id uuid references affiliate_applications(id) on delete set null,
  joined_at timestamptz not null default now(),
  activated_at timestamptz,
  paused_at timestamptz,
  sunset_at timestamptz,
  notes text
);

create index if not exists affiliates_status_idx on affiliates (status);
create index if not exists affiliates_archetype_idx on affiliates (archetype);
create index if not exists affiliates_sophistication_tier_idx
  on affiliates (sophistication_tier);
create index if not exists affiliates_user_id_idx on affiliates (user_id);

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

alter table affiliates enable row level security;

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

drop policy if exists "affiliates_self_update_profile" on affiliates;
create policy "affiliates_self_update_profile"
  on affiliates for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════
-- § 4 — affiliate_copy_submissions (brand-conformance gate)
-- ═══════════════════════════════════════════════════════════════════

create table if not exists affiliate_copy_submissions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references affiliates(id) on delete cascade,
  channel text not null check (
    channel in (
      'newsletter', 'podcast', 'twitter', 'linkedin', 'youtube',
      'tiktok', 'instagram', 'community', 'course', 'blog', 'other'
    )
  ),
  format text not null check (
    format in ('post', 'email', 'script', 'thread', 'video', 'audio', 'long_form', 'other')
  ),
  draft_body text not null,
  draft_url text,
  scheduled_publish_at timestamptz,
  status text not null default 'submitted' check (
    status in ('submitted', 'reviewing', 'approved', 'edits_requested', 'declined')
  ),
  reviewer_notes text,
  edit_requests text,
  decline_reason text,
  decline_category text check (
    decline_category in (
      'ftc_disclosure_missing',
      'misrepresentation',
      'banned_phrasing',
      'palette_or_visual_drift',
      'pricing_misstatement',
      'unverifiable_claim',
      'other'
    )
  ),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_email text,
  counted_toward_gate boolean not null default false
);

create index if not exists affiliate_copy_submissions_affiliate_id_idx
  on affiliate_copy_submissions (affiliate_id);
create index if not exists affiliate_copy_submissions_status_idx
  on affiliate_copy_submissions (status);
create index if not exists affiliate_copy_submissions_submitted_at_idx
  on affiliate_copy_submissions (submitted_at desc);

alter table affiliate_copy_submissions enable row level security;

drop policy if exists "affiliate_copy_submissions_self_read"
  on affiliate_copy_submissions;
create policy "affiliate_copy_submissions_self_read"
  on affiliate_copy_submissions for select
  to authenticated
  using (
    affiliate_id in (
      select id from affiliates
      where user_id = auth.uid()
         or slug = coalesce(
           auth.jwt() -> 'user_metadata' ->> 'affiliate_slug',
           auth.jwt() -> 'user_metadata' ->> 'partner_slug'
         )
    )
  );

drop policy if exists "affiliate_copy_submissions_self_insert"
  on affiliate_copy_submissions;
create policy "affiliate_copy_submissions_self_insert"
  on affiliate_copy_submissions for insert
  to authenticated
  with check (
    affiliate_id in (
      select id from affiliates
      where user_id = auth.uid()
    )
  );

-- ═══════════════════════════════════════════════════════════════════
-- § 5 — affiliate_metrics view
-- ═══════════════════════════════════════════════════════════════════

create or replace view affiliate_metrics as
select
  a.id                              as affiliate_id,
  a.slug                            as affiliate_slug,
  a.display_name,
  a.status,
  a.archetype,
  a.sophistication_tier,
  a.commission_pct,
  a.strike_count,
  a.approved_pieces_count,
  a.joined_at,
  a.activated_at,
  coalesce((
    select count(*)::int
    from affiliate_clicks c
    where c.affiliate_slug = a.slug
  ), 0) as total_clicks,
  coalesce((
    select count(*)::int
    from affiliate_clicks c
    where c.affiliate_slug = a.slug
      and c.clicked_at >= now() - interval '30 days'
  ), 0) as clicks_30d,
  coalesce((
    select count(*)::int
    from affiliate_attributions at
    where at.affiliate_slug = a.slug
      and at.status <> 'refunded'
  ), 0) as attributed_enrollments,
  coalesce((
    select sum(at.gross_amount_cents)::bigint
    from affiliate_attributions at
    where at.affiliate_slug = a.slug
      and at.status <> 'refunded'
  ), 0) as gross_revenue_cents,
  coalesce((
    select sum(at.commission_amount_cents)::bigint
    from affiliate_attributions at
    where at.affiliate_slug = a.slug
      and at.status in ('pending', 'cleared')
  ), 0) as projected_commission_cents,
  coalesce((
    select sum(at.commission_amount_cents)::bigint
    from affiliate_attributions at
    where at.affiliate_slug = a.slug
      and at.status = 'paid'
  ), 0) as paid_commission_cents,
  case
    when coalesce((
      select count(*) from affiliate_clicks c
      where c.affiliate_slug = a.slug
        and c.clicked_at >= now() - interval '30 days'
    ), 0) = 0 then 0::numeric
    else round(
      coalesce((
        select count(*) from affiliate_attributions at
        where at.affiliate_slug = a.slug
          and at.attributed_at >= now() - interval '30 days'
          and at.status <> 'refunded'
      ), 0)::numeric
      /
      (
        select count(*) from affiliate_clicks c
        where c.affiliate_slug = a.slug
          and c.clicked_at >= now() - interval '30 days'
      )::numeric
      * 100,
      2
    )
  end as conversion_rate_30d_pct,
  coalesce((
    select count(*)::int from affiliate_copy_submissions s
    where s.affiliate_id = a.id
      and s.status in ('submitted', 'reviewing')
  ), 0) as pending_submissions
from affiliates a;
