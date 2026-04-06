import type { MetadataRoute } from "next";

/**
 * Pre-launch: blocks all crawling.
 *
 * LAUNCH DAY: Replace rules with:
 *   { userAgent: "*", allow: ["/", "/about", "/terms", "/privacy", "/refund-policy", "/contact"], disallow: ["/dashboard", "/course", "/login", "/signup", "/api"] }
 *
 * Then submit sitemap to Google Search Console.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
