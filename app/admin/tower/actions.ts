"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { canonCheck } from "@/lib/partnerships/canon-mechanical";

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
