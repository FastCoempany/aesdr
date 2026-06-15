export const dynamic = "force-dynamic";
// A batch BetterContact waterfall (~30-90s) plus per-row writes. 180s is well
// within Pro's ceiling and gives the batch room.
export const maxDuration = 180;

import { NextResponse } from "next/server";

import { verifyCronAuth } from "@/lib/cron-auth";
import { isAgentEnabled } from "@/lib/partnerships/agent-switch";
import { createAdminClient } from "@/utils/supabase/admin";
import { batchFindAndSave, emailFinderConfigured, type BatchRow } from "@/lib/partnerships/email-finder";

/**
 * Contact-finder — the reliable replacement for the per-promote after() find.
 * Every 5 min (when its lever is ON), it takes a small batch of ENRICHED
 * candidates that haven't been email-checked yet and runs them through
 * BetterContact in ONE batched request, writing found_email + chipping the map.
 *
 * This covers both fresh promotes and the existing backlog with no per-person
 * clicks. BetterContact bills per found email, so the lever is the credit
 * control: off = no spend.
 */

const BATCH = 8;

export async function GET(request: Request) {
  const authErr = verifyCronAuth(request);
  if (authErr) return authErr;

  // Master switch — OFF by default. Nothing spends until enabled in the tower.
  if (!(await isAgentEnabled("contact-finder"))) {
    return NextResponse.json({ disabled: true });
  }
  if (!emailFinderConfigured()) {
    return NextResponse.json({ error: "EMAIL_FINDER_API_KEY is not set" }, { status: 200 });
  }

  const supabase = createAdminClient();
  const { data: rows, error } = await supabase
    .from("partner_pipeline")
    .select("id, name, contact_path, handle, why_fit, dossier_brief")
    .eq("status", "enriched")
    .eq("motion", "affiliate")
    .is("email_checked_at", null)
    .order("updated_at", { ascending: false })
    .limit(BATCH);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!rows || rows.length === 0) {
    return NextResponse.json({ nothing_to_find: true });
  }

  try {
    const result = await batchFindAndSave(rows as BatchRow[], "contact-finder");
    return NextResponse.json({ examined: rows.length, ...result });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
