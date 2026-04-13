export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { createAdminClient } from '@/utils/supabase/admin';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  return new Stripe(key);
}

const checkoutSchema = z.object({
  tier: z.enum(['individual', 'team']),
  email: z.string().email().max(320).optional(),
});

export async function POST(request: Request) {
  try {
    // Rate limit: 5 checkout sessions per IP per hour
    const ip = getClientIP(request);
    const rl = rateLimit(`checkout:${ip}`, { max: 5, windowMs: 60 * 60 * 1000 });
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Validate origin to prevent cross-site form submission
    const origin = request.headers.get('origin');
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aesdr.com';
    if (origin && new URL(siteUrl).origin !== origin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const result = checkoutSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request: ' + result.error.issues.map(i => i.message).join(', ') },
        { status: 400 }
      );
    }
    const { tier, email } = result.data;

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
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aesdr.com'}/purchase/cancel`,
      customer_email: email || undefined,
      metadata: { tier },
    });

    // Log checkout start for abandonment tracking
    if (email) {
      const supabase = createAdminClient();
      const { error: sessionError } = await supabase.from('checkout_sessions').upsert(
        {
          session_id: session.id,
          user_email: email,
          tier,
          started_at: new Date().toISOString(),
          completed: false,
        },
        { onConflict: 'session_id' }
      );
      if (sessionError) {
        console.error('Checkout session tracking failed:', sessionError.message);
      }
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
