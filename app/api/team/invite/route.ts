export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendTeamInviteEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

const InviteSchema = z.object({
  email: z.string().email().max(320),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimit(`team-invite:${user.id}`, { max: 20, windowMs: 60 * 60 * 1000 });
    if (!rl.success) {
      return NextResponse.json({ error: "Too many invites. Try again later." }, { status: 429 });
    }

    const body = await request.json();
    const parsed = InviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    const inviteEmail = parsed.data.email.toLowerCase();

    const admin = createAdminClient();

    // Verify user owns a team
    const { data: team } = await admin
      .from("teams")
      .select("id, max_seats")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!team) {
      return NextResponse.json({ error: "No team found" }, { status: 403 });
    }

    // Check seat count
    const { count: memberCount } = await admin
      .from("team_members")
      .select("id", { count: "exact", head: true })
      .eq("team_id", team.id);

    if ((memberCount ?? 0) >= team.max_seats) {
      return NextResponse.json({ error: "All seats are filled" }, { status: 400 });
    }

    // Check if already invited
    const { data: existing } = await admin
      .from("team_members")
      .select("id, accepted_at")
      .eq("team_id", team.id)
      .eq("email", inviteEmail)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: existing.accepted_at ? "Already a team member" : "Already invited" }, { status: 409 });
    }

    // Generate secure invite token
    const token = crypto.randomUUID();

    const { error: insertErr } = await admin
      .from("team_members")
      .insert({
        team_id: team.id,
        email: inviteEmail,
        role: "member",
        invite_token: token,
      });

    if (insertErr) {
      console.error("[team-invite] Insert failed:", insertErr.message);
      return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
    }

    const ownerName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Your team admin";
    await sendTeamInviteEmail(inviteEmail, ownerName, token);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[team-invite] Unexpected error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
