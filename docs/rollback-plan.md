# AESDR Rollback Plan

## Instant Rollback via Vercel (< 30 seconds)

Every Vercel deployment is immutable. Rolling back means pointing production
to a previous known-good deployment.

### Steps

1. Go to **vercel.com** → AESDR project → **Deployments**
2. Find the last known-good deployment (green "Ready" status, before the bad deploy)
3. Click the **three dots** (⋯) → **Promote to Production**
4. Production is now running the old code. Done.

### What This Affects

- All serverless functions (API routes, server components) switch immediately
- Static assets switch within seconds (CDN invalidation)
- Database is NOT rolled back — schema changes require manual reversal

### Database Rollback

If a migration broke something:

1. Go to **Supabase** → **SQL Editor**
2. Run the reverse migration (DROP TABLE, ALTER TABLE, etc.)
3. Migrations do not auto-rollback — always test migrations in Supabase's
   staging branch first if available

## Environment Variable Issues

If a bad env var caused the issue:

1. **Vercel** → Settings → Environment Variables → fix the value
2. Click **Deployments** → latest → ⋯ → **Redeploy**

## Top Failure Modes and Responses

| Failure | Symptom | Response |
|---------|---------|----------|
| Bad deploy | Pages crash, 500 errors | Vercel rollback (steps above) |
| Supabase down | Auth fails, data not loading | Check status.supabase.com, wait for recovery |
| Stripe webhook broken | Purchases not provisioning | Check Vercel logs, fix code, re-send failed events from Stripe dashboard |
| Resend down | Emails not sending | Check resend.com status; users can still sign in, purchases still work |
| Rate limiter too aggressive | Users blocked from normal actions | Adjust limits in lib/rate-limit.ts or relevant route, redeploy |
| Admin locked out | ADMIN_EMAILS wrong | Fix env var in Vercel, redeploy |

## Monitoring

- **Health check:** `GET /api/health` — returns 200 if app + database are healthy, 503 if degraded
- **Vercel Logs:** Real-time function logs at vercel.com → Logs
- **Sentry:** Error tracking at sentry.io (configured on main branch)
