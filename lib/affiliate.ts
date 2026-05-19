/**
 * Affiliate backend helpers.
 *
 * Stays small. The cookie format, slug generator, IP hash, and
 * attribution-cookie parser all live here so the click endpoint,
 * /api/checkout, the Stripe webhook, and admin actions read from one
 * place. Per docs/canon-revisions/2026-05-19-affiliate-backend-plan.md.
 */

import crypto from "node:crypto";

/** Cookie name pinned in canon. 30-day TTL. */
export const ATTRIBUTION_COOKIE = "aesdr_attribution";

/** Visitor de-dup cookie. 1-year TTL. Anonymous random ID. */
export const VISITOR_COOKIE = "aesdr_visitor";

/** Attribution window from first click. */
export const ATTRIBUTION_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

/** Refund window after purchase (matches /partners/payments copy). */
export const REFUND_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

/** Default commission rate on the consumer-side affiliate program. */
export const DEFAULT_COMMISSION_RATE = 0.3;

/**
 * Cookie value format: `${link_id}.${click_id}`. Both UUIDs. Dot
 * separator because UUIDs never contain dots.
 */
export function formatAttributionCookie(linkId: string, clickId: string): string {
  return `${linkId}.${clickId}`;
}

export function parseAttributionCookie(
  raw: string | undefined | null
): { linkId: string; clickId: string } | null {
  if (!raw || typeof raw !== "string") return null;
  const parts = raw.split(".");
  if (parts.length !== 2) return null;
  const [linkId, clickId] = parts;
  if (!isUuid(linkId) || !isUuid(clickId)) return null;
  return { linkId, clickId };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(s: string): boolean {
  return UUID_RE.test(s);
}

/**
 * Hash an IP for storage. Salt is the IP_HASH_SALT env var so two
 * different deployments can't cross-correlate. 32 chars of hex is
 * enough collision resistance for de-dup at the click level.
 */
export function hashIP(ip: string): string {
  const salt = process.env.IP_HASH_SALT || "aesdr-affiliate";
  return crypto
    .createHash("sha256")
    .update(`${salt}:${ip}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * Generate a URL-safe slug for a new affiliate link. 8 characters,
 * base32 alphabet (no ambiguous 0/O/1/l/i). Caller is responsible for
 * collision-checking against affiliate_links.slug.
 */
export function generateSlug(length = 8): string {
  const alphabet = "23456789abcdefghjkmnpqrstuvwxyz";
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

/**
 * Generate an anonymous visitor ID (used in the visitor cookie). 16
 * chars of hex. Set once per browser, reused across clicks for de-dup
 * analytics ("one human pasted the link three times" vs "three humans").
 */
export function generateVisitorId(): string {
  return crypto.randomBytes(8).toString("hex");
}

/**
 * Append the link's UTMs to the destination URL. If the destination
 * already has the same UTM key set, the link's value wins (the
 * affiliate's attribution intent overrides any default the destination
 * already carried).
 */
export function buildRedirectUrl(
  destination: string,
  utms: {
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    utm_content?: string | null;
  }
): string {
  let url: URL;
  try {
    url = new URL(destination);
  } catch {
    return destination;
  }
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const) {
    const value = utms[key];
    if (value && value.length > 0) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}
