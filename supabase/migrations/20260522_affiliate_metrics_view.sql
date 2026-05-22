-- Aggregate metrics view for cross-affiliate admin trends.
-- Per docs/canon-revisions/2026-05-22-affiliate-hub-plan.md (step 13 of 14).

create or replace view affiliate_metrics as
select
  a.id                              as affiliate_id,
  a.slug                            as affiliate_slug,
  a.display_name,
  a.status,
  a.archetype,
  a.sophistication_tier,
  a.commission_pct,
  a.strike_count,
  a.approved_pieces_count,
  a.joined_at,
  a.activated_at,

  -- clicks (lifetime)
  coalesce((
    select count(*)::int
    from affiliate_clicks c
    where c.affiliate_slug = a.slug
  ), 0) as total_clicks,

  -- clicks (last 30 days)
  coalesce((
    select count(*)::int
    from affiliate_clicks c
    where c.affiliate_slug = a.slug
      and c.clicked_at >= now() - interval '30 days'
  ), 0) as clicks_30d,

  -- attributed enrollments (lifetime, not refunded)
  coalesce((
    select count(*)::int
    from affiliate_attributions at
    where at.affiliate_slug = a.slug
      and at.status <> 'refunded'
  ), 0) as attributed_enrollments,

  -- gross attributed revenue cents (not refunded)
  coalesce((
    select sum(at.gross_amount_cents)::bigint
    from affiliate_attributions at
    where at.affiliate_slug = a.slug
      and at.status <> 'refunded'
  ), 0) as gross_revenue_cents,

  -- commission projected (pending + cleared)
  coalesce((
    select sum(at.commission_amount_cents)::bigint
    from affiliate_attributions at
    where at.affiliate_slug = a.slug
      and at.status in ('pending', 'cleared')
  ), 0) as projected_commission_cents,

  -- commission paid (lifetime)
  coalesce((
    select sum(at.commission_amount_cents)::bigint
    from affiliate_attributions at
    where at.affiliate_slug = a.slug
      and at.status = 'paid'
  ), 0) as paid_commission_cents,

  -- conversion rate (attributed / clicks, last 30 days)
  case
    when coalesce((
      select count(*) from affiliate_clicks c
      where c.affiliate_slug = a.slug
        and c.clicked_at >= now() - interval '30 days'
    ), 0) = 0 then 0::numeric
    else round(
      coalesce((
        select count(*) from affiliate_attributions at
        where at.affiliate_slug = a.slug
          and at.attributed_at >= now() - interval '30 days'
          and at.status <> 'refunded'
      ), 0)::numeric
      /
      (
        select count(*) from affiliate_clicks c
        where c.affiliate_slug = a.slug
          and c.clicked_at >= now() - interval '30 days'
      )::numeric
      * 100,
      2
    )
  end as conversion_rate_30d_pct,

  -- pending copy submissions count
  coalesce((
    select count(*)::int from affiliate_copy_submissions s
    where s.affiliate_id = a.id
      and s.status in ('submitted', 'reviewing')
  ), 0) as pending_submissions

from affiliates a;

-- Service-role admin client reads this view; no RLS needed at view layer
-- because the underlying tables enforce it.
