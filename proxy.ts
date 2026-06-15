import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAdminEmail } from "@/lib/admin";

const PUBLIC_PATHS = ["/", "/terms", "/privacy", "/refund-policy", "/about", "/contact", "/success", "/purchase/cancel", "/login", "/signup", "/syllabus", "/coming-soon", "/mobile", "/preview", "/free/manager-archetype-map"];

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
  // visits work without any session cookie. On main, those routes don't
  // exist on disk, so Next renders its own 404 — harmless.
  if (pathname.startsWith("/x/")) {
    return supabaseResponse;
  }

  // ── Affiliate-experience environment: lock everything else to 404 ──
  // AFFILIATE_EXPERIENCE=1 is set ONLY on the dedicated affiliatekit
  // deployment. There, every non-/x/* path 404s so affiliatekit.aesdr.com is
  // the kit experience and nothing else. On production (var unset) this
  // block is skipped entirely and the app behaves normally.
  if (process.env.AFFILIATE_EXPERIENCE === "1") {
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
  if (comingSoon && !hasCsBypass && !isAdmin && !pathname.startsWith("/api/") && pathname !== "/coming-soon" && pathname !== "/mobile") {
    const ua = request.headers.get("user-agent") || "";
    const isMobile = /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(ua);
    const url = request.nextUrl.clone();
    url.pathname = isMobile ? "/mobile" : "/coming-soon";
    url.search = "";
    return NextResponse.redirect(url, 302);
  }

  // --- Route access control ---
  if (PUBLIC_PATHS.includes(pathname)) {
    return supabaseResponse;
  }

  // Let API routes, dashboard, course, tools, account, auth pages, the
  // partner hub, admin pages, and artifact previews through. Partner hub
  // is partner-facing public surface (no auth required, like /syllabus).
  // Artifact pages handle their own auth gates internally and accept
  // ?preview=1 for partner-side previews of the end-of-course
  // Programme/Manuscript artifacts.
  if (pathname.startsWith("/api/") || pathname.startsWith("/dashboard") || pathname.startsWith("/course") || pathname.startsWith("/tools/") || pathname.startsWith("/account") || pathname.startsWith("/auth/") || pathname.startsWith("/affiliates") || pathname.startsWith("/admin") || pathname.startsWith("/artifacts/") || pathname === "/welcome") {
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
