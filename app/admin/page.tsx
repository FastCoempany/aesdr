import { createAdminClient } from "@/utils/supabase/admin";

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  const [purchasesRes, refundsRes, progressRes, teamsRes, artifactsRes] = await Promise.all([
    supabase.from("purchases").select("plan, amount_cents", { count: "exact" }).eq("status", "active"),
    supabase.from("purchases").select("id", { count: "exact" }).eq("status", "refunded"),
    supabase.from("course_progress").select("user_id, is_completed"),
    supabase.from("teams").select("id", { count: "exact" }),
    supabase.from("generated_artifacts").select("id", { count: "exact" }),
  ]);

  const purchases = purchasesRes.data ?? [];
  const totalCustomers = purchasesRes.count ?? 0;
  const totalRevenue = purchases.reduce((sum, p) => sum + (p.amount_cents ?? 0), 0);
  const sdrCount = purchases.filter((p) => p.plan === "sdr" || p.plan === "individual").length;
  const aeCount = purchases.filter((p) => p.plan === "ae").length;
  const teamCount = purchases.filter((p) => p.plan === "team").length;
  const refundCount = refundsRes.count ?? 0;
  const teamPlanCount = teamsRes.count ?? 0;
  const artifactCount = artifactsRes.count ?? 0;

  const progressRows = progressRes.data ?? [];
  const uniqueUsers = new Set(progressRows.map((r) => r.user_id));
  const completedLessons = progressRows.filter((r) => r.is_completed).length;
  const avgCompleted = uniqueUsers.size > 0 ? (completedLessons / uniqueUsers.size).toFixed(1) : "0";

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: activeCount } = await supabase
    .from("course_progress")
    .select("user_id", { count: "exact", head: true })
    .gte("updated_at", sevenDaysAgo);

  const metrics = [
    { label: "Paying Customers", value: String(totalCustomers) },
    { label: "Revenue", value: `$${(totalRevenue / 100).toLocaleString()}` },
    { label: "SDR / AE / Team", value: `${sdrCount} / ${aeCount} / ${teamCount}` },
    { label: "Refunds", value: String(refundCount) },
    { label: "Active (7d)", value: String(activeCount ?? 0) },
    { label: "Avg Lessons Done", value: avgCompleted },
    { label: "Teams Created", value: String(teamPlanCount) },
    { label: "Artifacts Generated", value: String(artifactCount) },
  ];

  return (
    <>
      <header style={{ marginBottom: "40px" }}>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: ".3em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: "8px" }}>
          Command Center
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "36px", fontWeight: 900, fontStyle: "italic", lineHeight: "1.1" }}>
          Dashboard
        </h1>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "48px",
        }}
      >
        {metrics.map((m) => (
          <div
            key={m.label}
            style={{
              padding: "24px",
              background: "#fff",
              border: "1px solid #E8E4DF",
            }}
          >
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "9px", letterSpacing: ".2em", textTransform: "uppercase", color: "#6B6B6B", marginBottom: "8px" }}>
              {m.label}
            </p>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "32px", fontWeight: 900, fontStyle: "italic", lineHeight: "1" }}>
              {m.value}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
