-- Outbound queue: send-channel + draft provenance.
-- Additive only. Companion to the scribe drafter cron (app/api/cron/scribe)
-- and the tower draft house.
--
-- send_channel splits rows courier can transmit (email) from rows the operator
-- must send by hand (a DM handle / a contact form — no email address). Courier
-- only processes 'email'; the tower shows 'manual' rows with a copy-and-mark
-- control instead of a Send button.
--
-- draft_source records which arm drafted the row (e.g. 'scribe-cron:newsletter')
-- so the board can show provenance. personalization_note carries the mechanical
-- drafter's flag when a bespoke placeholder is still unfilled — that row is
-- warden_cleared=false until a human fills it in the tower's inline editor.

alter table partner_outbound_queue
  add column if not exists send_channel text not null default 'email'
    check (send_channel in ('email','manual'));

alter table partner_outbound_queue
  add column if not exists draft_source text;

alter table partner_outbound_queue
  add column if not exists personalization_note text;
