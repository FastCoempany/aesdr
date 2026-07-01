import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAdminEmail } from "@/lib/admin";
import { EXPERIENCE_COOKIE, verifyExperienceToken } from "@/lib/experience-gate";

const PUBLIC_PATHS = ["/", "/terms", "/privacy", "/refund-policy", "/about", "/contact", "/success", "/purchase/cancel", "/login", "/signup", "/syllabus", "/coming-soon", "/mobile", "/preview", "/free/manager-archetype-map", "/unsubscribe"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Supabase session refresh (required for server components to read auth) ---
  // We need the user-resolution to also gate admin bypass below, so this has
  // to run before the coming-soon gate.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the auth token — must be awaited for cookies to sync
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = isAdminEmail(user?.email);

  // ── Affiliate-experience: /x/* always passes ──
  // /x/* is the locked prospect experience. Let it through every gate
  // (coming-soon, allowlist, anonymous lock) unconditionally so incognito
  // visits work without any session cookie. NOTE: these routes DO exist on
  // disk (app/(affiliate-experience)/x/**), so on the main production deploy
  // they are served and bypass every gate. That's intended for the kit, but
  // it means each /x/* route must carry its own auth/validation — see
  // /x/track and /x/ops, which are guarded at the route level.
  if (pathname.startsWith("/x/")) {
    // Invite gate for the prospect EXPERIENCE. The kit is not an open URL:
    // access is granted only by /x/access (after it validates a roster slug /
    // ops session / founder key) which drops the EXPERIENCE_COOKIE. Here we
    // enforce it on the content routes (landing, kit). Kept open:
    //   - /x/welcome  — the wall/entry itself (renders its own gate)
    //   - /x/access   — the grant route that SETS the cookie
    //   - /x/track    — telemetry POST (own same-origin + rate guards)
    //   - /x/ops*     — founder console (own password gate)
    // No cookie on a content route ⇒ bounce to the welcome wall, preserving
    // ?p= so it can still be validated + granted at /x/access.
    const infra =
      pathname.startsWith("/x/track") ||
      pathname.startsWith("/x/ops") ||
      pathname.startsWith("/x/access");
    const entry = pathname === "/x/welcome";
    if (!infra && !entry) {
      const invited = !!(await verifyExperienceToken(
        request.cookies.get(EXPERIENCE_COOKIE)?.value,
      ));
      if (!invited) {
        const url = request.nextUrl.clone();
        url.pathname = "/x/welcome";
        const p = request.nextUrl.searchParams.get("p");
        url.search = p ? `?p=${encodeURIComponent(p)}` : "";
        return NextResponse.redirect(url, 302);
      }
    }
    return supabaseResponse;
  }

  // ── Affiliate-kit experience ──
  // Served two ways: a dedicated AFFILIATE_EXPERIENCE=1 deployment, OR — the
  // robust one — the affiliatekit.* hostname on the MAIN deployment. Gating on
  // the HOST (not only the env var) lets the clean domain live on the main,
  // always-from-main project instead of a separate one that silently drifts out
  // of date. The kit lives entirely under /x/* (which passed above); the bare
  // domain rewrites to the welcome gate, everything else 404s, so the kit domain is
  // the kit and nothing else. aesdr.com (host isn't affiliatekit*, var unset)
  // skips this block and behaves normally.
  const affiliateHost = (request.headers.get("host") ?? "").toLowerCase();
  const isAffiliateExperience =
    process.env.AFFILIATE_EXPERIENCE === "1" ||
    affiliateHost.startsWith("affiliatekit.");
  if (isAffiliateExperience) {
    // The bare domain IS the prospect's home: serve the Step-1 welcome gate
    // there (the proper first screen — "Begin" then carries them into the full
    // /x/landing experience). A REWRITE (not a redirect) so the URL stays
    // affiliatekit.aesdr.com/ clean. Everything else outside /x/* still 404s.
    if (pathname === "/" || pathname === "/x") {
      const url = request.nextUrl.clone();
      url.pathname = "/x/welcome";
      return NextResponse.rewrite(url);
    }
    return new NextResponse("Not found", { status: 404 });
  }

  // ── URL-param bypass: `?bypass=<COMING_SOON_BYPASS_CODE>` ──
  // Set the cookie at the edge and redirect to a clean URL on any path.
  // Replaces the previous client-side mechanism in /coming-soon (which
  // shipped the literal code in the JS bundle). Fails closed if the env
  // var is unset.
  const urlBypass = request.nextUrl.searchParams.get("bypass");
  if (urlBypass) {
    const expectedBypass = process.env.COMING_SOON_BYPASS_CODE;
    if (expectedBypass && urlBypass === expectedBypass) {
      const cleanUrl = request.nextUrl.clone();
      cleanUrl.searchParams.delete("bypass");
      // Send the visitor to the landing page so they don't bounce back into
      // /coming-soon if they originally hit it directly.
      if (cleanUrl.pathname === "/coming-soon" || cleanUrl.pathname === "/mobile") {
        cleanUrl.pathname = "/";
      }
      const bypassResponse = NextResponse.redirect(cleanUrl, 302);
      bypassResponse.cookies.set("aesdr_cs_bypass", "1", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
      return bypassResponse;
    }
    // Bad code — strip the param to avoid leaking it in browser history,
    // and continue with the normal gating below.
    const stripped = request.nextUrl.clone();
    stripped.searchParams.delete("bypass");
    return NextResponse.redirect(stripped, 302);
  }

  // ── Coming-soon gate: runtime-toggleable via COMING_SOON env var ──
  // Reading process.env inside the handler (not at module scope) ensures
  // the edge runtime picks up the current value on each request, so flipping
  // the toggle in Vercel takes effect without a redeploy.
  //
  // Desktop visitors land on /coming-soon (password gate). Mobile visitors
  // land on /mobile (visuals-only, no password — mobile can't use the
  // ghost-button bypass anyway). Admins bypass entirely.
  const comingSoon = process.env.COMING_SOON === "true";
  const hasCsBypass = !!request.cookies.get("aesdr_cs_bypass");
  // API routes must never hit the human holding-page gate — they're called
  // programmatically (Vercel crons, webhooks, admin tools) with no session
  // cookie, so a 302 to /coming-soon silently breaks them. They carry their
  // own auth (verifyCronAuth / requireAdmin / etc.). This was eating every
  // cron invocation as a 302.
  if (comingSoon && !hasCsBypass && !isAdmin && !pathname.startsWith("/api/") && !pathname.startsWith("/r/") && pathname !== "/coming-soon" && pathname !== "/mobile") {
    const ua = request.headers.get("user-agent") || "";
    const isMobile = /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(ua);
    const url = request.nextUrl.clone();
    url.pathname = isMobile ? "/mobile" : "/coming-soon";
    url.search = "";
    return NextResponse.redirect(url, 302);
  }

  // AUDIT (#5, adversarial pass): a temp-password user must set a real password
  // before using the app. Per-page checks missed /account, /account/data,
  // /reveal, and the tool routes — enforce it once here across the authenticated
  // app areas (post-launch; pre-launch the coming-soon gate above already holds
  // everything). /account/set-password, /auth/*, and /api/* are exempt so the
  // set-password flow itself and programmatic routes aren't redirect-looped.
  const needsPw = user?.user_metadata?.needs_password_change === true;
  if (
    needsPw &&
    pathname !== "/account/set-password" &&
    pathname !== "/account/reset-password" &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/auth/") &&
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/course") ||
      pathname.startsWith("/tools") ||
      pathname.startsWith("/artifacts") ||
      pathname.startsWith("/reveal") ||
      pathname.startsWith("/team") ||
      pathname.startsWith("/account") ||
      pathname.startsWith("/affiliates"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/account/set-password";
    url.search = "";
    return NextResponse.redirect(url, 302);
  }

  // --- Route access control ---
  if (PUBLIC_PATHS.includes(pathname)) {
    return supabaseResponse;
  }

  // Let API routes, dashboard, course, tools, account, auth pages, the
  // affiliate hub, admin pages, artifact previews, affiliate click links
  // (/r/), and team management through. The affiliate hub is public-facing
  // (no auth required, like /syllabus). Artifact pages handle their own auth
  // gates internally and accept ?preview=1 for partner-side previews of the
  // end-of-course Programme/Manuscript artifacts. /r/<slug> is the affiliate
  // click endpoint — it MUST pass so the attribution cookie gets set before
  // the redirect (it 404s unknown slugs itself). /team manages team seats.
  if (pathname.startsWith("/api/") || pathname.startsWith("/dashboard") || pathname.startsWith("/course") || pathname.startsWith("/tools/") || pathname.startsWith("/account") || pathname.startsWith("/auth/") || pathname.startsWith("/affiliates") || pathname.startsWith("/admin") || pathname.startsWith("/artifacts/") || pathname.startsWith("/r/") || pathname.startsWith("/team") || pathname === "/welcome") {
    return supabaseResponse;
  }

  // Admins bypass the lock for any route — founder needs to see the full
  // app in production, including not-yet-allowlisted routes.
  if (isAdmin) {
    return supabaseResponse;
  }

  // Bypass lock if founder cookie is set
  if (request.cookies.get("aesdr_bypass")?.value === "1") {
    return supabaseResponse;
  }

  const landingUrl = request.nextUrl.clone();
  landingUrl.pathname = "/";
  landingUrl.search = "";

  // Temporary hold-page redirect while the rest of the product stays private.
  return NextResponse.redirect(landingUrl, 302);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
