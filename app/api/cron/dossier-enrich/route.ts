export const dynamic = "force-dynamic";
// Each brief now runs the two-phase research loop (search + fetch, then a
// guaranteed write-up) via the shared runBriefAndSave — the SAME engine the
// "Run brief" button uses. BATCH sequential calls; a tick that gets cut short is
// harmless — each row's writes complete before the next, and the next tick's
// not-ilike-[dossier] filter resumes where this one stopped. The founder's
// per-candidate button is the fast path; this cron grinds the backlog hourly.
export const maxDuration = 300;

import { NextResponse } from "next/server";

import { verifyCronAuth } from "@/lib/cron-auth";
import { isAgentEnabled } from "@/lib/partnerships/agent-switch";
import { createAdminClient } from "@/utils/supabase/admin";
import { runBriefAndSave } from "@/lib/partnerships/brief";

/**
 * Dossier auto-enrich. Runs hourly when the dossier-enrich switch is ON. Takes
 * pipeline rows at status='enriched' that lack a dossier brief (the why_fit
 * column hasn't been marked '[dossier]') and runs the brief on each via
 * runBriefAndSave — same two-phase research + same downstream (pipeline merge,
 * dossier_brief, event, email-finder pass) as the room's button, minus the
 * polled status row (the cron isn't watched).
 *
 * Costs real Anthropic tokens per row. Hard-capped at BATCH per tick so a
 * runaway can't burn a fortune. 'sourced' rows are handled by the operator
 * promoting in the tower, so this only runs on rows the human already accepted.
 */

const BATCH = 2;

export async function GET(request: Request) {
  const authErr = verifyCronAuth(request);
  if (authErr) return authErr;

  // Master switch — OFF by default. Nothing runs until enabled in the tower.
  if (!(await isAgentEnabled("dossier-enrich"))) {
    return NextResponse.json({ disabled: true });
  }

  const supabase = createAdminClient();
  const { data: rows, error } = await supabase
    .from("partner_pipeline")
    .select("id")
    .eq("status", "enriched")
    .eq("motion", "affiliate")
    .not("why_fit", "ilike", "%[dossier]%")
    .order("updated_at", { ascending: true })
    .limit(BATCH);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let enriched = 0;
  let failed = 0;

  for (const r of rows ?? []) {
    // runId=null → no polled status row; the cron isn't watched, but it shares
    // the exact research + save path the button uses.
    const outcome = await runBriefAndSave(r.id as string, "dossier-cron", null);
    if (outcome.status === "done") enriched++;
    else failed++;
  }

  return NextResponse.json({
    examined: rows?.length ?? 0,
    enriched,
    failed,
  });
}
