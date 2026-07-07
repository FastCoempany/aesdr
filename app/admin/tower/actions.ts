"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { canonCheck } from "@/lib/partnerships/canon-mechanical";
import { runAffiliatePayoutBatch } from "@/app/actions/affiliate";
import {
  PARTNER_AGENTS,
  SUPPORTED_MODELS,
  getAgentModel,
} from "@/lib/partnerships/agent-switch";
import {
  runScoutSweep,
  runDossier,
  verdictNextAction,
  type ScoutSweepId,
} from "@/lib/partnerships/anthropic-agents";
import { logPartnerEvent, logPartnerEvents } from "@/lib/partnerships/events";
import {
  attemptEmailFind,
  emailFinderConfigured,
  sanitizeDomainInput,
} from "@/lib/partnerships/email-finder";

/** Best-effort sanitize of a model-reported domain — bad output becomes null,
 *  never an error. */
function safeDomain(input: string | null | undefined): string | null {
  if (!input) return null;
  try {
    return sanitizeDomainInput(input);
  } catch {
    return null;
  }
}
import {
  renderFirstTouch,
  extractEmail,
  firstTouchIdemKey,
} from "@/lib/partnerships/outreach-templates";
import { sendOutboundRow } from "@/lib/partnerships/courier-send";
import { assertUnderDailyWall, logAgentSpend } from "@/lib/partnerships/spend";
import { getSuppressedEmails } from "@/lib/email";

/** Re-render the tower and a candidate's room after a state change. */
function revalidateCandidate(pipelineId: string | null | undefined) {
  revalidatePath("/admin/tower");
  revalidatePath("/admin/tower/pipeline");
  if (pipelineId) revalidatePath(`/admin/tower/candidate/${pipelineId}`);
}

const VALID_SWEEPS: readonly ScoutSweepId[] = [
  "communities",
  "newsletters_podcasts",
  "practitioners",
];

/**
 * The tower's trigger-pulls. Every action here is the human gesture at an
 * irreversible boundary — approving an outbound send, holding one, editing a
 * draft, marking a hand-sent message done, or clearing a signal off the board.
 * Each is admin-gated and each is one gesture.
 *
 * sendOutboundRow (behind the Send now button) does the actual email sending;
 * these only flip state. Approving an email row sets status='approved' — armed,
 * waiting for the operator's Send now click. Manual rows (a DM handle / a form)
 * the operator sends by hand and marks sent here.
 */

/** Approve one drafted outbound row → armed for the Send now button. */
export async function approveDraft(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");

  const supabase = createAdminClient();
  // Only a row that's actually 'ready' (drafted + warden-cleared) can be
  // approved — guards against approving something mid-edit or already sent.
  const { data: row, error } = await supabase
    .from("partner_outbound_queue")
    .update({
      status: "approved",
      approved_by: user.email,
      approved_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "ready")
    .select("related_pipeline_id, subject")
    .maybeSingle();
  if (error) throw new Error(error.message);

  if (row?.related_pipeline_id) {
    await logPartnerEvent({
      pipelineId: row.related_pipeline_id,
      actor: user.email,
      kind: "approved",
      detail: { subject: row.subject },
    });
  }
  revalidateCandidate(row?.related_pipeline_id);
}

/**
 * Approve every email-channel ready row at once — the batch trigger-pull.
 * Only touches email rows (manual rows are sent by hand). Fetches then updates
 * by id so it stays correct before/after the send_channel migration.
 */
export async function approveAllReady() {
  const user = await requireAdmin();
  const supabase = createAdminClient();

  const { data: rows, error: readErr } = await supabase
    .from("partner_outbound_queue")
    .select("*")
    .eq("status", "ready");
  if (readErr) throw new Error(readErr.message);

  const ids = (rows ?? [])
    .filter((r) => (r.send_channel ?? "email") === "email")
    .map((r) => r.id);
  if (ids.length === 0) {
    revalidatePath("/admin/tower");
    return;
  }

  const { error } = await supabase
    .from("partner_outbound_queue")
    .update({
      status: "approved",
      approved_by: user.email,
      approved_at: new Date().toISOString(),
    })
    .in("id", ids)
    .eq("status", "ready");
  if (error) throw new Error(error.message);

  revalidatePath("/admin/tower");
}

/**
 * Send one ARMED (status='approved') email row immediately — the tower's manual
 * click-to-send. Reuses the courier's exact send path (sendOutboundRow), so the
 * claim-before-send idempotency holds even if a courier tick races this click,
 * and a double-click can't double-send. No cron required: the mail is gone by
 * the time this action returns.
 *
 * Guard chain: admin-gated · email-channel only (manual rows go by hand) · must
 * already be 'approved' (you pressed Ready first), so an unreviewed draft can't
 * fire. The Send button also carries a confirm dialog — see page.tsx.
 */
export async function sendNow(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");

  const supabase = createAdminClient();
  const { data: row, error } = await supabase
    .from("partner_outbound_queue")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) throw new Error("Draft not found.");
  if ((row.send_channel ?? "email") !== "email") {
    throw new Error("Manual rows are delivered by hand — use Mark sent.");
  }
  if (row.status !== "approved") {
    throw new Error("Press Ready before sending.");
  }

  await sendOutboundRow(supabase, row, new Date().toISOString(), user.email);
  // Don't throw on a send failure — sendOutboundRow already flipped the row to
  // 'failed' with the error, so the card shows a clear red "didn't send" badge
  // instead of a jarring full-page error. Either way (sent ✓ or failed ✗) the
  // revalidate renders the result right where the operator clicked.
  revalidateCandidate(row.related_pipeline_id);
}

