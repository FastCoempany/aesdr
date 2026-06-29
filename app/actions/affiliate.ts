"use server";

import { revalidatePath } from "next/cache";
import * as Sentry from "@sentry/nextjs";

import { requireAdmin } from "@/lib/admin";
import { generateSlug } from "@/lib/affiliate";
import { hasFtcDisclosure } from "@/lib/ftc-disclosure";
import { applyClawbacks } from "@/lib/payout-math";
import { findUserIdByEmail } from "@/lib/auth-users";
import {
  getAffiliateById,
  getAffiliateForUser,
  gateRequirementFor,
  STRIKE_THRESHOLD,
  type StrikeEntry,
} from "@/lib/affiliate-entity";
import {
  sendAffiliateCopyApprovedEmail,
  sendAffiliateCopyDeclinedEmail,
  sendAffiliateCopyEditsRequestedEmail,
  sendAffiliateGateClearedEmail,
  sendAffiliateOnboardingEmail,
  sendAffiliatePauseEmail,
} from "@/lib/email";
import { logEvent } from "@/lib/events";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

type Result = { ok: true; data?: Record<string, unknown> } | { ok: false; error: string };

/**
 * Allowed channel / format values for copy submissions. Kept in lockstep with
 * the SubmitCopyForm option lists (app/affiliates/dashboard/submissions/
 * SubmitCopyForm.tsx). Server-validated (R3-AF-8) so a hand-crafted POST
 * can't store an arbitrary string.
 */
const SUBMISSION_CHANNELS = new Set([
  "newsletter",
  "podcast",
  "twitter",
  "linkedin",
  "youtube",
  "tiktok",
  "instagram",
  "community",
  "course",
  "blog",
  "other",
]);
const SUBMISSION_FORMATS = new Set([
  "post",
  "email",
  "script",
  "thread",
  "video",
  "audio",
  "long_form",
  "other",
]);

/**
 * Create a new affiliate link for the calling user. The user must be linked
 * to a real `affiliates` row (via affiliates.user_id). Slug is taken from
 * that server-trusted row; affiliate names the label only.
 */
export async function createAffiliateLink(formData: FormData): Promise<Result> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to manage links." };

  // AUDIT (P0-9): authorize off the server-trusted affiliates row, NOT
  // client-writable user_metadata.is_affiliate / affiliate_slug. A user
  // could set those via supabase.auth.updateUser({ data }) and mint links
  // under any slug. The slug now comes from the matched row.
  const affiliate = await getAffiliateForUser({ userId: user.id });
  if (!affiliate) {
    return { ok: false, error: "Your account isn't set up for the Affiliate Program. Email hello@aesdr.com." };
  }
  const affiliateSlug = affiliate.slug;

  const destination =
    String(formData.get("destination") ?? "https://aesdr.com/").trim() ||
    "https://aesdr.com/";
  const label = String(formData.get("label") ?? "").trim().slice(0, 80) || null;
  const utm_source = String(formData.get("utm_source") ?? "").trim().slice(0, 50) || null;
  const utm_medium = String(formData.get("utm_medium") ?? "").trim().slice(0, 50) || null;
  const utm_campaign = String(formData.get("utm_campaign") ?? "").trim().slice(0, 100) || null;
  const utm_content = String(formData.get("utm_content") ?? "").trim().slice(0, 100) || null;

  let parsedDest: URL;
  try {
    parsedDest = new URL(destination);
  } catch {
    return { ok: false, error: "Destination must be a valid URL." };
  }
  const allowedHosts = ["aesdr.com", "www.aesdr.com"];
  if (!allowedHosts.includes(parsedDest.hostname)) {
    return { ok: false, error: "Destination must point to aesdr.com." };
  }

  const admin = createAdminClient();

  // Generate a slug, retry on collision. Three attempts is plenty for
  // the 31^8 namespace size.
  let slug = "";
  let insertErr: { code?: string; message: string } | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    slug = generateSlug();
    const { error } = await admin.from("affiliate_links").insert({
      affiliate_slug: affiliateSlug,
      slug,
      destination_url: parsedDest.toString(),
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      label,
    });
    if (!error) {
      insertErr = null;
      break;
    }
    insertErr = error;
    // 23505 = unique_violation. Retry on slug collision; bail on anything else.
    if (error.code !== "23505") break;
  }
  if (insertErr) {
    console.error("[affiliate] link insert failed", insertErr);
    return { ok: false, error: "Couldn't create the link. Try again." };
  }

  revalidatePath("/affiliates/dashboard");
  revalidatePath("/affiliates/dashboard/links");
  return { ok: true, data: { slug } };
}

/**
 * Mark a payout as paid. Founder-only. Throws on error (so an admin
 * form submission surfaces failures via the framework's error boundary
 * rather than swallowing them).
 */
