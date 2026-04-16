import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_PATHS = ["/", "/terms", "/privacy", "/refund-policy", "/about", "/contact", "/success", "/purchase/cancel", "/login", "/signup"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  // Let API routes, dashboard, course, tools, account, and auth pages through
  if (pathname.startsWith("/api/") || pathname.startsWith("/dashboard") || pathname.startsWith("/course") || pathname.startsWith("/tools/") || pathname.startsWith("/account") || pathname.startsWith("/auth/") || pathname.startsWith("/admin") || pathname.startsWith("/team")) {
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
