# Launch Day: Proxy Removal Plan

> Step-by-step checklist for flipping AESDR from gated pre-launch to public.
> Estimated time: 15 minutes. Zero downtime.

---

## Pre-Launch Checks (do these the day before)

- [ ] Stripe integration live and tested with a real $1 charge (refund after)
- [ ] Supabase RLS policies reviewed and enabled on all tables
- [ ] Real testimonials replacing faux placeholders in `components/Testimonials.tsx`
- [ ] Legal pages (terms, privacy, refund) reviewed by you
- [ ] support@aesdr.com inbox active and receiving
- [ ] DNS and SSL verified on aesdr.com

---

## Launch Sequence

### Step 1: Remove the proxy gate

Delete `proxy.ts` from the project root entirely:

```bash
rm proxy.ts
```

This removes the redirect-to-landing behavior. All routes become accessible via normal auth flow (Supabase handles protected routes).

### Step 2: Flip robots.ts to allow crawling

Edit `app/robots.ts` — replace the `disallow: ["/"]` rule with:

```ts
rules: {
  userAgent: "*",
  allow: ["/", "/about", "/terms", "/privacy", "/refund-policy", "/contact"],
  disallow: ["/dashboard", "/course", "/login", "/signup", "/api"],
},
```

### Step 3: Remove the ghost button

Delete `components/GhostButton.tsx` and remove its import + usage from `app/page.tsx`.

Remove the `aesdr_bypass` cookie reference (no longer needed):
- Delete the `ghostPulse` keyframe from `app/globals.css`

### Step 4: Deploy

```bash
git add -A
git commit -m "Launch: remove proxy gate, enable SEO crawling, remove ghost button"
git push origin main
```

Vercel (or your host) will auto-deploy from main.

### Step 5: Verify

- [ ] Visit aesdr.com — landing page loads publicly
- [ ] Visit aesdr.com/dashboard — redirects to /login (Supabase auth, not proxy)
- [ ] Visit aesdr.com/login — login form works
- [ ] Visit aesdr.com/robots.txt — shows correct allow/disallow rules
- [ ] Visit aesdr.com/sitemap.xml — lists public pages
- [ ] Google Search Console: submit sitemap URL

---

## Rollback (if something breaks)

Re-add `proxy.ts` from git history:

```bash
git checkout HEAD~1 -- proxy.ts
git commit -m "Rollback: re-enable proxy gate"
git push origin main
```

This restores the gated state in under 60 seconds.

---

## Post-Launch (within 24 hours)

- [ ] Submit sitemap to Google Search Console
- [ ] Test purchase flow end-to-end with a real card
- [ ] Send launch announcement (email list, social)
- [ ] Monitor Supabase dashboard for auth errors
- [ ] Check Vercel logs for 500s
