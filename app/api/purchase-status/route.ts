export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

// Session IDs older than this are treated as stale — prevents harvesting
// PII via leaked/logged/bookmarked Stripe session IDs long after checkout.
const MAX_SESSION_AGE_MS = 30 * 60 * 1000; // 30 minutes

export async function GET(request: Request) {
  try {
    const ip = getClientIP(request);
    const rl = await rateLimit(`purchase-status:${ip}`, { max: 20, windowMs: 60 * 1000 });
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId || !/^cs_(test|live)_[a-zA-Z0-9]{10,}$/.test(sessionId)) {
      return NextResponse.json({ confirmed: false });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('purchases')
      .select('customer_name, plan, purchased_at')
      .eq('stripe_session_id', sessionId)
      .eq('status', 'active')
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ confirmed: false });
    }

    const age = Date.now() - new Date(data.purchased_at).getTime();
    if (age > MAX_SESSION_AGE_MS) {
      return NextResponse.json({ confirmed: true });
    }

    return NextResponse.json({
      confirmed: true,
      name: data.customer_name,
      plan: data.plan,
    });
  } catch {
    return NextResponse.json({ confirmed: false });
  }
}
