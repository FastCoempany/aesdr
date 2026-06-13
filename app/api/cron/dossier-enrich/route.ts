export const dynamic = "force-dynamic";
// Each brief runs a server-side web_search + web_fetch loop (self-capped at
// RESEARCH_BUDGET_MS ~80s). BATCH=2 sequential calls fit inside 180s (valid on
// Pro; ceiling is 300s). If a tick still gets cut short, it's harmless: rows
// update one at a time and the next tick's not-ilike-[dossier] filter resumes
// where this one stopped. The founder's per-candidate "Run brief now" button
// is the fast path; this cron just grinds the backlog hourly.
export const maxDuration = 180;

import { NextResponse } from "next/server";

import { verifyCronAuth } from "@/lib/cron-auth";
import { isAgentEnabled, getAgentModel } from "@/lib/partnerships/agent-switch";
import { createAdminClient } from "@/utils/supabase/admin";
import { runDossier, verdictNextAction } from "@/lib/partnerships/anthropic-agents";
import { logPartnerEvent } from "@/lib/partnerships/events";
import {
  attemptEmailFind,
  emailFinderConfigured,
  sanitizeDomainInput,
} from "@/lib/partnerships/email-finder";

/** Model-reported domain → bare host, or null if it isn't one. */
function safeDomain(input: string | null | undefined): string | null {
  if (!input) return null;
  try {
    return sanitizeDomainInput(input);
  } catch {
    return null;
  }
}

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

const BATCH = 2;

export async function GET(request: Request) {
  const authErr = verifyCronAuth(request);
  if (authErr) return authErr;

  // Master switch — OFF by default. Nothing runs until enabled in the tower.
  if (!(await isAgentEnabled("dossier-enrich"))) {
    return NextResponse.json({ disabled: true });
  }

  const supabase = createAdminClient();
  const model = await getAgentModel("dossier-enrich");
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
    const brief = await runDossier(
      {
        name: r.name as string,
        surface: r.surface as string | null,
        handle: r.handle as string | null,
        existingWhyFit: r.why_fit as string | null,
      },
      model,
    );
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
        next_action: verdictNextAction(brief.verdict),
        updated_at: new Date().toISOString(),
      })
      .eq("id", r.id);
    // Structured copy for the room — separate write so a pre-migration
    // database (no dossier_brief column) doesn't fail the merge above.
    await supabase.from("partner_pipeline").update({ dossier_brief: brief }).eq("id", r.id);
    await logPartnerEvent({
      pipelineId: r.id as string,
      actor: "dossier",
      kind: "brief_written",
      detail: { model, verdict: brief.verdict },
    });

    // Finder pass rides the brief (one Prospeo credit, only on a hit). A
    // finder hiccup never fails the enrich tick.
    if (emailFinderConfigured()) {
      try {
        await attemptEmailFind({
          pipelineId: r.id as string,
          name: r.name as string,
          contactPath: brief.contact_path,
          handle: r.handle as string | null,
          extraText: updated_why_fit,
          domainOverride: safeDomain(brief.own_domain),
          via: "dossier",
          actor: "dossier",
        });
      } catch {
        /* retry by hand from the room's Find email button */
      }
    }
    enriched++;
  }

  return NextResponse.json({
    examined: rows?.length ?? 0,
    enriched,
    failed,
  });
}
