# 2026-05-22 — Affiliate hub plan

> **Status:** Plan. Awaiting execution sign-off.
> **Scope:** Build the consumer-side affiliate program — vetting, signed
> link infrastructure, affiliate dashboard, admin dashboard, brand-conformance
> approval gate, commission + payout pipeline.
> **Owner:** Antaeus Coe.
> **Depends on:** `2026-05-22-partners-to-affiliates-rename-plan.md`
> (Phase 1 routes-rename ships before this plan begins; affiliate hub
> uses the `/affiliates/*` namespace).

---

## Five founder decisions (ratified 2026-05-22)

1. **Audience.** Affiliate program is consumer-side individuals (creators,
   micro-creators, alumni ambassadors). Not B2B channel partners — those
   stay at `/enterprise/channel`.
2. **Payout.** **30% of net revenue** (gross minus refunds and Stripe
   processing fees), same as the existing D22 §5.1 default.
3. **Brand-conformance gate.** First **3 pieces** of affiliate marketing
   copy reviewed and approved by AESDR before going live. Inherits the
   canon §16 approval workflow already in use for partner pilots.
   - **v1 exit criterion:** Option A — 3 approvals → exits the gate (no
     calendar-time requirement).
   - **v1.1 exit criterion:** sophistication-toggle hybrid — `proven`
     affiliates exit at 3 approvals (Option A); `developing` affiliates
     need 3 approvals AND 30 days elapsed (Option B). Tier set at D27
     vetting, founder-overridable. See §10 for the schema + workflow.
4. **Tracking.** Hybrid model: **HMAC-signed link** as source of truth,
   **UTMs layered for GA4 reporting**. Per-affiliate signed link at
   `aesdr.com/r/{token}`, 30-day attribution cookie, last-touch UTM
   fallback if cookie cleared.
5. **Dashboards.** Two — affiliate-facing (per spec §3 below) and
   admin-facing (per spec §4 below).

**Additional ratifications (2026-05-22):**

- **Payment processor:** Stripe Connect Standard for v1.
- **Multi-touch attribution model:** last-cookie-wins as default (industry standard); revisit after first 10 attributions.
- **Public AESDR-side affiliate disclosure:** footer line injected on every page when `aesdr_aff` cookie is present, per FTC norms.

---

## 1. Routes (under `/affiliates/*` post-rename)

| Route | Purpose | Auth |
|---|---|---|
| `/affiliates` | Marketing landing (existing; inherits from current `/partners`) | public |
| `/affiliates/apply` | Application form (existing) | public |
| `/affiliates/dashboard` | **New.** Affiliate-facing dashboard | affiliate session |
| `/affiliates/dashboard/copy` | **New.** Approved copy library + submission queue | affiliate session |
| `/affiliates/dashboard/payments` | **New.** Payment settings, payout history | affiliate session |
| `/affiliates/dashboard/account` | **New.** Profile, leave / pause | affiliate session |
| `/r/{token}` | **New.** Signed-link redirect handler | edge middleware |
| `/affiliates/onboard` | **New.** Post-approval onboarding (W-9, payment method, link generation) | affiliate session |

Existing static routes (`/affiliates/program`, `/affiliates/economics`,
`/affiliates/how-we-work`, etc.) stay; their copy gets a light pass to
reflect the new dashboard URLs and the signed-link mechanic.

---

## 2. Signed-link infrastructure

### 2.1 Token shape

```
aesdr.com/r/{token}
```

Where `{token}` is base64url-encoded JSON:

```json
{ "aid": "<affiliate_id>", "v": 1, "iat": <unix-ts> }
```

