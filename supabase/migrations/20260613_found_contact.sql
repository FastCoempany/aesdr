-- Stored contact-find results on the candidate, so the map can chip "email
-- found / none" and the room can show it next to the name without re-querying
-- BetterContact. Additive + idempotent. The app degrades gracefully until this
-- is applied: the finder's column writes are best-effort, and the map/room read
-- via select('*') so a missing column is simply undefined.
--
-- found_email      — the verified/catch-all-safe address BetterContact returned
-- found_email_status — deliverable | catch_all_safe | ... (raw provider status)
-- found_phone / found_phone_status — reserved; phone enrichment is off for now
-- email_checked_at — set once a real lookup ran; the find-once guard reads it
alter table partner_pipeline add column if not exists found_email text;
alter table partner_pipeline add column if not exists found_email_status text;
alter table partner_pipeline add column if not exists found_phone text;
alter table partner_pipeline add column if not exists found_phone_status text;
alter table partner_pipeline add column if not exists email_checked_at timestamptz;
