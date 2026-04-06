# Backup Strategy

> What's backed up, where, and how to recover if something breaks.

---

## What's Backed Up

| Data | Where | Backup | Recovery |
|---|---|---|---|
| **Lesson HTML** (36 files) | Git repo | GitHub mirrors every push | `git clone` or `git checkout` |
| **Tool HTML** (5 files) | Git repo | Same as above | Same as above |
| **User accounts** | Supabase Auth | Supabase daily backups (Free tier: 7 days) | Supabase dashboard restore |
| **Course progress** | Supabase `course_progress` table | Supabase daily backups | Supabase dashboard restore |
| **Purchases** (future) | Stripe + Supabase `purchases` table | Stripe retains all records; Supabase daily backups | Stripe dashboard + Supabase restore |
| **Environment vars** | Vercel dashboard | Not backed up automatically | Re-enter manually from Supabase/Stripe dashboards |
| **DNS config** | Your registrar | Not backed up | Re-configure from registrar dashboard |
| **Email content seeds** | Git repo (`docs/content/`) | GitHub | `git clone` |

---

## Supabase Backup Details

### Free Tier (current)
- **Automatic daily backups** — retained for 7 days
- **No point-in-time recovery** — you can only restore to the most recent daily snapshot
- **Restore method:** Supabase dashboard > Settings > Database > Backups > Download

### Pro Tier ($25/month — upgrade when revenue justifies it)
- **Point-in-time recovery** — restore to any second in the last 7 days
- **Upgrade path:** Supabase dashboard > Settings > Billing > Upgrade

### How to verify backups exist
1. Go to **Supabase dashboard > Settings > Database > Backups**
2. You should see a list of daily snapshots with timestamps
3. If empty, your project may have been created recently — check back tomorrow

---

## Disaster Scenarios

### Supabase is down
- **Impact:** Users can't log in, progress doesn't save, dashboard shows empty
- **What still works:** Landing page, legal pages, about/contact (no DB needed)
- **User experience:** Course pages redirect to login (which fails gracefully)
- **Action:** Wait for Supabase to recover. Check status at [status.supabase.com](https://status.supabase.com)
- **localStorage backup:** ProgressSaver always saves to localStorage first, so in-progress work isn't lost

### Vercel is down
- **Impact:** Entire site is offline
- **Action:** Nothing you can do — accept the dependency. Check [vercel.com/status](https://vercel.com/status)
- **Mitigation:** None practical for a solo founder

### Git repo is deleted or corrupted
- **Impact:** Source code lost
- **Action:** Clone from GitHub (your primary remote)
- **Prevention:** Never force-push to main. Use feature branches.

### Accidental data deletion (e.g., DROP TABLE)
- **Impact:** User progress lost
- **Action:** Restore from Supabase daily backup (Settings > Database > Backups)
- **Prevention:** Never run raw SQL in production without reading it twice. Use the SQL Editor's "run" button, not batch scripts.

### Stripe account issue
- **Impact:** Can't process payments
- **Action:** All purchase records are in Stripe's own systems — nothing is lost. Contact Stripe support.
- **Mitigation:** Keep `purchases` table in Supabase as a mirror for your own queries

---

## What's NOT Backed Up (and doesn't need to be)

- **Node modules** — reinstall with `npm install`
- **`.next` build cache** — rebuild with `npx next build`
- **Browser localStorage** — per-device, ephemeral by design
- **Vercel build logs** — informational only, not critical

---

## Checklist Before Launch

- [ ] Verify Supabase backups page shows at least one snapshot
- [ ] Confirm GitHub repo is the remote for your local git
- [ ] Save Supabase URL + anon key somewhere outside Vercel (e.g., password manager)
- [ ] Save Stripe API keys somewhere outside Vercel
- [ ] Bookmark status pages: status.supabase.com, vercel.com/status
