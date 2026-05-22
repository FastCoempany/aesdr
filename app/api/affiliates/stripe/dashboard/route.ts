/**
 * POST /api/affiliates/stripe/dashboard
 *
 * Returns a single-use login link to the affiliate's Stripe Express
 * dashboard. Used so they can manage payouts, tax info, and bank
 * accounts without needing a Stripe password.
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { createDashboardLoginLink } from "@/lib/stripe-connect";
import { getAffiliateForUser } from "@/lib/affiliate-entity";
import { createClient } from "@/utils/supabase/server";

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
    const url = await createDashboardLoginLink(affiliate.stripe_account_id);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[stripe-connect] dashboard link failed", err);
    return NextResponse.json(
      { error: "Couldn't create dashboard link." },
      { status: 500 }
    );
  }
}