export async function markPayoutPaid(formData: FormData): Promise<void> {
  await requireAdmin();
  const payoutId = String(formData.get("payoutId") ?? "");
  const paymentMethod = String(formData.get("paymentMethod") ?? "").trim() || null;
  const paymentReference = String(formData.get("paymentReference") ?? "").trim() || null;

  if (!payoutId) throw new Error("Missing payout id.");

  const admin = createAdminClient();
  const { data: payout, error: getErr } = await admin
    .from("affiliate_payouts")
    .select("id, affiliate_slug, total_commission_cents, net_paid_cents, attribution_ids, status")
    .eq("id", payoutId)
    .maybeSingle();
  if (getErr || !payout) throw new Error("Payout not found.");
  if (payout.status === "paid") throw new Error("Already marked paid.");

  const nowIso = new Date().toISOString();

  // AUDIT (§11): a payout created by runAffiliatePayoutBatch already netted open
  // clawbacks (it stamps net_paid_cents). A payout finalized through this MANUAL
  // path historically did not — so the affiliate kept commission on a refunded /
  // disputed sale. Net any open clawbacks here too, recording the real net and
  // consuming the clawbacks so they can't double-apply. Guard on net_paid_cents
  // being unset so a batch payout (whose money already moved) is never re-netted.
  let nettingNote: string | null = null;
  if (payout.net_paid_cents == null) {
    const { data: openClawbacks } = await admin
      .from("commission_clawbacks")
      .select("id, amount_cents")
      .eq("affiliate_slug", payout.affiliate_slug)
      .is("applied_payout_id", null)
      .order("created_at", { ascending: true });
    const gross = payout.total_commission_cents ?? 0;
    const { netCents, clawbackTotal, applications } = applyClawbacks(gross, openClawbacks ?? []);
    const { error: netErr } = await admin
      .from("affiliate_payouts")
      .update({ net_paid_cents: netCents })
      .eq("id", payoutId);
    if (netErr) throw new Error(netErr.message);
    // Mirror the batch: full → close the row; partial → decrement the remainder.
    for (const cb of applications) {
      const { error: cbErr } = cb.full
        ? await admin
            .from("commission_clawbacks")
            .update({ applied_payout_id: payoutId, applied_at: nowIso })
            .eq("id", cb.id)
        : await admin
            .from("commission_clawbacks")
            .update({ amount_cents: cb.remaining })
            .eq("id", cb.id);
      if (cbErr) {
        // Surface — a silent failure would re-net the same clawback next time.
        console.error("[markPayoutPaid] clawback apply failed", {
          clawbackId: cb.id,
          payoutId,
          error: cbErr.message,
        });
      }
    }
    if (clawbackTotal > 0) {
      nettingNote = `netted ${clawbackTotal}¢ clawback; pay net ${netCents}¢ of ${gross}¢ gross`;
    }
  }

  const { error: updErr } = await admin
    .from("affiliate_payouts")
    .update({
      status: "paid",
      paid_at: nowIso,
      payment_method: paymentMethod,
      payment_reference: paymentReference,
      ...(nettingNote ? { note: nettingNote } : {}),
    })
    .eq("id", payoutId);
  if (updErr) throw new Error(updErr.message);

  // Also stamp paid_at on the underlying attribution rows.
  if (payout.attribution_ids?.length) {
    await admin
      .from("affiliate_attributions")
      .update({ status: "paid", paid_at: nowIso })
      .in("id", payout.attribution_ids);
  }

  await logEvent("affiliate_payout_paid", {
    affiliate_slug: payout.affiliate_slug,
    payout_id: payout.id,
    total_cents: payout.total_commission_cents,
  });

  revalidatePath("/admin/affiliates");
  revalidatePath(`/admin/affiliates/${payout.affiliate_slug}`);
}

/* ─── copy submissions (affiliate side) ─── */

/**
 * Affiliate submits a draft piece for brand-conformance review.
 */
