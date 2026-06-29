import fs from "node:fs/promises";

import { getUnitFilePath } from "@/utils/content/catalog";
import { createClient } from "@/utils/supabase/server";
import { verifyPaidAccess } from "@/utils/access/verifyAccess";

export const dynamic = "force-dynamic";

/**
 * Serves lesson HTML files for rendering inside an iframe.
 * URL: /course/:lessonId/units/:unitId
 *
 * AUDIT (adversarial pass 2026-06-29): this serves the PAID product. It had NO
 * auth/entitlement check, so anyone could `curl /course/1/units/1` and read every
 * unit (the page wrapper gated access, but the iframe source did not). Gate it
 * the same way the page wrapper + the tool routes do.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string; unitId: string }> }
) {
  // AUDIT (adversarial re-audit 2026-06-29): gate on server-trusted access only.
  // The old aesdr_bypass cookie was client-forgeable (document.cookie, === "1"),
  // which would have re-opened this very paywall; admins bypass via isAdminEmail
  // inside verifyPaidAccess, so no cookie is needed.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Sign in to view this lesson.", { status: 401 });
  }
  if (!(await verifyPaidAccess(supabase, user))) {
    return new Response("This lesson requires an active purchase.", { status: 403 });
  }

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
      // AUDIT: was `max-age=3600`, which kept serving the paid asset from the
      // browser cache for up to an hour after access was revoked (refund/
      // dispute). Match the no-store posture of the download routes.
      "Cache-Control": "private, no-store",
    },
  });
}
