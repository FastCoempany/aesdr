/**
 * GET /api/partners/kit-private/auth?t=<signed>&next=<path>
 *
 * Handles partner-kit token sign-in:
 *   1. Verify HMAC + expiry on the URL token.
 *   2. Resolve the token to a DB row (rejects revoked / expired).
 *   3. Log the auth event (success or denied).
 *   4. Set a session cookie (signed copy of the same token).
 *   5. Redirect to `next` (defaults to /partners/kit-private).
 *
 * The cookie lasts 30 days and is scoped to /partners/kit-private. Subsequent
 * page renders read the cookie directly — no DB lookup on the auth path
 * after first sign-in (DB still hit per page view for the access log).
 */

import { NextResponse } from "next/server";
import {
  verifyToken,
  resolveToken,
  logAccess,
  KIT_COOKIE_NAME,
  KIT_TOKEN_COOKIE_OPTS,
} from "@/lib/partner-kit-tokens";
import { readRequestMeta } from "@/lib/req-meta";

export const runtime = "nodejs";

const PRIVATE_BASE = "/partners/kit-private";

function safeNext(next: string | null): string {
  if (!next) return PRIVATE_BASE;
  // Only allow same-origin paths under the private kit area.
  if (!next.startsWith(PRIVATE_BASE)) return PRIVATE_BASE;
  if (next.includes("//") || next.includes("..")) return PRIVATE_BASE;
  return next;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("t");
  const next = safeNext(url.searchParams.get("next"));
  const meta = readRequestMeta(request.headers);

  if (!token) {
    return NextResponse.redirect(new URL("/partners/kit-private?e=missing", url.origin));
  }

  const verified = verifyToken(token);
  if (!verified.ok) {
    await logAccess({
      tokenId: null,
      partnerSlug: "(unknown)",
      event: "denied",
      ipHash: meta.ipHash,
      userAgent: meta.userAgent,
      referrer: meta.referrer,
    });
    return NextResponse.redirect(
      new URL(`/partners/kit-private?e=${verified.reason}`, url.origin),
    );
  }

  const resolved = await resolveToken(verified.tid);
  if (!resolved) {
    await logAccess({
      tokenId: verified.tid,
      partnerSlug: "(unknown)",
      event: "denied",
      ipHash: meta.ipHash,
      userAgent: meta.userAgent,
      referrer: meta.referrer,
    });
    return NextResponse.redirect(
      new URL("/partners/kit-private?e=revoked", url.origin),
    );
  }

  await logAccess({
    tokenId: resolved.tid,
    partnerSlug: resolved.partner_slug,
    event: "auth",
    ipHash: meta.ipHash,
    userAgent: meta.userAgent,
    referrer: meta.referrer,
  });

  const res = NextResponse.redirect(new URL(next, url.origin));
  res.cookies.set(KIT_COOKIE_NAME, token, KIT_TOKEN_COOKIE_OPTS);
  return res;
}
