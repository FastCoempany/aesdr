export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendWelcomeEmail } from '@/lib/email';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
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

    // Look up Supabase auth user by email to link purchase to user_id
    let userId: string | null = null;
    if (email) {
      const { data } = await supabase.auth.admin.getUserByEmail(email);
      if (data?.user) userId = data.user.id;
    }

    // Record purchase (idempotent via upsert on stripe_session_id)
    await supabase.from('purchases').upsert(
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

    // Mark checkout session as completed (for abandonment tracking)
    await supabase
      .from('checkout_sessions')
      .update({ completed: true })
      .eq('session_id', session.id);

    // Send welcome email (don't let failure break the webhook)
    if (email) {
      try {
        await sendWelcomeEmail(email, name);
      } catch (err) {
        console.error('Welcome email failed:', err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
