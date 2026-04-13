import fs from "node:fs/promises";
import path from "node:path";

const TOOLS_ROOT = path.join(process.cwd(), "tools", "standalone-html");

// Whitelist of valid tool slugs (prevents path traversal)
const ALLOWED_SLUGS = new Set([
  "3.3-aesdr-alignment-contract",
  "6.3-idk-framework",
  "9.2-time-reclaimed-calculator",
  "10.1-ROI-commission-defense-tracker",
  "12.3-72-hr-strike-plan",
]);

/**
 * Serves standalone tool HTML files.
 * URL: /tools/:slug  (slug matches filename without .html)
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!ALLOWED_SLUGS.has(slug)) {
    return new Response("Tool not found", { status: 404 });
  }

  const filePath = path.join(TOOLS_ROOT, `${slug}.html`);

  let html: string;
  try {
    html = await fs.readFile(filePath, "utf-8");
  } catch {
    return new Response("Tool not found", { status: 404 });
  }

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
