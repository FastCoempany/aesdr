import { createAdminClient } from "@/utils/supabase/admin";
import { LESSONS } from "@/utils/progress/types";

export const dynamic = "force-dynamic";

interface PurchaseRow {
  user_id: string | null;
  user_email: string;
  customer_name: string | null;
  purchased_at: string;
  plan: string;
}

interface ProgressRow {
  user_id: string;
  lesson_id: string;
  is_completed: boolean;
  updated_at: string;
}

interface AtRiskRow {
  email: string;
  name: string | null;
  plan: string;
  purchased_at: string;
  completed: number;
  lastActivityAt: string | null;
  daysSinceActivity: number;
  daysSincePurchase: number;
  reason: string;
}

const DAY = 24 * 60 * 60 * 1000;

function daysAgo(iso: string | null): number {
  if (!iso) return Infinity;
  return Math.floor((Date.now() - new Date(iso).getTime()) / DAY);
}

export default async function AtRiskPage() {
  const supabase = createAdminClient();

  const [purchasesRes, progressRes] = await Promise.all([
    supabase
      .from("purchases")
      .select("user_id, user_email, customer_name, purchased_at, plan")
      .eq("status", "active")
      .order("purchased_at", { ascending: false })
      .limit(2000),
    supabase
      .from("course_progress")
      .select("user_id, lesson_id, is_completed, updated_at"),
  ]);

  const purchases: PurchaseRow[] = (purchasesRes.data as PurchaseRow[]) ?? [];
  const progress: ProgressRow[] = (progressRes.data as ProgressRow[]) ?? [];

  const progressByUser = new Map<
    string,
    { completed: number; lastActivityAt: string | null }
  >();
  for (const row of progress) {
    if (!row.user_id) continue;
    const entry = progressByUser.get(row.user_id) ?? {
      completed: 0,
      lastActivityAt: null,
    };
    if (row.is_completed) entry.completed++;
    if (!entry.lastActivityAt || row.updated_at > entry.lastActivityAt) {
      entry.lastActivityAt = row.updated_at;
    }
    progressByUser.set(row.user_id, entry);
  }

  // At-risk = purchased >= 5 days ago, < 12 lessons complete, no activity
  // in 7+ days. Bucketed by severity:
  //   - "silent_start"   ≥ 5d since purchase + 0 lessons + 0 activity
  //   - "stalled"        ≥ 7d since last activity, 1-11 completed
  //   - "near_finish"    8-11 completed, ≥ 14d since last activity (push to finish)
  const rows: AtRiskRow[] = [];
  for (const p of purchases) {
    if (!p.user_id) continue;
    const pr = progressByUser.get(p.user_id) ?? {
      completed: 0,
      lastActivityAt: null,
    };
    const daysSincePurchase = daysAgo(p.purchased_at);
    const daysSinceActivity = daysAgo(pr.lastActivityAt);
    const completed = pr.completed;

    if (completed >= LESSONS.length) continue;

    let reason: string | null = null;
    if (completed === 0 && daysSincePurchase >= 5) {
      reason = `silent_start (${daysSincePurchase}d since purchase, no opens)`;
    } else if (
      completed >= 8 &&
      completed < LESSONS.length &&
      daysSinceActivity >= 14
    ) {
      reason = `near_finish (${completed}/${LESSONS.length}, ${daysSinceActivity}d quiet)`;
    } else if (completed > 0 && daysSinceActivity >= 7) {
      reason = `stalled (${completed}/${LESSONS.length}, ${daysSinceActivity}d quiet)`;
    }
    if (!reason) continue;

    rows.push({
      email: p.user_email,
      name: p.customer_name,
      plan: p.plan,
      purchased_at: p.purchased_at,
      completed,
      lastActivityAt: pr.lastActivityAt,
      daysSinceActivity,
      daysSincePurchase,
      reason,
    });
  }

  rows.sort((a, b) => b.daysSinceActivity - a.daysSinceActivity);

  const summary = {
    total: rows.length,
    silent_start: rows.filter((r) => r.reason.startsWith("silent_start")).length,
    stalled: rows.filter((r) => r.reason.startsWith("stalled")).length,
    near_finish: rows.filter((r) => r.reason.startsWith("near_finish")).length,
  };

  return (
    <div>
      <p
        style={{
          fontFamily: "'Space Mono',monospace",
          fontSize: 10,
          letterSpacing: ".32em",
          textTransform: "uppercase",
          color: "#6B6B6B",
          marginBottom: 8,
        }}
      >
        Admin · Retention triage
      </p>
      <h1
        style={{
          fontFamily: "'Playfair Display',Georgia,serif",
          fontStyle: "italic",
          fontWeight: 900,
          fontSize: "clamp(28px,4vw,40px)",
          lineHeight: 1.1,
          marginBottom: 24,
        }}
      >
        Who&rsquo;s slipping.
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 32,
        }}
      >
        {[
          { label: "Total at risk", value: summary.total },
          { label: "Silent start", value: summary.silent_start },
          { label: "Stalled mid", value: summary.stalled },
          { label: "Near finish", value: summary.near_finish },
        ].map((m) => (
          <div
            key={m.label}
            style={{
              background: "#fff",
              border: "1px solid #E8E4DF",
              padding: "16px 18px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: "'Space Mono',monospace",
                fontSize: 9,
                letterSpacing: ".25em",
                textTransform: "uppercase",
                color: "#6B6B6B",
              }}
            >
              {m.label}
            </p>
            <p
              style={{
                margin: 0,
                fontFamily: "'Playfair Display',Georgia,serif",
                fontStyle: "italic",
                fontWeight: 900,
                fontSize: 36,
                color: m.value > 0 ? "#8B1A1A" : "#1A1A1A",
              }}
            >
              {m.value}
            </p>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #E8E4DF" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "Georgia,'Source Serif 4',serif",
            fontSize: 14,
          }}
        >
          <thead>
            <tr style={{ background: "#FAF7F2", textAlign: "left" }}>
              {["Customer", "Plan", "Progress", "Last activity", "Reason"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px 16px",
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 10,
                    letterSpacing: ".22em",
                    textTransform: "uppercase",
                    color: "#6B6B6B",
                    borderBottom: "1px solid #E8E4DF",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "32px 16px",
                    textAlign: "center",
                    color: "#6B6B6B",
                  }}
                >
                  Nobody at risk in the current window. Either the cohort is
                  small or retention is holding.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr
                key={r.email}
                style={{ borderBottom: "1px solid #E8E4DF" }}
              >
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ fontWeight: 700 }}>{r.name || r.email}</div>
                  <div style={{ fontSize: 12, color: "#6B6B6B" }}>{r.email}</div>
                </td>
                <td style={{ padding: "12px 16px", textTransform: "uppercase" }}>
                  {r.plan}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  {r.completed} / {LESSONS.length}
                </td>
                <td style={{ padding: "12px 16px", color: "#6B6B6B" }}>
                  {r.lastActivityAt
                    ? `${r.daysSinceActivity}d ago`
                    : `none (${r.daysSincePurchase}d since purchase)`}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 11,
                    color: "#8B1A1A",
                  }}
                >
                  {r.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
