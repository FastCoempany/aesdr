import type { MetadataRoute } from "next";

/**
 * Sitemap for public pages. Empty during pre-launch (robots.txt blocks crawling).
 * Populate with public URLs after launch and submit to Google Search Console.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.SITE_URL || "https://aesdr.com";

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/terms`, lastModified: new Date() },
    { url: `${baseUrl}/privacy`, lastModified: new Date() },
    { url: `${baseUrl}/refund-policy`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
  ];
}
