-- Adversarial pass 2026-06-29 — FIX (#10): affiliate self-read RLS trusted
-- `user_metadata`, which is CLIENT-WRITABLE (`supabase.auth.updateUser({ data })`).
-- Any signed-in user could pin a victim's slug into their own user_metadata and
-- read that affiliate's links, clicks, buyer emails, commissions, and payouts
-- directly from a raw browser Supabase client. The application-layer fix routes
-- the dashboard through getAffiliateForUser (by affiliates.user_id), but the DB
-- policies are the real boundary and must not trust user_metadata.
--
-- Fix: the four slug-keyed tables authorize on `app_metadata` (set only by the
-- service role during provisioning — clients cannot write it). The affiliates
-- table has its own user_id, so it authorizes on `auth.uid()` directly.
-- Apply in the Supabase SQL editor.

-- ── affiliates: authorize on the server-trusted user_id ──
drop policy if exists "affiliates_self_read" on public.affiliates;
create policy "affiliates_self_read"
  on public.affiliates for select
  using (user_id = auth.uid());

-- ── affiliate_links ──
drop policy if exists "affiliate_links_self_read" on public.affiliate_links;
create policy "affiliate_links_self_read"
  on public.affiliate_links for select
  using (
    affiliate_slug = coalesce(
      auth.jwt() -> 'app_metadata' ->> 'affiliate_slug',
      auth.jwt() -> 'app_metadata' ->> 'partner_slug'
    )
  );

-- ── affiliate_clicks ──
drop policy if exists "affiliate_clicks_self_read" on public.affiliate_clicks;
create policy "affiliate_clicks_self_read"
  on public.affiliate_clicks for select
  using (
    affiliate_slug = coalesce(
      auth.jwt() -> 'app_metadata' ->> 'affiliate_slug',
      auth.jwt() -> 'app_metadata' ->> 'partner_slug'
    )
  );

-- ── affiliate_attributions ──
drop policy if exists "affiliate_attributions_self_read" on public.affiliate_attributions;
create policy "affiliate_attributions_self_read"
  on public.affiliate_attributions for select
  using (
    affiliate_slug = coalesce(
      auth.jwt() -> 'app_metadata' ->> 'affiliate_slug',
      auth.jwt() -> 'app_metadata' ->> 'partner_slug'
    )
  );

-- ── affiliate_payouts ──
drop policy if exists "affiliate_payouts_self_read" on public.affiliate_payouts;
create policy "affiliate_payouts_self_read"
  on public.affiliate_payouts for select
  using (
    affiliate_slug = coalesce(
      auth.jwt() -> 'app_metadata' ->> 'affiliate_slug',
      auth.jwt() -> 'app_metadata' ->> 'partner_slug'
    )
  );