/**
 * Edit a draft in place — the tower as draft house. Re-runs the mechanical
 * canon gate on the new text and flips warden_cleared accordingly; clears the
 * personalization note (the operator has now taken responsibility for the copy).
 */
export async function editDraft(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!id) throw new Error("Missing id.");
  if (!subject || !body) throw new Error("Subject and body are required.");

  const { clean } = canonCheck(`${subject}\n${body}`);

  const supabase = createAdminClient();
  const { data: row, error } = await supabase
    .from("partner_outbound_queue")
    .update({
      subject,
      body,
      warden_cleared: clean,
      personalization_note: clean ? null : "Canon flags remain — review before sending.",
    })
    .eq("id", id)
    .in("status", ["ready", "approved"])
    .select("related_pipeline_id")
    .maybeSingle();
  if (error) throw new Error(error.message);

  if (row?.related_pipeline_id) {
    await logPartnerEvent({
      pipelineId: row.related_pipeline_id,
      actor: user.email,
      kind: "draft_edited",
      detail: { warden_cleared: clean },
    });
  }
  revalidateCandidate(row?.related_pipeline_id);
}

/**
 * Mark a manual-channel draft as sent by hand. Writes the immutable sent-log
 * line (so the audit trail is complete across both channels) and flips the row
 * to sent. courier never sees manual rows, so this is the only path that
 * completes them.
 */
export async function markManualSent(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");

  const supabase = createAdminClient();
  const { data: row, error: readErr } = await supabase
    .from("partner_outbound_queue")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (readErr) throw new Error(readErr.message);
  if (!row) throw new Error("Draft not found.");

  const nowIso = new Date().toISOString();
  // Append the audit line. This is the whole point of the function (a complete
  // sent-log across both channels), so a failed write must NOT be ignored — only
  // a genuine double-mark (23505 on the unique idempotency_key) is safe to pass.
  // AUDIT (final pass): the error was previously unchecked, so a real insert
  // failure would still flip the row to 'sent' with no audit trail.
  const { error: logErr } = await supabase.from("partner_sent_log").insert({
    queue_id: row.id,
    to_addr: row.to_addr,
    subject: row.subject,
    tier: row.tier,
    idempotency_key: row.idempotency_key,
    model: "manual",
    sent_at: nowIso,
  });
  if (logErr && logErr.code !== "23505") {
    throw new Error(`Failed to write sent-log: ${logErr.message}`);
  }
  const { error } = await supabase
    .from("partner_outbound_queue")
    .update({ status: "sent", sent_at: nowIso })
    .eq("id", id)
    .in("status", ["ready", "approved"]);
  if (error) throw new Error(error.message);

  if (row.related_pipeline_id) {
    await logPartnerEvent({
      pipelineId: row.related_pipeline_id,
      actor: user.email,
      kind: "sent",
      detail: { channel: "manual", subject: row.subject },
    });
  }

  // Start the follow-up ladder clock for a manual cold first-touch, same as
  // courier does for email sends. Guarded so follow-ups never reset it.
  if (row.tier === "cold" && row.related_pipeline_id) {
    const { data: stamped } = await supabase
      .from("partner_pipeline")
      .update({ first_touch_at: nowIso, status: "contacted", updated_at: nowIso })
      .eq("id", row.related_pipeline_id)
      .is("first_touch_at", null)
      .select("id")
      .maybeSingle();
    if (stamped) {
      await logPartnerEvent({
        pipelineId: row.related_pipeline_id,
        actor: user.email,
        kind: "contacted",
        detail: { via: "manual first touch" },
      });
    }
  }

  revalidateCandidate(row.related_pipeline_id);
}

