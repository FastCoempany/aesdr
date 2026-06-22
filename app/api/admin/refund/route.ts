export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { isAdminEmail } from "@/lib/admin";
// AUDIT (IC-2/#54): centralized, apiVersion-pinned Stripe client.
import { getStripe } from "@/lib/stripe-connect";

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aesdr.com";
    if (origin && new URL(siteUrl).origin !== origin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rl = await rateLimit(`admin-refund:${user.id}`, { max: 10, windowMs: 60 * 60 * 1000 });
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const purchaseId = body?.purchaseId;
    if (!purchaseId || typeof purchaseId !== "string") {
      return NextResponse.json({ error: "Missing purchaseId" }, { status: 400 });
    }

    const admin = createAdminClient();

    // AUDIT (P0-3): this used to be a bare `purchases.update({status:'refunded'})`
    // that issued NO Stripe refund and never reversed commission — the customer
    // lost access but kept their money and the affiliate stayed paid. Now we
    // issue the real Stripe refund here and let the resulting `charge.refunded`
    // webhook (after P0-2/P0-4) own the purchases + attribution DB flips, so
    // refund semantics live in exactly one place.
    const { data: purchase, error: lookupErr } = await admin
      .from("purchases")
      .select("stripe_session_id, status")
      .eq("id", purchaseId)
      .maybeSingle();

    if (lookupErr) {
      console.error("[admin-refund] Lookup failed:", lookupErr.message);
      return NextResponse.json({ error: "Failed to look up purchase" }, { status: 500 });
    }
    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }
    // AUDIT (P0-3): only an active purchase is refundable here (mirrors the old
    // `.eq('status','active')` guard) — prevents double-refunding.
    if (purchase.status !== "active") {
      return NextResponse.json({ error: "Purchase is not refundable" }, { status: 409 });
    }
    if (!purchase.stripe_session_id) {
      return NextResponse.json({ error: "No Stripe session on purchase" }, { status: 422 });
    }

    const stripe = getStripe();

    // Resolve the PaymentIntent from the stored Checkout Session id (purchases
    // store only stripe_session_id), then issue the refund against it.
    let paymentIntentId: string | null = null;
    try {
      const session = await stripe.checkout.sessions.retrieve(purchase.stripe_session_id);
      paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null;
    } catch (err) {
      console.error("[admin-refund] Session retrieve failed:", err);
      return NextResponse.json({ error: "Failed to resolve payment" }, { status: 502 });
    }

    if (!paymentIntentId) {
      return NextResponse.json({ error: "No payment to refund" }, { status: 422 });
    }

    try {
      // AUDIT (P0-3): the real refund. `charge.refunded` then flips the DB.
      // Idempotency-keyed on the purchase so a double-click can't double-refund.
      await stripe.refunds.create(
        { payment_intent: paymentIntentId },
        { idempotencyKey: `admin-refund:${purchaseId}` }
      );
    } catch (err) {
      console.error("[admin-refund] Stripe refund failed:", err);
      return NextResponse.json({ error: "Refund failed at Stripe" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin-refund] Unexpected error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
