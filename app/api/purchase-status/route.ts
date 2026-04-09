export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
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
