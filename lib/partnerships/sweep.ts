import { createAdminClient } from "@/utils/supabase/admin";
import { getAgentModel } from "@/lib/partnerships/agent-switch";
import { type ScoutSweepId } from "@/lib/partnerships/anthropic-agents";
import { runBriefAndSave } from "@/lib/partnerships/brief";
import { createDossierRun } from "@/lib/partnerships/dossier-run";
import { researchSweep, type ResearchCandidate } from "@/lib/partnerships/scout-research";
import { assertUnderDailyWall, logAgentSpend } from "@/lib/partnerships/spend";
import { updateSweepRun, finishSweepRun } from "@/lib/partnerships/sweep-run";
import { logPartnerEvents } from "@/lib/partnerships/events";

/**
 * The canonical scout-sweep runner: run the agentic research loop (search +
 * fetch, two-phase, live progress), de-dupe against the pipeline, insert every
 * candidate it surfaced — flagging the ones whose contact path it couldn't
 * verify rather than dropping them — and then, since the warren consolidation
 * (founder 2026-07-15), PREPARE the whole catch before the run closes: each
 * new candidate is auto-promoted to `enriched` and gets its research brief +
 * email hunt run in parallel, so what lands on the floor is a finished card.
 *
 * The human gate moved, it didn't disappear: the brief's reach-out/skip
 * verdict stays advisory, and nothing drafts or sends without a press in the
 * candidate's room. Stamps the run row + diagnostic `log` on every path.
 */

export const VALID_SWEEPS: readonly ScoutSweepId[] = [
  "communities",
  "newsletters_podcasts",
  "practitioners",
];

export function isValidSweep(s: string): s is ScoutSweepId {
  return (VALID_SWEEPS as readonly string[]).includes(s);
}

/** A contact path we'd actually act on: present, not LinkedIn, not a "couldn't
 *  find one" placeholder. Paired with the model's contact_verified flag — used
 *  to FLAG rows, not to drop them. */
function isUsableContact(path: string): boolean {
  const p = path.trim().toLowerCase();
  if (!p) return false;
  if (p.includes("linkedin")) return false;
  if (/couldn'?t|could not|not found|no (public |non-linkedin )?contact|unknown|^n\/?a$|^none$/.test(p)) {
    return false;
  }
  return true;
}

function isVerified(c: ResearchCandidate): boolean {
  return c.contact_verified && isUsableContact(c.contact_path);
}

export type SweepOutcome = {
  status: "done" | "empty" | "failed";
  inserted: number;
  seen: number;
};

/**
 * Run one sweep end to end, updating its status row (and diagnostic log) as it
 * goes. Always closes the run (done / empty / failed). Safe to call from
 * inside after().
 */
