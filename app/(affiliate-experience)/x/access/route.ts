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
  EXPERIENCE_MAX_AGE,
  FOUNDER_COOKIE,
  founderPassValue,
  signExperienceToken,
} from "@/lib/experience-gate";
import { isOpsAuthed } from "../../_lib/ops-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin;
  const slug = (req.nextUrl.searchParams.get("p") || "").slice(0, 128).trim();
  const key = req.nextUrl.searchParams.get("k") || "";

  // Founder bypass — the ?k=<COMING_SOON_BYPASS_CODE> door. Drops the founder
  // cookie, which the gate accepts INDEPENDENT of EXPERIENCE_GATE_SECRET, so the
  // founder is never walled out of their own site (even before the gate secret
  // is set). Checked first, short-circuits.
  if (
    key &&
    process.env.COMING_SOON_BYPASS_CODE &&
    key === process.env.COMING_SOON_BYPASS_CODE
  ) {
    const pass = await founderPassValue();
    if (pass) {
      const res = NextResponse.redirect(`${origin}/x/welcome`, { status: 303 });
      res.cookies.set(FOUNDER_COOKIE, pass, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: EXPERIENCE_MAX_AGE,
      });
      return res;
    }
  }

  // The token's subject records HOW access was granted: a real prospect slug or
  // an authenticated ops session.
  let subject: string | null = null;

  // 1) A real prospect slug from the /x/ops roster.
  if (slug) {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("affiliate_prospects")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();
    if (data) subject = slug;
  }

  // 2) Founder path — an authenticated ops session (the ?k= key door is handled
  //    up top and doesn't need the gate secret).
  if (!subject && (await isOpsAuthed())) subject = "ops";

  // Sign the grant. `signExperienceToken` returns null when the gate secret
  // isn't configured — fail-closed, so an unset secret walls everyone.
  const token = subject ? await signExperienceToken(subject) : null;
  if (!token) {
    return NextResponse.redirect(`${origin}/x/welcome?locked=1`, {
      status: 303,
    });
  }

  // Redemption log: every grant of a real prospect slug records an
  // access_granted event (coarse geo/device) into affiliate_prospect_events, so
  // a forwarded/leaked link becomes VISIBLE in /x/ops — many grants, or grants
  // from several countries, on one slug reads as sharing. Best-effort; a logging
  // failure must never block the grant.
  if (subject === slug) {
    const country = req.headers.get("x-vercel-ip-country");
    const ua = req.headers.get("user-agent") || "";
    const device = /mobi|android|iphone|ipad/i.test(ua) ? "mobile" : "desktop";
    try {
      await createAdminClient()
        .from("affiliate_prospect_events")
        .insert({
          prospect_slug: slug,
          session_id: null,
          name: "access_granted",
          props: { via: "link" },
          path: "/x/access",
          country: country ? country.slice(0, 8) : null,
          device,
        });
    } catch {
      /* logging is best-effort */
    }
  }

  const dest = slug
    ? `${origin}/x/welcome?p=${encodeURIComponent(slug)}`
    : `${origin}/x/welcome`;
  const res = NextResponse.redirect(dest, { status: 303 });
  res.cookies.set(EXPERIENCE_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: EXPERIENCE_MAX_AGE,
  });
  return res;
}
