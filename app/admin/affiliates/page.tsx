import Link from "next/link";

import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

function dollars(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US")}`;
}

interface PerSlug {
  partner_slug: string;
  links: number;
  clicks: number;
  pendingCents: number;
  clearedCents: number;
  paidCents: number;
  refundedCount: number;
}

export default async function AdminAffiliatesPage() {
  const supabase = createAdminClient();

  const [linksRes, clicksRes, attribRes] = await Promise.all([
    supabase.from("affiliate_links").select("partner_slug, active"),
    supabase.from("affiliate_clicks").select("partner_slug"),
    supabase
      .from("affiliate_attributions")
      .select("partner_slug, status, commission_amount_cents"),
  ]);

  const linkCounts = new Map<string, number>();
  for (const l of linksRes.data ?? []) {
    linkCounts.set(l.partner_slug, (linkCounts.get(l.partner_slug) ?? 0) + 1);
  }

  const clickCounts = new Map<string, number>();
  for (const c of clicksRes.data ?? []) {
    clickCounts.set(c.partner_slug, (clickCounts.get(c.partner_slug) ?? 0) + 1);
  }

  const perSlug = new Map<string, PerSlug>();
  for (const a of attribRes.data ?? []) {
    const slug = a.partner_slug;
    const entry = perSlug.get(slug) ?? {
      partner_slug: slug,
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
        partner_slug: slug,
        links: linkCounts.get(slug) ?? 0,
        clicks: clickCounts.get(slug) ?? 0,
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
        Affiliate ledger.
      </h1>

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
              {["Affiliate", "Links", "Clicks", "Pending", "Cleared", "Paid", "Refunded", ""].map((h) => (
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
                  colSpan={8}
                  style={{ padding: "32px 16px", textAlign: "center", color: "#6B6B6B" }}
                >
                  No affiliates yet. Create the first one by setting{" "}
                  <code>user_metadata.is_affiliate = true</code> and{" "}
                  <code>user_metadata.partner_slug = &quot;...&quot;</code>{" "}
                  on a Supabase auth user, then have them sign in and
                  visit <code>/partners/dashboard/links</code>.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.partner_slug} style={{ borderBottom: "1px solid #E8E4DF" }}>
                <td style={{ padding: "12px 14px" }}>
                  <strong>{r.partner_slug}</strong>
                </td>
                <td style={{ padding: "12px 14px" }}>{r.links}</td>
                <td style={{ padding: "12px 14px" }}>{r.clicks}</td>
                <td style={{ padding: "12px 14px" }}>{dollars(r.pendingCents)}</td>
                <td style={{ padding: "12px 14px", fontWeight: 700, color: r.clearedCents > 0 ? "#8B1A1A" : "#1A1A1A" }}>
                  {dollars(r.clearedCents)}
                </td>
                <td style={{ padding: "12px 14px", color: "#6B6B6B" }}>{dollars(r.paidCents)}</td>
                <td style={{ padding: "12px 14px", color: "#6B6B6B" }}>{r.refundedCount}</td>
                <td style={{ padding: "12px 14px" }}>
                  <Link
                    href={`/admin/affiliates/${r.partner_slug}`}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
