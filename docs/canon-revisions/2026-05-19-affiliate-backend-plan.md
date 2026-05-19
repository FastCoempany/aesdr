# Affiliate operational backend + self-serve dashboard

> **Status:** Active scope. Documents the architecture and naming
> separation for the affiliate operational backend and the affiliate-
> visible dashboard. Pairs with `2026-05-19-language-patch-master-plan.md`
> (which sweeps the existing `/partners` *copy*) — this doc covers the
> *operational backend* that the copy already describes.
> **Owner:** Antaeus Coe.
> **Last revised:** 2026-05-19.

The `/partners` routes already describe a 30%-commission, 30-day-
attribution, Net-45 payout affiliate program. The buyer-facing
content is built. The operational backend behind the content — click
tracking, attribution, commission ledger, self-serve dashboard — is
not. This doc scopes that build.

---

## 1. Naming separation (a canon entry)

Two surfaces in the codebase use the word "partner." They are
different audiences, different deal shapes, different teams of
buyers. The canon needs to keep them separate.

| Surface | URL | Audience | Deal | What it is |
|---|---|---|---|---|
| Affiliate program | `/partners` | Individual operators, coaches, community owners, creators with an audience of AEs and SDRs | 30% commission on net revenue, Net-45, workshop-first | The consumer-side affiliate hub (what this doc scopes) |
| Channel partnerships | `/teams/partners` | Companies — LMS platforms, sales-enablement vendors, sales-hiring agencies, fractional RevOps, HR tech marketplaces | Reseller / referral / white-label, variable economics, B2B contract | The B2B "for Teams" channel program |

**Rule going forward** (added to the language-patch supplement):

- When the consumer-side affiliate program is meant, write *Partners*
  (capital P, the program name) or *affiliates*. The URL is `/partners`.
- When the B2B channel program is meant, write *channel partners* or
  *channel partnerships* (always with the "channel" prefix). The URL
  is `/teams/partners`.
- Never use the bare word *partner* to mean either without context.
  The reader needs the qualifier the first time on every page.

The existing `/teams/partners` hero already uses "Channel
partnerships" as its eyebrow. The existing `/partners` page uses
"affiliate cohort" and "partners" interchangeably. The language sweep
in batch 5 enforces this rule across both surfaces.

---

## 2. What's built today

Per the audit on 2026-05-19:

**Routes built** (15): `app/partners/`, `apply`, `curriculum`,
`economics`, `faq`, `how-we-work`, `kit/[slug]`, `kit-private/[slug]`,
`payments`, `play`, `program`, `timeline`, `who-we-dont-work-with`.

**Brand canon**: `AFFILIATE_BRAND_CANON.md` (809 lines).

**Operational docs**: `content/aesdr-internal/` (14 docs), `content/partner-kit/` (9), `content/partner-kit-private/` (9).

**Application flow**: `app/partners/apply` posts to `/api/partners/apply`, which writes to `partner_applications` table and emails the founder via `sendPartnerApplicationNotification`.

**Private kit gate**: `partner_kit_tokens` + `partner_kit_access` tables (migration `20260509_partner_kit_gate.sql`) gate the private partner kit via HMAC-signed signed URL with audit log.

**Webhook plumbing**: `app/api/webhooks/stripe/route.ts` handles `checkout.session.completed` — creates the Supabase auth user, writes a `purchases` row, sends welcome + receipt emails. The webhook does not currently read any affiliate attribution metadata.

---

## 3. What's missing — the backend

