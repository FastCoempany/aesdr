export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import Stripe from 'stripe';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendWelcomeEmail, sendReceiptEmail } from '@/lib/email';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  return new Stripe(key);
}

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
      Sentry.captureMessage('Purchase upsert failed', { level: 'error', extra: { error: purchaseError.message, sessionId: session.id } });
    }

    // If team plan, create team + add owner as admin member
    if (tier === 'team' && userId && isNewPurchase) {
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
            max_seats: 10,
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
        await sendWelcomeEmail(email, name, tempPassword);
      } catch (err) {
        Sentry.captureException(err, { extra: { handler: 'stripe-webhook', step: 'welcome_email' } });
      }

      try {
        await sendReceiptEmail(email, name, tier, amountCents);
      } catch (err) {
        Sentry.captureException(err, { extra: { handler: 'stripe-webhook', step: 'receipt_email' } });
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
        const { error } = await supabase
          .from('purchases')
          .update({ status: 'refunded' })
          .eq('stripe_session_id', sessionId);
        if (error) console.error('[webhook] Refund status update failed:', error.message);
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
        const { error } = await supabase
          .from('purchases')
          .update({ status: 'disputed' })
          .eq('stripe_session_id', sessionId);
        if (error) console.error('[webhook] Dispute status update failed:', error.message);
      }
    }
  }

  return NextResponse.json({ received: true });
}
