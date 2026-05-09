/**
 * Partner-kit gate — token issuance, verification, and access logging.
 *
 * Token URL format: /partners/kit-private?t=<base64url(payload)>.<base64url(hmac)>
 * Payload: { tid: <uuid>, exp: <unix-seconds> } JSON, then base64url-encoded.
 * HMAC: SHA-256(payload, KIT_TOKEN_SECRET). Signature ensures partners can't
 * forge tokens; the DB row gives us revocation + audit.
 *
 * Cookie: same shape as the URL token, signed with the same secret. The cookie
 * is set after first successful URL verification so the partner can navigate
 * the kit without re-presenting the URL token.
 */

import crypto from "node:crypto";
import { createAdminClient } from "@/utils/supabase/admin";

const SECRET_ENV = "KIT_TOKEN_SECRET";
export const KIT_COOKIE_NAME = "aesdr_kit_session";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  const s = process.env[SECRET_ENV];
  if (!s) throw new Error(`${SECRET_ENV} is not set`);
  if (s.length < 32)
    throw new Error(`${SECRET_ENV} must be at least 32 characters`);
  return s;
}

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString("base64url");
}

function fromB64url(s: string): Buffer {
  return Buffer.from(s, "base64url");
}

type Payload = { tid: string; exp: number };

export function signToken(tid: string, expiresAt: Date): string {
  const payload: Payload = { tid, exp: Math.floor(expiresAt.getTime() / 1000) };
  const body = b64url(JSON.stringify(payload));
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

export type VerifyResult =
  | { ok: true; tid: string; expiresAt: Date }
  | { ok: false; reason: "malformed" | "bad_sig" | "expired" };

export function verifyToken(token: string): VerifyResult {
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "malformed" };
  const [body, sig] = parts;

  const expectedSig = crypto
    .createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");
  // timing-safe compare
  if (
    sig.length !== expectedSig.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))
  ) {
    return { ok: false, reason: "bad_sig" };
  }

  let payload: Payload;
  try {
    payload = JSON.parse(fromB64url(body).toString("utf8"));
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (typeof payload.tid !== "string" || typeof payload.exp !== "number") {
    return { ok: false, reason: "malformed" };
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (payload.exp < nowSec) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, tid: payload.tid, expiresAt: new Date(payload.exp * 1000) };
}

export type ResolvedToken = {
  tid: string;
  partner_slug: string;
  partner_label: string | null;
  expires_at: string;
  revoked_at: string | null;
};

/**
 * Resolve a verified token to a DB row. Returns null if the token doesn't
 * exist or has been revoked.
 */
export async function resolveToken(tid: string): Promise<ResolvedToken | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("partner_kit_tokens")
    .select("id, partner_slug, partner_label, expires_at, revoked_at")
    .eq("id", tid)
    .maybeSingle();

  if (error) {
    console.error("[partner-kit] resolveToken DB error:", error);
    return null;
  }
  if (!data) return null;
  if (data.revoked_at) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) return null;

  return {
    tid: data.id,
    partner_slug: data.partner_slug,
    partner_label: data.partner_label,
    expires_at: data.expires_at,
    revoked_at: data.revoked_at,
  };
}

export type AccessEvent = "view" | "auth" | "denied";

export async function logAccess(args: {
  tokenId: string | null;
  partnerSlug: string;
  docSlug?: string | null;
  event: AccessEvent;
  ipHash?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
}): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("partner_kit_access").insert({
    token_id: args.tokenId,
    partner_slug: args.partnerSlug,
    doc_slug: args.docSlug ?? null,
    event: args.event,
    ip_hash: args.ipHash ?? null,
    user_agent: args.userAgent ?? null,
    referrer: args.referrer ?? null,
  });
  if (error) {
    console.error("[partner-kit] logAccess failed:", error);
  }
}

/**
 * Mint a new token row + return the URL-ready signed token string.
 * Called from the founder's CLI script (scripts/mint-partner-kit-token.ts).
 */
export async function mintToken(args: {
  partnerSlug: string;
  partnerLabel?: string;
  notes?: string;
  expiresInDays: number;
}): Promise<{ tid: string; signed: string; expiresAt: Date }> {
  const expiresAt = new Date(
    Date.now() + args.expiresInDays * 24 * 60 * 60 * 1000,
  );
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("partner_kit_tokens")
    .insert({
      partner_slug: args.partnerSlug,
      partner_label: args.partnerLabel ?? null,
      notes: args.notes ?? null,
      expires_at: expiresAt.toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to mint token: ${error?.message ?? "unknown"}`);
  }

  return {
    tid: data.id,
    signed: signToken(data.id, expiresAt),
    expiresAt,
  };
}

export const KIT_TOKEN_COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/partners/kit-private",
  maxAge: COOKIE_MAX_AGE_SECONDS,
};
