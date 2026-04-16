import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;

  if (!token) redirect("/login");

  const admin = createAdminClient();

  // Look up the invite
  const { data: invite } = await admin
    .from("team_members")
    .select("id, team_id, email, accepted_at")
    .eq("invite_token", token)
    .maybeSingle();

  if (!invite) {
    return (
      <main style={{ background: "#FAF7F2", color: "#1A1A1A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "28px", fontWeight: 900, fontStyle: "italic", marginBottom: "16px" }}>
            Invalid Invite
          </h1>
          <p style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: "16px", color: "#6B6B6B" }}>
            This invite link is invalid or has expired.
          </p>
        </div>
      </main>
    );
  }

  if (invite.accepted_at) redirect("/dashboard");

  // Check if user is logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to signup with return URL
    redirect(`/signup?next=${encodeURIComponent(`/team/accept?token=${token}`)}&email=${encodeURIComponent(invite.email)}`);
  }

  // Accept the invite — link user_id, clear token, set accepted_at
  await admin
    .from("team_members")
    .update({
      user_id: user.id,
      accepted_at: new Date().toISOString(),
      invite_token: null,
    })
    .eq("id", invite.id);

  redirect("/dashboard");
}
