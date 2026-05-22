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
 * Resolve the canonical affiliate row for an authenticated user. Looks up by
 * `user_id` first (the future state where every affiliate is wired to an
 * auth.users row), then falls back to the JWT user_metadata claim
 * (`affiliate_slug`, with `partner_slug` as a backwards-compat fallback for
 * sessions minted before the rename).
 *
 * Returns null if no affiliate row exists yet. The caller decides whether
 * to render the no-access notice, redirect to /affiliates/apply, etc.
 */
export async function getAffiliateForUser(args: {
  userId: string;
  jwtAffiliateSlug?: string | null;
  jwtPartnerSlug?: string | null;
}): Promise<AffiliateRecord | null> {
  const admin = createAdminClient();

  const byUserId = await admin
    .from("affiliates")
    .select("*")
    .eq("user_id", args.userId)
    .maybeSingle();

  if (byUserId.data) return byUserId.data as AffiliateRecord;

  const slug = args.jwtAffiliateSlug || args.jwtPartnerSlug;
  if (!slug) return null;

  const bySlug = await admin
    .from("affiliates")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  return (bySlug.data as AffiliateRecord) ?? null;
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
