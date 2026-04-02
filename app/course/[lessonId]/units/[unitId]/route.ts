import fs from "node:fs/promises";

import { getUnitFilePath } from "@/utils/content/catalog";

/**
 * Serves lesson HTML files for rendering inside an iframe.
 * URL: /course/:lessonId/units/:unitId
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string; unitId: string }> }
) {
  const { lessonId, unitId } = await params;
  const filePath = await getUnitFilePath(lessonId, unitId);

  if (!filePath) {
    return new Response("Lesson unit not found", { status: 404 });
  }

  let html: string;
  try {
    html = await fs.readFile(filePath, "utf-8");
  } catch {
    return new Response("Could not read lesson file", { status: 500 });
  }

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
