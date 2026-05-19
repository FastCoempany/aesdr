"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { generateSlug } from "@/lib/affiliate";
import { logEvent } from "@/lib/events";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

type Result = { ok: true; data?: Record<string, unknown> } | { ok: false; error: string };

/**
 * Create a new affiliate link for the calling user. The user must have
 * `is_affiliate: true` and `partner_slug` pinned on user_metadata. Slug
 * is generated server-side; affiliate names the label only.
 */
export async function createAffiliateLink(formData: FormData): Promise<Result> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to manage links." };

  const isAffiliate = user.user_metadata?.is_affiliate === true;
  const partnerSlug = user.user_metadata?.partner_slug as string | undefined;
  if (!isAffiliate || !partnerSlug) {
    return { ok: false, error: "Your account isn't set up for the Partners program. Email hello@aesdr.com." };
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
      partner_slug: partnerSlug,
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

  revalidatePath("/partners/dashboard");
  revalidatePath("/partners/dashboard/links");
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
    .select("id, partner_slug, total_commission_cents, attribution_ids, status")
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
    partner_slug: payout.partner_slug,
    payout_id: payout.id,
    total_cents: payout.total_commission_cents,
  });

  revalidatePath("/admin/affiliates");
  revalidatePath(`/admin/affiliates/${payout.partner_slug}`);
}
