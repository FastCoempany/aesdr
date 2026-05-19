export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import crypto from "node:crypto";

import { sendManagerArchetypeMap } from "@/lib/email";
import { logEvent } from "@/lib/events";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { createAdminClient } from "@/utils/supabase/admin";

const SOURCE = "manager-archetype-map";

// Loose RFC-5322-ish check — Resend will do the real validation. We only
// reject the obvious garbage here so we don't burn a Resend call.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function hashIP(ip: string) {
  const salt = process.env.IP_HASH_SALT || "aesdr-free-leads";
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const rl = await rateLimit(`free-lead:${SOURCE}:${ip}`, {
    max: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Try again in an hour." },
      { status: 429 }
    );
  }

  let body: { email?: unknown; role?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      { error: "That doesn't look like a valid email." },
      { status: 400 }
    );
  }

  const role =
    body.role === "ae" || body.role === "sdr" ? body.role : null;

  const supabase = createAdminClient();
  const ipHash = hashIP(ip);
  const ua = request.headers.get("user-agent")?.slice(0, 300) ?? null;
  const referrer = request.headers.get("referer")?.slice(0, 500) ?? null;

  // Upsert by (lower(email), source) — re-submitting just re-sends the asset.
  const { data: existing } = await supabase
    .from("free_leads")
    .select("id, delivered_at")
    .eq("email", email)
    .eq("source", SOURCE)
    .maybeSingle();

  let leadId = existing?.id as string | undefined;
  if (!leadId) {
    const { data: inserted, error: insertErr } = await supabase
      .from("free_leads")
      .insert({
        email,
        source: SOURCE,
        role,
        ip_hash: ipHash,
        user_agent: ua,
        referrer,
      })
      .select("id")
      .single();
    if (insertErr) {
      console.error("[free-lead] insert failed", insertErr);
      return NextResponse.json(
        { error: "Couldn't save that. Try again in a minute." },
        { status: 500 }
      );
    }
    leadId = inserted.id;
  }

  const ok = await sendManagerArchetypeMap(email);
  if (!ok) {
    await supabase
      .from("free_leads")
      .update({ delivery_error: "resend_send_failed" })
      .eq("id", leadId);
    return NextResponse.json(
      { error: "Email send failed. Your address is saved — we'll retry." },
      { status: 502 }
    );
  }

  await supabase
    .from("free_leads")
    .update({ delivered_at: new Date().toISOString(), delivery_error: null })
    .eq("id", leadId);

  await logEvent(
    "free_lead_captured",
    { source: SOURCE, role },
    { email, ipHash, userAgent: ua }
  );

  return NextResponse.json({ ok: true });
}
