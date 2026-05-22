import Link from "next/link";

import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

function dollars(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US")}`;
}

interface PerSlug {
  affiliate_slug: string;
  links: number;
  clicks: number;
  pendingCents: number;
  clearedCents: number;
  paidCents: number;
  refundedCount: number;
}

export default async function AdminAffiliatesPage() {
  const supabase = createAdminClient();

  const [linksRes, clicksRes, attribRes, metricsRes] = await Promise.all([
    supabase.from("affiliate_links").select("affiliate_slug, active"),
    supabase.from("affiliate_clicks").select("affiliate_slug"),
    supabase
      .from("affiliate_attributions")
      .select("affiliate_slug, status, commission_amount_cents"),
    supabase
      .from("affiliate_metrics")
      .select(
        "affiliate_slug, display_name, status, archetype, sophistication_tier, strike_count, approved_pieces_count, pending_submissions"
      ),
  ]);

  type MetricsRow = {
    affiliate_slug: string;
    display_name: string;
    status: string;
    archetype: string;
    sophistication_tier: string;
    strike_count: number;
    approved_pieces_count: number;
    pending_submissions: number;
  };
  const metricsBySlug = new Map<string, MetricsRow>();
  for (const m of (metricsRes.data ?? []) as MetricsRow[]) {
    metricsBySlug.set(m.affiliate_slug, m);
  }

  const linkCounts = new Map<string, number>();
  for (const l of linksRes.data ?? []) {
    linkCounts.set(l.affiliate_slug, (linkCounts.get(l.affiliate_slug) ?? 0) + 1);
  }

  const clickCounts = new Map<string, number>();
  for (const c of clicksRes.data ?? []) {
    clickCounts.set(c.affiliate_slug, (clickCounts.get(c.affiliate_slug) ?? 0) + 1);
  }

  const perSlug = new Map<string, PerSlug>();
  for (const a of attribRes.data ?? []) {
    const slug = a.affiliate_slug;
    const entry = perSlug.get(slug) ?? {
      affiliate_slug: slug,
      links: linkCounts.get(slug) ?? 0,
      clicks: clickCounts.get(slug) ?? 0,
      pendingCents: 0,
      clearedCents: 0,
      paidCents: 0,
      refundedCount: 0,
    };
    const c = a.commission_amount_cents ?? 0;
    if (a.status === "pending") entry.pendingCents += c;
    else if (a.status === "cleared") entry.clearedCents += c;
    else if (a.status === "paid") entry.paidCents += c;
    else if (a.status === "refunded") entry.refundedCount++;
    perSlug.set(slug, entry);
  }

  // Also include affiliates with links but no attributions yet.
  for (const slug of linkCounts.keys()) {
    if (!perSlug.has(slug)) {
      perSlug.set(slug, {
        affiliate_slug: slug,
        links: linkCounts.get(slug) ?? 0,
        clicks: clickCounts.get(slug) ?? 0,
        pendingCents: 0,
        clearedCents: 0,
        paidCents: 0,
        refundedCount: 0,
      });
    }
  }

  // Include affiliates from the metrics view even when they have no
  // links/clicks/attributions yet (vetting + activated, pre-promotion).
  for (const slug of metricsBySlug.keys()) {
    if (!perSlug.has(slug)) {
      perSlug.set(slug, {
        affiliate_slug: slug,
        links: 0,
        clicks: 0,
        pendingCents: 0,
        clearedCents: 0,
        paidCents: 0,
        refundedCount: 0,
      });
    }
  }

  const rows = Array.from(perSlug.values()).sort(
    (a, b) => b.clearedCents + b.pendingCents - (a.clearedCents + a.pendingCents)
  );

  // Aggregate header stats
  const totalCleared = rows.reduce((s, r) => s + r.clearedCents, 0);
  const totalPending = rows.reduce((s, r) => s + r.pendingCents, 0);
  const totalPaid = rows.reduce((s, r) => s + r.paidCents, 0);

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
        Admin · Affiliates
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: "'Playfair Display',Georgia,serif",
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: "clamp(28px,4vw,40px)",
            lineHeight: 1.1,
          }}
        >
          Affiliate ledger.
        </h1>
        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/admin/affiliates/new"
            style={{
              fontFamily: "'Barlow Condensed',sans-serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: ".15em",
              textTransform: "uppercase",
              color: "#1A1A1A",
              background: "transparent",
              border: "1px solid #1A1A1A",
              padding: "9px 20px",
              textDecoration: "none",
            }}
          >
            New affiliate
          </Link>
          <Link
            href="/admin/affiliates/queue"
            style={{
              fontFamily: "'Barlow Condensed',sans-serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: ".15em",
              textTransform: "uppercase",
              color: "#fff",
              background: "#8B1A1A",
              padding: "10px 20px",
              textDecoration: "none",
            }}
          >
            Review queue →
          </Link>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 32,
        }}
      >
        {[
          { label: "Affiliates", value: String(rows.length) },
          { label: "Pending commission", value: dollars(totalPending) },
          { label: "Cleared · owed", value: dollars(totalCleared), emphasis: true },
          { label: "Paid · lifetime", value: dollars(totalPaid) },
        ].map((m) => (
          <div
            key={m.label}
            style={{
              background: "#fff",
              border: m.emphasis ? "2px solid #8B1A1A" : "1px solid #E8E4DF",
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
                fontSize: 30,
                color: m.emphasis ? "#8B1A1A" : "#1A1A1A",
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
              {["Affiliate", "Status", "Tier", "Gate", "Strikes", "Pending", "Cleared", "Paid", ""].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 14px",
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
                  colSpan={9}
                  style={{ padding: "32px 16px", textAlign: "center", color: "#6B6B6B" }}
                >
                  No affiliates yet. Click <strong>New affiliate</strong>{" "}
                  above to create one. They land in <code>vetting</code>{" "}
                  status; the onboarding email fires when you flip them
                  to <code>active</code>.
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const m = metricsBySlug.get(r.affiliate_slug);
              const gateRequirement = m?.sophistication_tier === "proven" ? 1 : 3;
              return (
              <tr key={r.affiliate_slug} style={{ borderBottom: "1px solid #E8E4DF" }}>
                <td style={{ padding: "12px 14px" }}>
                  <div><strong>{m?.display_name ?? r.affiliate_slug}</strong></div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#6B6B6B" }}>
                    {r.affiliate_slug} · {r.links} link{r.links === 1 ? "" : "s"} · {r.clicks} click{r.clicks === 1 ? "" : "s"}
                  </div>
                </td>
                <td style={{ padding: "12px 14px", fontFamily: "'Space Mono',monospace", fontSize: 11, textTransform: "uppercase", letterSpacing: ".18em", color: m?.status === "active" ? "#1A1A1A" : "#6B6B6B" }}>
                  {m?.status ?? "—"}
                </td>
                <td style={{ padding: "12px 14px", fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#6B6B6B" }}>
                  {m?.sophistication_tier ?? "—"}
                </td>
                <td style={{ padding: "12px 14px", fontFamily: "'Space Mono',monospace", fontSize: 13 }}>
                  {m ? `${m.approved_pieces_count}/${gateRequirement}` : "—"}
                  {m && m.pending_submissions > 0 && (
                    <span style={{ color: "#8B1A1A", marginLeft: 6 }}>+{m.pending_submissions}</span>
                  )}
                </td>
                <td style={{ padding: "12px 14px", color: (m?.strike_count ?? 0) > 0 ? "#8B1A1A" : "#6B6B6B" }}>
                  {m?.strike_count ?? 0}
                </td>
                <td style={{ padding: "12px 14px" }}>{dollars(r.pendingCents)}</td>
                <td style={{ padding: "12px 14px", fontWeight: 700, color: r.clearedCents > 0 ? "#8B1A1A" : "#1A1A1A" }}>
                  {dollars(r.clearedCents)}
                </td>
                <td style={{ padding: "12px 14px", color: "#6B6B6B" }}>{dollars(r.paidCents)}</td>
                <td style={{ padding: "12px 14px" }}>
                  <Link
                    href={`/admin/affiliates/${r.affiliate_slug}`}
                    style={{
                      fontFamily: "'Barlow Condensed',sans-serif",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: ".15em",
                      textTransform: "uppercase",
                      color: "#8B1A1A",
                      textDecoration: "underline",
                    }}
                  >
                    Detail →
                  </Link>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
