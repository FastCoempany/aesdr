-- The delivered stamp (founder 2026-07-15): proof level 2 for the one-press
-- send. The Resend webhook (/api/webhooks/resend) stamps each partner_sent_log
-- line when Resend confirms what happened to the message:
--   delivery_status: 'delivered' | 'bounced' | 'complained'  (null = no event yet)
--   delivered_at:    set only on 'delivered'
--
-- Run this in the Supabase SQL editor, then enable the `email.delivered`
-- event on the existing /api/webhooks/resend endpoint in the Resend
-- dashboard (bounce + complaint events are already registered for the
-- suppression list).

alter table partner_sent_log
  add column if not exists delivery_status text
    check (delivery_status in ('delivered', 'bounced', 'complained')),
  add column if not exists delivered_at timestamptz;

-- The webhook looks lines up by Resend's message id.
create index if not exists partner_sent_log_resend_id_idx
  on partner_sent_log (resend_id);
