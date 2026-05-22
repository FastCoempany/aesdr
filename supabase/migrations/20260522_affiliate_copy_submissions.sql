-- Brand-conformance gate: affiliate copy submissions.
-- Per docs/canon-revisions/2026-05-22-affiliate-hub-plan.md (step 3 of 14).
--
-- New affiliates must submit their first 3 promotional pieces for admin
-- review before the gate exits (tier 'developing'). 'Proven' tier exits
-- after 1 piece. Each submission goes through:
--
--   submitted → reviewing → (approved | edits_requested | declined)
--
-- Three same-category declines auto-pause the affiliate (handled by the
-- compliance tracker action; this table is the system of record).

create table if not exists affiliate_copy_submissions (
  id uuid primary key default gen_random_uuid(),

  affiliate_id uuid not null references affiliates(id) on delete cascade,

  -- the work itself
  channel text not null check (
    channel in (
      'newsletter', 'podcast', 'twitter', 'linkedin', 'youtube',
      'tiktok', 'instagram', 'community', 'course', 'blog', 'other'
    )
  ),
  format text not null check (
    format in ('post', 'email', 'script', 'thread', 'video', 'audio', 'long_form', 'other')
  ),
  draft_body text not null,
  draft_url text,
  scheduled_publish_at timestamptz,

  -- review lifecycle
  status text not null default 'submitted' check (
    status in ('submitted', 'reviewing', 'approved', 'edits_requested', 'declined')
  ),

  -- admin response
  reviewer_notes text,
  edit_requests text,
  decline_reason text,
  decline_category text check (
    decline_category in (
      'ftc_disclosure_missing',
      'misrepresentation',
      'banned_phrasing',
      'palette_or_visual_drift',
      'pricing_misstatement',
      'unverifiable_claim',
      'other'
    )
  ),

  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_email text,

  -- whether this submission counted toward the gate (only approved
  -- submissions advance approved_pieces_count on affiliates)
  counted_toward_gate boolean not null default false
);

create index if not exists affiliate_copy_submissions_affiliate_id_idx
  on affiliate_copy_submissions (affiliate_id);
create index if not exists affiliate_copy_submissions_status_idx
  on affiliate_copy_submissions (status);
create index if not exists affiliate_copy_submissions_submitted_at_idx
  on affiliate_copy_submissions (submitted_at desc);

-- ─── RLS ───

alter table affiliate_copy_submissions enable row level security;

-- An authenticated affiliate reads their own submissions.
drop policy if exists "affiliate_copy_submissions_self_read"
  on affiliate_copy_submissions;
create policy "affiliate_copy_submissions_self_read"
  on affiliate_copy_submissions for select
  to authenticated
  using (
    affiliate_id in (
      select id from affiliates
      where user_id = auth.uid()
         or slug = coalesce(
           auth.jwt() -> 'user_metadata' ->> 'affiliate_slug',
           auth.jwt() -> 'user_metadata' ->> 'partner_slug'
         )
    )
  );

-- An authenticated affiliate inserts a submission for their own affiliate row.
drop policy if exists "affiliate_copy_submissions_self_insert"
  on affiliate_copy_submissions;
create policy "affiliate_copy_submissions_self_insert"
  on affiliate_copy_submissions for insert
  to authenticated
  with check (
    affiliate_id in (
      select id from affiliates
      where user_id = auth.uid()
    )
  );

-- All updates (admin review actions) go through service-role admin client.
