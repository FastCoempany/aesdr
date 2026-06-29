export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { userHasCompletedCourse } from '@/utils/access/courseComplete';
import { ATTRIBUTION_COOKIE, parseAttributionCookie } from '@/lib/affiliate';
import { rateLimit, getClientIP } from '@/lib/rate-limit';
import { getSiteUrl } from '@/lib/site-url';
// AUDIT (IC-2/#54): use the centralized, apiVersion-pinned Stripe client
// instead of constructing a bare `new Stripe(key)` here.
import { getStripe } from '@/lib/stripe-connect';

const checkoutSchema = z.object({
  tier: z.enum(['sdr', 'ae', 'team', 'artifact_unlock']),
  email: z.string().email().max(320).optional(),
  artifact_type: z.enum(['playbill', 'redline']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 checkout sessions per IP per hour
    const ip = getClientIP(request);
    const rl = await rateLimit(`checkout:${ip}`, { max: 5, windowMs: 60 * 60 * 1000 });
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Validate origin to prevent cross-site form submission
    const origin = request.headers.get('origin');
    const siteUrl = getSiteUrl();
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
    const { tier, email, artifact_type } = result.data;

    const priceMap: Record<string, string | undefined> = {
      sdr: process.env.STRIPE_PRICE_ID_SDR,
      ae: process.env.STRIPE_PRICE_ID_AE,
      team: process.env.STRIPE_PRICE_ID_TEAM,
      artifact_unlock: process.env.STRIPE_PRICE_ID_ARTIFACT_UNLOCK,
    };

    const priceId = priceMap[tier];
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    if (tier === 'artifact_unlock') {
      if (!artifact_type) {
        return NextResponse.json({ error: 'Artifact required for unlock' }, { status: 400 });
      }
      // AUDIT (#1 / P1-16, adversarial pass): gate the $40 unlock on auth +
      // course completion. Without this a buyer could pay $40 for an artifact
      // they never earned — which was therefore never generated — and land on an
      // empty page. If they finished the course, the artifact exists.
      const sb = await createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Sign in to unlock this artifact.' }, { status: 401 });
      }
      if (!(await userHasCompletedCourse(sb, user.id))) {
        return NextResponse.json({ error: 'Finish the course to unlock this artifact.' }, { status: 403 });
      }
    }

    const isUnlock = tier === 'artifact_unlock';
    const successUrl = isUnlock
      ? `${siteUrl}/artifacts/${artifact_type === 'playbill' ? 'playbill' : 'redline'}?unlocked=1`
      : `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = isUnlock
      ? `${siteUrl}/dashboard`
      : `${siteUrl}/purchase/cancel`;

    // Read attribution cookie (set by /r/[slug] when an affiliate's
    // audience clicked through). Passed to Stripe as session metadata so
    // the webhook can write an affiliate_attributions row after payment.
    const attributionCookie = request.cookies.get(ATTRIBUTION_COOKIE)?.value;
    const attribution = parseAttributionCookie(attributionCookie);

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      // R4-MON-7: Stripe Tax calculates + collects sales tax/VAT at checkout from
      // the buyer's location and your registered jurisdictions. Requires Stripe
      // Tax enabled in the dashboard (it is). Checkout auto-collects the billing
      // address when this is on, and your products fall back to Stripe's default
      // tax code unless you set one per product.
      automatic_tax: { enabled: true },
      // Guarantee a calculable address for Stripe Tax (don't rely on card
      // country alone, which Stripe treats as low-confidence for digital goods).
      billing_address_collection: 'required',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email || undefined,
      // AUDIT (IC-3/#55): always create a Stripe Customer so repeat buyers
      // join on a stable Customer id.
      customer_creation: 'always',
      // AUDIT (IC-1/#53): allow promo codes on the two individual course
      // tiers only (sdr/ae). Not on team or artifact_unlock.
      ...((tier === 'sdr' || tier === 'ae') ? { allow_promotion_codes: true } : {}),
      metadata: {
        tier,
        ...(artifact_type ? { artifact_type } : {}),
        ...(attribution
          ? {
              affiliate_link_id: attribution.linkId,
              affiliate_click_id: attribution.clickId,
            }
          : {}),
      },
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
