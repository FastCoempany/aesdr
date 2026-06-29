export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { Webhook } from "svix";
import { createAdminClient } from "@/utils/supabase/admin";

// Audit remediation R5-DV-2: Resend signs its webhooks with Svix. This endpoint
// verifies the signature against the RAW request body (mirroring the Stripe
// webhook's verify-then-process discipline — never parse-then-verify) and writes
// hard-bounce + spam-complaint recipients into email_suppressions
// (see 20260622_email_suppressions.sql). getSuppressedEmails() in lib/email.ts is
// the read side the lifecycle crons consult, so once an address lands here the
// drip/dropoff/review/abandonment/retention sends skip it.
//
// Setup: RESEND_WEBHOOK_SECRET must be set in Vercel, and the endpoint
// (/api/webhooks/resend) registered in the Resend dashboard, before any events
// arrive. With no secret set we fail closed (500) — an unverified payload is
// never processed.

// Resend payloads carry recipients at data.to (string | string[]); some event
// shapes also expose a single data.email. Normalize, validate shape, dedupe.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const e = raw.trim().toLowerCase();
  return EMAIL_RE.test(e) ? e : null;
}

function extractRecipients(data: { to?: unknown; email?: unknown }): string[] {
  const out = new Set<string>();
  const toField = data?.to;
  if (Array.isArray(toField)) {
    for (const r of toField) {
      const e = normalizeEmail(r);
      if (e) out.add(e);
    }
  } else {
    const e = normalizeEmail(toField);
    if (e) out.add(e);
  }
  // Fall back to data.email only when `to` yielded nothing.
  if (out.size === 0) {
    const e = normalizeEmail(data?.email);
    if (e) out.add(e);
  }
  return [...out];
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    // Fail closed: without the signing secret we cannot trust any payload.
    console.error("[resend-webhook] RESEND_WEBHOOK_SECRET environment variable is not set");
    Sentry.captureMessage("[resend-webhook] RESEND_WEBHOOK_SECRET is not set — refusing to process", {
      level: "error",
    });
    return new NextResponse("Server misconfigured", { status: 500 });
  }

  // Svix signature verification against the raw (unparsed) body.
  const wh = new Webhook(secret);
  let evt: { type: string; data: { to?: unknown; email?: unknown } };
  try {
    evt = wh.verify(rawBody, {
      "svix-id": request.headers.get("svix-id") ?? "",
      "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
      "svix-signature": request.headers.get("svix-signature") ?? "",
    }) as { type: string; data: { to?: unknown; email?: unknown } };
  } catch {
    return new NextResponse("invalid signature", { status: 400 });
  }

  let reason: "bounce" | "complaint";
  if (evt.type === "email.bounced") {
    reason = "bounce";
  } else if (evt.type === "email.complained") {
    reason = "complaint";
  } else {
    // Acknowledge other event types so Resend stops retrying — no-op.
    return NextResponse.json({ ignored: true });
  }

  const recipients = extractRecipients(evt.data);
  if (recipients.length === 0) {
    // Nothing actionable, but the event was valid — acknowledge so Resend
    // doesn't retry. Note it so a malformed/unexpected payload is visible.
    Sentry.captureMessage("[resend-webhook] handled event had no extractable recipient", {
      level: "warning",
      extra: { type: evt.type },
    });
    return NextResponse.json({ ok: true, suppressed: 0 });
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("email_suppressions")
      .upsert(
        recipients.map((email) => ({ email, reason })),
        { onConflict: "email" }
      );
    if (error) {
      // Loud log + Sentry, but still 200: a transient DB blip must not make
      // Resend hammer retries. The address simply isn't suppressed yet.
      console.error("[resend-webhook] suppression upsert failed:", error.message);
      Sentry.captureMessage("[resend-webhook] suppression upsert failed", {
        level: "error",
        extra: { error: error.message, type: evt.type, reason, count: recipients.length },
      });
      return NextResponse.json({ ok: true, suppressed: 0 });
    }
  } catch (err) {
    console.error(
      "[resend-webhook] unexpected error writing suppressions:",
      err instanceof Error ? err.message : err
    );
    Sentry.captureException(err, {
      extra: { handler: "resend-webhook", step: "suppression_upsert", type: evt.type, reason },
    });
    return NextResponse.json({ ok: true, suppressed: 0 });
  }

  return NextResponse.json({ ok: true, suppressed: recipients.length });
}
