"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * The tower's trigger-pulls. Every action here is the human gesture at an
 * irreversible boundary — approving an outbound send, holding one, or clearing
 * a signal off the board. Each is admin-gated and each is one button.
 *
 * Courier (the cron) does the actual sending; these only flip state. Approving
 * a row sets status='approved' and courier transmits it on its next tick.
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

/** Approve every ready row at once — the batch trigger-pull. */
export async function approveAllReady() {
  const user = await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("partner_outbound_queue")
    .update({
      status: "approved",
      approved_by: user.email,
      approved_at: new Date().toISOString(),
    })
    .eq("status", "ready");
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