…HMAC-SHA256-signed with `AFFILIATE_LINK_SIGNING_KEY` (server-side env
var). Format: `{base64url(payload)}.{base64url(signature)}`. Same shape
as JWT-compact but without the JWT header (we control both ends so we
don't need the header).

### 2.2 Database schema

New tables under `supabase/migrations/`:

```sql
-- supabase/migrations/<date>_affiliates.sql

create table affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete restrict,
  slug text unique not null,                  -- e.g. 'apex-bdr-club'
  status text not null check (status in ('vetting','active','paused','sunset','cut')),
  archetype text check (archetype in ('creator','coach','alumni','hybrid','community')),
  commission_pct numeric(5,2) default 30.00,
  attribution_window_days int default 30,
  joined_at timestamptz default now(),
  notes text
);

create table affiliate_clicks (
  id bigserial primary key,
  affiliate_id uuid references affiliates(id) on delete cascade,
  clicked_at timestamptz default now(),
  user_agent text,
  ip_hash text,                                -- sha256-hashed; never raw IP
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text
);

create table affiliate_attributions (
  id bigserial primary key,
  affiliate_id uuid references affiliates(id) on delete restrict,
  user_id uuid references auth.users,
  stripe_session_id text unique,
  attribution_source text not null check (attribution_source in ('cookie','utm','manual')),
  gross_amount_cents int not null,
  net_amount_cents int not null,
  commission_amount_cents int not null,
  status text not null check (status in ('pending','paid','refunded','clawed_back')),
  created_at timestamptz default now()
);

create table affiliate_copy_submissions (
  id bigserial primary key,
  affiliate_id uuid references affiliates(id) on delete cascade,
  surface text,                                -- 'newsletter' / 'social' / 'podcast' / 'dm' / etc.
  content text not null,
  status text not null check (status in ('pending','approved','approved_with_edits','declined')),
  reviewed_by uuid references auth.users,
  reviewed_at timestamptz,
  decision_notes text,
  submitted_at timestamptz default now()
);

create table affiliate_payouts (
  id bigserial primary key,
  affiliate_id uuid references affiliates(id) on delete restrict,
  payout_date timestamptz,
  amount_cents int not null,
  method text check (method in ('ach','wire','paypal')),
  reference_id text,                           -- payment processor transaction id
  attribution_ids bigint[],                    -- array of affiliate_attributions.id rows covered
  created_at timestamptz default now()
);
```

### 2.3 Middleware route handler

`app/r/[token]/route.ts`:

1. Parse `{token}` from URL params
2. Verify HMAC signature → fail → 404 (signal: unknown link, don't reveal whether the link existed)
3. Decode payload → extract `aid`
4. Look up `affiliate` row → if status ≠ `active`, redirect to landing without setting cookie (silent revoke)
5. Insert row into `affiliate_clicks` (async; doesn't block redirect)
6. Set `aesdr_aff` cookie:
   - `value`: `aid` (the affiliate UUID)
   - `max-age`: 2,592,000 (30 days)
   - `httpOnly`: true
   - `sameSite`: 'lax'
   - `secure`: true
7. Read query string for `utm_*` params; preserve them on the redirect
8. 302 redirect to landing (`/` by default; or `?dest=...` for affiliate-specified destinations)

### 2.4 Stripe webhook integration

`app/api/stripe/webhook/route.ts` (existing):

On `checkout.session.completed`:
1. Read `aesdr_aff` cookie from the session metadata (Stripe forwards
   cookies set on the checkout page)
2. If present and resolves to an `active` affiliate row:
   - Insert `affiliate_attributions` row with `attribution_source='cookie'`
3. If absent but `utm_source` starts with `affiliate-` and `utm_campaign`
   resolves to an affiliate slug:
   - Insert `affiliate_attributions` row with `attribution_source='utm'`
4. If neither, no attribution row created (organic / direct)

On `charge.refunded`:
1. Look up `affiliate_attributions` by `stripe_session_id`
2. Update `status` to `refunded`; update `commission_amount_cents`
   accordingly (zero out if full refund, scale down for partial)
3. If a `affiliate_payout` already covered this attribution, set status
   to `clawed_back` and decrement the affiliate's next pending payout

### 2.5 Attribution rules

Per the existing D22 §5.3:
- **30-day cookie window** from first qualifying click
- Cookie set → renewed on subsequent clicks within the window
- Last-touch UTM fallback only if cookie cleared between click and purchase
- Multiple affiliates touch the same buyer → cookie value is overwritten on each `aesdr.com/r/{token}` hit (last-cookie wins per attribution standard)
- Refunds reduce the commission base; payments already made get clawed back from the next payout

---

## 3. Affiliate-facing dashboard (`/affiliates/dashboard`)

Per the spec confirmed 2026-05-22.

### 3.1 Sections (top to bottom)

| Section | Component | Reads from |
|---|---|---|
| Your link | `<AffiliateLinkCard />` | `affiliates.slug` → generate `aesdr.com/r/{token}` |
| This pilot's numbers | `<AffiliateFunnel />` | `affiliate_clicks` + `affiliate_attributions` |
| Pending vs paid | `<CommissionLedger />` | `affiliate_attributions` + `affiliate_payouts` |
| Promotional copy library | `<CopyLibrary />` | Static content from `content/affiliate-kit/` |
| Submit copy for review | `<CopySubmitForm />` → POSTs to `affiliate_copy_submissions` | affiliate session |
| Compliance pack | `<DisclosurePack />` | Lift from `D19-disclosure-language-pack.md` |
| Brand assets | `<BrandAssetLinks />` | Static — lockup files (`10a-c`) |
| Payment settings | `<PaymentSettingsForm />` | `affiliates` table |
| Account | `<AccountSettings />` | `affiliates` + `auth.users` |

### 3.2 Voice / register

90 Rowan / 10 Michael per canon §3.3 (internal-doc register). Plain
operator copy. No celebration theater on the metrics ("congrats on
your 2 sales!"); just the numbers, plainly.

### 3.3 Real-time data freshness

- Funnel + commission ledger: 15-minute cache, refresh button for
  instant
- Submission queue: real-time (poll every 30s while page is open)
- Payment history: cached daily

---

## 4. Admin-facing dashboard (`/admin/affiliates`)

Per the spec confirmed 2026-05-22. Already a route stub; this section is
the contents.

### 4.1 Sub-routes

| Route | Purpose |
|---|---|
| `/admin/affiliates` | Affiliate roster (default view) |
| `/admin/affiliates/vetting` | Vetting queue (incoming applicants → D27 scorecard) |
| `/admin/affiliates/approval-queue` | Copy submissions awaiting review |
| `/admin/affiliates/payouts` | Batch payout management |
| `/admin/affiliates/[id]` | Single-affiliate detail view |
| `/admin/affiliates/aggregate` | Cross-affiliate trend reports |

### 4.2 Roster view contents

Sortable, filterable table:
- Name + slug
- Status (color-coded: active green, vetting yellow, paused gray, sunset gray, cut red)
- Join date
- Archetype
- All-time net revenue attributed (sortable)
- Refund rate (sortable)
- Last activity (clicked link / sent submission / etc.)
- Quick actions: pause, view detail, message

### 4.3 Vetting queue contents

Per `D27-partner-vetting-scorecard.md` (renamed `D27-affiliate-vetting-scorecard.md` post-rename):
- Incoming applicants list
- Click into single applicant → D27 scorecard form rendered as a fillable interface
- PASS / HOLD / FAIL decision actions
- PASS → triggers onboarding email + creates `affiliates` row with `status='active'`

### 4.4 Approval queue contents

- Incoming copy submissions (oldest first)
- Each row: affiliate name, surface, content (collapsible), submission timestamp
- Inline action buttons:
  - **APPROVED** → submission status → `approved`; email notification to affiliate
  - **APPROVED WITH EDITS** → opens a notes field; status → `approved_with_edits`; email with the edits
  - **DECLINED** → opens a notes field (required); status → `declined`; email with reason
- Filter by: status (pending / all), affiliate, surface, submitted-date-range

### 4.5 Brand-conformance audit (sub-section of detail view)

Per the canon §16 + §4.1 banned-vocabulary check:
- All approved copy from this affiliate, rendered as a list
- Per-piece compliance flag: `canon-check` runs against the content; flags
  highlighted inline
- Cross-reference with banned-vocabulary in their non-AESDR content
  (Google sample, posts list) — flagged if vocab violations appear in
  their other work (signal that the brand fit may erode)

### 4.6 Payouts management

Batch interface:
- "Pending payouts" tab: all `affiliate_attributions` with status=`pending`
  and outside the 14-day refund window
- Generate batch payout export (CSV for ACH / wire / PayPal)
- After export sent + payment confirmed: mark batch as `paid`, update
  `affiliate_payouts` rows
- W-9 / W-8BEN status badge per affiliate (block payout if missing)

### 4.7 Termination workflow

Per `D34-pilot-closeout-notes.md` (renamed for affiliate context):
- From single-affiliate detail view: "Cut affiliate" action
- Confirms with reason field (required)
- Triggers:
  - `affiliates.status` → `cut`
  - Signed link continues to validate signature but no longer sets cookie
    (silent revoke per §2.3 step 4)
  - Email D34 close-out note (CUT variant) to the affiliate
  - Audit log entry with reason

### 4.8 Aggregate metrics view

- Total active affiliates (this month / quarter / year)
- Total attributed revenue MoM
- Average commission per affiliate
- Refund rate trend
- Conversion-rate distribution (clicks → registrations → purchases)
- Top 5 / bottom 5 affiliates by net revenue
- Affiliates approaching 14-day window close
- Affiliates inactive 30+ days

---

## 5. Brand-conformance approval workflow

Per founder Q3 decision: first 3 pieces of affiliate marketing copy
reviewed and approved before going live.

### 5.1 Workflow

1. Affiliate submits copy via dashboard (§3.1 `<CopySubmitForm />`)
2. Submission lands in admin approval queue (§4.4)
3. AESDR ops reviews within 24 business hours
4. Decision posted: APPROVED / APPROVED WITH EDITS / DECLINED
5. Email notification to affiliate with decision + any edits
6. Once 3 pieces APPROVED, affiliate transitions out of brand-conformance
   gate; subsequent submissions optional (recommended but not blocking)

### 5.2 Audit trail

Every submission + decision is logged immutably in
`affiliate_copy_submissions`. Founder can later audit: "what did this
affiliate submit during onboarding? What got approved? What was edited
in?" Useful for D33 postmortem signals.

### 5.3 Auto-flagging during review

Before human review, run automatic checks:
- `node scripts/canon-check.mjs` on the submitted content (banned vocab)
- ESLint canon-blocklist (programmatic R-G4 catches)
- Disclosure language presence (regex for FTC-required phrases per D19)

Auto-flag results visible to reviewer in the approval queue. Reduces
human review time from "read every line" to "verify the flags are
right + scan for the things automation can't catch."

---

## 6. Affiliate lifecycle

```
Applicant
  ↓ submit /affiliates/apply
Vetting (D27 scorecard in admin queue)
  ↓ PASS
Onboarding (W-9, payment method, link generation, brand-conformance briefing)
  ↓ first 3 pieces approved
Active
  ↓ monthly cycle
Renew (continue on existing terms) OR Sunset (lifecycle close) OR Cut (immediate termination)
```

Each transition is a discrete action with an associated email + audit
log entry. Lifecycle states track on `affiliates.status`.

---

## 7. Compliance pack

Inherits from D19. Affiliate-facing dashboard (§3.1) surfaces:
- **FTC disclosure language** (verbatim, copy-paste-able per surface type)
  - Newsletter / blog: *"Affiliate disclosure: I earn a commission..."*
  - Social: `#ad` or `#sponsored`
  - Reel / video: 10-second verbal + persistent on-screen text
  - Live workshop: verbal disclosure at intro
  - DM: one-line inline
- **The "what AESDR won't tolerate" list:** missed disclosures, banned-vocab
  copy that gets pushed past edits, claims outside `D20-claims-sheet.md`
- **Three-strike policy:** affiliates flagged for the same compliance
  issue 3+ times → moved from `active` to `paused` for re-orientation
  conversation; not auto-cut

---

## 8. Infrastructure prerequisites

Before any of this ships:

| Item | Required for | Status |
|---|---|---|
| `AFFILIATE_LINK_SIGNING_KEY` env var | §2.1 token signing | **Pending** — generate via `openssl rand -hex 32`, add to Vercel env |
| Supabase migration `<date>_affiliates.sql` | §2.2 schema | **Pending** — schema specced above, write migration |
| `/r/[token]/route.ts` middleware | §2.3 signed link handling | **Pending** — implement after schema |
| Stripe webhook handler updates | §2.4 attribution capture | **Pending** — extend existing `/api/stripe/webhook/route.ts` |
| Email templates (onboarding, approval decisions, payout, close-out) | §5, §6 lifecycle | **Pending** — extend `lib/email.ts` |
| Affiliate dashboard pages | §3 affiliate-facing | **Pending** — new |
| Admin dashboard pages | §4 admin-facing | **Pending** — extend existing `/admin/affiliates` stub |
| Payment-processor integration | §4.6 payouts | **Pending** — decide processor (Stripe Connect? Wise? Plaid?) |

**Payment-processor decision:** Stripe Connect Standard is the cleanest
default — affiliates onboard to Stripe Connect via OAuth, AESDR transfers
commission via Stripe Transfers API, Stripe handles 1099-K tax reporting.
Alternative: Wise for international (lower FX cost); PayPal Mass Payments
for simplicity. Recommend Stripe Connect for v1; revisit if affiliate base
goes >70% international.

---

## 9. Execution sequence

Five phases over ~6–8 weeks calendar:

### Phase 1 — Foundation (week 1)
- Schema migration
- Signing key + env setup
- `/r/[token]` handler + cookie spec
- Stripe webhook extension

### Phase 2 — Affiliate dashboard MVP (week 2)
- `/affiliates/dashboard` shell
- Link card + funnel + commission ledger sections
- Read-only first; submit-copy + payment-settings flows in week 3

### Phase 3 — Admin tooling (week 3)
- `/admin/affiliates/vetting` queue
- `/admin/affiliates/approval-queue` workflow
- Roster + single-affiliate detail view

### Phase 4 — Lifecycle automation (week 4)
- Onboarding flow post-vetting PASS
- Email templates (approval / decline / payout / close-out)
- Three-strike compliance tracker

### Phase 5 — Payments + close-out (weeks 5–6)
- Stripe Connect integration
- Batch payout flow
- Clawback handling
- Aggregate metrics view

After Phase 5: end-to-end ready for live affiliate onboarding.

---

## 10. Open questions

- **Payment processor:** Stripe Connect default; confirm before Phase 5.
- **Attribution model on multi-touch:** last-cookie-wins (industry
  standard) vs first-touch (cleaner for the affiliate who introduced the
  buyer). Default: last-cookie-wins; revisit after first 10 attributions.
- **What happens to currently-pending partner-kit deliverables (the D-series docs that say "partner pilot agreement")?** Per the rename plan, body content rewrites "partner" → "affiliate" in those docs; the workflow itself remains intact.
- **Brand-conformance gate exit criteria.** First 3 pieces approved → exits the gate. Alternative: 3 pieces AND a 30-day window. **Default: Option A (just 3 pieces) for v1; sophistication-toggle hybrid baked into the schema for v1.1.**

  **Sophistication-toggle hybrid (v1.1):** The `affiliates` table carries a `sophistication_tier` field set at D27 vetting:
  - `proven` — established operator with track record (verified prior commercial work, existing creator with demonstrated brand-fit) → path A exit (3 approvals only).
  - `developing` — newcomer, unproven, lower D27 score, or any compliance flag during vetting → path B exit (3 approvals AND 30 days elapsed).

  Founder sets the tier during vetting; can override mid-program if behavior warrants moving up or down. v1 ships with `proven` as the universal default (effectively running Option A everywhere) until the toggle UI is built; v1.1 surfaces the toggle in the admin vetting flow and respects path B for `developing`-tier affiliates.

  Schema change in `affiliates` migration:
  ```sql
  alter table affiliates
    add column sophistication_tier text default 'proven'
    check (sophistication_tier in ('proven','developing'));
  ```

  Phase 4 (lifecycle automation) adds the conditional logic: if `sophistication_tier = 'developing'` AND `(approved_count < 3 OR (now() - joined_at) < interval '30 days')`, the affiliate stays in the gate; otherwise they exit.
- **Public-facing affiliate disclosure on `aesdr.com`.** Per FTC, AESDR's own surfaces also disclose the commission relationship. Default: footer line on every page that's reachable from an affiliate link — *"AESDR runs an affiliate program. Some links to this site carry commission for the referring affiliate."* Implementation in middleware: detect `aesdr_aff` cookie, inject footer disclosure when cookie present.

---

## 11. Acceptance

The affiliate hub ships v1-complete when:

- A new affiliate can: apply → get vetted → get approved → onboard → generate their signed link → submit + get-approved their first 3 pieces → see a click in their dashboard → see a purchase attribution → receive a payout
- An admin can: review applicants → approve copy submissions → run a batch payout → cut an affiliate cleanly
- All eight infrastructure prerequisites (§8) are deployed
- canon-check + ESLint pass on all new code
- The 5 founder decisions (top of doc) are reflected in production behavior
