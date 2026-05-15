export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

/**
 * Coming-soon bypass — server-side code verification.
 *
 * Replaces the previous client-side `const BYPASS_CODE` literal in
 * app/coming-soon/page.tsx, which shipped the secret in the JS bundle
 * where anyone could grep for it in DevTools.
 *
 * Now the code lives only in the Vercel env var `COMING_SOON_BYPASS_CODE`
 * (server-only — not prefixed `NEXT_PUBLIC_`). Comparison happens here,
 * the bundle stays clean, and brute force is rate-limited per IP.
 *
 * If the env var is unset, every request is rejected — the bypass is
 * effectively disabled (fail-closed). Admins authenticated via Supabase
 * can still access the site through the proxy.ts admin path.
 */
export async function POST(request: Request) {
  // Same-origin guard — only accept POSTs from the site itself.
  const origin = request.headers.get("origin");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aesdr.com";
  if (origin && new URL(siteUrl).origin !== origin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Rate limit by IP — 10 attempts per hour. Brute-forcing a 6-digit
  // numeric code at 10 tries/hr would take ~11.4 years on average.
  const ip = getClientIP(request);
  const rl = await rateLimit(`coming-soon-bypass:${ip}`, {
    max: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many attempts" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) } },
    );
  }

  // Parse body.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const code =
    typeof body === "object" && body !== null && "code" in body
      ? String((body as Record<string, unknown>).code ?? "")
      : "";

  // Verify against env var. Fail closed when unset.
  const expected = process.env.COMING_SOON_BYPASS_CODE;
  if (!expected) {
    return NextResponse.json({ error: "Bypass disabled" }, { status: 403 });
  }
  if (!timingSafeEqual(code, expected)) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  // Mint the bypass cookie. httpOnly so client JS can't read it (no longer
  // needs to — the gate logic now lives in proxy.ts and this route).
  const response = NextResponse.json({ ok: true });
  response.cookies.set("aesdr_cs_bypass", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

/**
 * Constant-time string equality — avoids leaking length / position info
 * via timing differences. Belt-and-suspenders given rate-limiting already
 * blocks practical brute force, but cheap to include.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
