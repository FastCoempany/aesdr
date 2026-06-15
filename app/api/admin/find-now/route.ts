export const dynamic = "force-dynamic";
// One batched BetterContact waterfall over the backlog (~40-90s).
export const maxDuration = 200;

import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { batchFindAndSave, emailFinderConfigured, type BatchRow } from "@/lib/partnerships/email-finder";

/**
 * Manual finder trigger — runs the SAME batchFindAndSave the contact-finder cron
 * runs, but through the admin session instead of cron auth. Use it to clear the
 * backlog right now without waiting on (or depending on) the Vercel cron:
 *
 *   /api/admin/find-now              → enriched candidates
 *   /api/admin/find-now?status=sourced
 *   /api/admin/find-now?limit=10
 *
 * Each call processes up to `limit` candidates that haven't been email-checked.
 * BetterContact bills per found email. Run it a few times to work through all.
 */
export async function GET(request: Request) {
  const user = await requireAdmin();
  if (!emailFinderConfigured()) {
    return NextResponse.json({ error: "EMAIL_FINDER_API_KEY is not set" }, { status: 200 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "enriched";
  const limit = Math.min(Number(url.searchParams.get("limit") || 40), 60);

  const supabase = createAdminClient();
  const { data: rows, error } = await supabase
    .from("partner_pipeline")
    .select("id, name, contact_path, handle, why_fit, dossier_brief")
    .eq("status", status)
    .eq("motion", "affiliate")
    .is("email_checked_at", null)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!rows || rows.length === 0) {
    return NextResponse.json({ nothing_to_find: true, note: "No unchecked candidates at this status." });
  }

  try {
    const result = await batchFindAndSave(rows as BatchRow[], user.email);
    return NextResponse.json({
      note: "Ran the finder now. Re-run /api/admin/state to see found_email populate, or hard-refresh the map.",
      examined: rows.length,
      ...result,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
