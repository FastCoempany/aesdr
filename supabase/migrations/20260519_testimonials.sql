-- Testimonial capture.
-- Replaces the "reply to email" testimonial flow with a structured
-- one-screen form gated to logged-in customers. We collect a 1-5
-- rating + a one-line testimonial + permission to use first-name +
-- role on the marketing site. Per audit H.16 (Phase 2).
--
-- Status starts as 'pending'; founder flips to 'approved' for the
-- ones we want to surface. The home-page Testimonials component
-- reads only status='approved' rows.

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text not null,
  display_name text,           -- first name as the user wants it shown
  role text,                   -- 'ae' | 'sdr' captured from user_metadata
  rating int not null check (rating between 1 and 5),
  body text not null check (char_length(body) between 1 and 1000),
  permit_publish boolean not null default false,

  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  status_changed_at timestamptz,
  status_note text,            -- admin-side note, never shown publicly

  submitted_at timestamptz not null default now(),
  source text not null default 'in_app' check (source in ('in_app','email_reply','import'))
);

create unique index if not exists testimonials_user_id_idx
  on testimonials (user_id);

create index if not exists testimonials_status_idx
  on testimonials (status);

create index if not exists testimonials_submitted_at_idx
  on testimonials (submitted_at desc);

alter table testimonials enable row level security;

-- Public can read approved testimonials only (for marquee surface).
create policy "testimonials_public_read_approved"
  on testimonials for select
  using (status = 'approved' and permit_publish = true);

-- Users can read their own submission (to show "thanks, you said X").
create policy "testimonials_self_read"
  on testimonials for select
  to authenticated
  using (auth.uid() = user_id);

-- Users can insert their own row, status forced to 'pending' by trigger.
create policy "testimonials_self_insert"
  on testimonials for insert
  to authenticated
  with check (auth.uid() = user_id and status = 'pending');

-- Users can update their own row only if it's still pending (re-edit before
-- approval); approved/rejected rows are immutable from their side.
create policy "testimonials_self_update_pending"
  on testimonials for update
  to authenticated
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status = 'pending');
