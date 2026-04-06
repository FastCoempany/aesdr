# First 24 Hours: Launch Day Monitoring

> What to watch, when to check, and what to do if something breaks.

---

## The Monitoring Schedule

### Hour 0 (immediately after deploy)
- [ ] Visit aesdr.com — confirm landing page loads
- [ ] Visit aesdr.com/login — confirm login form appears
- [ ] Create a test account, sign in, visit dashboard
- [ ] Open a lesson, advance a few screens, verify progress saves
- [ ] Complete a lesson, verify "Completed" badge appears on dashboard
- [ ] Download a tool PDF — confirm it downloads
- [ ] Make a test purchase with Stripe test card (if test mode) or real card ($1 product)
- [ ] Check Stripe dashboard for the charge
- [ ] Check Supabase dashboard for the new user row

### Hour 1-2
- [ ] Check Vercel dashboard > Deployments > latest > Logs — any 500 errors?
- [ ] Check Supabase dashboard > Authentication > Users — are signups appearing?
- [ ] Check Stripe dashboard > Payments — any failed charges?
- [ ] Check support@aesdr.com — any bounce-backs or user emails?

### Hour 6
- [ ] Same checks as Hour 1-2
- [ ] Check Supabase > Database > course_progress — are rows being created?
- [ ] Spot-check: sign in as your test user, verify progress persisted

### Hour 12
- [ ] Same checks
- [ ] Look for patterns: repeated auth failures? Same user hitting errors?

### Hour 24
- [ ] Full review of all dashboards
- [ ] Count: signups, purchases, lessons started, lessons completed
- [ ] Respond to any support emails

---

## Where to Check

| What | Where |
|---|---|
| Site status | Visit aesdr.com directly |
| Deploy logs / errors | Vercel dashboard > Project > Deployments > [latest] > Functions tab |
| Auth / signups | Supabase dashboard > Authentication > Users |
| Database activity | Supabase dashboard > Table Editor > course_progress |
| Payments | Stripe dashboard > Payments |
| Webhooks | Stripe dashboard > Developers > Webhooks > [endpoint] > Attempts |
| User emails | support@aesdr.com inbox |
| DNS issues | [dnschecker.org](https://dnschecker.org) — enter aesdr.com |

---

## Common Launch Issues and Fixes

### "Login doesn't work"
- **Check:** Supabase dashboard > Authentication > URL Configuration
- **Fix:** Ensure "Site URL" is `https://aesdr.com` (not localhost)
- **Fix:** Ensure "Redirect URLs" includes `https://aesdr.com/**`

### "Payment went through but no access"
- **Check:** Stripe webhook logs — is the webhook firing?
- **Fix:** Verify webhook endpoint URL in Stripe matches your Vercel deployment URL
- **Manual fix:** Create the purchase row in Supabase manually while debugging

### "Site shows old version"
- **Check:** Vercel dashboard — is the latest deploy actually live?
- **Fix:** Try hard refresh (Ctrl+Shift+R). If stale, trigger a redeploy in Vercel.

### "500 error on lesson page"
- **Check:** Vercel function logs for stack trace
- **Likely cause:** Supabase env vars misconfigured
- **Fix:** Compare Vercel env vars with Supabase dashboard values

### "Too many requests" / rate limiting
- **Check:** Supabase dashboard > Settings > Billing — are you on Free tier?
- **Free tier limit:** 150 concurrent Postgres connections
- **Fix:** If hitting limits on launch day, upgrade to Pro ($25/mo) immediately

---

## Kill Switches

### Level 1: Pause payments (keep site up)
In Stripe dashboard: **Products > [AESDR] > Archive product**
Users can still access courses, but no new purchases.

### Level 2: Lock site (emergency)
Re-add `proxy.ts` from git history:
```bash
git checkout HEAD~1 -- proxy.ts
git commit -m "Emergency: re-enable proxy lock"
git push origin main
```
Vercel auto-deploys. Site returns to pre-launch gated state within 2-3 minutes.

### Level 3: Full maintenance mode
Replace `app/page.tsx` return with:
```tsx
return (
  <main style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#020617", color: "#fff", fontFamily: "system-ui" }}>
    <p>We're doing some quick maintenance. Back shortly.</p>
  </main>
);
```
Deploy. All routes show the maintenance message.

---

## After 24 Hours

If nothing caught fire:
- Set up a weekly check (15 min): skim Vercel logs, Supabase users, Stripe payments
- Reply to any support emails within 48 hours (per your contact page promise)
- Start watching for drop-off patterns (users who sign up but never start Lesson 1)
