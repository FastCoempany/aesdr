import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import InviteForm from "./InviteForm";

export const metadata = {
  title: "Your Team | AESDR",
};

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: team } = await admin
    .from("teams")
    .select("id, name, max_seats")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!team) redirect("/dashboard");

  const { data: members } = await admin
    .from("team_members")
    .select("id, email, role, user_id, invited_at, accepted_at")
    .eq("team_id", team.id)
    .order("invited_at", { ascending: true });

  const memberRows = members ?? [];

  const userIds = memberRows.map((m) => m.user_id).filter(Boolean) as string[];
  let progressMap: Record<string, { completed: number; lastActive: string | null }> = {};

  if (userIds.length > 0) {
    const { data: progress } = await admin
      .from("course_progress")
      .select("user_id, is_completed, updated_at")
      .in("user_id", userIds);

    if (progress) {
      for (const row of progress) {
        const entry = progressMap[row.user_id] ?? { completed: 0, lastActive: null };
        if (row.is_completed) entry.completed++;
        if (!entry.lastActive || row.updated_at > entry.lastActive) entry.lastActive = row.updated_at;
        progressMap[row.user_id] = entry;
      }
    }
  }

  const acceptedCount = memberRows.filter((m) => m.accepted_at).length;
  const pendingCount = memberRows.filter((m) => !m.accepted_at).length;
  const seatsLeft = team.max_seats - memberRows.length;

  return (
    <main
      style={{
        background: "#FAF7F2",
        color: "#1A1A1A",
        minHeight: "100vh",
      }}
    >
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-[5%] py-5"
        style={{ borderBottom: "1px solid #E8E4DF", background: "rgba(250,247,242,0.95)", backdropFilter: "blur(10px)" }}
      >
        <Link href="/" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "18px", fontWeight: 900, fontStyle: "italic", letterSpacing: ".05em", textDecoration: "none" }}>
          <span style={{ background: "var(--iris)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "iris 3s linear infinite" }}>AESDR</span>
        </Link>
        <div className="flex items-center gap-4" style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: "11px", letterSpacing: ".15em", textTransform: "uppercase" }}>
          <Link href="/dashboard" style={{ color: "#6B6B6B", textDecoration: "none" }}>Course</Link>
          <Link href="/account" style={{ color: "#6B6B6B", textDecoration: "none" }}>Account</Link>
        </div>
      </nav>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 5%" }}>
        {/* Header */}
        <header style={{ marginBottom: "40px" }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: ".3em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: "8px" }}>
            Team Management
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 900, fontStyle: "italic", lineHeight: "1.1", marginBottom: "12px" }}>
            {team.name}
          </h1>
        </header>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px", marginBottom: "40px" }}>
          {[
            { label: "Members", value: String(acceptedCount) },
            { label: "Pending Invites", value: String(pendingCount) },
            { label: "Seats Left", value: String(seatsLeft) },
            { label: "Max Seats", value: String(team.max_seats) },
          ].map((s) => (
            <div key={s.label} style={{ padding: "20px", background: "#fff", border: "1px solid #E8E4DF" }}>
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "9px", letterSpacing: ".2em", textTransform: "uppercase", color: "#6B6B6B", marginBottom: "6px" }}>
                {s.label}
              </p>
              <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "28px", fontWeight: 900, fontStyle: "italic", lineHeight: "1" }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Invite */}
        {seatsLeft > 0 && (
          <div style={{ marginBottom: "40px", padding: "24px", background: "#fff", border: "1px solid #E8E4DF" }}>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: ".2em", textTransform: "uppercase", color: "#6B6B6B", marginBottom: "16px" }}>
              Invite a Team Member
            </p>
            <InviteForm />
          </div>
        )}

        {/* Members table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Source Serif 4', Georgia, serif", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E8E4DF" }}>
                {["Email", "Role", "Status", "Lessons", "Last Active", "Invited"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "12px 12px 12px 0",
                      fontFamily: "'Space Mono', monospace",
                      fontSize: "9px",
                      letterSpacing: ".2em",
                      textTransform: "uppercase",
                      color: "#6B6B6B",
                      fontWeight: 400,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {memberRows.map((m) => {
                const prog = m.user_id ? progressMap[m.user_id] : null;
                const lastActive = prog?.lastActive
                  ? new Date(prog.lastActive).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : "—";

                return (
                  <tr key={m.id} style={{ borderBottom: "1px solid #E8E4DF" }}>
                    <td style={{ padding: "12px 12px 12px 0", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.email}
                    </td>
                    <td style={{ padding: "12px 12px 12px 0" }}>
                      <span style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: "9px",
                        letterSpacing: ".15em",
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        border: `1px solid ${m.role === "admin" ? "#8B1A1A" : "#E8E4DF"}`,
                        color: m.role === "admin" ? "#8B1A1A" : "#6B6B6B",
                      }}>
                        {m.role}
                      </span>
                    </td>
                    <td style={{ padding: "12px 12px 12px 0" }}>
                      <span style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: "9px",
                        letterSpacing: ".1em",
                        textTransform: "uppercase",
                        color: m.accepted_at ? "#10B981" : "#D4A017",
                      }}>
                        {m.accepted_at ? "Active" : "Pending"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 12px 12px 0", fontFamily: "'Space Mono', monospace", fontSize: "13px" }}>
                      {prog ? `${prog.completed}/12` : "0/12"}
                    </td>
                    <td style={{ padding: "12px 12px 12px 0", color: "#6B6B6B", fontSize: "13px" }}>
                      {lastActive}
                    </td>
                    <td style={{ padding: "12px 12px 12px 0", color: "#6B6B6B", fontSize: "13px" }}>
                      {new Date(m.invited_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {memberRows.length === 0 && (
          <p style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: "16px", color: "#6B6B6B", textAlign: "center", padding: "40px 0" }}>
            No team members yet. Use the invite form above to add your first member.
          </p>
        )}
      </div>
    </main>
  );
}