/** Hold a draft — pull it back off the send path. */
export async function holdDraft(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");

  const supabase = createAdminClient();
  const { data: row, error } = await supabase
    .from("partner_outbound_queue")
    .update({ status: "held" })
    .eq("id", id)
    .in("status", ["ready", "approved"])
    .select("related_pipeline_id")
    .maybeSingle();
  if (error) throw new Error(error.message);

  if (row?.related_pipeline_id) {
    await logPartnerEvent({
      pipelineId: row.related_pipeline_id,
      actor: user.email,
      kind: "held",
    });
  }
  revalidateCandidate(row?.related_pipeline_id);
}

/**
 * Put a held or failed draft back on the path: status → 'ready', so it
 * reappears in the draft house for a fresh approve. This is the release valve
 * Hold never had — without it a held/failed draft was a dead-end.
 */
export async function releaseDraft(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");

  const supabase = createAdminClient();
  const { data: row, error } = await supabase
    .from("partner_outbound_queue")
    .update({ status: "ready", error: null })
    .eq("id", id)
    .in("status", ["held", "failed"])
    .select("related_pipeline_id")
    .maybeSingle();
  if (error) throw new Error(error.message);

  if (row?.related_pipeline_id) {
    await logPartnerEvent({
      pipelineId: row.related_pipeline_id,
      actor: user.email,
      kind: "released",
    });
  }
  revalidateCandidate(row?.related_pipeline_id);
}

/**
 * Run a real payout for one affiliate from the tower's Payouts card. Thin
 * wrapper over the production batch processor (aggregates cleared-unpaid
 * attributions → inserts the payout row → Stripe Connect transfer → marks
 * paid → emails the affiliate). The processor is admin-gated and only pays an
 * affiliate whose Stripe account is enabled; we just re-revalidate the tower.
 *
 * This is the one money gate — the click is real. The card shows the dry-run
 * total before you press it, and PayoutButton makes you confirm.
 */
export async function executePayout(formData: FormData) {
  await requireAdmin();
  await runAffiliatePayoutBatch(formData);
  revalidatePath("/admin/tower");
}

/**
 * Flip an agent's master switch on or off. This is the start/pause lever —
 * a cron does nothing on its scheduled tick unless its switch is enabled here.
 * OFF is the default for every agent; the operator turns each on deliberately.
 */
export async function setAgentSwitch(formData: FormData) {
  const user = await requireAdmin();
  const agent = String(formData.get("agent") ?? "");
  const enabled = String(formData.get("enabled") ?? "") === "true";
  if (!(PARTNER_AGENTS as readonly string[]).includes(agent)) {
    throw new Error("Unknown agent.");
  }
  const supabase = createAdminClient();
  const { error } = await supabase.from("agent_switches").upsert(
    {
      agent,
      enabled,
      updated_at: new Date().toISOString(),
      updated_by: user.email,
    },
    { onConflict: "agent" },
  );
  if (error) throw new Error(error.message);
  revalidatePath("/admin/tower");
}

/**
 * Set the model an LLM agent should use. Currently only scout + dossier-enrich
 * read this (the deterministic agents don't call an LLM). Stored in
 * agent_switches.model alongside the on/off flag.
 */
export async function setAgentModel(formData: FormData) {
  const user = await requireAdmin();
  const agent = String(formData.get("agent") ?? "");
  const model = String(formData.get("model") ?? "");
  if (!agent) throw new Error("Missing agent.");
  if (!(SUPPORTED_MODELS as readonly string[]).includes(model)) {
    throw new Error("Unknown model.");
  }
  const supabase = createAdminClient();
  const { error } = await supabase.from("agent_switches").upsert(
    {
      agent,
      model,
      updated_at: new Date().toISOString(),
      updated_by: user.email,
    },
    { onConflict: "agent" },
  );
  if (error) throw new Error(error.message);
  revalidatePath("/admin/tower");
}

