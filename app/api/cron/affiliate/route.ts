export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { verifyCronAuth } from "@/lib/cron-auth";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Daily affiliate-lifecycle cron.
 *
 * Promotes affiliate_attributions through their status lifecycle:
 *   pending → cleared once refund_window_closes_at has passed AND
 *             the underlying purchase is still status=active.
 *
 * Refund detection is handled in the Stripe webhook
 * (charge.refunded → status=refunded) so this cron doesn't need to
 * cross-check Stripe.
 *
 * Idempotent: re-running on the same day only flips the rows already
 * eligible; rows already cleared / paid / refunded are skipped by the
 * .eq("status", "pending") filter.
 *
 * Returns counts for monitoring.
 */
export async function GET(request: Request) {
  const authErr = verifyCronAuth(request);
  if (authErr) return authErr;

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  // Promote pending → cleared where the refund window has passed and
  // the purchase is still active.
  const { data: eligible, error: queryErr } = await supabase
    .from("affiliate_attributions")
    .select("id, purchase_id, partner_slug")
    .eq("status", "pending")
    .lte("refund_window_closes_at", nowIso)
    .limit(1000);

  if (queryErr) {
    return NextResponse.json({ error: queryErr.message }, { status: 500 });
  }

  let cleared = 0;
  let skippedRefunded = 0;

  for (const attr of eligible ?? []) {
    // Cross-check the underlying purchase status before clearing — a
    // race condition is possible where the Stripe refund event arrives
    // between this query and the update.
    const { data: purchase } = await supabase
      .from("purchases")
      .select("status")
      .eq("id", attr.purchase_id)
      .maybeSingle();

    if (!purchase || purchase.status !== "active") {
      // Purchase was refunded; the Stripe webhook should have flipped
      // this attribution already, but flip it here as a safety net.
      await supabase
        .from("affiliate_attributions")
        .update({ status: "refunded", refunded_at: nowIso })
        .eq("id", attr.id)
        .eq("status", "pending");
      skippedRefunded++;
      continue;
    }

    const { error: updErr } = await supabase
      .from("affiliate_attributions")
      .update({ status: "cleared", cleared_at: nowIso })
      .eq("id", attr.id)
      .eq("status", "pending"); // double-check to avoid race
    if (!updErr) cleared++;
  }

  return NextResponse.json({
    cleared,
    skippedRefunded,
    examined: eligible?.length ?? 0,
  });
}
