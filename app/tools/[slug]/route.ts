import fs from "node:fs/promises";
import path from "node:path";

const TOOLS_ROOT = path.join(process.cwd(), "tools", "standalone-html");

/**
 * Serves standalone tool HTML files.
 * URL: /tools/:slug  (slug matches filename without .html)
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
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
