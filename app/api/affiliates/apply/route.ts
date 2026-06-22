/**
 * API: POST /api/affiliates/apply
 * Spec: AESDR-AFFILIATE-HUB-SPEC.md §"Page 1.6 — /affiliates/apply"
 * Canon: §1.6 (honesty), §12 (founder backstage), §13
 *
 * Persists partner-application form submissions to the `affiliate_applications`
 * Supabase table, then notifies the founder via Resend (EMAIL_RECIPIENT).
 * Email failure does not fail the request — the row is the source of truth.
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendAffiliateApplicationNotification } from "@/lib/email";
import { hashIp } from "@/lib/hash-ip";

export const runtime = "nodejs";

// Loose RFC-5322-ish check; Resend does the real validation. We only reject
// obvious garbage so we capture a usable reply address for the decision email.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type ApplyBody = {
  applicantName: string;
  applicantEmail: string;
  audienceDescriptor: string;
  primaryChannel: "newsletter" | "podcast" | "community" | "course";
  audienceSize: string;
  linkUrl: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
};

function validate(body: unknown): { ok: true; data: ApplyBody } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid body" };
  const b = body as Record<string, unknown>;

  const required = ["applicantName", "applicantEmail", "audienceDescriptor", "primaryChannel", "audienceSize", "linkUrl"] as const;
  for (const k of required) {
    if (typeof b[k] !== "string" || (b[k] as string).trim().length === 0) {
      return { ok: false, error: `Missing field: ${k}` };
    }
  }

  const channel = b.primaryChannel as string;
  if (!["newsletter", "podcast", "community", "course"].includes(channel)) {
    return { ok: false, error: "Invalid primaryChannel" };
  }

  const email = (b.applicantEmail as string).trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Invalid applicantEmail" };
  }

  // Length caps to prevent abuse
  if ((b.applicantName as string).length > 200) return { ok: false, error: "applicantName too long" };
  if ((b.audienceDescriptor as string).length > 1000) return { ok: false, error: "audienceDescriptor too long" };
  if ((b.audienceSize as string).length > 200) return { ok: false, error: "audienceSize too long" };
  if ((b.linkUrl as string).length > 500) return { ok: false, error: "linkUrl too long" };

  return {
    ok: true,
    data: {
      applicantName: (b.applicantName as string).trim(),
      applicantEmail: email,
      audienceDescriptor: (b.audienceDescriptor as string).trim(),
      primaryChannel: channel as ApplyBody["primaryChannel"],
      audienceSize: (b.audienceSize as string).trim(),
      linkUrl: (b.linkUrl as string).trim(),
      utmSource: typeof b.utmSource === "string" ? (b.utmSource as string).slice(0, 100) : undefined,
      utmMedium: typeof b.utmMedium === "string" ? (b.utmMedium as string).slice(0, 100) : undefined,
      utmCampaign: typeof b.utmCampaign === "string" ? (b.utmCampaign as string).slice(0, 100) : undefined,
      utmContent: typeof b.utmContent === "string" ? (b.utmContent as string).slice(0, 100) : undefined,
    },
  };
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
  const ipHash = hashIp(ip);

  const supabase = createAdminClient();
  const { error: insertError } = await supabase
    .from("affiliate_applications")
    .insert({
      applicant_name: data.applicantName,
      applicant_email: data.applicantEmail,
      audience_descriptor: data.audienceDescriptor,
      primary_channel: data.primaryChannel,
      audience_size: data.audienceSize,
      link_url: data.linkUrl,
      utm_source: data.utmSource || null,
      utm_medium: data.utmMedium || null,
      utm_campaign: data.utmCampaign || null,
      utm_content: data.utmContent || null,
      user_agent: userAgent,
      ip_hash: ipHash,
    });

  if (insertError) {
    // Log only message/code — the full Supabase error object can echo the
    // submitted email back in `details`/`hint` (R5-PI-5).
    console.error("[affiliates/apply] Insert failed:", insertError.message, insertError.code);
    return NextResponse.json(
      { error: "Application could not be saved. Please try again." },
      { status: 500 },
    );
  }

  // Fire-and-forget email notification. Failures are logged inside the helper
  // and never bubble up — the Supabase row is the source of truth.
  void sendAffiliateApplicationNotification({
    applicantName: data.applicantName,
    audienceDescriptor: data.audienceDescriptor,
    primaryChannel: data.primaryChannel,
    audienceSize: data.audienceSize,
    linkUrl: data.linkUrl,
    utmSource: data.utmSource ?? null,
    utmMedium: data.utmMedium ?? null,
    utmCampaign: data.utmCampaign ?? null,
    utmContent: data.utmContent ?? null,
    userAgent,
    ipHash,
    submittedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
