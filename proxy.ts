import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_PATHS = ["/", "/terms", "/privacy", "/refund-policy", "/about", "/contact", "/success", "/purchase/cancel", "/login", "/signup", "/syllabus", "/coming-soon", "/mobile"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Coming-soon gate: runtime-toggleable via COMING_SOON env var ──
  // Reading process.env inside the handler (not at module scope) ensures
  // the edge runtime picks up the current value on each request, so flipping
  // the toggle in Vercel takes effect without a redeploy.
  //
  // Desktop visitors land on /coming-soon (password gate). Mobile visitors
  // land on /mobile (visuals-only, no password — mobile can't use the
  // ghost-button bypass anyway).
  const comingSoon = process.env.COMING_SOON === "true";
  const hasBypass = !!request.cookies.get("aesdr_cs_bypass");
  if (comingSoon && !hasBypass && pathname !== "/coming-soon" && pathname !== "/mobile") {
    const ua = request.headers.get("user-agent") || "";
    const isMobile = /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(ua);
    const url = request.nextUrl.clone();
    url.pathname = isMobile ? "/mobile" : "/coming-soon";
    url.search = "";
    return NextResponse.redirect(url, 302);
  }

  // --- Supabase session refresh (required for server components to read auth) ---
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
  await supabase.auth.getUser();

  // --- Route access control ---
  if (PUBLIC_PATHS.includes(pathname)) {
    return supabaseResponse;
  }

  // Let API routes, dashboard, course, tools, account, auth pages, and the
  // partner hub through. Partner hub is partner-facing public surface — should
  // be reachable without auth, just like /syllabus or /about (canon §1.4
  // borrowed-trust-as-merciless-mirror — the hub IS the merciless mirror).
  if (pathname.startsWith("/api/") || pathname.startsWith("/dashboard") || pathname.startsWith("/course") || pathname.startsWith("/tools/") || pathname.startsWith("/account") || pathname.startsWith("/auth/") || pathname.startsWith("/partners") || pathname === "/welcome") {
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