/**
 * Run one scout sweep on demand from the tower button. Inserts whatever Claude
 * returns as `sourced` rows in partner_pipeline — NOT enriched. The founder
 * reviews each row and either promotes it (to `enriched`) or rejects it (to
 * `passed`). This is the safety pattern for LLM-sourced data: the model writes,
 * the human approves.
 *
 * Costs real Anthropic API tokens per click.
 */
export async function runScoutSweepAction(formData: FormData) {
  const user = await requireAdmin();
  const sweep = String(formData.get("sweep") ?? "") as ScoutSweepId;
  if (!VALID_SWEEPS.includes(sweep)) throw new Error("Unknown sweep.");

  // Failures here land as an inline banner on the tower, not the masked
  // production error page — the operator needs the real message (missing env
  // var, API refusal, constraint violation) to act on it.
  let inserted = 0;
  let returned = 0;
  let failure: string | null = null;
  try {
    // The $10/day wall — refuse to start a paid run once today's ledger is full.
    await assertUnderDailyWall();
    const model = await getAgentModel("scout");
    const rows = await runScoutSweep(sweep, model, (usd) => {
      void logAgentSpend({ agent: "scout", usd });
    });
    returned = rows.length;

    if (rows.length > 0) {
      const supabase = createAdminClient();
      // De-dupe against existing names (case-insensitive). Anything that already
      // exists in the pipeline is skipped — scout will surface dupes occasionally.
      const names = rows.map((r) => r.name);
      const { data: existing } = await supabase
        .from("partner_pipeline")
        .select("name")
        .in("name", names);
      const have = new Set(
        (existing ?? []).map((e) => (e.name as string).toLowerCase()),
      );

      const inserts = rows
        .filter((r) => !have.has(r.name.toLowerCase()))
        .map((r) => ({
          name: r.name,
          surface: r.surface,
          handle: r.handle,
          motion: "affiliate",
          archetype: r.archetype,
          audience_est: r.audience_est,
          voice_fit: r.voice_fit,
          status: "sourced", // human review before promotion to 'enriched'
          contact_path: r.contact_path,
          why_fit: `${r.why_fit} [scout/${sweep}, ${user.email}]`,
          source_agent: `scout-tower:${sweep}`,
          next_action: "Review and accept, or reject",
        }));

      if (inserts.length > 0) {
        const { data: created, error } = await supabase
          .from("partner_pipeline")
          .insert(inserts)
          .select("id");
        if (error) throw new Error(error.message);
        await logPartnerEvents(
          (created ?? []).map((c) => ({
            pipelineId: c.id as string,
            actor: "scout",
            kind: "sourced",
            detail: { sweep, model, triggered_by: user.email },
          })),
        );
      }
      inserted = inserts.length;
    }
  } catch (e) {
    failure = e instanceof Error ? e.message : String(e);
  }

  revalidatePath("/admin/tower");
  // redirect() throws internally, so it must stay outside the try block.
  if (failure !== null) {
    redirect(`/admin/tower?sweep_error=${encodeURIComponent(failure.slice(0, 300))}`);
  }
  redirect(`/admin/tower?sweep_ok=${inserted}&sweep_seen=${returned}`);
}

/** Resolve the optional return_to field to a safe in-tower path. */
function towerReturnPath(formData: FormData): string | null {
  const raw = String(formData.get("return_to") ?? "");
  return raw.startsWith("/admin/tower") ? raw : null;
}

/**
 * Promote one sourced row to `enriched` — the operator's seal of approval.
 * From the review queue this redirects back with the door banner ("moved to
 * Research — open their room"); from the candidate's room it returns there.
 */
