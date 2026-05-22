/**
 * POST /api/affiliates/stripe/refresh
 *
 * Re-fetch the affiliate's Stripe account status. Called from the
 * dashboard's Payments page after the affiliate returns from Stripe-hosted
 * onboarding (or any time we suspect the cached status is stale).
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import {
  mapAccountStatus,
  retrieveAccount,
} from "@/lib/stripe-connect";
import { getAffiliateForUser } from "@/lib/affiliate-entity";
import { logEvent } from "@/lib/events";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const affiliate = await getAffiliateForUser({
    userId: user.id,
    jwtAffiliateSlug: user.user_metadata?.affiliate_slug as string | undefined,
    jwtPartnerSlug: user.user_metadata?.partner_slug as string | undefined,
  });
  if (!affiliate?.stripe_account_id) {
    return NextResponse.json(
      { error: "No Stripe account on file." },
      { status: 400 }
    );
  }

  try {
    const account = await retrieveAccount(affiliate.stripe_account_id);
    const status = mapAccountStatus(account);

    const admin = createAdminClient();
    await admin
      .from("affiliates")
      .update({ stripe_account_status: status })
      .eq("id", affiliate.id);

    if (status === "enabled" && affiliate.stripe_account_status !== "enabled") {
      await logEvent("affiliate_stripe_enabled", {
        affiliate_id: affiliate.id,
        stripe_account_id: affiliate.stripe_account_id,
      });
    }

    return NextResponse.json({ status });
  } catch (err) {
    console.error("[stripe-connect] refresh failed", err);
    return NextResponse.json(
      { error: "Couldn't refresh status." },
      { status: 500 }
    );
  }
}
