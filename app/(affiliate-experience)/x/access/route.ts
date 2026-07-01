/**
 * GET /x/access?p=<slug> — the invite gate's grant endpoint.
 *
 * The ONE place the experience cookie is set. It grants access when the visitor
 * arrives with a real prospect slug (validated against the /x/ops roster), OR is
 * an authenticated ops session, OR carries the founder preview key (?k=, the
 * existing COMING_SOON_BYPASS_CODE) — so the founder can always look without a
 * minted prospect. Anything else is bounced to the "private preview" wall.
 *
 * On success it forwards to /x/welcome (keeping ?p= so ProspectTracker still
 * attributes the session). The bare domain and un-invited deep links never reach
 * this route, so they never get the cookie — they stay walled.
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  EXPERIENCE_COOKIE,
  EXPERIENCE_GRANT,
  EXPERIENCE_MAX_AGE,
} from "@/lib/experience-gate";
import { isOpsAuthed } from "../../_lib/ops-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin;
  const slug = (req.nextUrl.searchParams.get("p") || "").slice(0, 128).trim();
  const key = req.nextUrl.searchParams.get("k") || "";

  let granted = false;

  // 1) A real prospect slug from the /x/ops roster.
  if (slug) {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("affiliate_prospects")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();
    if (data) granted = true;
  }

  // 2) Founder paths — an authenticated ops session, or the coming-soon bypass
  //    code as a preview key, so the founder can preview without minting a row.
  if (!granted && (await isOpsAuthed())) granted = true;
  if (
    !granted &&
    key &&
    process.env.COMING_SOON_BYPASS_CODE &&
    key === process.env.COMING_SOON_BYPASS_CODE
  ) {
    granted = true;
  }

  if (!granted) {
    return NextResponse.redirect(`${origin}/x/welcome?locked=1`, {
      status: 303,
    });
  }

  const dest = slug
    ? `${origin}/x/welcome?p=${encodeURIComponent(slug)}`
    : `${origin}/x/welcome`;
  const res = NextResponse.redirect(dest, { status: 303 });
  res.cookies.set(EXPERIENCE_COOKIE, EXPERIENCE_GRANT, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: EXPERIENCE_MAX_AGE,
  });
  return res;
}