export async function submitAffiliateCopy(formData: FormData): Promise<Result> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to submit copy." };

  // AUDIT (P0-9): resolve by server-trusted user_id only (no JWT slug claim).
  const affiliate = await getAffiliateForUser({ userId: user.id });
  if (!affiliate) {
    return { ok: false, error: "Your affiliate account isn't active yet." };
  }
  if (affiliate.status === "paused" || affiliate.status === "cut" || affiliate.status === "sunset") {
    return { ok: false, error: `Your account is ${affiliate.status}. Email hello@aesdr.com.` };
  }

  const channel = String(formData.get("channel") ?? "").trim();
  const format = String(formData.get("format") ?? "").trim();
  const draftBody = String(formData.get("draft_body") ?? "").trim();
  const draftUrlRaw = String(formData.get("draft_url") ?? "").trim();
  const scheduledRaw = String(formData.get("scheduled_publish_at") ?? "").trim();
  const scheduledAt = scheduledRaw ? new Date(scheduledRaw).toISOString() : null;

  if (!channel || !format) {
    return { ok: false, error: "Channel and format are required." };
  }
  // AUDIT (R3-AF-8): validate channel/format against the known enums so a
  // hand-crafted POST can't store arbitrary strings the review UI then renders.
  if (!SUBMISSION_CHANNELS.has(channel)) {
    return { ok: false, error: "Unknown channel." };
  }
  if (!SUBMISSION_FORMATS.has(format)) {
    return { ok: false, error: "Unknown format." };
  }
  if (draftBody.length < 40) {
    return { ok: false, error: "Paste the full draft — at least a few sentences." };
  }
  if (draftBody.length > 20000) {
    return { ok: false, error: "Draft is too long (20k chars max)." };
  }

  // AUDIT (R4-LEG-5): the FTC Endorsement Guides (16 CFR Part 255) require an
  // affiliate to clearly disclose their material connection — that they earn a
  // commission — whenever they promote AESDR. Block (don't just advise) any
  // submission with no recognizable disclosure marker so unlabeled copy never
  // enters the review queue.
  if (!hasFtcDisclosure(draftBody)) {
    return {
      ok: false,
      error:
        "Add an FTC disclosure before submitting — e.g. '#ad', 'affiliate link', or 'I earn a commission if you buy.' This is required by law when you promote AESDR for a commission.",
    };
  }

  // AUDIT (R3-AF-8): the draft URL is rendered as a clickable link in the
  // founder's review queue. Reject anything that isn't a well-formed https URL
  // (blocks javascript:/data:/http: scheme injection) before storing.
  let draftUrl: string | null = null;
  if (draftUrlRaw) {
    let parsed: URL;
    try {
      parsed = new URL(draftUrlRaw);
    } catch {
      return { ok: false, error: "Draft URL must be a valid URL." };
    }
    if (parsed.protocol !== "https:") {
      return { ok: false, error: "Draft URL must start with https://." };
    }
    draftUrl = parsed.toString();
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("affiliate_copy_submissions")
    .insert({
      affiliate_id: affiliate.id,
      channel,
      format,
      draft_body: draftBody,
      draft_url: draftUrl,
      scheduled_publish_at: scheduledAt,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[affiliate] copy submission failed", error);
    return { ok: false, error: "Couldn't submit. Try again." };
  }

  await logEvent("affiliate_copy_submitted", {
    affiliate_id: affiliate.id,
    affiliate_slug: affiliate.slug,
    submission_id: data.id,
    channel,
    format,
  });

  revalidatePath("/affiliates/dashboard/submissions");
  revalidatePath("/admin/affiliates/queue");
  return { ok: true, data: { submission_id: data.id } };
}

/* ─── copy submission review (admin side) ─── */

interface ReviewContext {
  submission: {
    id: string;
    affiliate_id: string;
    channel: string;
    format: string;
    draft_body: string;
    counted_toward_gate: boolean;
  };
  reviewerEmail: string;
}

async function loadReviewContext(submissionId: string): Promise<ReviewContext> {
  const user = await requireAdmin();
  const admin = createAdminClient();
  const { data: submission, error } = await admin
    .from("affiliate_copy_submissions")
    .select("id, affiliate_id, channel, format, draft_body, counted_toward_gate, status")
    .eq("id", submissionId)
    .maybeSingle();
  if (error || !submission) throw new Error("Submission not found.");
  if (submission.status === "approved") throw new Error("Already approved.");
  return {
    submission,
    reviewerEmail: user.email || "founder@aesdr.com",
  };
}

/**
 * Admin approves a copy submission. If this clears the gate (developing =>
 * 3rd approval; proven => 1st approval), also stamp affiliates.gate_exited_at
 * and fire the gate-cleared notification.
 */
export async function approveAffiliateCopy(formData: FormData): Promise<void> {
  const submissionId = String(formData.get("submissionId") ?? "");
  const reviewerNotes = String(formData.get("reviewer_notes") ?? "").trim() || null;
  if (!submissionId) throw new Error("Missing submission id.");

  const { submission, reviewerEmail } = await loadReviewContext(submissionId);
  const admin = createAdminClient();
  const nowIso = new Date().toISOString();

  const affiliate = await getAffiliateById(submission.affiliate_id);
  if (!affiliate) throw new Error("Affiliate not found.");

  const countsTowardGate = !submission.counted_toward_gate;
  const newApprovedCount = countsTowardGate
    ? affiliate.approved_pieces_count + 1
    : affiliate.approved_pieces_count;
  const gateRequirement = gateRequirementFor(affiliate.sophistication_tier);
  const gateClearedNow =
    affiliate.gate_exited_at === null && newApprovedCount >= gateRequirement;

  const { error: subErr } = await admin
    .from("affiliate_copy_submissions")
    .update({
      status: "approved",
      reviewer_notes: reviewerNotes,
      reviewer_email: reviewerEmail,
      reviewed_at: nowIso,
      counted_toward_gate: countsTowardGate || submission.counted_toward_gate,
    })
    .eq("id", submissionId);
  if (subErr) throw new Error(subErr.message);

  if (countsTowardGate || gateClearedNow) {
    const patch: Record<string, unknown> = {
      approved_pieces_count: newApprovedCount,
    };
    if (gateClearedNow) {
      patch.gate_exited_at = nowIso;
      if (affiliate.status === "vetting") {
        patch.status = "active";
        patch.activated_at = nowIso;
      }
    }
    const { error: affErr } = await admin
      .from("affiliates")
      .update(patch)
      .eq("id", affiliate.id);
    if (affErr) throw new Error(affErr.message);
  }

  await sendAffiliateCopyApprovedEmail({
    to: affiliate.email,
    displayName: affiliate.display_name,
    channel: submission.channel,
    reviewerNotes,
    gateCleared: gateClearedNow,
  });

  if (gateClearedNow) {
    await sendAffiliateGateClearedEmail({
      to: affiliate.email,
      displayName: affiliate.display_name,
    });
  }

  await logEvent("affiliate_copy_approved", {
    affiliate_id: affiliate.id,
    affiliate_slug: affiliate.slug,
    submission_id: submissionId,
    gate_cleared_now: gateClearedNow,
  });

  revalidatePath("/admin/affiliates/queue");
  revalidatePath(`/admin/affiliates/${affiliate.slug}`);
  revalidatePath("/affiliates/dashboard/submissions");
}

/**
 * Admin requests edits on a copy submission. Submission goes back to the
 * affiliate's queue for revision.
 */
export async function requestAffiliateCopyEdits(formData: FormData): Promise<void> {
  const submissionId = String(formData.get("submissionId") ?? "");
  const editRequests = String(formData.get("edit_requests") ?? "").trim();
  if (!submissionId) throw new Error("Missing submission id.");
  if (!editRequests || editRequests.length < 10) {
    throw new Error("Edit requests must be substantive (at least 10 chars).");
  }

  const { submission, reviewerEmail } = await loadReviewContext(submissionId);
  const admin = createAdminClient();
  const nowIso = new Date().toISOString();

  const { error } = await admin
    .from("affiliate_copy_submissions")
    .update({
      status: "edits_requested",
      edit_requests: editRequests,
      reviewer_email: reviewerEmail,
      reviewed_at: nowIso,
    })
    .eq("id", submissionId);
  if (error) throw new Error(error.message);

  const affiliate = await getAffiliateById(submission.affiliate_id);
  if (affiliate) {
    await sendAffiliateCopyEditsRequestedEmail({
      to: affiliate.email,
      displayName: affiliate.display_name,
      channel: submission.channel,
      editRequests,
    });
  }

  await logEvent("affiliate_copy_edits_requested", {
    submission_id: submissionId,
    affiliate_id: submission.affiliate_id,
  });

  revalidatePath("/admin/affiliates/queue");
}

/**
 * Admin declines a copy submission. Three same-category declines auto-pause
 * the affiliate.
 */
export async function declineAffiliateCopy(formData: FormData): Promise<void> {
  const submissionId = String(formData.get("submissionId") ?? "");
  const declineReason = String(formData.get("decline_reason") ?? "").trim();
  const declineCategory = String(formData.get("decline_category") ?? "").trim();
  if (!submissionId) throw new Error("Missing submission id.");
  if (!declineReason || declineReason.length < 10) {
    throw new Error("Decline reason must be substantive.");
  }
  if (!declineCategory) throw new Error("Decline category required.");

  const { submission, reviewerEmail } = await loadReviewContext(submissionId);
  const admin = createAdminClient();
  const nowIso = new Date().toISOString();

  const { error: subErr } = await admin
    .from("affiliate_copy_submissions")
    .update({
      status: "declined",
      decline_reason: declineReason,
      decline_category: declineCategory,
      reviewer_email: reviewerEmail,
      reviewed_at: nowIso,
    })
    .eq("id", submissionId);
  if (subErr) throw new Error(subErr.message);

  const affiliate = await getAffiliateById(submission.affiliate_id);
  if (!affiliate) return;

  // Three-strike tracker: count same-category strikes.
  const newStrike: StrikeEntry = {
    submission_id: submissionId,
    category: declineCategory,
    recorded_at: nowIso,
    reviewer_email: reviewerEmail,
  };
  const updatedLog = [...affiliate.strike_log, newStrike];
  // AUDIT (P1-14): count only strikes recorded since the affiliate's last
  // reactivation. A reactivated affiliate (activated_at bumped) gets a fresh
  // 3-strike window — previously the lifetime same-category count meant the
  // very next same-category decline re-paused them. activated_at is null for
  // affiliates that never activated, in which case the full log counts.
  const windowStartMs = affiliate.activated_at
    ? new Date(affiliate.activated_at).getTime()
    : 0;
  const sameCategoryCount = updatedLog.filter(
    (s) =>
      s.category === declineCategory &&
      new Date(s.recorded_at).getTime() >= windowStartMs
  ).length;
  const shouldPause =
    sameCategoryCount >= STRIKE_THRESHOLD && affiliate.status === "active";

  const patch: Record<string, unknown> = {
    strike_count: affiliate.strike_count + 1,
    strike_log: updatedLog,
  };
  if (shouldPause) {
    patch.status = "paused";
    patch.paused_at = nowIso;
  }
  await admin.from("affiliates").update(patch).eq("id", affiliate.id);

  await sendAffiliateCopyDeclinedEmail({
    to: affiliate.email,
    displayName: affiliate.display_name,
    channel: submission.channel,
    declineReason,
    declineCategory,
    strikeNumber: sameCategoryCount,
    autoPaused: shouldPause,
  });

  if (shouldPause) {
    await sendAffiliatePauseEmail({
      to: affiliate.email,
      displayName: affiliate.display_name,
      reason: `Three ${declineCategory.replace(/_/g, " ")} violations.`,
    });
  }

  await logEvent("affiliate_copy_declined", {
    affiliate_id: affiliate.id,
    affiliate_slug: affiliate.slug,
    submission_id: submissionId,
    category: declineCategory,
    strike_number: sameCategoryCount,
    auto_paused: shouldPause,
  });

  revalidatePath("/admin/affiliates/queue");
  revalidatePath(`/admin/affiliates/${affiliate.slug}`);
}

/* ─── affiliate entity management (admin side) ─── */

/**
 * Set an affiliate's sophistication tier. Drives the gate-exit threshold.
 */
export async function setAffiliateSophisticationTier(formData: FormData): Promise<void> {
  await requireAdmin();
  const affiliateId = String(formData.get("affiliateId") ?? "");
  const tier = String(formData.get("sophistication_tier") ?? "");
  if (!affiliateId) throw new Error("Missing affiliate id.");
  if (tier !== "developing" && tier !== "proven") {
    throw new Error("Tier must be developing or proven.");
  }
  const admin = createAdminClient();
  await admin.from("affiliates").update({ sophistication_tier: tier }).eq("id", affiliateId);
  revalidatePath("/admin/affiliates");
  revalidatePath(`/admin/affiliates/${affiliateId}`);
}

/* ─── payout batch processor ─── */

/**
 * Generate + send a payout batch for one affiliate, covering all `cleared`
 * attributions that aren't already attached to an existing payout.
 *
 * Steps:
 *   1. Aggregate cleared attributions for the affiliate.
 *   2. Insert an affiliate_payouts row (status=processing).
 *   3. Run a Stripe Transfer to the affiliate's Connect account.
 *   4. Mark payout paid + stamp paid_at on the underlying attributions.
 *   5. Email the affiliate.
 *
 * Failures roll the payout back to status=failed and leave attributions
 * untouched so the next run picks them up.
 */
export async function runAffiliatePayoutBatch(formData: FormData): Promise<void> {
  await requireAdmin();
  const affiliateId = String(formData.get("affiliateId") ?? "");
  if (!affiliateId) throw new Error("Missing affiliate id.");

  const affiliate = await getAffiliateById(affiliateId);
  if (!affiliate) throw new Error("Affiliate not found.");
  if (!affiliate.stripe_account_id || affiliate.stripe_account_status !== "enabled") {
    throw new Error(
      "Affiliate's Stripe account is not enabled. They must finish onboarding first."
    );
  }

  const admin = createAdminClient();

  // AUDIT (P0-1 / P2-9): atomically CLAIM the cleared attributions before we
  // compute or transfer anything. The UPDATE ... WHERE status='cleared'
  // RETURNING id transitions rows to 'processing' and returns only the rows
  // THIS invocation actually flipped — so two concurrent batch runs (the two
  // payout buttons, a Server-Action retry, or a batch racing markPayoutPaid)
  // can never both grab the same row: the loser's UPDATE matches zero of them.
  // We operate strictly on the ids we claimed, never on a stale pre-read set.
  //
  // SCHEMA DEPENDENCY (UNSAFE TO AUTO-APPLY): the affiliate_attributions
  // status CHECK in 20260519_affiliate_backend.sql is currently
  // ('pending','cleared','paid','refunded') and must be widened to include
  // 'processing' (a coordinating migration, owned by the migrations/ledger
  // surface — not in this agent's file set). Until that migration lands these
  // claim writes will violate the CHECK and the payout will abort safely
  // (no money moves), which is the correct fail-direction.
  const { data: claimed, error: claimErr } = await admin
    .from("affiliate_attributions")
    .update({ status: "processing" })
    .eq("affiliate_slug", affiliate.slug)
    .eq("status", "cleared")
    .select("id, commission_amount_cents, attributed_at");
  if (claimErr) throw new Error(claimErr.message);
  if (!claimed || claimed.length === 0) {
    throw new Error("No cleared attributions to pay out.");
  }

  const ids = claimed.map((a) => a.id);

  // Helper: release the claim (back to 'cleared') so a later run retries.
  const releaseClaim = async () => {
    await admin
      .from("affiliate_attributions")
      .update({ status: "cleared" })
      .in("id", ids)
      .eq("status", "processing");
  };

  // AUDIT (P0-1 / P2-9): refuse if any of these attributions are already
  // attached to a payout that isn't 'failed' — defends against a torn prior
  // run (markPayoutPaid / an interrupted batch) having already taken them.
  const { data: priorPayouts, error: priorErr } = await admin
    .from("affiliate_payouts")
    .select("id, status, attribution_ids")
    .eq("affiliate_slug", affiliate.slug)
    .neq("status", "failed");
  if (priorErr) {
    await releaseClaim();
    throw new Error(priorErr.message);
  }
  const claimedSet = new Set(ids);
  const alreadyCovered = (priorPayouts ?? []).some((p) =>
    (p.attribution_ids ?? []).some((aid: string) => claimedSet.has(aid))
  );
  if (alreadyCovered) {
    await releaseClaim();
    throw new Error(
      "Some of these attributions are already on an existing payout. Aborting to avoid a double payout."
    );
  }

  const total = claimed.reduce((s, a) => s + (a.commission_amount_cents ?? 0), 0);
  if (total <= 0) {
    await releaseClaim();
    throw new Error("Total payout is zero.");
  }
  const dates = claimed.map((a) => new Date(a.attributed_at).getTime());
  const periodStart = new Date(Math.min(...dates)).toISOString().slice(0, 10);
  const periodEnd = new Date(Math.max(...dates)).toISOString().slice(0, 10);

  // AUDIT (P0-2 / #31): net any open clawbacks (refunds/disputes on commission
  // that was already paid out) against this payout, oldest first. A clawback
  // larger than this period's total is applied partially; the remainder carries
  // to the next payout. Needs 20260622_commission_clawbacks.sql applied.
  const { data: openClawbacks } = await admin
    .from("commission_clawbacks")
    .select("id, amount_cents")
    .eq("affiliate_slug", affiliate.slug)
    .is("applied_payout_id", null)
    .order("created_at", { ascending: true });
  // AUDIT (review #4): netting extracted to the pure, unit-tested applyClawbacks
  // (coerces null/zero amounts and computes the full-vs-partial remainder
  // correctly — the old inline `full: apply === cb.amount_cents` mis-marked a
  // null amount and could write amount_cents=0, violating the >0 CHECK after the
  // transfer had already gone out). Concurrency is already covered upstream: the
  // attribution claim serializes payout batches per affiliate, so a losing batch
  // aborts at "No cleared attributions" before ever reaching this netting.
  const { netCents: netTotal, clawbackTotal, applications: clawbackApplications } =
    applyClawbacks(total, openClawbacks ?? []);

  const { data: payout, error: insErr } = await admin
    .from("affiliate_payouts")
    .insert({
      affiliate_slug: affiliate.slug,
      affiliate_id: affiliate.id,
      period_start: periodStart,
      period_end: periodEnd,
      total_commission_cents: total,
      // AUDIT (review #2): gross is total_commission_cents; what actually
      // transferred after clawback netting is net_paid_cents, so the dashboard +
      // 1099 reconciliation read the real paid amount (needs the new migration).
      net_paid_cents: netTotal,
      attribution_ids: ids,
      status: "processing",
      note:
        clawbackTotal > 0
          ? `netted ${clawbackTotal}¢ clawback; transferred ${netTotal}¢ of ${total}¢ gross`
          : null,
    })
    .select("id")
    .single();
  if (insErr || !payout) {
    await releaseClaim();
    throw new Error(insErr?.message ?? "Could not insert payout.");
  }

  // Lazy-import Stripe to keep the action import surface small.
  const { transferToAffiliate } = await import("@/lib/stripe-connect");
  const { sendAffiliatePayoutNotificationEmail } = await import("@/lib/email");

  let transferId: string;
  if (netTotal <= 0) {
    // AUDIT (P0-2): clawbacks fully consumed this period's commission — there is
    // nothing to transfer. The payout row records the gross + the netting note;
    // the clawbacks are marked applied below.
    transferId = "clawback-netted-zero";
  } else try {
    const transfer = await transferToAffiliate({
      accountId: affiliate.stripe_account_id,
      amountCents: netTotal,
      payoutId: payout.id,
      affiliateSlug: affiliate.slug,
    });
    transferId = transfer.id;
  } catch (err) {
    await admin
      .from("affiliate_payouts")
      .update({
        status: "failed",
        note: err instanceof Error ? err.message : "Stripe transfer failed.",
      })
      .eq("id", payout.id);
    // AUDIT (P0-1): release the claimed attributions back to 'cleared' so the
    // next run can re-attempt them. The transfer is idempotency-keyed on
    // payout.id (lib/stripe-connect.ts), so a retry that re-creates the
    // payout row cannot double-send for THIS payout; releasing only restores
    // the rows to a payable state.
    await releaseClaim();
    throw err;
  }

  const nowIso = new Date().toISOString();
  await admin
    .from("affiliate_payouts")
    .update({
      status: "paid",
      paid_at: nowIso,
      payment_method: "stripe_connect_transfer",
      payment_reference: transferId,
    })
    .eq("id", payout.id);
  // Transition the claimed rows processing → paid.
  await admin
    .from("affiliate_attributions")
    .update({ status: "paid", paid_at: nowIso })
    .in("id", ids);

  // AUDIT (P0-2): mark the clawbacks consumed by this payout. Fully-applied rows
  // close (applied_payout_id); a partially-applied row keeps its remainder open
  // for the next payout.
  for (const cb of clawbackApplications) {
    const { error: cbErr } = cb.full
      ? await admin
          .from("commission_clawbacks")
          .update({ applied_payout_id: payout.id, applied_at: nowIso })
          .eq("id", cb.id)
      : await admin
          .from("commission_clawbacks")
          .update({ amount_cents: cb.remaining })
          .eq("id", cb.id);
    // AUDIT (review #3b): a silently-failed update would re-net the same
    // clawback on the next payout (double-claw). Surface it.
    if (cbErr) {
      console.error("[payout] clawback apply failed after transfer", {
        clawbackId: cb.id,
        payoutId: payout.id,
        error: cbErr.message,
      });
    }
  }

  await sendAffiliatePayoutNotificationEmail({
    to: affiliate.email,
    displayName: affiliate.display_name,
    amountCents: netTotal,
    periodStart,
    periodEnd,
    paymentMethod: "Stripe Connect",
    reference: transferId,
  });

  await logEvent("affiliate_payout_paid", {
    affiliate_slug: affiliate.slug,
    payout_id: payout.id,
    total_cents: total,
  });

  revalidatePath("/admin/affiliates");
  revalidatePath(`/admin/affiliates/${affiliate.slug}`);
  revalidatePath("/affiliates/dashboard/payments");
}

/**
 * Update an affiliate's lifecycle status. Active / paused / sunset / cut.
 */
export async function setAffiliateStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const affiliateId = String(formData.get("affiliateId") ?? "");
  const status = String(formData.get("status") ?? "");
  const allowed = ["vetting", "active", "paused", "sunset", "cut"] as const;
  if (!affiliateId) throw new Error("Missing affiliate id.");
  if (!(allowed as readonly string[]).includes(status)) throw new Error("Invalid status.");

  const previous = await getAffiliateById(affiliateId);
  if (!previous) throw new Error("Affiliate not found.");

  const admin = createAdminClient();
  const nowIso = new Date().toISOString();
  const patch: Record<string, unknown> = { status };
  if (status === "active") patch.activated_at = nowIso;
  if (status === "paused") patch.paused_at = nowIso;
  if (status === "sunset") patch.sunset_at = nowIso;
  await admin.from("affiliates").update(patch).eq("id", affiliateId);

  // AUDIT (adversarial pass): a sunset/cut affiliate won't receive future
  // payouts, so any OPEN clawback against them can never be netted automatically.
  // Surface it so it's recovered (or written off) by hand instead of lingering
  // silently — there is no negative-payout path.
  if (status === "sunset" || status === "cut") {
    const { data: openCbs } = await admin
      .from("commission_clawbacks")
      .select("amount_cents")
      .eq("affiliate_slug", previous.slug)
      .is("applied_payout_id", null);
    const owedCents = (openCbs ?? []).reduce((s, c) => s + (c.amount_cents ?? 0), 0);
    if (owedCents > 0) {
      Sentry.captureMessage(
        "[affiliate] sunset/cut with unrecovered clawbacks — manual recovery needed",
        {
          level: "warning",
          extra: { affiliateSlug: previous.slug, status, owedCents, openCount: openCbs?.length ?? 0 },
        },
      );
    }
  }

  // Fire onboarding email on first activation (vetting → active).
  if (previous.status === "vetting" && status === "active") {
    await sendAffiliateOnboardingEmail({
      to: previous.email,
      displayName: previous.display_name,
      slug: previous.slug,
      sophisticationTier: previous.sophistication_tier,
    });
  }

  await logEvent("affiliate_status_changed", { affiliate_id: affiliateId, status });
  revalidatePath("/admin/affiliates");
  revalidatePath(`/admin/affiliates/${previous.slug}`);
}

