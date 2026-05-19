-- Affiliate operational backend.
-- Per docs/canon-revisions/2026-05-19-affiliate-backend-plan.md.
--
-- Four tables that turn the existing /partners affiliate hub from a set
-- of marketing pages into a working program — click tracking,
-- attribution, commission ledger, payout aggregation.
--
-- All writes from server-side admin client. RLS is enabled and lets
-- a logged-in affiliate read their own rows (filtered by partner_slug
-- against the user_metadata.partner_slug claim).

-- ─── affiliate_links ───
-- A trackable handle a single affiliate hands their audience.
-- Slug is short, URL-safe, unique; renders at aesdr.com/r/{slug}.
create table if not exists affiliate_links (
  id uuid primary key default gen_random_uuid(),
  partner_slug text not null,
  slug text not null unique,
  destination_url text not null default 'https://aesdr.com/',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  label text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);
create index if not exists affiliate_links_partner_slug_idx
  on affiliate_links (partner_slug);
create index if not exists affiliate_links_active_idx
  on affiliate_links (active, expires_at);

-- ─── affiliate_clicks ───
-- One row per click on /r/{slug}.
create table if not exists affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references affiliate_links(id) on delete cascade,
  partner_slug text not null,
  ip_hash text,
  user_agent text,
  referrer text,
  visitor_id text,
  clicked_at timestamptz not null default now()
);
create index if not exists affiliate_clicks_link_id_idx
  on affiliate_clicks (link_id);
create index if not exists affiliate_clicks_partner_slug_idx
  on affiliate_clicks (partner_slug);
create index if not exists affiliate_clicks_clicked_at_idx
  on affiliate_clicks (clicked_at desc);

-- ─── affiliate_attributions ───
-- One row per click→purchase match. Status moves through
-- pending → cleared → paid (or refunded), driven by a daily cron.
create table if not exists affiliate_attributions (
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
    check (status in ('pending', 'cleared', 'paid', 'refunded')),

  attributed_at timestamptz not null default now(),
  attribution_window_closes_at timestamptz not null,
  refund_window_closes_at timestamptz not null,
  cleared_at timestamptz,
  paid_at timestamptz,
  refunded_at timestamptz
);
create unique index if not exists affiliate_attributions_purchase_idx
  on affiliate_attributions (purchase_id);
create index if not exists affiliate_attributions_partner_slug_idx
  on affiliate_attributions (partner_slug);
create index if not exists affiliate_attributions_status_window_idx
  on affiliate_attributions (status, refund_window_closes_at);

-- ─── affiliate_payouts ───
-- Aggregated payout batch. Founder marks paid after sending money.
create table if not exists affiliate_payouts (
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
create index if not exists affiliate_payouts_partner_slug_idx
  on affiliate_payouts (partner_slug);
create index if not exists affiliate_payouts_status_idx
  on affiliate_payouts (status);

-- ─── RLS ───
alter table affiliate_links        enable row level security;
alter table affiliate_clicks       enable row level security;
alter table affiliate_attributions enable row level security;
alter table affiliate_payouts      enable row level security;

-- A logged-in affiliate sees only their own rows. Their partner_slug is
-- pinned on the JWT via user_metadata at signup (set by the admin
-- console when the affiliate account is created).
create policy "affiliate_links_self_read"
  on affiliate_links for select
  to authenticated
  using (
    partner_slug = coalesce(
      auth.jwt() -> 'user_metadata' ->> 'partner_slug',
      ''
    )
  );

create policy "affiliate_clicks_self_read"
  on affiliate_clicks for select
  to authenticated
  using (
    partner_slug = coalesce(
      auth.jwt() -> 'user_metadata' ->> 'partner_slug',
      ''
    )
  );

create policy "affiliate_attributions_self_read"
  on affiliate_attributions for select
  to authenticated
  using (
    partner_slug = coalesce(
      auth.jwt() -> 'user_metadata' ->> 'partner_slug',
      ''
    )
  );

create policy "affiliate_payouts_self_read"
  on affiliate_payouts for select
  to authenticated
  using (
    partner_slug = coalesce(
      auth.jwt() -> 'user_metadata' ->> 'partner_slug',
      ''
    )
  );

-- All writes go through the service-role admin client (no policies for
-- insert / update / delete). The click endpoint, webhook, cron job, and
-- founder admin all use the admin client.
