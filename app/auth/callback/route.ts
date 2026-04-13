import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Allowed redirect paths after authentication (prevent open redirect)
const ALLOWED_PREFIXES = ['/dashboard', '/account', '/course', '/tools'];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  let next = searchParams.get('next') || '/dashboard';

  // Prevent open redirect: only allow relative paths with known prefixes
  if (
    next.startsWith('http') ||
    next.startsWith('//') ||
    !ALLOWED_PREFIXES.some((p) => next.startsWith(p))
  ) {
    next = '/dashboard';
  }

  const supabase = await createClient();

  if (code) {
    // OAuth / PKCE code exchange
    await supabase.auth.exchangeCodeForSession(code);
  } else if (token_hash && type) {
    // Magic link / email OTP verification
    await supabase.auth.verifyOtp({ token_hash, type: type as 'magiclink' | 'email' });
  }

  return NextResponse.redirect(new URL(next, origin));
}
