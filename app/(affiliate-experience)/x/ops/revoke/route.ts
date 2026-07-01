/**
 * POST /x/ops/revoke — the kill-switch for a leaked invite link.
 *
 * Deletes the prospect (and their events) so the link dies immediately:
 * resolveExperienceAccess's live roster check fails on the very next page load,
 * revoking every already-issued copy of the cookie even though its HMAC is still
 * valid. Ops-authed only.
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { isOpsAuthed } from "../../../_lib/ops-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!(await isOpsAuthed())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let slug = "";
  try {
    const body = (await req.json()) as { slug?: unknown };
    slug = String(body?.slug || "").slice(0, 128).trim();
  } catch {
    /* fall through to the empty-slug guard */
  }
  if (!slug) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = createAdminClient();
  // Events first so a foreign key (if any) doesn't block the prospect delete.
  await supabase
    .from("affiliate_prospect_events")
    .delete()
    .eq("prospect_slug", slug);
  await supabase.from("affiliate_prospects").delete().eq("slug", slug);

  return NextResponse.json({ ok: true });
}
