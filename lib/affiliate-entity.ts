/**
 * Affiliate entity data-access layer.
 *
 * Reads from the canonical `affiliates` table (introduced by
 * 20260522_affiliates_entity.sql). Used by the dashboard, submit-copy
 * form, payment settings UI, and the admin queue — single chokepoint so
 * the JWT-claim ↔ entity-row reconciliation lives in one place.
 *
 * Per docs/canon-revisions/2026-05-22-affiliate-hub-plan.md.
 */

import { createAdminClient } from "@/utils/supabase/admin";

export type AffiliateStatus = "vetting" | "active" | "paused" | "sunset" | "cut";

export type AffiliateArchetype =
  | "creator"
  | "coach"
  | "alumni"
  | "hybrid"
  | "community";

export type AffiliateSophisticationTier = "developing" | "proven";

export type StripeAccountStatus =
  | "pending"
  | "restricted"
  | "enabled"
  | "disabled";

export interface AffiliateRecord {
  id: string;
  user_id: string | null;
  slug: string;
  display_name: string;
  email: string;

  status: AffiliateStatus;
  archetype: AffiliateArchetype;
  sophistication_tier: AffiliateSophisticationTier;

  commission_pct: number;
  attribution_window_days: number;

  strike_count: number;
  strike_log: StrikeEntry[];

  stripe_account_id: string | null;
  stripe_account_status: StripeAccountStatus | null;
  payout_method: string | null;

  approved_pieces_count: number;
  gate_exited_at: string | null;

  application_id: string | null;

  joined_at: string;
  activated_at: string | null;
  paused_at: string | null;
  sunset_at: string | null;

  notes: string | null;

  // Workshop pilot fields (added 20260528_workshop_registration.sql).
  // All nullable; the workshop page renders only when
  // workshop_registration_open = true AND the title + date are populated.
  workshop_title: string | null;
  workshop_audience_descriptor: string | null;
  workshop_partner_quote: string | null;
  workshop_partner_quote_attribution: string | null;
  workshop_date_iso: string | null;
  workshop_timezone: string | null;

  host_first_name: string | null;
  host_last_name: string | null;
  host_tenure_years: number | null;
  host_background_beat: string | null;

  sms_enabled: boolean;
  workshop_registration_open: boolean;
}

export interface StrikeEntry {
  submission_id: string;
  category: string;
  recorded_at: string;
  reviewer_email: string;
}

/**
 * Number of copy pieces an affiliate must clear before the brand-conformance
 * gate exits and they can post freely. Tier-aware: developing affiliates
 * need the full three; proven affiliates exit at one.
 */
export function gateRequirementFor(
  tier: AffiliateSophisticationTier
): number {
  return tier === "proven" ? 1 : 3;
}

/**
 * True once the affiliate has cleared the gate.
 */
export function hasExitedGate(affiliate: AffiliateRecord): boolean {
  return (
    affiliate.gate_exited_at !== null ||
    affiliate.approved_pieces_count >= gateRequirementFor(affiliate.sophistication_tier)
  );
}

/**
 * Three-strike threshold. Auto-pauses the affiliate when reached.
 */
export const STRIKE_THRESHOLD = 3;

/**
 * Resolve the canonical affiliate row for an authenticated user.
 *
 * AUDIT (P0-9 / decision #5): identity is resolved ONLY by an
 * `affiliates.user_id` match — a server-trusted column the client cannot
 * write. The former fallback to the JWT `user_metadata.affiliate_slug` /
 * `partner_slug` claim has been REMOVED: `user_metadata` is client-writable
 * via `supabase.auth.updateUser({ data })`, so any signed-up user could pin
 * a victim's slug and resolve to their affiliate row (payout/bank/dashboard
 * takeover). Affiliates are now wired to an auth.users row at activation
 * (R3-AF-2 — see createAffiliate in app/actions/affiliate.ts), so the
 * user_id path is the only legitimate one.
 *
 * Returns null if no affiliate row is linked to this user. The caller
 * decides whether to render the no-access notice, redirect to
 * /affiliates/apply, etc.
 */
export async function getAffiliateForUser(args: {
  userId: string;
  // AUDIT (P0-9): these are accepted but DELIBERATELY IGNORED. They remain in
  // the signature only so existing call sites that still pass the JWT
  // user_metadata claim keep compiling during the migration; the slug is
  // never used to resolve an affiliate. Remove these params (and the args at
  // every call site) in a follow-up sweep once all callers are updated.
  jwtAffiliateSlug?: string | null;
  jwtPartnerSlug?: string | null;
}): Promise<AffiliateRecord | null> {
  const admin = createAdminClient();

  // AUDIT (P0-9): resolve by server-trusted user_id ONLY. No slug fallback.
  const byUserId = await admin
    .from("affiliates")
    .select("*")
    .eq("user_id", args.userId)
    .maybeSingle();

  return (byUserId.data as AffiliateRecord) ?? null;
}

/**
 * Resolve by slug (admin views, public lookup). No fallback chain.
 */
export async function getAffiliateBySlug(
  slug: string
): Promise<AffiliateRecord | null> {
  const admin = createAdminClient();
  const res = await admin
    .from("affiliates")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (res.data as AffiliateRecord) ?? null;
}

/**
 * Resolve by id (admin detail page, action handlers).
 */
export async function getAffiliateById(
  id: string
): Promise<AffiliateRecord | null> {
  const admin = createAdminClient();
  const res = await admin
    .from("affiliates")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (res.data as AffiliateRecord) ?? null;
}