export async function runSweepAndInsert(
  sweep: ScoutSweepId,
  actor: string,
  runId: string | null,
): Promise<SweepOutcome> {
  const diag: string[] = [];
  const stamp = (line: string) => diag.push(`${new Date().toISOString().slice(11, 19)}  ${line}`);

  try {
    // The research itself is the sweep's biggest spender — gate it on the
    // postage wall like every other Claude call, and meter what it burns.
    await assertUnderDailyWall();
    const model = await getAgentModel("scout");
    stamp(`research start · sweep=${sweep} · model=${model}`);

    const candidates = await researchSweep({
      sweep,
      model,
      onProgress: (p) =>
        void updateSweepRun(runId, {
          phase: p.phase,
          searches: p.searches,
          pages_read: p.pagesRead,
        }),
      onCostUsd: (usd) => {
        if (usd > 0) stamp(`research cost ~$${usd.toFixed(2)}`);
        void logAgentSpend({ agent: "scout", usd });
      },
    });

    // Keep every named candidate — flag the unverified, don't drop them.
    const named = candidates.filter((c) => c.name.trim().length > 0);
    const seen = named.length;
    const verified = named.filter(isVerified).length;
    await updateSweepRun(runId, { phase: "Scoring and de-duping…", seen });
    stamp(`research surfaced ${seen} candidate${seen === 1 ? "" : "s"}; ${verified} with a verified non-LinkedIn contact`);

    if (seen === 0) {
      stamp("nothing surfaced");
      await finishSweepRun(runId, {
        status: "empty",
        candidates_found: 0,
        seen,
        log: diag,
        phase: "Nothing surfaced",
      });
      return { status: "empty", inserted: 0, seen };
    }

    const supabase = createAdminClient();
    // De-dupe against existing names (case-insensitive).
    const lookupNames = named.map((c) => c.name);
    const { data: existing } = await supabase
      .from("partner_pipeline")
      .select("name")
      .in("name", lookupNames);
    const have = new Set((existing ?? []).map((e) => (e.name as string).toLowerCase()));
    const fresh = named.filter((c) => !have.has(c.name.toLowerCase()));
    const dupes = seen - fresh.length;
    if (dupes > 0) stamp(`${dupes} already in the pipeline`);

    if (fresh.length === 0) {
      await finishSweepRun(runId, {
        status: "empty",
        candidates_found: 0,
        seen,
        log: diag,
        phase: `Found ${seen}, all already in the pipeline`,
      });
      return { status: "empty", inserted: 0, seen };
    }

    const inserts = fresh.map((c) => ({
      name: c.name,
      surface: c.surface,
      handle: c.handle,
      motion: "affiliate",
      archetype: c.archetype,
      audience_est: c.audience_est,
      voice_fit: c.voice_fit,
      status: "enriched", // auto-promoted — the warren consolidation
      contact_path: c.contact_path,
      why_fit: `${c.why_fit}${c.conflict ? ` — conflict: ${c.conflict}` : ""}${isVerified(c) ? "" : " [⚠ contact unverified — confirm before outreach]"}`,
      source_agent: `scout-tower:${sweep}`,
      next_action: "Preparing — fit call, brief & address hunt are running",
    }));

    const { data: created, error } = await supabase
      .from("partner_pipeline")
      .insert(inserts)
      .select("id");
    if (error) throw new Error(`pipeline insert failed: ${error.message}`);
    const createdIds = (created ?? []).map((c) => c.id as string);

    await logPartnerEvents(
      createdIds.flatMap((pid) => [
        { pipelineId: pid, actor: "scout", kind: "sourced", detail: { sweep, model, triggered_by: actor } },
        { pipelineId: pid, actor: "sweep-auto", kind: "promoted", detail: { to: "enriched", via: "sweep consolidation" } },
      ]),
    );
    const freshVerified = fresh.filter(isVerified).length;
    stamp(`inserted ${inserts.length} new (${freshVerified} with a verified contact)`);

    // Prepare the whole catch before closing the run: briefs + email hunts in
    // parallel (sequential wouldn't fit the function window — one brief is
    // 60–120s). Wall math: checked before the sweep started, re-checked per
    // candidate here; a batch can overshoot the $10 wall by at most its own
    // briefs' cost. runBriefAndSave reports failure by return value, so both
    // rejections and returned failures are counted.
    await updateSweepRun(runId, {
      phase: `Preparing ${createdIds.length} card${createdIds.length === 1 ? "" : "s"} — briefs & address hunts…`,
      seen,
    });
    const prep = await Promise.allSettled(
      createdIds.map(async (pid) => {
        await assertUnderDailyWall();
        const briefRunId = await createDossierRun(pid, actor);
        return runBriefAndSave(pid, actor, briefRunId);
      }),
    );
    let prepFailed = 0;
    await Promise.all(
      prep.map((res, i) => {
        const failedMsg =
          res.status === "rejected"
            ? res.reason instanceof Error
              ? res.reason.message
              : String(res.reason)
            : res.value.status === "failed"
              ? "brief run failed — see their room's research log"
              : null;
        if (!failedMsg) return Promise.resolve();
        prepFailed += 1;
        stamp(`prepare failed for ${createdIds[i]}: ${failedMsg.slice(0, 160)}`);
        return supabase
          .from("partner_pipeline")
          .update({
            next_action: `Auto-prepare didn't finish (${failedMsg.slice(0, 120)}) — run the brief from their room.`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", createdIds[i])
          .then(() => undefined);
      }),
    );
    stamp(`prepared ${createdIds.length - prepFailed}/${createdIds.length} cards`);

    await finishSweepRun(runId, {
      status: "done",
      candidates_found: inserts.length,
      seen,
      log: diag,
      phase: `Sweep complete · ${inserts.length} card${inserts.length === 1 ? "" : "s"}${
        prepFailed > 0
          ? ` (${inserts.length - prepFailed} prepared, ${prepFailed} need a manual brief)`
          : " prepared — verdicts called, addresses hunted"
      }`,
    });
    return { status: "done", inserted: inserts.length, seen };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    stamp(`ERROR: ${error}`);
    await finishSweepRun(runId, { status: "failed", error, log: diag, phase: "Hit an error" });
    return { status: "failed", inserted: 0, seen: 0 };
  }
}
