export const dynamic = "force-dynamic";
// The research + email hunt run in after(); this is the ceiling on that work.
// The POST returns in <1s.
export const maxDuration = 200;

import { NextResponse, after } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { runBriefAndSave } from "@/lib/partnerships/brief";
import { createDossierRun } from "@/lib/partnerships/dossier-run";
import { logPartnerEvent } from "@/lib/partnerships/events";
import { assertUnderDailyWall } from "@/lib/partnerships/spend";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * "Accept & prepare" — Option 1's one big button (founder 2026-07-07).
 *
 *   POST /api/admin/accept-and-prepare?id=<pipelineId>
 *     1. checks the $10/day wall (refuses before spending)
 *     2. accepts the candidate (status sourced → enriched) — the human gate
 *     3. kicks the research brief + email hunt off in the background
 *        (the same runBriefAndSave engine as the room's Run brief button)
 *     4. returns { runId } — the button polls /api/admin/run-brief?runId=…
 *
 * The chain deliberately STOPS after research: the machine scores voice-fit,
 * but drafting waits for the founder's explicit fit call in the room
 * (Fits — draft them / Doesn't fit — bin). Nothing here writes a draft and
 * nothing here sends.
 */
export async function POST(request: Request) {
  const user = await requireAdmin();

  const id = new URL(request.url).searchParams.get("id") || "";
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing candidate id." }, { status: 400 });
  }

  // The $10/day wall — refuse before anything is accepted or spent.
  try {
    await assertUnderDailyWall();
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 409 },
    );
  }

  const actor = user.email ?? "admin";
  const supabase = createAdminClient();

  // Accept: sourced → enriched. Guarded on the current status so a double-click
  // (or a card someone already accepted) doesn't re-accept; an already-enriched
  // candidate just proceeds to the research step.
  const { data: accepted, error: accErr } = await supabase
    .from("partner_pipeline")
    .update({ status: "enriched", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "sourced")
    .select("name")
    .maybeSingle();
  if (accErr) {
    return NextResponse.json({ ok: false, error: accErr.message }, { status: 500 });
  }
  if (accepted) {
    await logPartnerEvent({
      pipelineId: id,
      actor,
      kind: "promoted",
      detail: { to: "enriched", via: "accept-and-prepare" },
    });
  } else {
    // Not sourced — only continue if they're already in the research queue.
    const { data: row } = await supabase
      .from("partner_pipeline")
      .select("status")
      .eq("id", id)
      .maybeSingle();
    if (!row) {
      return NextResponse.json({ ok: false, error: "Candidate not found." }, { status: 404 });
    }
    if (row.status !== "enriched") {
      return NextResponse.json(
        { ok: false, error: `Accept & prepare applies to a sourced candidate — this one is '${row.status}'.` },
        { status: 409 },
      );
    }
  }

  const runId = await createDossierRun(id, actor);

  after(async () => {
    try {
      await runBriefAndSave(id, actor, runId);
    } catch (e) {
      console.error(`[accept-and-prepare] ${id} crashed:`, e instanceof Error ? e.message : String(e));
    }
  });

  return NextResponse.json({ ok: true, runId, started: true });
}