export async function promoteSourced(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");
  const supabase = createAdminClient();
  const { data: updated, error } = await supabase
    .from("partner_pipeline")
    .update({ status: "enriched", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "sourced")
    .select("name")
    .maybeSingle();
  if (error) throw new Error(error.message);

  if (updated) {
    await logPartnerEvent({
      pipelineId: id,
      actor: user.email,
      kind: "promoted",
      detail: { to: "enriched" },
    });
    // The contact-finder cron (every 5 min) finds the email once they're
    // enriched — reliable now that the coming-soon middleware gate no longer
    // 302s cron requests. (Inline-on-promote was a stopgap while crons were
    // dead; reverted so promotes are instant again.)
  }
  revalidateCandidate(id);

  const returnTo = towerReturnPath(formData);
  if (returnTo) redirect(returnTo);
  if (updated) {
    redirect(
      `/admin/tower?promoted=${id}&promoted_name=${encodeURIComponent(updated.name as string)}`,
    );
  }
  redirect("/admin/tower");
}

/**
 * "They replied — hands off." Moves a candidate to `replied`, the
 * do-not-interrupt state (founder 2026-07-07): the follow-up ladder halts on
 * it, and nothing drafts or nudges them until you move them again. Replies
 * themselves live in your inbox — this status flip is what keeps the machine
 * out of a live conversation.
 */
export async function markReplied(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");
  const supabase = createAdminClient();
  const { data: updated, error } = await supabase
    .from("partner_pipeline")
    .update({ status: "replied", updated_at: new Date().toISOString() })
    .eq("id", id)
    .in("status", ["contacted", "enriched"])
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);

  if (updated) {
    await logPartnerEvent({
      pipelineId: id,
      actor: user.email,
      kind: "replied_marked",
      detail: { to: "replied" },
    });
  }
  revalidateCandidate(id);
  const returnTo = towerReturnPath(formData);
  redirect(returnTo || `/admin/tower/candidate/${id}`);
}

/**
 * The way back out of hands-off: the conversation ran its course without a
 * deal, so outreach may resume. replied → contacted (the ladder's halt (a)
 * releases; last-touch age still shows on the card).
 */
export async function resumeOutreach(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");
  const supabase = createAdminClient();
  const { data: updated, error } = await supabase
    .from("partner_pipeline")
    .update({ status: "contacted", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "replied")
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);

  if (updated) {
    await logPartnerEvent({
      pipelineId: id,
      actor: user.email,
      kind: "reconsidered",
      detail: { to: "contacted", from: "replied" },
    });
  }
  revalidateCandidate(id);
  const returnTo = towerReturnPath(formData);
  redirect(returnTo || `/admin/tower/candidate/${id}`);
}

/**
 * Pass on a not-yet-contacted candidate — sourced or enriched — into the bin
 * (status 'passed'). Never deleted; Reconsider pulls them back out.
 */
export async function rejectSourced(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");
  const supabase = createAdminClient();
  const { data: updated, error } = await supabase
    .from("partner_pipeline")
    .update({ status: "passed", updated_at: new Date().toISOString() })
    .eq("id", id)
    .in("status", ["sourced", "enriched"])
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);

  if (updated) {
    await logPartnerEvent({
      pipelineId: id,
      actor: user.email,
      kind: "rejected",
      detail: { to: "passed" },
    });
  }
  revalidateCandidate(id);
  const returnTo = towerReturnPath(formData);
  redirect(returnTo ?? "/admin/tower");
}

/**
 * Pull a candidate back out of the bin. If research already exists they
 * return to 'enriched' (the brief is kept, nothing is redone); otherwise back
 * to 'sourced', re-entering the review queue.
 */
export async function reconsiderPassed(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");
  const supabase = createAdminClient();

  const { data: row, error: readErr } = await supabase
    .from("partner_pipeline")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (readErr) throw new Error(readErr.message);
  if (!row) throw new Error("Candidate not found.");
  const hasBrief =
    row.dossier_brief != null ||
    (((row.why_fit as string | null) ?? "").includes("[dossier]"));
  const dest = hasBrief ? "enriched" : "sourced";

  const { data: updated, error } = await supabase
    .from("partner_pipeline")
    .update({ status: dest, updated_at: new Date().toISOString() })
    .eq("id", id)
    .in("status", ["passed", "cold"])
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);

  if (updated) {
    await logPartnerEvent({
      pipelineId: id,
      actor: user.email,
      kind: "reconsidered",
      detail: { to: dest },
    });
  }
  revalidateCandidate(id);
  const returnTo = towerReturnPath(formData);
  redirect(returnTo ?? `/admin/tower/candidate/${id}`);
}

/**
 * Run the dossier research call for ONE candidate, from their room. Same merge
 * the hourly cron does, plus the structured brief (dossier_brief jsonb, best-
 * effort until the 20260612 migration). Costs real Anthropic tokens per press;
 * the room's button confirms first. Failures come back as an inline banner.
 */