/* ─── new-affiliate creation (admin side) ─── */

/**
 * AUDIT (P0-9 / R3-AF-2): provision a server-trusted identity for a newly
 * created affiliate. Looks up (or creates) the Supabase auth user by email,
 * then stamps `is_affiliate` + `affiliate_slug` onto **app_metadata** — which
 * clients CANNOT write (unlike user_metadata). Returns the user id so the
 * caller can pin it onto affiliates.user_id, the only field
 * getAffiliateForUser now trusts.
 *
 * Create-then-find mirrors the Stripe webhook's pattern: createUser fails if
 * the email already exists, in which case we resolve the existing user and
 * merge claims onto their app_metadata.
 */
async function provisionAffiliateIdentity(args: {
  email: string;
  slug: string;
  displayName: string;
}): Promise<string | null> {
  const admin = createAdminClient();
  const email = args.email.toLowerCase();
  const claims = { is_affiliate: true, affiliate_slug: args.slug };

  // Try to create first.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    app_metadata: claims,
    user_metadata: { full_name: args.displayName || undefined },
  });
  if (created?.user) {
    return created.user.id;
  }

  // Already exists (or transient create failure): resolve the existing user
  // and merge the affiliate claims onto their app_metadata.
  if (createErr) {
    // Prefer a direct purchases-table lookup (cheap), else a bounded list scan.
    const { data: existingPurchase } = await admin
      .from("purchases")
      .select("user_id")
      .eq("user_email", email)
      .not("user_id", "is", null)
      .limit(1)
      .maybeSingle();

    let userId: string | null = existingPurchase?.user_id ?? null;
    if (!userId) {
      // §7: paginate all users instead of silently capping at the first 200.
      userId = await findUserIdByEmail(admin, email);
    }

    if (userId) {
      await admin.auth.admin.updateUserById(userId, {
        app_metadata: claims,
      });
    }
    return userId;
  }

  return null;
}

