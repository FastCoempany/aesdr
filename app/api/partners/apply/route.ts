/**
 * API: POST /api/partners/apply
 * Spec: AESDR-PARTNER-HUB-SPEC.md §"Page 1.6 — /partners/apply"
 * Canon: §1.6 (honesty), §12 (founder backstage), §13
 *
 * Persists partner-application form submissions to the `partner_applications`
 * Supabase table. Optionally emails admissions inbox if EMAIL_RECIPIENT env
 * var is set (graceful degradation per Phase 0 #6 — admissions@ inbox standup
 * is operationally pending; form ships functional today, email routing
 * activates when inbox lands).
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import crypto from "node:crypto";

export const runtime = "nodejs";

type ApplyBody = {
  applicantName: string;
  audienceDescriptor: string;
  primaryChannel: "newsletter" | "podcast" | "community" | "course" | "other";
  audienceSize: string;
  linkUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
};

function validate(body: unknown): { ok: true; data: ApplyBody } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid body" };
  const b = body as Record<string, unknown>;

  const required = ["applicantName", "audienceDescriptor", "primaryChannel", "audienceSize"] as const;
  for (const k of required) {
    if (typeof b[k] !== "string" || (b[k] as string).trim().length === 0) {
      return { ok: false, error: `Missing field: ${k}` };
    }
  }

  const channel = b.primaryChannel as string;
  if (!["newsletter", "podcast", "community", "course", "other"].includes(channel)) {
    return { ok: false, error: "Invalid primaryChannel" };
  }

  // Length caps to prevent abuse
  if ((b.applicantName as string).length > 200) return { ok: false, error: "applicantName too long" };
  if ((b.audienceDescriptor as string).length > 1000) return { ok: false, error: "audienceDescriptor too long" };
  if ((b.audienceSize as string).length > 200) return { ok: false, error: "audienceSize too long" };
  if (b.linkUrl && (b.linkUrl as string).length > 500) return { ok: false, error: "linkUrl too long" };

  return {
    ok: true,
    data: {
      applicantName: (b.applicantName as string).trim(),
      audienceDescriptor: (b.audienceDescriptor as string).trim(),
      primaryChannel: channel as ApplyBody["primaryChannel"],
      audienceSize: (b.audienceSize as string).trim(),
      linkUrl: typeof b.linkUrl === "string" ? (b.linkUrl as string).trim() || undefined : undefined,
      utmSource: typeof b.utmSource === "string" ? (b.utmSource as string).slice(0, 100) : undefined,
      utmMedium: typeof b.utmMedium === "string" ? (b.utmMedium as string).slice(0, 100) : undefined,
      utmCampaign: typeof b.utmCampaign === "string" ? (b.utmCampaign as string).slice(0, 100) : undefined,
      utmContent: typeof b.utmContent === "string" ? (b.utmContent as string).slice(0, 100) : undefined,
    },
  };
}

function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const v = validate(body);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  const { data } = v;

  const userAgent = request.headers.get("user-agent") || null;
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0]?.trim() : null;

  const supabase = createAdminClient();
  const { error: insertError } = await supabase
    .from("partner_applications")
    .insert({
      applicant_name: data.applicantName,
      audience_descriptor: data.audienceDescriptor,
      primary_channel: data.primaryChannel,
      audience_size: data.audienceSize,
      link_url: data.linkUrl || null,
      utm_source: data.utmSource || null,
      utm_medium: data.utmMedium || null,
      utm_campaign: data.utmCampaign || null,
      utm_content: data.utmContent || null,
      user_agent: userAgent,
      ip_hash: hashIp(ip),
    });

  if (insertError) {
    console.error("[partners/apply] Insert failed:", insertError);
    return NextResponse.json(
      { error: "Application could not be saved. Please try again." },
      { status: 500 },
    );
  }

  // Optional email send — only if EMAIL_RECIPIENT env var is set.
  // Per Phase 0 #6: admissions@aesdr.com inbox standup is operationally pending.
  // Form persists to Supabase always; email activates when inbox lands.
  const emailRecipient = process.env.EMAIL_RECIPIENT;
  if (emailRecipient) {
    try {
      // Resend or equivalent ESP integration goes here.
      // Until ESP is wired, this block is a no-op. Founder queries the
      // partner_applications table directly to review applications.
      console.log("[partners/apply] EMAIL_RECIPIENT set; ESP integration pending.");
    } catch (emailError) {
      // Email failure does not fail the request — application is saved regardless.
      console.error("[partners/apply] Email notification failed:", emailError);
    }
  }

  return NextResponse.json({ ok: true });
}