export async function runDossierNow(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");

  let failure: string | null = null;
  try {
    // The $10/day wall — refuse to start a paid run once today's ledger is full.
    await assertUnderDailyWall();
    const supabase = createAdminClient();
    const { data: row, error } = await supabase
      .from("partner_pipeline")
      .select("id, name, surface, handle, why_fit, audience_est")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Candidate not found.");

    const model = await getAgentModel("dossier-enrich");
    const brief = await runDossier(
      {
        name: row.name as string,
        surface: row.surface as string | null,
        handle: row.handle as string | null,
        existingWhyFit: row.why_fit as string | null,
      },
      model,
    );
    if (!brief) throw new Error("The brief reply didn't parse — run it again.");

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
      .eq("id", id);
    if (upErr) throw new Error(upErr.message);

    // Structured copy for the room — separate write so a pre-migration
    // database (no dossier_brief column) doesn't fail the whole run.
    await supabase.from("partner_pipeline").update({ dossier_brief: brief }).eq("id", id);

    await logPartnerEvent({
      pipelineId: id,
      actor: "dossier",
      kind: "brief_written",
      detail: { model, verdict: brief.verdict, triggered_by: user.email },
    });

    // Finder pass rides the brief: if it named their own site but no email,
    // look one up. A finder hiccup never fails the brief — the room has its
    // own Find email button for retries.
    if (emailFinderConfigured()) {
      try {
        await attemptEmailFind({
          pipelineId: id,
          name: row.name as string,
          contactPath: brief.contact_path,
          handle: row.handle as string | null,
          extraText: updated_why_fit,
          domainOverride: safeDomain(brief.own_domain),
          via: "dossier",
          actor: "dossier",
        });
      } catch {
        /* surfaced via the room's Find email button instead */
      }
    }
  } catch (e) {
    failure = e instanceof Error ? e.message : String(e);
  }

  revalidateCandidate(id);
  if (failure !== null) {
    redirect(`/admin/tower/candidate/${id}?err=${encodeURIComponent(failure.slice(0, 300))}`);
  }
  redirect(`/admin/tower/candidate/${id}?ok=brief`);
}

/**
 * Draft the first-touch for ONE enriched candidate, from their room — the same
 * deterministic template-fill scribe runs, minus scribe's voice-fit ≥ 4 bar
 * (pressing this IS the operator's override). The shared idempotency key means
 * scribe and this button can never double-draft. No LLM call; costs nothing.
 */
export async function draftNow(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");

  let failure: string | null = null;
  try {
    const supabase = createAdminClient();
    const { data: row, error } = await supabase
      .from("partner_pipeline")
      .select("id, name, surface, handle, contact_path, why_fit, status, dossier_brief")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Candidate not found.");
    if (row.status !== "enriched") {
      throw new Error("Scribe draft applies to a candidate at 'enriched' — accept them first.");
    }

    const key = firstTouchIdemKey(id);
    const { data: existing } = await supabase
      .from("partner_outbound_queue")
      .select("id, status")
      .eq("idempotency_key", key)
      .maybeSingle();
    if (existing) {
      throw new Error(`A first-touch draft already exists (status '${existing.status}') — see Drafts below.`);
    }

    const rendered = renderFirstTouch({
      name: row.name as string,
      surface: row.surface as string | null,
      handle: row.handle as string | null,
      why_fit: row.why_fit as string | null,
      first_touch_angle:
        (row.dossier_brief as { first_touch_angle?: string | null } | null)
          ?.first_touch_angle ?? null,
    });
    const { clean, hits } = canonCheck(`${rendered.subject}\n${rendered.body}`);
    const email = extractEmail(row.contact_path as string | null);
    // Suppression gate (founder 2026-07-07): never draft to an address that
    // bounced, complained, or unsubscribed. Fails closed like the send-side gate.
    if (email) {
      const suppressed = await getSuppressedEmails([email]);
      if (suppressed.has(email.toLowerCase())) {
        throw new Error(
          `${email} is on the suppression list (bounce / complaint / unsubscribe) — not drafting. Use a different contact path if you have one.`,
        );
      }
    }
    const wardenCleared = clean && rendered.unfilled.length === 0;
    const noteParts: string[] = [];
    if (rendered.unfilled.length > 0) {
      noteParts.push(`Fill before sending: ${rendered.unfilled.join(", ")}`);
    }
    if (!clean) {
      noteParts.push(`Canon flags: ${hits.map((h) => `"${h.term}" (${h.hint})`).join("; ")}`);
    }

    const { error: insErr } = await supabase.from("partner_outbound_queue").insert({
      to_addr: email || (row.contact_path as string | null) || (row.handle as string | null) || "(no contact path)",
      subject: rendered.subject,
      body: rendered.body,
      tier: "cold",
      status: "ready",
      warden_cleared: wardenCleared,
      send_after: new Date().toISOString(),
      idempotency_key: key,
      related_pipeline_id: id,
      drafted_by: `draft-now:${user.email}`,
      draft_source: `tower-draft-now:${rendered.templateId}`,
      send_channel: email ? "email" : "manual",
      personalization_note: noteParts.join(" · ") || null,
    });
    if (insErr) throw new Error(insErr.message);

    await logPartnerEvent({
      pipelineId: id,
      actor: user.email,
      kind: "drafted",
      detail: { via: "draft-now", template: rendered.templateId, warden_cleared: wardenCleared },
    });
  } catch (e) {
    failure = e instanceof Error ? e.message : String(e);
  }

  revalidateCandidate(id);
  if (failure !== null) {
    redirect(`/admin/tower/candidate/${id}?err=${encodeURIComponent(failure.slice(0, 300))}`);
  }
  redirect(`/admin/tower/candidate/${id}?ok=draft`);
}

