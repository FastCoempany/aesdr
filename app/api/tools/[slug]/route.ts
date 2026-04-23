import fs from "node:fs/promises";
import path from "node:path";

import { cookies } from "next/headers";

import { createClient } from "@/utils/supabase/server";

const TOOLS_ROOT = path.join(process.cwd(), "tools", "standalone-html");

// Whitelist of valid tool slugs (prevents path traversal)
const ALLOWED_SLUGS = new Set([
  "3.3-aesdr-alignment-contract",
  "6.3-idk-framework",
  "9.2-time-reclaimed-calculator",
  "10.1-ROI-commission-defense-tracker",
  "12.3-72-hr-strike-plan",
]);

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
 * Downloads a standalone AESDR tool HTML file as an attachment.
 * URL: /api/tools/:slug
 *
 * Gated: user must be authenticated AND have an active purchase (or be an
 * accepted team member on a team with an active purchase, or have the
 * founder bypass cookie).
 *
 * Sends `Content-Disposition: attachment` so the browser saves the file
 * instead of rendering it in-tab. Filename matches the slug + ".html".
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!ALLOWED_SLUGS.has(slug)) {
    return new Response("Tool not found", { status: 404 });
  }

  // Auth + purchase gate
  const cookieStore = await cookies();
  const hasBypass = cookieStore.get("aesdr_bypass")?.value === "1";

  if (!hasBypass) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.redirect(
        new URL("/login?reason=no_purchase", request.url),
        302
      );
    }

    const ok = await userHasAccess(user.id, user.email);
    if (!ok) {
      return Response.redirect(
        new URL("/login?reason=no_purchase", request.url),
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

  const filename = `${slug}.html`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
