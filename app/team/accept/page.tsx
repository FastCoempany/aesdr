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

  // Look up the invite (tokens expire after 7 days)
  // eslint-disable-next-line react-hooks/purity -- async server component, runs per-request
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: invite } = await admin
    .from("team_members")
    .select("id, team_id, email, accepted_at, created_at")
    .eq("invite_token", token)
    .gt("created_at", sevenDaysAgo)
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

  // Accept the invite — atomic check prevents double-accept race condition
  const { data: updated, error: updateErr } = await admin
    .from("team_members")
    .update({
      user_id: user.id,
      accepted_at: new Date().toISOString(),
      invite_token: null,
    })
    .eq("id", invite.id)
    .is("accepted_at", null)
    .select("id")
    .maybeSingle();

  if (updateErr || !updated) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-main)", color: "var(--text-main)" }}>
        <p style={{ fontFamily: "var(--serif)" }}>This invite has already been accepted.</p>
      </main>
    );
  }

  redirect("/dashboard");
}
