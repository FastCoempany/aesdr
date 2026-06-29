-- Adversarial re-audit 2026-06-29 — FIX (HIGH, data leak): the 20260629 RLS
-- migration re-pointed 5 affiliate tables off client-writable user_metadata but
-- MISSED affiliate_copy_submissions. Its self_read policy still resolves the
-- affiliate via `slug = coalesce(auth.jwt()->'user_metadata'->>'affiliate_slug',
-- ...)`, which a user can set to a victim's slug via supabase.auth.updateUser to
-- read the victim's copy drafts from a raw browser client. (The self_insert
-- policy was already user_id-only and is safe — left as-is.)
--
-- Fix: resolve strictly by affiliates.user_id = auth.uid(). Apply in the SQL editor.

drop policy if exists "affiliate_copy_submissions_self_read"
  on public.affiliate_copy_submissions;

create policy "affiliate_copy_submissions_self_read"
  on public.affiliate_copy_submissions for select
  to authenticated
  using (
    affiliate_id in (
      select id from public.affiliates where user_id = auth.uid()
    )
  );
