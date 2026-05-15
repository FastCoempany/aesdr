import type { MetadataRoute } from "next";
import { KIT_ENTRIES } from "@/lib/partner-kit";

/**
 * Pre-launch gating: when NEXT_PUBLIC_LAUNCH_MODE !== "true", return an
 * empty sitemap so the public route map (partner hub, kit slugs, etc.)
 * isn't enumerable at /sitemap.xml. Matches the policy in app/robots.ts,
 * which disallows all crawling under the same flag.
 *
 * The proxy.ts matcher excludes sitemap.xml from auth/coming-soon gating,
 * so without this conditional the full URL map leaks even when
 * COMING_SOON=true. Once NEXT_PUBLIC_LAUNCH_MODE flips at launch, the
 * full sitemap is restored and Search Console submission re-enables.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const launched = process.env.NEXT_PUBLIC_LAUNCH_MODE === "true";
  if (!launched) {
    return [];
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aesdr.com";
  const now = new Date();

  const kitDocUrls = KIT_ENTRIES.map((e) => ({
    url: `${baseUrl}/partners/kit/${e.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/syllabus`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/refund-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },

    // Partner hub (Phase 1)
    { url: `${baseUrl}/partners`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/partners/program`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/partners/curriculum`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/partners/kit`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/partners/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/partners/apply`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: `${baseUrl}/partners/how-we-work`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/partners/who-we-dont-work-with`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/partners/play`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    ...kitDocUrls,
  ];
}
