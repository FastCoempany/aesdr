export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import Stripe from 'stripe';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendWelcomeEmail, sendReceiptEmail } from '@/lib/email';
import { logEvent } from '@/lib/events';
import {
  ATTRIBUTION_WINDOW_MS,
  REFUND_WINDOW_MS,
  isSelfReferral,
} from '@/lib/affiliate';
// AUDIT (R4-MON-2/#1/#27): commission math now lives in one place and derives
// the rate from the affiliate's own commission_pct column.
import { computeCommissionCents, resolveCommissionRate } from '@/lib/commission';
// AUDIT (R4-MON-4 / decision #28): pure, unit-tested pro-rata refund math.
import { proRataClawbackCents } from '@/lib/payout-math';
// AUDIT (IC-2/#54): centralized, apiVersion-pinned Stripe client.
import { mapAccountStatus, getStripe } from '@/lib/stripe-connect';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

// AUDIT (R4-DR-4/#34): team is a fixed-seat SKU; no quantity selector exists.
const TEAM_MAX_SEATS = 10;

function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  for (const b of bytes) result += chars[b % chars.length];
  return result;
}

export async function POST(request: Request) {
  const rl = await rateLimit(`stripe-wh:${getClientIP(request)}`, { max: 100, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET environment variable is not set');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    Sentry.captureException(err, { extra: { handler: 'stripe-webhook', step: 'signature_verify' } });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email;
    const name = session.customer_details?.name || 'there';
    const tierRaw = session.metadata?.tier;
    const amountCents = session.amount_total || 0;

    const supabase = createAdminClient();

    // Handle artifact unlock purchases separately
    if (tierRaw === 'artifact_unlock') {
      const artifactType = session.metadata?.artifact_type;
      if (artifactType && email) {
        // Find user by email
        let unlockUserId: string | null = null;
        const { data: existingPurchase } = await supabase
          .from('purchases')
          .select('user_id')
          .eq('user_email', email.toLowerCase())
          .not('user_id', 'is', null)
          .limit(1)
          .maybeSingle();
        unlockUserId = existingPurchase?.user_id ?? null;

        if (unlockUserId) {
          const { error: unlockError } = await supabase
            .from('artifact_unlocks')
            .upsert(
              {
                user_id: unlockUserId,
                artifact_type: artifactType,
                stripe_session_id: session.id,
                amount_cents: amountCents,
              },
              { onConflict: 'user_id,artifact_type' }
            );
          if (unlockError) {
            console.error('[webhook] Artifact unlock insert failed:', unlockError.message);
          }
        }
      }
      return NextResponse.json({ received: true });
    }

    const validTiers = ['sdr', 'ae', 'team'];
    const tier = validTiers.includes(tierRaw || '') ? tierRaw! : 'sdr';

    // Look up or create Supabase auth user by email
    let userId: string | null = null;
    let tempPassword: string | null = null;

    if (email) {
      // Try to create the user first — if they already exist, createUser
      // returns an error we can handle. This avoids the expensive listUsers
      // scan that fetches all users into memory.
      tempPassword = generatePassword();
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: name !== 'there' ? name : undefined,
          needs_password_change: true,
        },
      });

      if (newUser?.user) {
        userId = newUser.user.id;
      } else if (createError) {
        // AUDIT (P0-13/R4-DR-2/R4-DR-3): a createUser failure is NOT always
        // "email already exists". A transient Supabase 429/5xx/network blip
        // hits this same branch — the old code blindly assumed "exists",
        // nulled the password, found no user, and returned 200, permanently
        // stranding a paying buyer (no auth account, userless purchase, an
        // email telling them to use a password they never got). Only a real
        // email_exists (status 422) means the user is already there; for
        // anything else, surface it and return 500 so Stripe retries.
        const isEmailExists =
          createError.code === 'email_exists' || createError.status === 422;
        if (!isEmailExists) {
          Sentry.captureException(createError, {
            extra: {
              handler: 'stripe-webhook',
              step: 'create_user',
              sessionId: session.id,
              code: createError.code,
              status: createError.status,
            },
          });
          return NextResponse.json({ error: 'User provisioning failed' }, { status: 500 });
        }

        // User already exists — look up by querying the purchases table
        // for a previous record with this email, or fall back to a
        // bounded admin user list
        tempPassword = null;

        const { data: existingPurchase, error: lookupErr } = await supabase
          .from('purchases')
          .select('user_id')
          .eq('user_email', email.toLowerCase())
          .not('user_id', 'is', null)
          .limit(1)
          .maybeSingle();

        if (lookupErr) {
          console.error('[webhook] Purchase lookup failed:', lookupErr.message);
        }

        if (existingPurchase?.user_id) {
          userId = existingPurchase.user_id;
        } else {
          // Last resort: bounded list search (cap at 50)
          const { data: userList, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 50 });
          if (listErr) {
            console.error('[webhook] User list failed:', listErr.message);
          }
          const matched = userList?.users?.find(
            (u) => u.email?.toLowerCase() === email.toLowerCase()
          );
          userId = matched?.id ?? null;
        }
      }
    }

    // Check if this webhook was already processed (prevent duplicate emails on retry)
    const { data: existingRecord } = await supabase
      .from('purchases')
      .select('stripe_session_id')
      .eq('stripe_session_id', session.id)
      .maybeSingle();

    const isNewPurchase = !existingRecord;

    // Record purchase (idempotent via upsert on stripe_session_id)
    const { error: purchaseError } = await supabase.from('purchases').upsert(
      {
        stripe_session_id: session.id,
        user_email: email,
        user_id: userId,
        customer_name: name !== 'there' ? name : null,
        plan: tier,
        amount_cents: amountCents,
        status: 'active',
        purchased_at: new Date().toISOString(),
      },
      { onConflict: 'stripe_session_id' }
    );
    if (purchaseError) {
      // AUDIT (P0-13/R4-DR-2): the purchase row is the source of truth that
      // gates team creation, attribution, and the "you're in" emails. If it
      // failed to write, do NOT continue (which previously made a team with
      // purchase_id:null, silently dropped attribution, and still emailed the
      // buyer for an uncommitted purchase). Return 500 so Stripe retries.
      Sentry.captureException(new Error(`Purchase upsert failed: ${purchaseError.message}`), {
        extra: { handler: 'stripe-webhook', step: 'purchase_upsert', sessionId: session.id },
      });
      return NextResponse.json({ error: 'Purchase persistence failed' }, { status: 500 });
    }

    // If team plan, create team + add owner as admin member.
    // AUDIT (R4-DR-3): dropped the `&& isNewPurchase` guard — it made a
    // first-attempt team-creation failure never retry. The existingTeam check
    // below already makes this idempotent, so the flag was redundant + harmful.
    if (tier === 'team' && userId) {
      const { data: existingTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('owner_id', userId)
        .maybeSingle();

      if (!existingTeam) {
        const { data: purchaseRow } = await supabase
          .from('purchases')
          .select('id')
          .eq('stripe_session_id', session.id)
          .maybeSingle();

        const { data: newTeam, error: teamErr } = await supabase
          .from('teams')
          .insert({
            name: name !== 'there' ? `${name}'s Team` : 'My Team',
            owner_id: userId,
            purchase_id: purchaseRow?.id ?? null,
            // AUDIT (R4-DR-4/#34): fixed-seat SKU, hoisted to a named const.
            max_seats: TEAM_MAX_SEATS,
          })
          .select('id')
          .single();

        if (teamErr) {
          console.error('[webhook] Team creation failed:', teamErr.message);
        } else if (newTeam && email) {
          const { error: memberErr } = await supabase
            .from('team_members')
            .insert({
              team_id: newTeam.id,
              user_id: userId,
              email: email.toLowerCase(),
              role: 'admin',
              accepted_at: new Date().toISOString(),
            });

          if (memberErr) {
            console.error('[webhook] Team owner member insert failed:', memberErr.message);
          }
        }
      }
    }

    // Mark checkout session as completed (for abandonment tracking)
    const { error: checkoutError } = await supabase
      .from('checkout_sessions')
      .update({ completed: true })
      .eq('session_id', session.id);
    if (checkoutError) {
      Sentry.captureMessage('Checkout session update failed', { level: 'error', extra: { error: checkoutError.message, sessionId: session.id } });
    }

    // Send emails only on first processing (skip on Stripe retries)
    if (email && isNewPurchase) {
      try {
        await sendWelcomeEmail(email, name, tempPassword, session.id);
      } catch (err) {
        Sentry.captureException(err, { extra: { handler: 'stripe-webhook', step: 'welcome_email' } });
      }

      try {
        await sendReceiptEmail(email, name, tier, amountCents, session.id);
      } catch (err) {
        Sentry.captureException(err, { extra: { handler: 'stripe-webhook', step: 'receipt_email' } });
      }
    }

    // ── Affiliate attribution ────────────────────────────────────────
    // If the checkout carried affiliate_link_id metadata (set by
    // /api/checkout reading the aesdr_attribution cookie), write an
    // affiliate_attributions row. Idempotent via the unique index on
    // purchase_id — Stripe webhook retries won't double-attribute.
    //
    // AUDIT (R4-MON-6/#7): assert USD. amount_total is interpreted as
    // USD-cents everywhere downstream; a non-USD (esp. zero-decimal, e.g. JPY)
    // sale would be wrong by up to 100×. If it's not USD, Sentry + skip
    // attribution entirely (access is still provisioned above).
    const currencyOk = (session.currency || '').toLowerCase() === 'usd';
    if (!currencyOk) {
      Sentry.captureMessage('[webhook] Non-USD checkout — skipping attribution', {
        level: 'warning',
        extra: { sessionId: session.id, currency: session.currency },
      });
    }

    // AUDIT (R4-MON-3/#2): team sales are non-attributable per the public
    // promise (affiliates/faq). Never write an attribution for tier 'team'.
    const affiliateLinkId = session.metadata?.affiliate_link_id;
    const affiliateClickId = session.metadata?.affiliate_click_id;
    // AUDIT (review #12): NOT gated on isNewPurchase. The attribution upsert is
    // idempotent on purchase_id, and gating on isNewPurchase meant a first
    // delivery that upserted the purchase then 500'd before this block would
    // permanently lose the commission on the Stripe retry (isNewPurchase=false).
    if (affiliateLinkId && email && currencyOk && tier !== 'team') {
      try {
        const { data: linkRow } = await supabase
          .from('affiliate_links')
          .select('id, affiliate_slug')
          .eq('id', affiliateLinkId)
          .maybeSingle();

        if (linkRow) {
          const { data: purchaseRow } = await supabase
            .from('purchases')
            .select('id, purchased_at')
            .eq('stripe_session_id', session.id)
            .maybeSingle();

          if (purchaseRow) {
            const purchasedAt = new Date(purchaseRow.purchased_at);

            // AUDIT (R4-MON-2/#1/#27): rate comes from the affiliate's own
            // commission_pct column (the previously-dead column), not a
            // hardcoded constant. Falls back to 30% when the row/column is
            // missing. The actual rate used is stored on the attribution row.
            const { data: affiliateRow } = await supabase
              .from('affiliates')
              .select('commission_pct')
              .eq('slug', linkRow.affiliate_slug)
              .maybeSingle();
            const commissionRate = resolveCommissionRate(affiliateRow?.commission_pct);

            // AUDIT (R4-MON-5/#27): commission base is NET of Stripe processing
            // fees where the fee is resolvable. Fetch the charge's
            // balance_transaction.fee via the PaymentIntent's latest charge;
            // base = gross - fee. If the fee can't be resolved (no PI, expand
            // fails, balance_transaction not yet available), fall back to gross.
            // AUDIT: fee may not be settled at webhook time for some payment
            // methods — gross fallback keeps this defensive, never overpaying
            // beyond the configured rate-of-gross worst case.
            let baseCents = amountCents;
            try {
              const piId =
                typeof session.payment_intent === 'string'
                  ? session.payment_intent
                  : session.payment_intent?.id ?? null;
              if (piId) {
                const stripe = getStripe();
                const pi = await stripe.paymentIntents.retrieve(piId);
                const chargeId =
                  typeof pi.latest_charge === 'string'
                    ? pi.latest_charge
                    : pi.latest_charge?.id ?? null;
                if (chargeId) {
                  const charge = await stripe.charges.retrieve(chargeId, {
                    expand: ['balance_transaction'],
                  });
                  const bt = charge.balance_transaction;
                  const feeCents =
                    bt &&
                    typeof bt !== 'string' &&
                    typeof bt.fee === 'number' &&
                    // AUDIT (review #6): balance_transaction.fee is in the Stripe
                    // SETTLEMENT currency, which may differ from the USD charge on
                    // a non-USD-settling account. Only net it off a USD gross when
                    // the fee itself is USD; otherwise fall back to gross.
                    bt.currency === 'usd'
                      ? bt.fee
                      : null;
                  if (feeCents != null && feeCents >= 0 && feeCents < amountCents) {
                    baseCents = amountCents - feeCents;
                  }
                }
              }
            } catch (feeErr) {
              // Non-fatal: leave baseCents = gross.
              Sentry.captureException(feeErr, {
                extra: { handler: 'stripe-webhook', step: 'commission_fee_lookup', sessionId: session.id },
              });
            }

            const commissionCents = computeCommissionCents(baseCents, commissionRate);
            // AUDIT (R3-AF-3/#3): self-referral (buyer email == affiliate's own)
            // is recorded but excluded from payout. Needs the widened status
            // CHECK (20260622_attribution_status_and_applicant_email.sql).
            const selfRef = await isSelfReferral(linkRow.affiliate_slug, email);
            const { error: attrErr } = await supabase.from('affiliate_attributions').upsert(
              {
                link_id: linkRow.id,
                affiliate_slug: linkRow.affiliate_slug,
                click_id: affiliateClickId || null,
                purchase_id: purchaseRow.id,
                user_email: email,
                gross_amount_cents: amountCents,
                // AUDIT (R4-MON-2): store the actual rate used, not a constant.
                commission_rate: commissionRate,
                commission_amount_cents: commissionCents,
                status: selfRef ? 'self_referral' : 'pending',
                attribution_window_closes_at: new Date(
                  purchasedAt.getTime() + ATTRIBUTION_WINDOW_MS
                ).toISOString(),
                refund_window_closes_at: new Date(
                  purchasedAt.getTime() + REFUND_WINDOW_MS
                ).toISOString(),
              },
              { onConflict: 'purchase_id' }
            );
            if (attrErr) {
              Sentry.captureMessage('[webhook] Attribution insert failed', {
                level: 'error',
                extra: { error: attrErr.message, sessionId: session.id, linkId: linkRow.id },
              });
            } else {
              await logEvent('affiliate_attributed', {
                affiliate_slug: linkRow.affiliate_slug,
                link_id: linkRow.id,
                purchase_id: purchaseRow.id,
                commission_cents: commissionCents,
              }, { userId, email });
            }
          }
        }
      } catch (err) {
        Sentry.captureException(err, { extra: { handler: 'stripe-webhook', step: 'affiliate_attribution' } });
      }
    }
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge;
    const supabase = createAdminClient();

    if (charge.payment_intent) {
      const stripe = getStripe();
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: charge.payment_intent as string,
        limit: 1,
      });
      const sessionId = sessions.data[0]?.id;
      if (sessionId) {
        // AUDIT (R4-MON-4 / decision #28): reduce commission PRO-RATA on a
        // refund. A full refund (amount_refunded >= captured) also revokes
        // access; a partial refund keeps access but still claws back the
        // refunded proportion of the affiliate's commission. amount_refunded is
        // CUMULATIVE, so proRataClawbackCents + GREATEST(existing, target) makes
        // incremental refunds monotonic and a webhook redelivery a no-op.
        const capturedCents = charge.amount_captured || charge.amount || 0;
        const refundedCents = charge.amount_refunded || 0;
        const isFullRefund = capturedCents > 0 && refundedCents >= capturedCents;

        const { data: purchase } = await supabase
          .from('purchases')
          .select('id')
          .eq('stripe_session_id', sessionId)
          .maybeSingle();

        if (purchase?.id) {
          const purchaseId = purchase.id;
          const { data: attrs } = await supabase
            .from('affiliate_attributions')
            .select('id, affiliate_slug, commission_amount_cents, status')
            .eq('purchase_id', purchaseId);
          const paidAttrs = (attrs ?? []).filter(
            (a) => a.status === 'paid' && (a.commission_amount_cents ?? 0) > 0,
          );
          const unpaidAttrs = (attrs ?? []).filter(
            (a) => a.status === 'pending' || a.status === 'cleared',
          );

          // Read-then-GREATEST-then-upsert a pro-rata 'refund' clawback for a set
          // of attributions. Overwrites to max(existing, target) so a redelivery
          // or a smaller out-of-order event never LOWERS an existing clawback.
          // (Concurrency note: two refund webhooks for the same charge could
          // interleave this read/write; partial refunds are rare enough that the
          // tiny race is acceptable — the unique index still prevents dup rows.)
          const writeProRataClawbacks = async (
            rows: { id: string; affiliate_slug: string | null; commission_amount_cents: number | null }[],
            label: string,
          ) => {
            if (rows.length === 0) return;
            const ids = rows.map((a) => a.id);
            const { data: existing } = await supabase
              .from('commission_clawbacks')
              .select('attribution_id, amount_cents')
              .eq('reason', 'refund')
              .in('attribution_id', ids);
            const existingMap = new Map(
              (existing ?? []).map((r) => [r.attribution_id, r.amount_cents ?? 0]),
            );
            const upsertRows = rows
              .map((a) => {
                const target = proRataClawbackCents(
                  a.commission_amount_cents ?? 0,
                  refundedCents,
                  capturedCents,
                );
                const amount = Math.max(existingMap.get(a.id) ?? 0, target);
                return {
                  affiliate_slug: a.affiliate_slug,
                  attribution_id: a.id,
                  purchase_id: purchaseId,
                  amount_cents: amount,
                  reason: 'refund',
                };
              })
              .filter((r) => r.amount_cents > 0);
            if (upsertRows.length === 0) return;
            const { error: cbErr } = await supabase
              .from('commission_clawbacks')
              .upsert(upsertRows, { onConflict: 'attribution_id,reason' });
            if (cbErr) {
              Sentry.captureMessage(`[webhook] clawback ledger upsert failed (${label})`, {
                level: 'error',
                extra: { sessionId, purchaseId, error: cbErr.message },
              });
            }
          };

          // PAID attributions: the money is out the door — claw back the
          // refunded proportion (full refund → fraction 1.0 → whole commission).
          await writeProRataClawbacks(paidAttrs, 'refund, paid');

          if (isFullRefund) {
            const { error: pErr } = await supabase
              .from('purchases')
              .update({ status: 'refunded' })
              .eq('id', purchaseId);
            if (pErr) console.error('[webhook] Refund status update failed:', pErr.message);

            if (unpaidAttrs.length > 0) {
              const unpaidIds = unpaidAttrs.map((a) => a.id);
              // Not-yet-paid commission is simply withdrawn, not clawed back.
              await supabase
                .from('affiliate_attributions')
                .update({ status: 'refunded', refunded_at: new Date().toISOString() })
                .in('id', unpaidIds);
              // An excluded (refunded + unpaid) attribution must NOT carry a
              // clawback — it would net against the affiliate's OTHER payouts.
              // Drop any pro-rata clawback written while this was still partial.
              await supabase
                .from('commission_clawbacks')
                .delete()
                .eq('reason', 'refund')
                .in('attribution_id', unpaidIds);
            }
          } else {
            // PARTIAL refund: keep access; reduce not-yet-paid commission
            // pro-rata via the same ledger so the next payout nets it.
            await writeProRataClawbacks(unpaidAttrs, 'refund, partial unpaid');
            Sentry.captureMessage('[webhook] Partial refund — access kept, commission reduced pro-rata', {
              level: 'info',
              extra: { sessionId, refundedCents, capturedCents },
            });
          }
        }
      }
    }
  }

  // ── Stripe Connect: affiliate Standard accounts ──────────────────
  // Track the affiliate's Stripe account through onboarding and any
  // subsequent restriction/disable events. Status drives whether the
  // payout batch processor can include this affiliate.
  if (event.type === 'account.updated') {
    const account = event.data.object as Stripe.Account;
    const status = mapAccountStatus(account);
    const supabase = createAdminClient();

    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('id, stripe_account_status')
      .eq('stripe_account_id', account.id)
      .maybeSingle();

    if (affiliate) {
      const previousStatus = affiliate.stripe_account_status;
      await supabase
        .from('affiliates')
        .update({ stripe_account_status: status })
        .eq('id', affiliate.id);

      if (status === 'enabled' && previousStatus !== 'enabled') {
        await logEvent('affiliate_stripe_enabled', {
          affiliate_id: affiliate.id,
          stripe_account_id: account.id,
        });
      }
    }
  }

  if (event.type === 'charge.dispute.created') {
    const dispute = event.data.object as Stripe.Dispute;
    const supabase = createAdminClient();

    if (dispute.payment_intent) {
      const stripe = getStripe();
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: dispute.payment_intent as string,
        limit: 1,
      });
      const sessionId = sessions.data[0]?.id;
      if (sessionId) {
        const { data: disputedPurchase, error } = await supabase
          .from('purchases')
          .update({ status: 'disputed' })
          .eq('stripe_session_id', sessionId)
          .select('id')
          .maybeSingle();
        if (error) console.error('[webhook] Dispute status update failed:', error.message);

        // AUDIT (P0-2): a dispute previously touched purchases only and left
        // affiliate_attributions untouched — so we kept paying 30% commission
        // on revenue we were losing to a chargeback. Flip any not-yet-paid
        // attribution out of pending/cleared to 'refunded' (the closest status
        // the CHECK constraint allows). If the dispute is later WON, the
        // charge.dispute.closed handler below re-clears it.
        if (disputedPurchase?.id) {
          const { data: paidAttrs } = await supabase
            .from('affiliate_attributions')
            .select('id, affiliate_slug, commission_amount_cents')
            .eq('purchase_id', disputedPurchase.id)
            .eq('status', 'paid');
          if (paidAttrs && paidAttrs.length > 0) {
            // AUDIT (P0-2): commission already paid out on a now-disputed sale —
            // write a clawback ledger row; the next payout nets it out.
            const clawbackRows = paidAttrs
              .filter((a) => (a.commission_amount_cents ?? 0) > 0)
              .map((a) => ({
                affiliate_slug: a.affiliate_slug,
                attribution_id: a.id,
                purchase_id: disputedPurchase.id,
                amount_cents: a.commission_amount_cents,
                reason: 'dispute',
              }));
            if (clawbackRows.length > 0) {
              const { error: cbErr } = await supabase.from('commission_clawbacks').insert(clawbackRows);
              if (cbErr) {
                Sentry.captureMessage('[webhook] clawback ledger insert failed (dispute)', {
                  level: 'error',
                  extra: { sessionId, purchaseId: disputedPurchase.id, error: cbErr.message },
                });
              }
            }
          }

          await supabase
            .from('affiliate_attributions')
            .update({
              status: 'refunded',
              refunded_at: new Date().toISOString(),
            })
            .eq('purchase_id', disputedPurchase.id)
            .in('status', ['pending', 'cleared']);
        }
      }
    }
  }

  // AUDIT (R4-SM-2/#5): a WON dispute previously left the buyer locked out of a
  // purchase they legitimately keep (no handler restored 'active'). On
  // charge.dispute.closed, restore access on a win and re-clear the attribution
  // we flipped on dispute.created; on a loss, leave it 'disputed'/'refunded'.
  if (event.type === 'charge.dispute.closed') {
    const dispute = event.data.object as Stripe.Dispute;
    const supabase = createAdminClient();

    if (dispute.payment_intent && dispute.status === 'won') {
      const stripe = getStripe();
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: dispute.payment_intent as string,
        limit: 1,
      });
      const sessionId = sessions.data[0]?.id;
      if (sessionId) {
        // Only restore rows we put into 'disputed' (don't resurrect a genuine
        // refund that happened to share a payment intent).
        const { data: restoredPurchase, error } = await supabase
          .from('purchases')
          .update({ status: 'active' })
          .eq('stripe_session_id', sessionId)
          .eq('status', 'disputed')
          .select('id')
          .maybeSingle();
        if (error) console.error('[webhook] Dispute-won restore failed:', error.message);

        // Re-clear the attribution we flipped to 'refunded' on dispute.created.
        // Back to 'pending' so the normal clear/payout cron picks it up again.
        if (restoredPurchase?.id) {
          await supabase
            .from('affiliate_attributions')
            .update({ status: 'pending', refunded_at: null })
            .eq('purchase_id', restoredPurchase.id)
            .eq('status', 'refunded');
        }
      }
    }
    // AUDIT (R4-SM-2): status === 'lost' (or warning_closed) — leave the
    // purchase 'disputed' and the attribution 'refunded' as-is.
  }

  return NextResponse.json({ received: true });
}
