export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

export async function GET(request: Request) {
  // Rate limit: 20 requests per IP per minute (success page polls every 2s for 30s)
  const ip = getClientIP(request);
  const rl = rateLimit(`purchase-status:${ip}`, { max: 20, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  // Validate session_id format (Stripe session IDs are cs_test_/cs_live_ + alphanumeric)
  if (!sessionId || !/^cs_(test|live)_[a-zA-Z0-9]{10,}$/.test(sessionId)) {
    return NextResponse.json({ confirmed: false });
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from('purchases')
    .select('user_email, customer_name, plan')
    .eq('stripe_session_id', sessionId)
    .eq('status', 'active')
    .maybeSingle();

  if (!data) {
    return NextResponse.json({ confirmed: false });
  }

  return NextResponse.json({
    confirmed: true,
    email: data.user_email,
    name: data.customer_name,
    plan: data.plan,
  });
}
