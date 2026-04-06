# Environment Variable Audit

> Every env var the app needs, where to find the value, and where to set it.

---

## Current Variables (required now)

| Variable | Value Source | Scope | Secret? |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard > Settings > API > Project URL | Client + Server | No (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard > Settings > API > anon public key | Client + Server | No (public, but don't share casually) |
| `SITE_URL` | `https://aesdr.com` | Server only | No |

## Future Variables (add when integrating)

| Variable | Value Source | Scope | Secret? |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe dashboard > Developers > API keys > Secret key | Server only | **YES** |
| `STRIPE_WEBHOOK_SECRET` | Stripe dashboard > Developers > Webhooks > Signing secret | Server only | **YES** |
| `STRIPE_PRICE_ID_INDIVIDUAL` | Stripe dashboard > Products > Individual plan > Price ID | Server only | No |
| `STRIPE_PRICE_ID_TEAM` | Stripe dashboard > Products > Team plan > Price ID | Server only | No |
| `RESEND_API_KEY` | Resend dashboard > API Keys (if using Resend for email) | Server only | **YES** |

---

## Where to Set Them

### Local Development
File: `.env.local` (gitignored — never commit this)

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your_anon_key
SITE_URL=http://localhost:3000
```

### Vercel (Production + Preview)
1. Go to **Vercel dashboard > Your project > Settings > Environment Variables**
2. Add each variable
3. Set the correct scope:
   - **Production:** all variables
   - **Preview:** all variables (use same Supabase project or a staging one)
   - **Development:** not needed (use `.env.local` locally)

---

## How to Verify Everything Matches

### Step 1: Get your Supabase values
1. Open **Supabase dashboard > Settings > API**
2. Copy "Project URL" (looks like `https://xyzabc.supabase.co`)
3. Copy "anon public" key (starts with `eyJ`)

### Step 2: Check Vercel
1. Open **Vercel dashboard > Your project > Settings > Environment Variables**
2. Find `NEXT_PUBLIC_SUPABASE_URL` — click the eye icon to reveal the value
3. Compare character-by-character with what you copied from Supabase
4. Do the same for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Confirm `SITE_URL` is `https://aesdr.com`

### Step 3: Check local
1. Open `.env.local` in your project root
2. Same comparison — values should match Supabase dashboard

If anything doesn't match: update the incorrect one and redeploy.

---

## Security Rules

1. **Never commit `.env.local`** — it's in `.gitignore` by default
2. **Never put secret keys in `NEXT_PUBLIC_` variables** — those are exposed to the browser
3. **If a key leaks in git history:**
   - Rotate it immediately in the source dashboard (Supabase/Stripe)
   - Update Vercel env vars with the new value
   - Redeploy
4. **Use different Stripe keys for test vs. live** — Stripe provides both in the dashboard
5. **The `anon` key is designed to be public** — it's rate-limited and scoped by RLS policies. The `service_role` key is the dangerous one. Never use `service_role` in client code.

---

## Quick Sanity Check Command

Run this locally to verify your env vars are loaded:

```bash
npx next info
```

This prints your Next.js config. If the app starts without errors, your env vars are working.
