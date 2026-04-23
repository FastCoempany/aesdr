import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Verify a user has active paid access — either through their own purchase
 * or as an accepted member of an active team.
 *
 * Combines email + user_id checks into a single OR query to halve round
 * trips vs. checking them sequentially. Falls through to a team check if
 * no direct purchase is found.
 */
export async function verifyPaidAccess(
  supabase: SupabaseClient,
  user: User
): Promise<boolean> {
  const email = user.email?.toLowerCase() ?? "";

  // Single query: purchase linked to user_id OR user_email
  const { data: directPurchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("status", "active")
    .or(`user_id.eq.${user.id}${email ? `,user_email.eq.${email}` : ""}`)
    .limit(1)
    .maybeSingle();

  if (directPurchase) return true;

  // No direct purchase — check team membership with a joined query
  const { data: teamMembership } = await supabase
    .from("team_members")
    .select("teams!inner(purchase_id, id)")
    .eq("user_id", user.id)
    .not("accepted_at", "is", null)
    .limit(1)
    .maybeSingle();

  if (!teamMembership) return false;

  const team = teamMembership.teams as unknown as {
    id: string;
    purchase_id: string | null;
  } | null;
  if (!team?.purchase_id) return false;

  const { data: teamPurchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("id", team.purchase_id)
    .eq("status", "active")
    .maybeSingle();

  return !!teamPurchase;
}
