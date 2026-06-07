export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { verifyCronAuth } from "@/lib/cron-auth";
import { isAgentEnabled } from "@/lib/partnerships/agent-switch";
import { createAdminClient } from "@/utils/supabase/admin";
import { runDossier } from "@/lib/partnerships/anthropic-agents";

/**
 * Dossier auto-enrich. Runs hourly when the dossier-enrich switch is ON. Takes
 * pipeline rows at status='enriched' that lack a dossier brief (the why_fit
 * column hasn't been marked '[dossier]') and runs the dossier LLM call on
 * each, updating voice_fit / audience_est / contact_path / why_fit in place.
 *
 * Costs real Anthropic tokens per row. Hard-capped at BATCH per tick so a
 * runaway sweep can't burn a fortune.
 *
 * The 'sourced' tier is handled by the operator promoting in the tower — so
 * dossier-enrich only runs on rows the human already accepted. That keeps the
 * cost bounded by the human's promote-rate.
 */

const BATCH = 5;

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
    .select("id, name, surface, handle, why_fit, voice_fit, audience_est, contact_path")
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
    const brief = await runDossier({
      name: r.name as string,
      surface: r.surface as string | null,
      handle: r.handle as string | null,
      existingWhyFit: r.why_fit as string | null,
    });
    if (!brief) {
      failed++;
      continue;
    }
    // Merge: don't overwrite an existing audience_est with null; do refresh
    // voice_fit and contact_path; append the verdict line to why_fit.
    const updated_why_fit = `${r.why_fit ?? ""} | ${brief.first_touch_angle} (conflict: ${brief.conflict_note || brief.conflict}, verdict: ${brief.verdict}) [dossier]`;
    await supabase
      .from("partner_pipeline")
      .update({
        audience_est: brief.audience_est ?? (r.audience_est as number | null),
        voice_fit: brief.voice_fit,
        contact_path: brief.contact_path,
        why_fit: updated_why_fit,
        next_action:
          brief.verdict === "reach_out"
            ? "Send to scribe (auto-drafter picks this up)"
            : brief.verdict === "skip"
              ? "Skip — see why_fit"
              : "Needs more research",
        updated_at: new Date().toISOString(),
      })
      .eq("id", r.id);
    enriched++;
  }

  return NextResponse.json({
    examined: rows?.length ?? 0,
    enriched,
    failed,
  });
}
