/**
 * POST /x/track — records one prospect-behavior event.
 *
 * Called by the client (app/(affiliate-experience)/_lib/track.ts). Writes with
 * the service-role client so it bypasses RLS (the tables have no public
 * policies). Geo + device are derived server-side from request headers so the
 * client never has to ask the prospect for anything.
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  sendProspectConversationRequestEmail,
  sendProspectEnterpriseIntentEmail,
} from "@/lib/email";

export const dynamic = "force-dynamic";

type Body = {
  slug?: unknown;
  sessionId?: unknown;
  name?: unknown;
  props?: unknown;
  path?: unknown;
  referrer?: unknown;
};

const str = (v: unknown, max: number): string | null =>
  typeof v === "string" && v.length > 0 ? v.slice(0, max) : null;

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const slug = str(body.slug, 128);
  const name = str(body.name, 64);
  if (!slug || !name) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const country = req.headers.get("x-vercel-ip-country");
  const ua = req.headers.get("user-agent") || "";
  const device = /mobi|android|iphone|ipad/i.test(ua) ? "mobile" : "desktop";

  const supabase = createAdminClient();

  // Auto-register unknown slugs so the dashboard roster fills itself in.
  await supabase
    .from("affiliate_prospects")
    .upsert({ slug }, { onConflict: "slug", ignoreDuplicates: true });

  const { error } = await supabase.from("affiliate_prospect_events").insert({
    prospect_slug: slug,
    session_id: str(body.sessionId, 128),
    name,
    props:
      body.props && typeof body.props === "object" && !Array.isArray(body.props)
        ? body.props
        : {},
    path: str(body.path, 256),
    referrer: str(body.referrer, 512),
    country: country ? country.slice(0, 8) : null,
    device,
  });

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // High-intent signal: enterprise-track submission from the /x/kit/what-you-earn
  // qualifier panel. Same dedup-on-server pattern as the conversation-request
  // notifier — only the first submission per slug fires the email.
  if (name === "kit_enterprise_intent_submitted") {
    const { count: subCount } = await supabase
      .from("affiliate_prospect_events")
      .select("*", { count: "exact", head: true })
      .eq("prospect_slug", slug)
      .eq("name", "kit_enterprise_intent_submitted");

    if ((subCount ?? 0) <= 1) {
      const { data: prospect } = await supabase
        .from("affiliate_prospects")
        .select("display_name")
        .eq("slug", slug)
        .single();

      const props =
        body.props && typeof body.props === "object" && !Array.isArray(body.props)
          ? (body.props as Record<string, unknown>)
          : {};
      const biggestDeal = String(props.biggest_deal ?? "").slice(0, 300);
      const dealDate1 = String(props.deal_date_1 ?? "").slice(0, 32) || null;
      const dealDate2 = String(props.deal_date_2 ?? "").slice(0, 32) || null;
      const salesCycle = String(props.sales_cycle ?? "").slice(0, 300);
      const verticals = String(props.verticals ?? "").slice(0, 300);

      sendProspectEnterpriseIntentEmail({
        slug,
        displayName: prospect?.display_name ?? null,
        biggestDeal,
        dealDate1,
        dealDate2,
        salesCycle,
        verticals,
        path: str(body.path, 256),
        country: country ? country.slice(0, 8) : null,
        device,
        submittedAt: new Date().toISOString(),
      }).catch((err) => {
        console.error("[track] enterprise-intent email failed:", err);
      });
    }
  }

  // High-intent signal: fire a one-shot email notification to the founder
  // the FIRST time this prospect clicks the Request-conversation CTA. Dedupe
  // by counting existing rows of this event-name for this slug — if more than
  // one (the one we just inserted), we've already notified; skip.
  if (name === "request_conversation_clicked") {
    const { count: convoCount } = await supabase
      .from("affiliate_prospect_events")
      .select("*", { count: "exact", head: true })
      .eq("prospect_slug", slug)
      .eq("name", "request_conversation_clicked");

    if ((convoCount ?? 0) <= 1) {
      const [{ data: prospect }, { count: totalEvents }] = await Promise.all([
        supabase
          .from("affiliate_prospects")
          .select("display_name")
          .eq("slug", slug)
          .single(),
        supabase
          .from("affiliate_prospect_events")
          .select("*", { count: "exact", head: true })
          .eq("prospect_slug", slug),
      ]);

      // Best-effort: email failure must never break the prospect's UX.
      sendProspectConversationRequestEmail({
        slug,
        displayName: prospect?.display_name ?? null,
        path: str(body.path, 256),
        country: country ? country.slice(0, 8) : null,
        device,
        totalEvents: totalEvents ?? 0,
        submittedAt: new Date().toISOString(),
      }).catch((err) => {
        console.error("[track] conversation-request email failed:", err);
      });
    }
  }

  return new NextResponse(null, { status: 204 });
}
