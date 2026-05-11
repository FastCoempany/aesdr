import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

/**
 * Admin email allowlist (from server-only ADMIN_EMAILS env var).
 * Parsed once at module load; rotation requires a redeploy.
 */
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Pure check: is the given email in the admin allowlist?
 * Lowercases the input before checking — comparison is case-insensitive.
 *
 * Useful for proxy.ts (edge middleware) and anywhere we have an email
 * string in hand but don't want the round-trip of a Supabase server client.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Returns the admin status for the current request's session.
 *
 * - `isAdmin: true` only when a signed-in user's email is in ADMIN_EMAILS
 * - Never throws, never redirects — pure "what's the current state" probe
 *
 * Use this from server components/routes that want to *conditionally* alter
 * behavior for admins (bypass paywalls, render the AdminChip, etc.) without
 * forcing the redirect that `requireAdmin` does.
 */
export async function getAdminContext(
  supabaseOverride?: SupabaseClient,
): Promise<{ isAdmin: boolean; user: User | null }> {
  const supabase = supabaseOverride ?? (await createClient());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return {
    user: user ?? null,
    isAdmin: isAdminEmail(user?.email),
  };
}

/**
 * Hard gate for /admin/* routes. Redirects to /dashboard if the visitor
 * is not signed in or not in ADMIN_EMAILS.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  return user;
}
