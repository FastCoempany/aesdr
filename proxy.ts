import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/terms", "/privacy", "/refund-policy"];

export function proxy(request: NextRequest) {
  if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Bypass lock if founder cookie is set
  if (request.cookies.get("aesdr_bypass")?.value === "1") {
    return NextResponse.next();
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
