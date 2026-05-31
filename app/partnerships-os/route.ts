import { readFileSync } from "fs";
import { join } from "path";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin();

  const html = readFileSync(
    join(process.cwd(), "content/internal/partnerships-os.html"),
    "utf8",
  );

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