| Missing piece | What it is |
|---|---|
| `affiliate_links` table | Per-affiliate tracking handles. `slug` is the short token in `/r/[slug]`. |
| `affiliate_clicks` table | One row per click on `/r/[slug]`. |
| `affiliate_attributions` table | One row per click → purchase match. Holds gross amount, commission rate, commission amount, status lifecycle. |
| `affiliate_payouts` table | Aggregated payouts. Founder-side marks paid. |
| `/r/[slug]` click endpoint | Logs the click, sets the `aesdr_attribution` cookie (30-day TTL), preserves UTMs, 302 redirects to destination. |
| Stripe checkout metadata pass-through | At checkout-button click, read the cookie and pass `attribution_link_id` to Stripe as session metadata. |
| Webhook attribution logic | On `checkout.session.completed`, read the metadata and write an `affiliate_attributions` row. |
| Status-lifecycle cron | Promotes attributions through `pending → refundable → cleared → paid`. Detects `refunded` via Stripe refund events. |
| `/partners/dashboard` route | Self-serve affiliate view (clicks, registrations, enrollments, refunds settling, projected commission, paid commission). |
| `/admin/affiliates` route | Founder management — create affiliate accounts, create initial links, view all attribution, mark payouts paid. |
| Affiliate auth model | `user_metadata.is_affiliate = true` + `user_metadata.partner_slug` for self-serve dashboard auth. |

---

## 4. Data model

### `affiliate_links`

```sql
create table affiliate_links (
  id uuid primary key default gen_random_uuid(),
  partner_slug text not null,
  slug text not null unique,                    -- /r/{slug}
  destination_url text not null,                -- where the click goes
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  label text,                                   -- internal label for the affiliate
  active boolean not null default true,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);
create index affiliate_links_partner_slug_idx on affiliate_links (partner_slug);
create index affiliate_links_active_idx on affiliate_links (active, expires_at);
```

### `affiliate_clicks`

```sql
create table affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references affiliate_links(id) on delete cascade,
  partner_slug text not null,                   -- denormalised
  ip_hash text,
  user_agent text,
  referrer text,
  visitor_id text,                              -- anonymous cookie id, for de-dup analytics
  clicked_at timestamptz not null default now()
);
create index affiliate_clicks_link_id_idx on affiliate_clicks (link_id);
create index affiliate_clicks_partner_slug_idx on affiliate_clicks (partner_slug);
create index affiliate_clicks_clicked_at_idx on affiliate_clicks (clicked_at desc);
```

### `affiliate_attributions`

```sql
create table affiliate_attributions (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references affiliate_links(id),
  partner_slug text not null,
  click_id uuid references affiliate_clicks(id),
  purchase_id uuid not null references purchases(id) on delete cascade,
  user_email text not null,

  gross_amount_cents bigint not null,
  commission_rate numeric not null default 0.30,
  commission_amount_cents bigint not null,

  status text not null default 'pending'
    check (status in ('pending', 'refundable', 'cleared', 'paid', 'refunded')),

  attributed_at timestamptz not null default now(),
  attribution_window_closes_at timestamptz not null,
  refund_window_closes_at timestamptz not null,
  cleared_at timestamptz,
  paid_at timestamptz,
  refunded_at timestamptz
);
create index affiliate_attributions_partner_slug_idx on affiliate_attributions (partner_slug);
create index affiliate_attributions_purchase_id_idx on affiliate_attributions (purchase_id);
create index affiliate_attributions_status_idx on affiliate_attributions (status, refund_window_closes_at);
```

### `affiliate_payouts`

```sql
create table affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  partner_slug text not null,
  period_start date not null,
  period_end date not null,
  total_commission_cents bigint not null,
  attribution_ids uuid[] not null,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'paid', 'failed')),
  payment_method text,
  payment_reference text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  note text
);
create index affiliate_payouts_partner_slug_idx on affiliate_payouts (partner_slug);
```

### Row-level security

All four tables get RLS enabled.

- Affiliates can read their own rows only (filter on `partner_slug`
  matching `auth.jwt() → user_metadata.partner_slug`).
- Writes go through the service role (admin client) — never direct
  from a logged-in affiliate. Click writes go through `/r/[slug]`
  which uses the admin client.

---

## 5. Status lifecycle (attributions)

An attribution moves through five states:

