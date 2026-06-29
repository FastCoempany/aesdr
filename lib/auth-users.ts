import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Find an auth user's id by email, paginating through ALL users (audit §7 /
 * R5-IC-10). The previous call sites used a single `listUsers({ perPage: 50 })`
 * / `{ perPage: 200 }` page, which silently returned no match for anyone past
 * that first page — a userless purchase or an unprovisioned affiliate once the
 * project grows past the page size. This walks pages until the user is found or
 * the list is exhausted, hard-capped so a GoTrue that ignores the page param
 * can't loop forever.
 */
export async function findUserIdByEmail(
  admin: SupabaseClient,
  email: string,
): Promise<string | null> {
  const target = email.trim().toLowerCase();
  if (!target) return null;
  const perPage = 1000; // GoTrue clamps to its own max; the loop covers the rest.
  for (let page = 1; page <= 200; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    const users = data?.users ?? [];
    if (error || users.length === 0) break;
    const match = users.find((u) => u.email?.toLowerCase() === target);
    if (match) return match.id;
  }
  return null;
}
