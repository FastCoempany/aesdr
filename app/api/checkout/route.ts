export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/utils/supabase/admin';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(request: Request) {
  try {
    const { tier, email } = await request.json();

    const priceMap: Record<string, string | undefined> = {
      individual: process.env.STRIPE_PRICE_ID_INDIVIDUAL,
      team: process.env.STRIPE_PRICE_ID_TEAM,
    };

    const priceId = priceMap[tier];
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aesdr.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aesdr.com'}/#pricing`,
      customer_email: email || undefined,
      metadata: { tier },
    });

    // Log checkout start for abandonment tracking
    if (email) {
      const supabase = createAdminClient();
      await supabase.from('checkout_sessions').upsert(
        {
          session_id: session.id,
          user_email: email,
          tier,
          started_at: new Date().toISOString(),
          completed: false,
        },
        { onConflict: 'session_id' }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
