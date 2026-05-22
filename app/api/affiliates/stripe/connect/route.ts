/**
 * POST /api/affiliates/stripe/connect
 *
 * Affiliate initiates Stripe Connect Standard onboarding. Creates the
 * Stripe Account (if not already created), persists the id + initial
 * status onto the affiliates row, and returns a single-use onboarding URL
 * the client redirects to.
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import {
  createOnboardingLink,
  ensureStripeAccount,
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
  if (!affiliate) {
    return NextResponse.json(
      { error: "Affiliate account not found." },
      { status: 403 }
    );
  }

  try {
    const stripeAccountId = await ensureStripeAccount(affiliate);

    // Persist the account id immediately so we can resume if the
    // affiliate bounces off the Stripe-hosted flow.
    if (!affiliate.stripe_account_id) {
      const admin = createAdminClient();
      await admin
        .from("affiliates")
        .update({
          stripe_account_id: stripeAccountId,
          stripe_account_status: "pending",
        })
        .eq("id", affiliate.id);

      await logEvent("affiliate_stripe_connected", {
        affiliate_id: affiliate.id,
        stripe_account_id: stripeAccountId,
      });
    }

    const url = await createOnboardingLink({ accountId: stripeAccountId });
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[stripe-connect] onboarding failed", err);
    return NextResponse.json(
      { error: "Couldn't start Stripe onboarding. Try again." },
      { status: 500 }
    );
  }
}
