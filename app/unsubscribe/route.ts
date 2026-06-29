export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

// Audit remediation P0-12 / R5-DV-2: the unsubscribe surface the email footer +
// List-Unsubscribe header point at. Writes the address into email_suppressions
// (see 20260622_email_suppressions.sql); the lifecycle crons must then exclude
// suppressed addresses.
//
// AUDIT (P0-12, remaining): the email footer link + the `List-Unsubscribe` header
// still need `?email=<recipient>` (or a signed token) appended per-send, and the
// crons (drip/dropoff/review/abandonment/retention) need a `NOT EXISTS
// (email_suppressions)` / `.not('email','in',...)` guard, for one-click to fully
// work end-to-end. This route is functional once the link carries ?email=.

function page(title: string, body: string): NextResponse {
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · AESDR</title></head>
<body style="margin:0;background:#FAF7F2;color:#1A1A1A;font-family:Georgia,'Source Serif 4',serif;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px">
<div style="max-width:440px;text-align:center">
<p style="font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:#8B1A1A;margin:0 0 18px">AESDR</p>
<h1 style="font-family:'Playfair Display',Georgia,serif;font-weight:600;font-size:28px;margin:0 0 14px">${title}</h1>
${body}
</div></body></html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

function normalizeEmail(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const e = raw.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
}

async function suppress(email: string): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("email_suppressions")
      .upsert({ email, reason: "unsubscribe" }, { onConflict: "email" });
    if (error) {
      console.error("[unsubscribe] suppress failed:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[unsubscribe] unexpected error:", err instanceof Error ? err.message : err);
    return false;
  }
}

// One-click (RFC 8058): mail clients POST here. Also serves the confirm form's POST.
export async function POST(request: NextRequest) {
  let email = normalizeEmail(request.nextUrl.searchParams.get("email"));
  if (!email) {
    try {
      const form = await request.formData();
      email = normalizeEmail(form.get("email")?.toString());
    } catch {
      /* no form body (one-click) */
    }
  }
  if (!email) {
    return page("We need your address", `<p style="font-size:16px;color:#6B6B6B;line-height:1.6">We couldn't read which address to unsubscribe. Reply to any AESDR email with UNSUBSCRIBE and we'll take care of it.</p>`);
  }
  const ok = await suppress(email);
  return page(
    ok ? "You're unsubscribed" : "Something went wrong",
    ok
      ? `<p style="font-size:16px;color:#6B6B6B;line-height:1.6">${email} won't receive lifecycle emails from us. Course access and receipts are unaffected.</p>`
      : `<p style="font-size:16px;color:#6B6B6B;line-height:1.6">We couldn't process that just now. Reply to any AESDR email with UNSUBSCRIBE and a human will handle it.</p>`
  );
}

// GET shows a one-button confirm page.
export async function GET(request: NextRequest) {
  const email = normalizeEmail(request.nextUrl.searchParams.get("email"));
  if (!email) {
    return page("Unsubscribe", `<p style="font-size:16px;color:#6B6B6B;line-height:1.6">Open this from the link in one of our emails, or reply to any AESDR email with UNSUBSCRIBE.</p>`);
  }
  return page(
    "Unsubscribe",
    `<p style="font-size:16px;color:#6B6B6B;line-height:1.6;margin-bottom:22px">Stop lifecycle emails to <strong style="color:#1A1A1A">${email}</strong>? (Receipts and course access are unaffected.)</p>
<form method="POST" action="/unsubscribe?email=${encodeURIComponent(email)}">
<button type="submit" style="font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#fff;background:#8B1A1A;border:none;padding:14px 28px;cursor:pointer">Unsubscribe</button>
</form>`
  );
}
