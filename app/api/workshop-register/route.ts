/**
 * POST /api/workshop-register
 *
 * Form handler for the workshop registration page at /[affiliateSlug]/workshop.
 * Validates payload, rate-limits, looks up the affiliate's live workshop,
 * inserts a registrant row, returns ok/error JSON.
 *
 * Per D07 (registration-page spec), D12 + canon §10.5 (SMS opt-in with
 * separate consent), canon §10.3 B4 (no overclaiming in error copy).
 *
 * No buyer-facing copy strings in the body — error messages are short,
 * neutral, action-oriented. Confirmation email send is a follow-on
 * (next pass; current pass returns ok and leaves the form to display
 * the inline success state with mention of email delivery).
 */

import { NextResponse } from "next/server";

import { getLiveWorkshopAffiliate, insertWorkshopRegistration } from "@/lib/workshop";
import type { WorkshopRegistrationPayload } from "@/lib/workshop";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { readRequestMeta } from "@/lib/req-meta";

const RATE_LIMIT = { max: 5, windowMs: 60_000 }; // 5/min per IP

function isValidEmail(email: string): boolean {
  // Pragmatic: server-side defense, not a comprehensive RFC 5322 check.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{1,14}$/.test(phone);
}

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const limit = await rateLimit(`workshop-register:${ip}`, RATE_LIMIT);
  if (!limit.success) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Try again in a minute." },
      { status: 429 },
    );
  }

  let body: Partial<WorkshopRegistrationPayload>;
  try {
    body = await request.json();
  } catch {
    return bad("Invalid request.");
  }

  // ── Validation ──
  if (!body.affiliate_slug || typeof body.affiliate_slug !== "string") {
    return bad("Missing workshop reference.");
  }
  if (!body.email || typeof body.email !== "string" || !isValidEmail(body.email)) {
    return bad("That doesn't look like a valid email.");
  }
  if (!body.first_name || typeof body.first_name !== "string" || body.first_name.trim().length < 1) {
    return bad("First name is required.");
  }
  if (body.first_name.length > 100) {
    return bad("First name is too long.");
  }
  if (body.role !== "AE" && body.role !== "SDR") {
    return bad("Pick a role: AE or SDR.");
  }
  if (body.tenure_months != null) {
    const t = Number(body.tenure_months);
    if (!Number.isFinite(t) || t < 0 || t > 600) {
      return bad("Tenure looks off. Use months in role.");
    }
  }
  if (body.sms_opted_in === true) {
    if (!body.phone_e164 || !isValidE164(body.phone_e164)) {
      return bad("Mobile number must be E.164 format (e.g. +15555551234).");
    }
  }

  // ── Look up the live workshop for this affiliate ──
  const affiliate = await getLiveWorkshopAffiliate(body.affiliate_slug);
  if (!affiliate) {
    return bad("Registration for that workshop isn't open.", 404);
  }

  // SMS opt-in only valid if the affiliate's pilot has SMS enabled
  // (per D12 — most early pilots dormant on SMS).
  const smsOptedIn = body.sms_opted_in === true && affiliate.sms_enabled;

  // ── Insert ──
  const meta = readRequestMeta(request.headers);
  const result = await insertWorkshopRegistration({
    payload: {
      affiliate_slug: affiliate.slug,
      email: body.email,
      first_name: body.first_name,
      role: body.role,
      tenure_months: body.tenure_months ?? null,
      sms_opted_in: smsOptedIn,
      phone_e164: smsOptedIn ? body.phone_e164 ?? null : null,
      utm_source: body.utm_source ?? null,
      utm_medium: body.utm_medium ?? null,
      utm_campaign: body.utm_campaign ?? null,
    },
    affiliate,
    ipHash: meta.ipHash,
    userAgent: meta.userAgent,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
