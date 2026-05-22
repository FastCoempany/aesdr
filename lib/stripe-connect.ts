/**
 * Stripe Connect Standard helpers for the affiliate payout pipeline.
 *
 * Standard accounts give affiliates a full Stripe dashboard, handle 1099-K
 * reporting on Stripe's side once thresholds trip, and let us send payouts
 * via the Transfers API. The Account Links flow (introduced 2022) replaces
 * the older OAuth dance and works for both Standard and Express.
 *
 * Per docs/canon-revisions/2026-05-22-affiliate-hub-plan.md (step 8).
 */

import Stripe from "stripe";

import type {
  AffiliateRecord,
  StripeAccountStatus,
} from "@/lib/affiliate-entity";

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (stripeClient) return stripeClient;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  stripeClient = new Stripe(key);
  return stripeClient;
}

/**
 * Site origin for account-link return/refresh URLs. Falls back to
 * NEXT_PUBLIC_SITE_URL → aesdr.com.
 */
function siteOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://aesdr.com";
}

/**
 * Create (or retrieve) the Stripe Connect Standard account for an affiliate.
 * Returns the Stripe Account id and persists it onto the affiliate row.
 */
export async function ensureStripeAccount(
  affiliate: AffiliateRecord
): Promise<string> {
  if (affiliate.stripe_account_id) return affiliate.stripe_account_id;
  const stripe = getStripe();

  const account = await stripe.accounts.create({
    type: "standard",
    email: affiliate.email,
    metadata: {
      affiliate_id: affiliate.id,
      affiliate_slug: affiliate.slug,
    },
  });

  return account.id;
}

/**
 * Generate an onboarding Account Link the affiliate clicks through to
 * complete KYC + bank-account setup. Single-use, short-lived (~minutes).
 */
export async function createOnboardingLink(args: {
  accountId: string;
}): Promise<string> {
  const stripe = getStripe();
  const origin = siteOrigin();
  const link = await stripe.accountLinks.create({
    account: args.accountId,
    refresh_url: `${origin}/affiliates/dashboard/payments?refresh=1`,
    return_url: `${origin}/affiliates/dashboard/payments?status=done`,
    type: "account_onboarding",
  });
  return link.url;
}

/**
 * Map Stripe's flags onto our enum. Used both right after onboarding and
 * from the account.updated webhook handler.
 */
export function mapAccountStatus(
  account: Stripe.Account
): StripeAccountStatus {
  if (account.charges_enabled && account.payouts_enabled && account.details_submitted) {
    return "enabled";
  }
  if (account.requirements?.disabled_reason) return "disabled";
  if ((account.requirements?.currently_due?.length ?? 0) > 0) return "restricted";
  if (!account.details_submitted) return "pending";
  return "restricted";
}

export async function retrieveAccount(accountId: string): Promise<Stripe.Account> {
  return getStripe().accounts.retrieve(accountId);
}

/**
 * Generate a one-time login link to the affiliate's Stripe Express dashboard.
 * (Standard accounts can use loginLinks too — Stripe returns the appropriate
 * deep link automatically.)
 */
export async function createDashboardLoginLink(accountId: string): Promise<string> {
  const stripe = getStripe();
  const link = await stripe.accounts.createLoginLink(accountId);
  return link.url;
}

/**
 * Send a payout to the affiliate via the Transfers API. Returns the
 * resulting Transfer.id which we persist as the payout's payment_reference.
 *
 * Requires the affiliate's Stripe account to be enabled (charges + payouts).
 */
export async function transferToAffiliate(args: {
  accountId: string;
  amountCents: number;
  payoutId: string;
  affiliateSlug: string;
}): Promise<Stripe.Transfer> {
  const stripe = getStripe();
  if (args.amountCents <= 0) {
    throw new Error("Transfer amount must be positive.");
  }
  return stripe.transfers.create({
    amount: args.amountCents,
    currency: "usd",
    destination: args.accountId,
    metadata: {
      payout_id: args.payoutId,
      affiliate_slug: args.affiliateSlug,
    },
  });
}
