/**
 * Stripe Connect Standard helpers for the affiliate payout pipeline.
 *
 * Standard accounts give affiliates a full Stripe dashboard and let us send
 * payouts via the Transfers API. 1099-NEC filing is handled by Stripe Connect
 * tax reporting (enabled platform-side; Stripe collects the W-9/W-8 at
 * onboarding) -- NOT 1099-K, which only covers an account's own processing
 * volume, not our platform transfers. The Account Links flow (introduced 2022) replaces
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

// AUDIT (IC-2/#54): pin an explicit apiVersion so a Stripe-side default bump
// can't silently change request/response shapes. This is the version
// stripe@22 ships against; confirm it matches the Dashboard's API version.
// AUDIT: confirm matches Dashboard.
export const STRIPE_API_VERSION = "2026-03-25.dahlia" as const;

/**
 * Shared Stripe client (cached singleton). Exported so the checkout +
 * webhook routes use the same pinned apiVersion instead of each
 * constructing their own `new Stripe(...)`. (IC-2/#54 centralization.)
 */
export function getStripe(): Stripe {
  if (stripeClient) return stripeClient;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  stripeClient = new Stripe(key, { apiVersion: STRIPE_API_VERSION });
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
  // AUDIT (P0-1/R4-AF-7): a Standard account can have charges/payouts enabled
  // yet lack the `transfers` capability — it then passes this gate and 400s on
  // transfers.create. Require transfers === 'active' before calling it enabled.
  const transfersActive = account.capabilities?.transfers === "active";
  if (
    account.charges_enabled &&
    account.payouts_enabled &&
    account.details_submitted &&
    transfersActive
  ) {
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
  /** AUDIT (R4-MON-6): currency must flow through, not be hardcoded usd. */
  currency?: string;
}): Promise<Stripe.Transfer> {
  const stripe = getStripe();
  if (args.amountCents <= 0) {
    throw new Error("Transfer amount must be positive.");
  }
  return stripe.transfers.create(
    {
      amount: args.amountCents,
      // AUDIT (R4-MON-6): default to usd but accept a passed-through currency
      // so a non-USD payout isn't silently sent as dollars.
      currency: (args.currency || "usd").toLowerCase(),
      destination: args.accountId,
      metadata: {
        payout_id: args.payoutId,
        affiliate_slug: args.affiliateSlug,
      },
    },
    {
      // AUDIT (P0-1): idempotency-key the transfer so a re-clicked payout,
      // a Server-Action retry, or two concurrent runs can't double-pay.
      idempotencyKey: `payout:${args.payoutId}`,
    }
  );
}
