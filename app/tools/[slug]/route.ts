import fs from "node:fs/promises";
import path from "node:path";

import { createClient } from "@/utils/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { ALLOWED_TOOL_SLUGS, evaluateToolGate } from "@/utils/content/catalog";

const TOOLS_ROOT = path.join(process.cwd(), "tools", "standalone-html");

/**
 * Returns true if the user has course access (active purchase, or accepted
 * team_member on a team with an active purchase).
 */
async function userHasAccess(
  userId: string,
  email: string | null | undefined
): Promise<boolean> {
  const supabase = await createClient();

  if (email) {
    const { data } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_email", email.toLowerCase())
      .eq("status", "active")
      .limit(1)
      .maybeSingle();
    if (data) return true;
  }

  const { data: byId } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  if (byId) return true;

  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id, teams!inner(id, purchase_id)")
    .eq("user_id", userId)
    .not("accepted_at", "is", null)
    .limit(1)
    .maybeSingle();

  if (membership) {
    const team = membership.teams as unknown as {
      id: string;
      purchase_id: string | null;
    };
    if (team?.purchase_id) {
      const { data: teamPurchase } = await supabase
        .from("purchases")
        .select("id")
        .eq("id", team.purchase_id)
        .eq("status", "active")
        .maybeSingle();
      if (teamPurchase) return true;
    }
  }

  return false;
}

/**
 * Serves standalone tool HTML files for in-browser use ("OPEN" action).
 * URL: /tools/:slug  (slug matches filename without .html)
 *
 * Gated: user must be authenticated AND have an active purchase (or be an
 * accepted team member on a team with an active purchase, or have the
 * founder bypass cookie).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!ALLOWED_TOOL_SLUGS.has(slug)) {
    return new Response("Tool not found", { status: 404 });
  }

  // Auth + access gate. AUDIT (adversarial re-audit 2026-06-29): admins bypass
  // via server-trusted isAdminEmail — the old aesdr_bypass cookie was
  // client-forgeable (document.cookie, === "1") and would have opened this gate
  // to anyone.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.redirect(
      new URL("/login?reason=no_purchase", _request.url),
      302
    );
  }

  if (!isAdminEmail(user.email)) {
    const ok = await userHasAccess(user.id, user.email);
    if (!ok) {
      return Response.redirect(
        new URL("/login?reason=no_purchase", _request.url),
        302
      );
    }

    // AUDIT (R3-CURR-1 / decision #9): enforce the same completion gate the
    // download route uses (the OPEN route previously gated on purchase only).
    const { data: rows } = await supabase
      .from("course_progress")
      .select("lesson_id, is_completed")
      .eq("user_id", user.id)
      .eq("is_completed", true);

    const completedSet = new Set((rows ?? []).map((r) => r.lesson_id));
    const gate = evaluateToolGate(slug, completedSet);
    if (!gate.ok) {
      return Response.redirect(
        new URL("/dashboard?tool=locked", _request.url),
        302
      );
    }
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
      // AUDIT (adversarial pass): was `max-age=3600`, which served the gated
      // asset for up to an hour after access was revoked (refund/dispute).
      "Cache-Control": "private, no-store",
    },
  });
}
