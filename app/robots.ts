import type { MetadataRoute } from "next";

/**
 * Set NEXT_PUBLIC_LAUNCH_MODE=true in Vercel to flip public crawling on.
 * Then submit the sitemap to Google Search Console.
 */
export default function robots(): MetadataRoute.Robots {
  const launched = process.env.NEXT_PUBLIC_LAUNCH_MODE === "true";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aesdr.com";

  if (!launched) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/about", "/terms", "/privacy", "/refund-policy", "/contact", "/syllabus"],
      disallow: ["/dashboard", "/course", "/login", "/api", "/account", "/tools", "/artifacts", "/reveal", "/admin", "/team"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
