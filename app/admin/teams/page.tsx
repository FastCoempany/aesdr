import { createAdminClient } from "@/utils/supabase/admin";

export default async function AdminTeams() {
  const supabase = createAdminClient();

  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, owner_id, max_seats, created_at")
    .order("created_at", { ascending: false });

  const rows = teams ?? [];

  // Get member counts per team
  const teamIds = rows.map((t) => t.id);
  let memberCounts: Record<string, { total: number; accepted: number }> = {};

  if (teamIds.length > 0) {
    const { data: members } = await supabase
      .from("team_members")
      .select("team_id, accepted_at")
      .in("team_id", teamIds);

    if (members) {
      for (const m of members) {
        const entry = memberCounts[m.team_id] ?? { total: 0, accepted: 0 };
        entry.total++;
        if (m.accepted_at) entry.accepted++;
        memberCounts[m.team_id] = entry;
      }
    }
  }

  // Get owner emails
  const ownerIds = [...new Set(rows.map((t) => t.owner_id))];
  let ownerEmails: Record<string, string> = {};

  if (ownerIds.length > 0) {
    const { data: purchases } = await supabase
      .from("purchases")
      .select("user_id, user_email")
      .in("user_id", ownerIds);

    if (purchases) {
      for (const p of purchases) {
        if (p.user_id && p.user_email) ownerEmails[p.user_id] = p.user_email;
      }
    }
  }

  return (
    <>
      <header style={{ marginBottom: "32px" }}>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: ".3em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: "8px" }}>
          Organizations
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "36px", fontWeight: 900, fontStyle: "italic", lineHeight: "1.1" }}>
          Teams
        </h1>
      </header>

      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: ".1em", color: "#6B6B6B", marginBottom: "16px" }}>
        {rows.length} team{rows.length !== 1 ? "s" : ""}
      </p>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Source Serif 4', Georgia, serif", fontSize: "14px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #E8E4DF" }}>
              {["Team Name", "Owner", "Members", "Pending", "Seats", "Created"].map((h) => (
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
            {rows.map((team) => {
              const counts = memberCounts[team.id] ?? { total: 0, accepted: 0 };
              return (
                <tr key={team.id} style={{ borderBottom: "1px solid #E8E4DF" }}>
                  <td style={{ padding: "12px 12px 12px 0", fontWeight: 600 }}>
                    {team.name}
                  </td>
                  <td style={{ padding: "12px 12px 12px 0", color: "#6B6B6B", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ownerEmails[team.owner_id] ?? "—"}
                  </td>
                  <td style={{ padding: "12px 12px 12px 0", fontFamily: "'Space Mono', monospace", fontSize: "13px" }}>
                    {counts.accepted}
                  </td>
                  <td style={{ padding: "12px 12px 12px 0" }}>
                    <span style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: "9px",
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      color: counts.total - counts.accepted > 0 ? "#D4A017" : "#6B6B6B",
                    }}>
                      {counts.total - counts.accepted}
                    </span>
                  </td>
                  <td style={{ padding: "12px 12px 12px 0", fontFamily: "'Space Mono', monospace", fontSize: "13px" }}>
                    {counts.total}/{team.max_seats}
                  </td>
                  <td style={{ padding: "12px 12px 12px 0", color: "#6B6B6B", fontSize: "13px" }}>
                    {new Date(team.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: "16px", color: "#6B6B6B", textAlign: "center", padding: "40px 0" }}>
          No teams created yet.
        </p>
      )}
    </>
  );
}
