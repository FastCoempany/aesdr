/**
 * One place for required-environment behavior (audit P2-12).
 *
 * `requireEnv` is the canonical fail-loud accessor for a variable the app
 * cannot run correctly without: it throws a clear, named error rather than
 * letting an `undefined` propagate into a silent misbehavior downstream.
 *
 * ── Required SERVER environment variables ─────────────────────────────────
 * These MUST be set in every deployed environment. They are server-only
 * (never prefixed `NEXT_PUBLIC_`) and are read at the point of use, not here —
 * this comment is the canonical reference for what "fully configured" means:
 *
 *   STRIPE_SECRET_KEY              Stripe API key (checkout, transfers, refunds)
 *   STRIPE_WEBHOOK_SECRET          Verifies inbound Stripe webhook signatures
 *   SUPABASE_SERVICE_ROLE_KEY      Supabase service-role key (admin client, RLS bypass)
 *   NEXT_PUBLIC_SUPABASE_URL       Supabase project URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY  Supabase anon key (browser client)
 *   RESEND_API_KEY                 Resend transactional email (alias: aesdr_email_api_key)
 *   UPSTASH_REDIS_REST_URL         Upstash Redis REST endpoint (distributed rate limiting)
 *   UPSTASH_REDIS_REST_TOKEN       Upstash Redis REST token
 *   CRON_SECRET                    Bearer secret guarding the cron routes
 *   KIT_TOKEN_SECRET               HMAC secret for affiliate-kit access tokens
 *
 * ── Required PUBLIC (build-time inlined) variable ─────────────────────────
 *   NEXT_PUBLIC_SITE_URL           Canonical site origin. Read via getSiteUrl()
 *                                  in lib/site-url.ts, which fails loud in
 *                                  production rather than defaulting to a host.
 */

/**
 * Return the value of a required environment variable, or throw if it is
 * missing/empty. Use for any variable whose absence should hard-fail the
 * request instead of degrading silently.
 */
export function requireEnv(name: string): string {
  const v = process.env[name];
  if (v == null || v === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

/** True when running in a production build (`NODE_ENV === "production"`). */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
