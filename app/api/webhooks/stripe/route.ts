export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendWelcomeEmail, sendReceiptEmail } from '@/lib/email';

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

    // Look up or create Supabase auth user by email
    let userId: string | null = null;
    let magicLink: string | null = null;

    if (email) {
      // Check if user already exists
      const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const existingUser = users?.users?.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      );

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Auto-create auth user with a random password (they'll use magic link)
        const tempPassword = crypto.randomUUID() + crypto.randomUUID();
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: { full_name: name !== 'there' ? name : undefined },
        });

        if (createError) {
          console.error('Failed to create auth user:', createError);
        } else if (newUser?.user) {
          userId = newUser.user.id;
        }
      }

      // Generate magic link for the welcome email
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aesdr.com'}/auth/callback?next=/dashboard`,
        },
      });

      if (linkError) {
        console.error('Failed to generate magic link:', linkError);
      } else if (linkData?.properties?.action_link) {
        magicLink = linkData.properties.action_link;
      }
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

    // Send emails (don't let failures break the webhook)
    if (email) {
      try {
        await sendWelcomeEmail(email, name, magicLink);
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
