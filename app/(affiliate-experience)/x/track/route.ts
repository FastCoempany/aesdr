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
  return new NextResponse(null, { status: 204 });
}