| State | When | What it means |
|---|---|---|
| `pending` | On purchase | Commission is potential; refund window still open. |
| `refundable` | Day 1 | Same as pending, but explicitly inside the 14-day refund window. (Identical to pending in practice — used only for analytics clarity.) |
| `cleared` | Day 14 after purchase | Refund window closed. Commission is owed. |
| `paid` | After founder marks the payout settled | Money has left AESDR's account. |
| `refunded` | Anytime | Purchase was refunded. Commission is voided. |

The status-lifecycle cron job runs daily and promotes rows based on
dates. Stripe refund events flip rows to `refunded` directly.

---

## 6. Click flow end-to-end

1. Affiliate sends `https://aesdr.com/r/abc123` to their audience.
2. Browser hits `/r/abc123`. Server:
   - Looks up the `affiliate_links` row by `slug = abc123`.
   - Writes an `affiliate_clicks` row with `ip_hash`, `user_agent`, `referrer`, anonymous `visitor_id`.
   - Sets an `aesdr_attribution` cookie with `link_id` + `clicked_at` (30-day TTL, httpOnly, sameSite=lax).
   - 302 redirects to `destination_url` with the link's UTMs appended (or overwritten if conflicting).
3. Visitor browses, eventually clicks the pricing CTA.
4. `CheckoutButton` reads the `aesdr_attribution` cookie and POSTs `attribution_link_id` to `/api/checkout` (new field).
5. `/api/checkout` passes `attribution_link_id` into Stripe session metadata.
6. After payment, Stripe webhook fires `checkout.session.completed`:
   - The webhook reads `session.metadata.attribution_link_id`.
   - Writes a `purchases` row (existing behaviour).
   - If `attribution_link_id` is present, writes an `affiliate_attributions` row with status `pending`.
7. Daily cron promotes `pending → cleared` at 14 days; flips to `refunded` if Stripe sends a refund event for that purchase.
8. Founder reviews the `cleared` rows, batches them into an `affiliate_payouts` row, marks paid.

---

## 7. Routes to build

### Public click endpoint

`app/r/[slug]/route.ts` — Edge runtime preferred (cheap, fast, no DB connection lifecycle to manage). Logs to `affiliate_clicks`, sets cookie, 302 redirects.

### Affiliate dashboard (self-serve)

`app/partners/dashboard/page.tsx` — Logged-in surface. Reads `user_metadata.partner_slug`, redirects to login if absent or if `is_affiliate !== true`.

Sections:
1. **At-a-glance** — last 30 days: clicks, registrations, enrollments, refunds settling, projected commission, paid commission.
2. **Active links** — list of `affiliate_links` with copy-URL buttons + per-link click counts.
3. **Recent attributions** — last 50 attributions with status pill.
4. **Payout history** — past `affiliate_payouts` rows.

### Affiliate link management (self-serve)

`app/partners/dashboard/links/page.tsx` — affiliate can create a new link for themselves under their own `partner_slug`. Slug is short-randomised by the server (no slug collisions; affiliate can rename the *label* but not the slug).

### Founder-side management

`app/admin/affiliates/page.tsx` — list affiliates, create new affiliate account (sets `is_affiliate` + `partner_slug` in user_metadata), create initial link, view all attributions across affiliates, batch attributions into a payout, mark payouts paid.

---

## 8. Files to add / modify

### New files

| File | What |
|---|---|
| `supabase/migrations/20260519_affiliate_backend.sql` | Migration for the four tables + RLS |
| `app/r/[slug]/route.ts` | Click endpoint |
| `app/partners/dashboard/page.tsx` | Affiliate dashboard |
| `app/partners/dashboard/links/page.tsx` | Affiliate link management |
| `app/partners/dashboard/_components/StatTile.tsx` | Dashboard tile component |
| `app/admin/affiliates/page.tsx` | Founder admin |
| `app/admin/affiliates/[partnerSlug]/page.tsx` | Per-affiliate detail view |
| `app/actions/affiliate.ts` | Server actions: createLink, createAffiliate, markPayoutPaid |
| `app/api/cron/affiliate/route.ts` | Daily lifecycle cron (pending → cleared) |
| `lib/affiliate.ts` | Helpers: readAttributionCookie, hashIP, generateSlug |

