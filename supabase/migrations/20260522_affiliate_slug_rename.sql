-- Phase 3 rename: partner_* → affiliate_* schema canonicalization.
-- Per docs/canon-revisions/2026-05-22-partners-to-affiliates-rename-plan.md Phase 3.
--
-- Closes the rename loop end-to-end on the database side:
--   - affiliate_links.partner_slug → affiliate_slug (column rename)
--   - affiliate_clicks.partner_slug → affiliate_slug
--   - affiliate_attributions.partner_slug → affiliate_slug
--   - affiliate_payouts.partner_slug → affiliate_slug
--   - partner_applications → affiliate_applications (table rename)
--   - All indexes + RLS policies updated to the new column name
--
-- Idempotent: each ALTER guards with IF EXISTS / IF NOT EXISTS where supported.
-- Safe to re-run; safe to run on empty tables (no live affiliate data exists pre-pilot).

-- ─── column renames ───

alter table if exists affiliate_links
  rename column partner_slug to affiliate_slug;
alter table if exists affiliate_clicks
  rename column partner_slug to affiliate_slug;
alter table if exists affiliate_attributions
  rename column partner_slug to affiliate_slug;
alter table if exists affiliate_payouts
  rename column partner_slug to affiliate_slug;

-- ─── index renames (PG drops/recreates with the new column reference) ───

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

-- ─── table rename: partner_applications → affiliate_applications ───

alter table if exists partner_applications
  rename to affiliate_applications;

-- ─── RLS policies: drop old, recreate against new column name ───
-- The original policies in 20260519_affiliate_backend.sql referenced
-- partner_slug + user_metadata.partner_slug. JWT user_metadata key stays
-- as partner_slug for backward compat through the next session refresh;
-- code reads it as affiliate_slug via coalesce in the application layer.

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

-- ─── notes ───
--
-- Backward-compatible JWT claim handling: existing affiliate sessions
-- carry user_metadata.partner_slug. The coalesce above honors either
-- key. Next time those users refresh their session (or the admin
-- console updates their metadata), the canonical claim becomes
-- affiliate_slug. After ~14 days the coalesce can drop the partner_slug
-- fallback (followed by a separate migration).
--
-- The Stripe webhook handler reads from session.metadata.affiliate_link_id
-- (already affiliate-named) and inserts rows with the new column name;
-- application code separately rewrites session.metadata.partner_slug
-- producers to use affiliate_slug.
