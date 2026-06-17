import { createAdminClient } from "@/utils/supabase/admin";
import { getAgentModel } from "@/lib/partnerships/agent-switch";
import { verdictNextAction } from "@/lib/partnerships/anthropic-agents";
import { runDossierResearch } from "@/lib/partnerships/dossier-research";
import { updateDossierRun, finishDossierRun } from "@/lib/partnerships/dossier-run";
import { logPartnerEvent } from "@/lib/partnerships/events";
import {
  attemptEmailFind,
  emailFinderConfigured,
  sanitizeDomainInput,
} from "@/lib/partnerships/email-finder";

/**
 * Research + save ONE candidate's brief, updating its run row (and diagnostic
 * log) as it goes. Same downstream effects as the old runDossierNow action —
 * the pipeline merge, the structured dossier_brief, the event, the email-finder
 * pass — but driven from the background (after()) so a long research call can't
 * be killed mid-flight. Always closes the run (done / failed); safe inside
 * after().
 */

function safeDomain(input: string | null | undefined): string | null {
  if (!input) return null;
  try {
    return sanitizeDomainInput(input);
  } catch {
    return null;
  }
}

export async function runBriefAndSave(
  pipelineId: string,
  actor: string,
  runId: string | null,
): Promise<{ status: "done" | "failed"; verdict?: string }> {
  const diag: string[] = [];
  const stamp = (line: string) => diag.push(`${new Date().toISOString().slice(11, 19)}  ${line}`);

  try {
    const supabase = createAdminClient();
    const { data: row, error } = await supabase
      .from("partner_pipeline")
      .select("id, name, surface, handle, why_fit, audience_est")
      .eq("id", pipelineId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Candidate not found.");

    const model = await getAgentModel("dossier-enrich");
    stamp(`brief start · model=${model} · ${row.name}`);

    const brief = await runDossierResearch(
      {
        name: row.name as string,
        surface: row.surface as string | null,
        handle: row.handle as string | null,
        existingWhyFit: row.why_fit as string | null,
      },
      model,
      (p) =>
        void updateDossierRun(runId, {
          phase: p.phase,
          searches: p.searches,
          pages_read: p.pagesRead,
        }),
    );

    if (!brief) {
      stamp("the write-up didn't parse into a brief");
      await finishDossierRun(runId, {
        status: "failed",
        error: "The research finished but the brief didn't parse — run it again.",
        phase: "Couldn't read back a brief",
        log: diag,
      });
      return { status: "failed" };
    }

    stamp(
      `brief written · verdict=${brief.verdict} · voice_fit=${brief.voice_fit} · ${brief.contact_path ? "contact found" : "no contact"}${brief.own_domain ? ` · domain ${brief.own_domain}` : ""}`,
    );
    await updateDossierRun(runId, { phase: "Saving the brief…" });

    const nowIso = new Date().toISOString();
    const updated_why_fit = `${row.why_fit ?? ""} | ${brief.first_touch_angle} (conflict: ${brief.conflict_note || brief.conflict}, verdict: ${brief.verdict}) [dossier]`;
    const { error: upErr } = await supabase
      .from("partner_pipeline")
      .update({
        audience_est: brief.audience_est ?? (row.audience_est as number | null),
        voice_fit: brief.voice_fit,
        contact_path: brief.contact_path,
        why_fit: updated_why_fit,
        next_action: verdictNextAction(brief.verdict),
        updated_at: nowIso,
      })
      .eq("id", pipelineId);
    if (upErr) throw new Error(`pipeline update failed: ${upErr.message}`);

    // Structured copy for the room — separate write so a pre-migration database
    // (no dossier_brief column) doesn't fail the whole run.
    await supabase.from("partner_pipeline").update({ dossier_brief: brief }).eq("id", pipelineId);

    await logPartnerEvent({
      pipelineId,
      actor: "dossier",
      kind: "brief_written",
      detail: { model, verdict: brief.verdict, triggered_by: actor },
    });

    // Finder pass rides the brief: if it named their own site, look an email up.
    // A finder hiccup never fails the brief — the room has its own Find email
    // button for retries.
    if (emailFinderConfigured()) {
      try {
        await attemptEmailFind({
          pipelineId,
          name: row.name as string,
          contactPath: brief.contact_path,
          handle: row.handle as string | null,
          extraText: updated_why_fit,
          domainOverride: safeDomain(brief.own_domain),
          via: "dossier",
          actor: "dossier",
        });
        stamp("ran the email-finder pass");
      } catch {
        stamp("email-finder pass hiccupped — retry from the room's Find email");
      }
    }

    await finishDossierRun(runId, {
      status: "done",
      verdict: brief.verdict,
      phase: `Brief ready · ${brief.verdict.replace("_", " ")}`,
      log: diag,
    });
    return { status: "done", verdict: brief.verdict };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    stamp(`ERROR: ${error}`);
    await finishDossierRun(runId, { status: "failed", error, phase: "Hit an error", log: diag });
    return { status: "failed" };
  }
}
