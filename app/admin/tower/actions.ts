"use server";

import { revalidatePath } from "next/cache";

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
  type ScoutSweepId,
} from "@/lib/partnerships/anthropic-agents";

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
 * Courier (the cron) does the actual email sending; these only flip state.
 * Approving an email row sets status='approved' and courier transmits it on its
 * next tick. Manual rows (a DM handle / a form) never touch courier — the
 * operator sends by hand and marks them sent here.
 */

/** Approve one drafted outbound row → courier sends it next tick. */
export async function approveDraft(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");

  const supabase = createAdminClient();
  // Only a row that's actually 'ready' (drafted + warden-cleared) can be
  // approved — guards against approving something mid-edit or already sent.
  const { error } = await supabase
    .from("partner_outbound_queue")
    .update({
      status: "approved",
      approved_by: user.email,
      approved_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "ready");
  if (error) throw new Error(error.message);

  revalidatePath("/admin/tower");
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
 * Edit a draft in place — the tower as draft house. Re-runs the mechanical
 * canon gate on the new text and flips warden_cleared accordingly; clears the
 * personalization note (the operator has now taken responsibility for the copy).
 */
export async function editDraft(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!id) throw new Error("Missing id.");
  if (!subject || !body) throw new Error("Subject and body are required.");

  const { clean } = canonCheck(`${subject}\n${body}`);

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("partner_outbound_queue")
    .update({
      subject,
      body,
      warden_cleared: clean,
      personalization_note: clean ? null : "Canon flags remain — review before sending.",
    })
    .eq("id", id)
    .eq("status", "ready");
  if (error) throw new Error(error.message);

  revalidatePath("/admin/tower");
}

/**
 * Mark a manual-channel draft as sent by hand. Writes the immutable sent-log
 * line (so the audit trail is complete across both channels) and flips the row
 * to sent. courier never sees manual rows, so this is the only path that
 * completes them.
 */
export async function markManualSent(formData: FormData) {
  await requireAdmin();
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
  // Append the audit line (idempotency_key unique-indexed — a double-mark no-ops).
  await supabase.from("partner_sent_log").insert({
    queue_id: row.id,
    to_addr: row.to_addr,
    subject: row.subject,
    tier: row.tier,
    idempotency_key: row.idempotency_key,
    model: "manual",
    sent_at: nowIso,
  });
  const { error } = await supabase
    .from("partner_outbound_queue")
    .update({ status: "sent", sent_at: nowIso })
    .eq("id", id)
    .in("status", ["ready", "approved"]);
  if (error) throw new Error(error.message);

  // Start the follow-up ladder clock for a manual cold first-touch, same as
  // courier does for email sends. Guarded so follow-ups never reset it.
  if (row.tier === "cold" && row.related_pipeline_id) {
    await supabase
      .from("partner_pipeline")
      .update({ first_touch_at: nowIso, status: "contacted", updated_at: nowIso })
      .eq("id", row.related_pipeline_id)
      .is("first_touch_at", null);
  }

  revalidatePath("/admin/tower");
}

/** Hold a draft — pull it back off the send path. */
export async function holdDraft(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("partner_outbound_queue")
    .update({ status: "held" })
    .eq("id", id)
    .in("status", ["ready", "approved"]);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/tower");
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

  const model = await getAgentModel("scout");
  const rows = await runScoutSweep(sweep, model);
  if (rows.length === 0) {
    // Nothing to insert; bail without an error so the UI can show "no rows".
    revalidatePath("/admin/tower");
    return;
  }

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
      next_action: "Review and promote, or reject",
    }));

  if (inserts.length > 0) {
    const { error } = await supabase.from("partner_pipeline").insert(inserts);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/tower");
}

/** Promote one sourced row to `enriched` — the operator's seal of approval. */
export async function promoteSourced(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("partner_pipeline")
    .update({ status: "enriched", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "sourced");
  if (error) throw new Error(error.message);
  revalidatePath("/admin/tower");
}

/** Reject one sourced row — moves to `passed`, not deleted. */
export async function rejectSourced(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("partner_pipeline")
    .update({ status: "passed", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "sourced");
  if (error) throw new Error(error.message);
  revalidatePath("/admin/tower");
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