### Modified files

| File | What changes |
|---|---|
| `app/api/checkout/route.ts` | Read attribution cookie, pass `attribution_link_id` to Stripe metadata |
| `app/api/webhooks/stripe/route.ts` | On `checkout.session.completed`, read metadata and write attribution row |
| `app/api/webhooks/stripe/route.ts` | Handle `charge.refunded` to flip attributions to `refunded` |
| `components/CheckoutButton.tsx` | Pass attribution cookie value through to `/api/checkout` |
| `app/admin/layout.tsx` | Add "Affiliates" to the admin nav |
| `lib/events.ts` | Add `affiliate_click` + `affiliate_attributed` + `affiliate_payout_paid` event types |

---

## 9. Sequencing

Inside the broader language-patch overhaul:

| Order | What | When |
|---|---|---|
| Now | Scope doc (this file) | Today |
| Now | Migration + click endpoint + webhook attribution + types | Today |
| Now | Affiliate dashboard (read-only view) | Today / tomorrow |
| Now | Founder admin route (basic) | Today / tomorrow |
| After batch 5 sweep | Sweep affiliate copy and brand canon for the new language rules | Per master plan batch 5 |
| Post-MVP | Stripe Connect payouts | Later in 2026 (matches the existing `/partners/payments` copy) |
| Post-MVP | Self-serve link generation by affiliates | After the founder creates the first 3-5 affiliate accounts manually |

The backend ships before the canon sweep on the partner routes
because the data infrastructure is independent of copy. The copy
sweep just changes the words on the existing pages.

---

## 10. Open decision points

| # | Question | Default |
|---|---|---|
| D.1 | Should the cookie name be `aesdr_attribution` or something more opaque (e.g., `aesdr_r`)? | `aesdr_attribution` for clarity; founder can opaquify if needed. |
| D.2 | TTL on the cookie — is 30 days fixed, or do we want per-link override? | Fixed 30 days. Per-link override is a knob nobody needs yet. |
| D.3 | What happens on a logged-in user who clicks a partner link after already buying? | Attribution recorded but not paid out — flagged for review. They were already a customer; the affiliate doesn't get paid. |
| D.4 | First-touch or last-touch attribution? | First-touch. AESDR's existing canon says first-touch (`/partners/economics` page). |
| D.5 | What about two affiliates whose audiences overlap (same buyer clicks both)? | First click wins. The cookie isn't overwritten by a later click. |
| D.6 | Per-affiliate commission rate override (e.g., a launch partner at 40%)? | Stored on `affiliate_links.commission_rate` if we add it. Default 30%. Founder decides whether to support per-affiliate overrides; not in MVP. |
| D.7 | Visitor `visitor_id` cookie — separate from the attribution cookie? | Yes. Used for de-duping clicks (one human pasting the link in three Slack channels shouldn't count as three clicks). Separate 1-year cookie. |

Tell me which defaults need overriding before the migration ships.

---

## 11. Sweep implications

The existing `/partners` copy (built before this backend existed)
describes the attribution flow as if it's live: "First-touch
attribution gets recorded in the AESDR dashboard with their email."
Once the backend is live, that copy is accurate. The language sweep
in batch 5 can leave the descriptive sections of `/partners/economics`
and `/partners/payments` largely intact — they describe what the
backend will do, and the backend is being built to match the
existing description.

The copy that *was* wrong (e.g., "they're already in the AESDR
dashboard" when there is no dashboard yet) gets corrected by the
backend shipping, not by a copy change. The sweep verifies the copy
matches the now-live backend.
