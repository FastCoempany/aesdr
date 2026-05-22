"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { generateSlug } from "@/lib/affiliate";
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
  sendAffiliatePauseEmail,
} from "@/lib/email";
import { logEvent } from "@/lib/events";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

type Result = { ok: true; data?: Record<string, unknown> } | { ok: false; error: string };

/**
 * Create a new affiliate link for the calling user. The user must have
 * `is_affiliate: true` and `affiliate_slug` pinned on user_metadata. Slug
 * is generated server-side; affiliate names the label only.
 */
export async function createAffiliateLink(formData: FormData): Promise<Result> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to manage links." };

  const isAffiliate = user.user_metadata?.is_affiliate === true;
  const affiliateSlug = user.user_metadata?.affiliate_slug as string | undefined;
  if (!isAffiliate || !affiliateSlug) {
    return { ok: false, error: "Your account isn't set up for the Affiliate Program. Email hello@aesdr.com." };
  }

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
    .select("id, affiliate_slug, total_commission_cents, attribution_ids, status")
    .eq("id", payoutId)
    .maybeSingle();
  if (getErr || !payout) throw new Error("Payout not found.");
  if (payout.status === "paid") throw new Error("Already marked paid.");

  const nowIso = new Date().toISOString();
  const { error: updErr } = await admin
    .from("affiliate_payouts")
    .update({
      status: "paid",
      paid_at: nowIso,
      payment_method: paymentMethod,
      payment_reference: paymentReference,
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

  const affiliate = await getAffiliateForUser({
    userId: user.id,
    jwtAffiliateSlug: user.user_metadata?.affiliate_slug as string | undefined,
    jwtPartnerSlug: user.user_metadata?.partner_slug as string | undefined,
  });
  if (!affiliate) {
    return { ok: false, error: "Your affiliate account isn't active yet." };
  }
  if (affiliate.status === "paused" || affiliate.status === "cut" || affiliate.status === "sunset") {
    return { ok: false, error: `Your account is ${affiliate.status}. Email hello@aesdr.com.` };
  }

  const channel = String(formData.get("channel") ?? "").trim();
  const format = String(formData.get("format") ?? "").trim();
  const draftBody = String(formData.get("draft_body") ?? "").trim();
  const draftUrl = String(formData.get("draft_url") ?? "").trim() || null;
  const scheduledRaw = String(formData.get("scheduled_publish_at") ?? "").trim();
  const scheduledAt = scheduledRaw ? new Date(scheduledRaw).toISOString() : null;

  if (!channel || !format) {
    return { ok: false, error: "Channel and format are required." };
  }
  if (draftBody.length < 40) {
    return { ok: false, error: "Paste the full draft — at least a few sentences." };
  }
  if (draftBody.length > 20000) {
    return { ok: false, error: "Draft is too long (20k chars max)." };
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
  const sameCategoryCount = updatedLog.filter(
    (s) => s.category === declineCategory
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

  const admin = createAdminClient();
  const nowIso = new Date().toISOString();
  const patch: Record<string, unknown> = { status };
  if (status === "active") patch.activated_at = nowIso;
  if (status === "paused") patch.paused_at = nowIso;
  if (status === "sunset") patch.sunset_at = nowIso;
  await admin.from("affiliates").update(patch).eq("id", affiliateId);

  await logEvent("affiliate_status_changed", { affiliate_id: affiliateId, status });
  revalidatePath("/admin/affiliates");
  revalidatePath(`/admin/affiliates/${affiliateId}`);
}
