export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendWelcomeEmail, sendReceiptEmail } from '@/lib/email';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
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
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email;
    const name = session.customer_details?.name || 'there';
    const tier = session.metadata?.tier || 'individual';
    const amountCents = session.amount_total || 0;

    const supabase = createAdminClient();

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
        },
      });

      if (newUser?.user) {
        userId = newUser.user.id;
      } else if (createError) {
        // User already exists — look up by querying the purchases table
        // for a previous record with this email, or fall back to a
        // bounded admin user list
        tempPassword = null;

        const { data: existingPurchase } = await supabase
          .from('purchases')
          .select('user_id')
          .eq('user_email', email.toLowerCase())
          .not('user_id', 'is', null)
          .limit(1)
          .maybeSingle();

        if (existingPurchase?.user_id) {
          userId = existingPurchase.user_id;
        } else {
          // Last resort: bounded list search (cap at 50, paginate if needed)
          const { data: userList } = await supabase.auth.admin.listUsers({ perPage: 50 });
          const matched = userList?.users?.find(
            (u) => u.email?.toLowerCase() === email.toLowerCase()
          );
          userId = matched?.id ?? null;
        }
      }
    }

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
      console.error('Purchase upsert failed:', purchaseError.message);
    }

    // Mark checkout session as completed (for abandonment tracking)
    const { error: checkoutError } = await supabase
      .from('checkout_sessions')
      .update({ completed: true })
      .eq('session_id', session.id);
    if (checkoutError) {
      console.error('Checkout session update failed:', checkoutError.message);
    }

    // Send emails (don't let failures break the webhook)
    if (email) {
      try {
        await sendWelcomeEmail(email, name, tempPassword);
      } catch (err) {
        console.error('Welcome email failed:', err);
      }

      try {
        await sendReceiptEmail(email, name, tier, amountCents);
      } catch (err) {
        console.error('Receipt email failed:', err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