/**
 * Look up an email for ONE candidate from their room — runs BetterContact's
 * waterfall, one credit only on a found email. Verified results go straight into the contact path
 * (drafts then route as real email sends); unverified results wait on the
 * brief card for an explicit "use anyway".
 */
export async function findEmailNow(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");

  let failure: string | null = null;
  let okParam = "email";
  let triedN = 0;
  try {
    const supabase = createAdminClient();
    const { data: row, error } = await supabase
      .from("partner_pipeline")
      .select("id, name, contact_path, handle, why_fit")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Candidate not found.");

    // Operator-pasted domain wins; a bad paste throws with a clear message.
    const pasted = String(formData.get("domain") ?? "").trim();
    const domainOverride = pasted ? sanitizeDomainInput(pasted) : null;

    const result = await attemptEmailFind({
      pipelineId: id,
      name: row.name as string,
      contactPath: row.contact_path as string | null,
      handle: row.handle as string | null,
      extraText: row.why_fit as string | null,
      domainOverride,
      via: "find-now",
      actor: user.email,
      force: true,
    });
    triedN = result.tried.length;
    if (result.skipped === "has_email") {
      throw new Error("The contact path already has an email — nothing to find.");
    }
    if (result.skipped === "no_domain") {
      throw new Error(
        "Couldn't form a single domain to search — their record has only platform links and their name didn't yield a guessable domain. Paste their site in the box next to Find email.",
      );
    }
    okParam = !result.found ? "email_none" : result.applied ? "email" : "email_risky";
  } catch (e) {
    failure = e instanceof Error ? e.message : String(e);
  }

  revalidateCandidate(id);
  if (failure !== null) {
    redirect(`/admin/tower/candidate/${id}?err=${encodeURIComponent(failure.slice(0, 300))}`);
  }
  redirect(
    `/admin/tower/candidate/${id}?ok=${okParam}${okParam === "email_none" ? `&tried=${triedN}` : ""}`,
  );
}

/**
 * Operator override: take the unverified (catch-all/unknown) email the finder
 * surfaced and put it on the contact path anyway — labeled so the risk stays
 * visible all the way to the draft.
 */
export async function useFoundEmail(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");

  const supabase = createAdminClient();
  const { data: row, error } = await supabase
    .from("partner_pipeline")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) throw new Error("Candidate not found.");

  const fe = (row.dossier_brief as { found_email?: { email: string; status: string } } | null)
    ?.found_email;
  if (!fe?.email) throw new Error("No found email on file for this candidate.");

  const { error: upErr } = await supabase
    .from("partner_pipeline")
    .update({
      contact_path: `${fe.email} (unverified ${fe.status.toLowerCase()} — verify before send) · ${(row.contact_path as string | null) ?? ""}`.replace(/ · $/, ""),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (upErr) throw new Error(upErr.message);

  await logPartnerEvent({
    pipelineId: id,
    actor: user.email,
    kind: "email_used",
    detail: { email: fe.email, status: fe.status },
  });
  revalidateCandidate(id);
  redirect(`/admin/tower/candidate/${id}?ok=email`);
}

/** Clear a signal off the decision board. */
export async function handleSignal(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("partner_signals")
    .update({ handled_at: new Date().toISOString(), handled_by: user.email })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/tower");
}