/**
 * Create a new affiliate row from scratch (or promote an application).
 * Founder-only. Fields mirror the affiliates table; status defaults to
 * 'vetting' so the founder explicitly activates after the welcome
 * conversation.
 */
export async function createAffiliate(formData: FormData): Promise<void> {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const display_name = String(formData.get("display_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const archetype = String(formData.get("archetype") ?? "creator");
  const sophistication_tier = String(formData.get("sophistication_tier") ?? "developing");
  const application_id_raw = String(formData.get("application_id") ?? "").trim();
  const application_id = application_id_raw || null;

  if (!slug || !/^[a-z0-9-]{2,40}$/.test(slug)) {
    throw new Error("Slug must be 2–40 chars, lowercase letters/digits/hyphens.");
  }
  if (!display_name) throw new Error("Display name required.");
  if (!email || !email.includes("@")) throw new Error("Valid email required.");
  if (!["creator", "coach", "alumni", "hybrid", "community"].includes(archetype)) {
    throw new Error("Invalid archetype.");
  }
  if (!["developing", "proven"].includes(sophistication_tier)) {
    throw new Error("Invalid sophistication tier.");
  }

  const admin = createAdminClient();

  // AUDIT (P0-9 / R3-AF-2): provision the auth identity BEFORE inserting the
  // affiliate row so we can pin user_id on insert. Without this the affiliate
  // can never resolve their own dashboard/links/Stripe (getAffiliateForUser
  // trusts only user_id), and the old client-writable user_metadata path is
  // gone.
  const userId = await provisionAffiliateIdentity({ email, slug, displayName: display_name });

  const { error } = await admin.from("affiliates").insert({
    slug,
    display_name,
    email,
    archetype,
    sophistication_tier,
    application_id,
    user_id: userId, // AUDIT (R3-AF-2): server-trusted identity link.
    status: "vetting",
  });
  if (error) throw new Error(error.message);

  // AUDIT (R4-SM-4): when promoting an application, advance it out of the
  // review queue so the queue actually drains. 'passed-vetting' is the
  // terminal "became an affiliate" state in the affiliate_applications enum.
  if (application_id) {
    const { error: appErr } = await admin
      .from("affiliate_applications")
      .update({ status: "passed-vetting" })
      .eq("id", application_id);
    if (appErr) {
      console.error("[affiliate] application status advance failed", appErr);
    }
  }

  // AUDIT (R3-AF-2): the account was provisioned with app_metadata claims +
  // email_confirm but no password, so send a set-password link the affiliate
  // uses to first sign in to their dashboard. Best-effort — never block setup.
  if (userId) {
    try {
      const { data: linkData } = await admin.auth.admin.generateLink({
        type: "recovery",
        email,
      });
      const actionLink = linkData?.properties?.action_link;
      if (actionLink) {
        const { sendAffiliateActivationEmail } = await import("@/lib/email");
        await sendAffiliateActivationEmail({ to: email, displayName: display_name, actionLink });
      }
    } catch (e) {
      console.error("[affiliate] activation email failed", e);
    }
  }

  await logEvent("affiliate_status_changed", { affiliate_id: slug, status: "vetting" });

  revalidatePath("/admin/affiliates");
}

/* ─── workshop pilot config (admin side) ─── */

/**
 * Update an affiliate's workshop-pilot config (title, audience, date,
 * host, partner quote, SMS toggle, master open switch).
 *
 * The form posts a full snapshot of the workshop fields each save, so
 * we update them all at once rather than maintaining per-field actions.
 * Empty strings on text/textarea fields become NULL in the DB.
 *
 * Per D07 (registration spec), D08 (title ratified 2026-05-28), D29
 * (host stubs), D12 (SMS opt-in toggle), canon §10.5 (consent rules).
 */
export async function setAffiliateWorkshop(formData: FormData): Promise<void> {
  await requireAdmin();
  const affiliateId = String(formData.get("affiliateId") ?? "");
  if (!affiliateId) throw new Error("Missing affiliate id.");

  const text = (key: string): string | null => {
    const v = String(formData.get(key) ?? "").trim();
    return v === "" ? null : v;
  };
  const integer = (key: string): number | null => {
    const raw = String(formData.get(key) ?? "").trim();
    if (raw === "") return null;
    const n = Number(raw);
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
      throw new Error(`${key} must be an integer.`);
    }
    return n;
  };
  const checkbox = (key: string): boolean =>
    String(formData.get(key) ?? "") === "on";

  // Validate ISO date if provided. We accept any string Date can parse —
  // admins are expected to enter ISO 8601 with offset (e.g.
  // "2026-06-15T18:00:00-04:00"). Postgres will store it as timestamptz.
  const dateRaw = text("workshop_date_iso");
  if (dateRaw && Number.isNaN(new Date(dateRaw).getTime())) {
    throw new Error("workshop_date_iso must be a valid ISO 8601 datetime.");
  }

  // Master switch sanity: can't open registration without title + date.
  const open = checkbox("workshop_registration_open");
  const title = text("workshop_title");
  if (open && (!title || !dateRaw)) {
    throw new Error(
      "Can't open registration without both workshop_title and workshop_date_iso set."
    );
  }

  const patch = {
    workshop_title: title,
    workshop_audience_descriptor: text("workshop_audience_descriptor"),
    workshop_partner_quote: text("workshop_partner_quote"),
    workshop_partner_quote_attribution: text("workshop_partner_quote_attribution"),
    workshop_date_iso: dateRaw,
    workshop_timezone: text("workshop_timezone") || "America/New_York",
    host_first_name: text("host_first_name"),
    host_last_name: text("host_last_name"),
    host_tenure_years: integer("host_tenure_years"),
    host_background_beat: text("host_background_beat"),
    sms_enabled: checkbox("sms_enabled"),
    workshop_registration_open: open,
  };

  const admin = createAdminClient();
  const { error } = await admin
    .from("affiliates")
    .update(patch)
    .eq("id", affiliateId);
  if (error) throw new Error(`Couldn't save workshop config: ${error.message}`);

  // Use the affiliate's slug for the revalidate path (admin URL uses slug).
  const affiliate = await getAffiliateById(affiliateId);
  if (affiliate) {
    revalidatePath(`/admin/affiliates/${affiliate.slug}`);
    revalidatePath(`/${affiliate.slug}/workshop`);
  }
  revalidatePath("/admin/affiliates");
}
