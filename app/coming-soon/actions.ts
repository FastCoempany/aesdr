"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Server action for coming-soon bypass.
 *
 * Why a server action instead of `fetch('/api/coming-soon-bypass')`:
 *
 * The fetch-based approach split the cookie set and the navigation across
 * two separate HTTP round-trips:
 *   1. POST /api/coming-soon-bypass → response with Set-Cookie
 *   2. window.location.href = "/" → new request, browser sends cookies
 *
 * Between (1) and (2) the cookie has to round-trip through Set-Cookie
 * processing in the browser, the fetch promise has to resolve, the client
 * has to read `res.ok`, and only THEN does the navigation start. There
 * are several places this can fail or race:
 *   - Some browsers/extensions interfere with Set-Cookie on fetch
 *     responses, especially when cookies have HttpOnly + Secure + SameSite
 *     attributes
 *   - Existing non-HttpOnly cookies with the same name can confuse storage
 *   - The navigation can fire before the cookie is fully committed
 *
 * Server actions collapse the two round-trips into ONE response: the
 * action sets the cookie via `cookies().set()` and calls `redirect()`,
 * which throws a special redirect signal that Next.js serializes into the
 * same response. The browser receives one HTTP response that simultaneously
 * sets the cookie AND tells the browser to navigate. There is no window
 * during which the cookie is "set but not yet sent" — it's atomic.
 */

const COOKIE_NAME = "aesdr_cs_bypass";

export async function submitBypassAction(code: string): Promise<void> {
  // Rate limit by IP — 10 attempts per hour. Brute-forcing a 6-digit
  // numeric code at 10 tries/hr would take ~11.4 years on average.
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";
  const rl = await rateLimit(`coming-soon-bypass:${ip}`, {
    max: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.success) {
    // Silent — keeps the gate opaque.
    return;
  }

  // Fail closed when the env var is unset.
  const expected = process.env.COMING_SOON_BYPASS_CODE;
  if (!expected) {
    return;
  }

  if (!timingSafeEqual(code, expected)) {
    return;
  }

  // Cookie set + redirect collapse into a single response.
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect("/");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ── The gate's waitlist ("No letter yet? Leave an address") ──
// Rides the existing free_leads table (source-scoped, zero migration) and the
// existing typed event ledger. Outcome comes back via ?w= so the gate stays a
// server-rendered page that works without JS.

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const WAITLIST_SOURCE = "gate_waitlist";

export async function joinWaitlistAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    redirect("/coming-soon?w=invalid");
  }

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";
  const rl = await rateLimit(`gate-waitlist:${ip}`, {
    max: 6,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.success) {
    redirect("/coming-soon?w=later");
  }

  try {
    const { createAdminClient } = await import("@/utils/supabase/admin");
    const { hashIp } = await import("@/lib/hash-ip");
    const supabase = createAdminClient();
    const { data: existing } = await supabase
      .from("free_leads")
      .select("id")
      .eq("email", email)
      .eq("source", WAITLIST_SOURCE)
      .maybeSingle();
    if (!existing) {
      const { error } = await supabase.from("free_leads").insert({
        email,
        source: WAITLIST_SOURCE,
        ip_hash: hashIp(ip),
        user_agent: headersList.get("user-agent")?.slice(0, 400) ?? null,
        referrer: headersList.get("referer")?.slice(0, 400) ?? null,
      });
      if (error) {
        // message/code only — the full error object can echo the email.
        console.error("[gate-waitlist] insert failed", error.message, error.code);
        redirect("/coming-soon?w=save");
      }
      const { logEvent } = await import("@/lib/events");
      await logEvent("free_lead_captured", { source: WAITLIST_SOURCE });
    }
  } catch (e) {
    // redirect() throws its control-flow signal — never swallow it.
    if (e && typeof e === "object" && "digest" in e) throw e;
    console.error("[gate-waitlist] failed", e instanceof Error ? e.message : String(e));
    redirect("/coming-soon?w=save");
  }

  redirect("/coming-soon?w=ok");
}
