import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import RefundButton from "./RefundButton";

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; plan?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const planFilter = params.plan ?? "";

  const supabase = createAdminClient();

  let query = supabase
    .from("purchases")
    .select("id, user_email, user_id, customer_name, plan, amount_cents, status, purchased_at")
    .order("purchased_at", { ascending: false })
    .limit(200);

  if (planFilter) query = query.eq("plan", planFilter);
  if (q) query = query.ilike("user_email", `%${q}%`);

  const { data: purchases } = await query;
  const rows = purchases ?? [];

  // Fetch progress counts for all user_ids in one query
  const userIds = [...new Set(rows.map((r) => r.user_id).filter(Boolean))] as string[];
  const progressMap: Record<string, { completed: number; lastActive: string | null }> = {};

  if (userIds.length > 0) {
    const { data: progress } = await supabase
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

  return (
    <>
      <header style={{ marginBottom: "32px" }}>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: ".3em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: "8px" }}>
          Personnel
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "36px", fontWeight: 900, fontStyle: "italic", lineHeight: "1.1" }}>
          Users
        </h1>
      </header>

      {/* Filters */}
      <form style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by email..."
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: "14px",
            padding: "10px 16px",
            border: "1px solid #E8E4DF",
            background: "#fff",
            color: "#1A1A1A",
            width: "280px",
          }}
        />
        <select
          name="plan"
          defaultValue={planFilter}
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "11px",
            letterSpacing: ".1em",
            textTransform: "uppercase",
            padding: "10px 16px",
            border: "1px solid #E8E4DF",
            background: "#fff",
            color: "#1A1A1A",
          }}
        >
          <option value="">All Plans</option>
          <option value="sdr">SDR</option>
          <option value="ae">AE</option>
          <option value="team">Team</option>
        </select>
        <button
          type="submit"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: ".15em",
            textTransform: "uppercase",
            padding: "10px 24px",
            background: "#1A1A1A",
            color: "#FAF7F2",
            border: "none",
            cursor: "pointer",
          }}
        >
          Filter
        </button>
      </form>

      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: ".1em", color: "#6B6B6B", marginBottom: "16px" }}>
        {rows.length} result{rows.length !== 1 ? "s" : ""}
      </p>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Source Serif 4', Georgia, serif", fontSize: "14px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #E8E4DF" }}>
              {["Email", "Name", "Plan", "Amount", "Status", "Purchased", "Lessons", "Last Active", ""].map((h) => (
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
            {rows.map((row) => {
              const prog = row.user_id ? progressMap[row.user_id] : null;
              const lastActive = prog?.lastActive
                ? new Date(prog.lastActive).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "—";

              return (
                <tr key={row.id} style={{ borderBottom: "1px solid #E8E4DF" }}>
                  <td style={{ padding: "12px 12px 12px 0", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {row.user_email}
                  </td>
                  <td style={{ padding: "12px 12px 12px 0", color: "#6B6B6B" }}>
                    {row.customer_name ?? "—"}
                  </td>
                  <td style={{ padding: "12px 12px 12px 0" }}>
                    <span
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: "9px",
                        letterSpacing: ".15em",
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        border: `1px solid ${row.plan === "team" ? "#8B1A1A" : "#E8E4DF"}`,
                        color: row.plan === "team" ? "#8B1A1A" : "#6B6B6B",
                      }}
                    >
                      {row.plan}
                    </span>
                  </td>
                  <td style={{ padding: "12px 12px 12px 0", fontFamily: "'Space Mono', monospace", fontSize: "13px" }}>
                    ${(row.amount_cents / 100).toFixed(0)}
                  </td>
                  <td style={{ padding: "12px 12px 12px 0" }}>
                    <span
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: "9px",
                        letterSpacing: ".1em",
                        textTransform: "uppercase",
                        color: row.status === "active" ? "#10B981" : row.status === "refunded" ? "#8B1A1A" : "#6B6B6B",
                      }}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 12px 12px 0", color: "#6B6B6B", fontSize: "13px" }}>
                    {new Date(row.purchased_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td style={{ padding: "12px 12px 12px 0", fontFamily: "'Space Mono', monospace", fontSize: "13px" }}>
                    {prog ? `${prog.completed}/12` : "0/12"}
                  </td>
                  <td style={{ padding: "12px 12px 12px 0", color: "#6B6B6B", fontSize: "13px" }}>
                    {lastActive}
                  </td>
                  <td style={{ padding: "12px 12px 12px 0" }}>
                    {row.status === "active" && (
                      <RefundButton purchaseId={row.id} email={row.user_email} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
