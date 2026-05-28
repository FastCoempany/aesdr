/**
 * Workshop registration domain logic.
 *
 * Pairs with:
 *   - supabase/migrations/20260528_workshop_registration.sql (schema)
 *   - content/affiliate-kit/workshop-registration.md (page template)
 *   - app/[affiliateSlug]/workshop/page.tsx (renderer)
 *   - app/api/workshop-register/route.ts (form POST handler)
 *   - components/workshop/WorkshopRegistrationForm.tsx (client form)
 *
 * Per D07 (registration-page spec), D08 (title ratified 2026-05-28),
 * D12 (SMS opt-in, per-pilot toggle), canon §10.5 (consent rules).
 */

import { createAdminClient } from "@/utils/supabase/admin";
import type { AffiliateRecord } from "@/lib/affiliate-entity";

/**
 * The ratified workshop title (D08, 2026-05-28). Falls back to this if an
 * affiliate hasn't set their own workshop_title yet.
 */
export const DEFAULT_WORKSHOP_TITLE = "What good actually looks like in startup SaaS";

/**
 * The ratified subtitle (D08, 2026-05-28).
 */
export const DEFAULT_WORKSHOP_SUBTITLE =
  "Sixty minutes on the part of the job your onboarding skipped — for SDRs and AEs in their first two years, and the experienced ones running it back with more context.";

/**
 * Returns the affiliate iff their workshop registration is live. Returns
 * null otherwise (page renders 404).
 *
 * A workshop is "live" when:
 *   1. The affiliate row exists, and
 *   2. workshop_registration_open = true, and
 *   3. workshop_date_iso is set (without a date there's nothing to register for).
 */
export async function getLiveWorkshopAffiliate(
  slug: string
): Promise<AffiliateRecord | null> {
  const admin = createAdminClient();
  const res = await admin
    .from("affiliates")
    .select("*")
    .eq("slug", slug)
    .eq("workshop_registration_open", true)
    .not("workshop_date_iso", "is", null)
    .maybeSingle();
  return (res.data as AffiliateRecord) ?? null;
}

/**
 * Substitute [SLOT] placeholders in the workshop template with per-affiliate
 * values. The HOST_LINE and PARTNER_QUOTE_BLOCK slots resolve to empty
 * (or fallback) strings when the affiliate hasn't populated those fields,
 * so the template renders cleanly regardless of which slots are populated.
 *
 * REGISTRATION_FORM_SLOT is left as a literal placeholder string; the
 * server page splits the rendered HTML around it to inject the React
 * form component (which can't live inside a markdown string).
 */
export function resolveTemplateSlots(
  template: string,
  affiliate: AffiliateRecord
): string {
  const title = affiliate.workshop_title || DEFAULT_WORKSHOP_TITLE;
  const audience =
    affiliate.workshop_audience_descriptor ||
    "SDRs and AEs in their first two years in startup SaaS. Also written for experienced operators who want the realities of the role called out, not necessarily retaught.";

  const hostLine = resolveHostLine(affiliate);
  const partnerQuoteBlock = resolvePartnerQuoteBlock(affiliate);
  const dateDisplay = resolveDateDisplay(affiliate);

  return template
    .replaceAll("[WORKSHOP_TITLE]", title)
    .replaceAll("[WORKSHOP_SUBTITLE]", DEFAULT_WORKSHOP_SUBTITLE)
    .replaceAll("[WORKSHOP_AUDIENCE_DESCRIPTOR]", audience)
    .replaceAll("[HOST_LINE]", hostLine)
    .replaceAll("[PARTNER_QUOTE_BLOCK]", partnerQuoteBlock)
    .replaceAll("[WORKSHOP_DATE_DISPLAY]", dateDisplay);
}

/**
 * Host line — falls back to the canon §12.3 "Admissions" alias display
 * when no host is cast (ratified 2026-05-28 in D17).
 */
function resolveHostLine(affiliate: AffiliateRecord): string {
  if (affiliate.host_first_name && affiliate.host_last_name) {
    const tenure = affiliate.host_tenure_years
      ? ` — ${affiliate.host_tenure_years} years in SaaS sales`
      : "";
    const beat = affiliate.host_background_beat
      ? `. ${affiliate.host_background_beat}`
      : "";
    return `${affiliate.host_first_name} ${affiliate.host_last_name}${tenure}${beat}.`;
  }
  return "Admissions, AESDR.";
}

/**
 * Partner-quote block — rendered only if both quote and attribution are
 * present. Otherwise the slot resolves to an empty string (the template's
 * surrounding `---` separators handle the layout gracefully when empty).
 */
function resolvePartnerQuoteBlock(affiliate: AffiliateRecord): string {
  if (
    affiliate.workshop_partner_quote &&
    affiliate.workshop_partner_quote_attribution
  ) {
    return `> *"${affiliate.workshop_partner_quote}"*\n>\n> — ${affiliate.workshop_partner_quote_attribution}`;
  }
  return "";
}

/**
 * Date display — formatted in the affiliate's workshop_timezone. Falls
 * back to a plain ISO string if the date is unset (caller is responsible
 * for not rendering the page in that state via getLiveWorkshopAffiliate).
 */
function resolveDateDisplay(affiliate: AffiliateRecord): string {
  if (!affiliate.workshop_date_iso) return "TBD";
  const tz = affiliate.workshop_timezone || "America/New_York";
  try {
    const date = new Date(affiliate.workshop_date_iso);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: tz,
      timeZoneName: "short",
    }).format(date);
  } catch {
    return affiliate.workshop_date_iso;
  }
}

/**
 * Payload shape that the registration form POSTs to /api/workshop-register.
 * Server-side validation in the route handler is the source of truth;
 * this type is the contract.
 */
export interface WorkshopRegistrationPayload {
  affiliate_slug: string;
  email: string;
  first_name: string;
  role: "AE" | "SDR";
  tenure_months?: number | null;
  sms_opted_in: boolean;
  phone_e164?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
}

/**
 * Insert a registration row. Returns a result discriminated union the form
 * can render. Re-submits (same affiliate + workshop_date + email) are
 * treated as success (idempotent — the unique constraint catches them).
 */
export async function insertWorkshopRegistration(args: {
  payload: WorkshopRegistrationPayload;
  affiliate: AffiliateRecord;
  ipHash: string | null;
  userAgent: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!args.affiliate.workshop_date_iso) {
    return { ok: false, error: "Workshop date not set." };
  }
  const admin = createAdminClient();
  const { error } = await admin.from("workshop_registrants").insert({
    affiliate_slug: args.affiliate.slug,
    workshop_date_iso: args.affiliate.workshop_date_iso,
    email: args.payload.email.trim().toLowerCase(),
    first_name: args.payload.first_name.trim(),
    role: args.payload.role,
    tenure_months: args.payload.tenure_months ?? null,
    sms_opted_in: args.payload.sms_opted_in,
    phone_e164: args.payload.phone_e164?.trim() || null,
    utm_source: args.payload.utm_source ?? null,
    utm_medium: args.payload.utm_medium ?? null,
    utm_campaign: args.payload.utm_campaign ?? null,
    ip_hash: args.ipHash,
    user_agent: args.userAgent,
  });
  // Idempotent re-submit (unique-constraint violation) — treat as success.
  if (error && error.code === "23505") return { ok: true };
  if (error) return { ok: false, error: "Couldn't save. Try again in a minute." };
  return { ok: true };
}
