# AESDR Staged Rollout Plan

## Overview

Four-week rollout from private alpha to public launch. Each stage has
explicit gate criteria that must be met before advancing.

**Monitoring during all stages:** Check Vercel Logs and `/api/health`
daily. Respond to any 503 within 1 hour.

---

## Week 1 — Private Alpha (10 users)

### Who
Hand-pick 10 users you can contact directly (text, DM, or email).
Mix of AEs and SDRs across experience levels.

### What to watch
- Complete signup-to-first-lesson flow without help
- Course content loads correctly (video, text, interactive elements)
- Payment flow completes (use Stripe test mode or live small amounts)
- Team invite flow works end-to-end
- Account page shows correct purchase info

### Daily routine
1. Check Vercel Logs for errors (vercel.com -> Logs)
2. Hit `GET /api/health` — confirm 200
3. Review any user-reported issues
4. Fix and deploy same-day if possible

### Gate to Week 2
- [ ] 0 critical bugs (crashes, data loss, payment failures)
- [ ] < 3 non-critical bugs open
- [ ] All 10 users completed at least 1 lesson successfully
- [ ] Health check returning 200 for 7 consecutive days

---

## Week 2 — Closed Beta (100 users)

### Who
Invite from waitlist or mailing list. Send in batches of 25 over 4 days
to control the ramp.

### What to watch
- Performance under real concurrent load
- Email delivery (signup confirmations, team invites, drip sequences)
- Edge cases: password reset, re-purchase, multiple devices
- Team plan: invite, accept, seat limits

### Daily routine
1. All Week 1 checks, plus:
2. Monitor email delivery rates in Resend dashboard
3. Check Supabase for any failed queries or connection issues
4. Review user feedback (support@aesdr.com inbox)

### Gate to Week 3
- [ ] 0 critical bugs
- [ ] < 3 P1 bugs open (P1 = feature broken but workaround exists)
- [ ] Error rate < 0.5% across all API routes
- [ ] Health check stable for 14 consecutive days
- [ ] Email delivery rate > 95%

---

## Week 3 — Waitlist Drip (open in batches)

### Who
Open signup from waitlist in batches of 100/day. Monitor each batch
for 24 hours before sending the next.

### What to watch
- Signup surge handling (rate limits, auth service)
- Stripe webhook processing under load
- Course progress tracking accuracy
- Any new error patterns in Vercel Logs

### Daily routine
1. All Week 2 checks, plus:
2. Compare real traffic patterns to expectations
3. Monitor Stripe dashboard for failed webhooks
4. Check rate limiter isn't blocking legitimate users

### Gate to Week 4
- [ ] Error rate < 0.1% sustained for 72 hours
- [ ] No payment failures (Stripe webhook success rate > 99%)
- [ ] Course completion rate matches expectations
- [ ] No infrastructure scaling issues

---

## Week 4 — Public Launch

### Actions
1. Remove waitlist/invite gate
2. Announce publicly (social, email list, partnerships)
3. Be available for 48 hours post-announcement (war room mode)

### War room protocol (first 48 hours)
- Check Vercel Logs every 2 hours
- Hit `/api/health` every hour (or set up automated monitoring)
- Respond to support emails within 2 hours
- If error rate exceeds 1%: pause new signups, investigate
- If critical bug found: Vercel rollback (see rollback-plan.md)

### Post-launch (Week 4+)
- Daily health check review for 2 more weeks
- Weekly review of error logs and user feedback
- Monthly chaos/resilience check

---

## Rollback Triggers

At any stage, roll back immediately if:

| Trigger | Action |
|---------|--------|
| Payment processing broken | Vercel rollback + pause signups |
| Data loss detected | Vercel rollback + Supabase point-in-time recovery |
| Auth completely broken | Vercel rollback |
| Error rate > 5% for 15 min | Vercel rollback |
| Health check 503 for 10 min | Investigate, rollback if not resolved in 30 min |

See `/docs/rollback-plan.md` for step-by-step rollback instructions.

---

## External Uptime Monitoring (Recommended)

Set up a free monitoring service to ping `/api/health` automatically:

### Option A: Better Uptime (betteruptime.com) — Free tier
1. Create account
2. Add monitor: `GET https://aesdr.com/api/health`
3. Check interval: 3 minutes
4. Alert via email when status != 200
5. Set up a public status page (optional, builds trust)

### Option B: UptimeRobot (uptimerobot.com) — Free tier
1. Create account
2. Add HTTP(s) monitor: `https://aesdr.com/api/health`
3. Check interval: 5 minutes (free tier)
4. Alert via email

Either service gives you 24/7 automated monitoring at no cost. You'll get
an email the moment the health check fails, even when you're asleep.
