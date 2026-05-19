export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";

import { logEvent } from "@/lib/events";
import {
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_WINDOW_MS,
  VISITOR_COOKIE,
  buildRedirectUrl,
  formatAttributionCookie,
  generateVisitorId,
  hashIP,
} from "@/lib/affiliate";
import { getClientIP } from "@/lib/rate-limit";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Affiliate click endpoint at /r/[slug].
 *
 * Logs a click row, sets the attribution cookie (30-day TTL), preserves
 * the link's UTMs on the destination URL, and 302 redirects.
 *
 * Cookie is httpOnly so the browser can't leak the link_id to JS — the
 * read happens server-side in /api/checkout, which passes the link_id
 * to Stripe as session metadata.
 *
 * Inactive or expired links 404. Unknown slugs 404 (no leak about
 * whether a slug was ever registered).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: link } = await supabase
    .from("affiliate_links")
    .select(
      "id, partner_slug, destination_url, utm_source, utm_medium, utm_campaign, utm_content, active, expires_at"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!link) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (!link.active) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (link.expires_at && new Date(link.expires_at).getTime() < Date.now()) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ip = getClientIP(request);
  const ipHash = hashIP(ip);
  const ua = request.headers.get("user-agent")?.slice(0, 300) ?? null;
  const referrer = request.headers.get("referer")?.slice(0, 500) ?? null;

  // Reuse the existing visitor cookie if present, otherwise mint one.
  // Visitor id is anonymous, 1-year TTL, only used for de-dup analytics.
  const existingVisitorId = request.cookies.get(VISITOR_COOKIE)?.value;
  const visitorId = existingVisitorId || generateVisitorId();

  // Insert the click row. Failure to log shouldn't break the redirect —
  // the affiliate's audience must always land at the destination.
  let clickId: string | null = null;
  try {
    const { data: clickRow } = await supabase
      .from("affiliate_clicks")
      .insert({
        link_id: link.id,
        partner_slug: link.partner_slug,
        ip_hash: ipHash,
        user_agent: ua,
        referrer,
        visitor_id: visitorId,
      })
      .select("id")
      .single();
    clickId = clickRow?.id ?? null;
  } catch (err) {
    console.warn("[/r] click insert failed", slug, err);
  }

  await logEvent(
    "affiliate_clicked",
    { partner_slug: link.partner_slug, link_id: link.id },
    { ipHash, userAgent: ua }
  );

  const destination = buildRedirectUrl(link.destination_url, {
    utm_source: link.utm_source,
    utm_medium: link.utm_medium,
    utm_campaign: link.utm_campaign,
    utm_content: link.utm_content,
  });

  const response = NextResponse.redirect(destination, 302);

  // Attribution cookie — only set if we successfully logged the click,
  // otherwise the cookie holds a click_id that doesn't exist.
  if (clickId) {
    response.cookies.set(ATTRIBUTION_COOKIE, formatAttributionCookie(link.id, clickId), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Math.floor(ATTRIBUTION_WINDOW_MS / 1000),
    });
  }

  // Visitor cookie — set whether the click logged or not. 1-year TTL.
  if (!existingVisitorId) {
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
    });
  }

  return response;
}
