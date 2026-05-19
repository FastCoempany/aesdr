import Link from "next/link";
import { notFound } from "next/navigation";

import { markPayoutPaid } from "@/app/actions/affiliate";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

function dollars(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US")}`;
}

function dateShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toISOString().slice(0, 10);
}

export default async function AffiliateDetailPage({
  params,
}: {
  params: Promise<{ partnerSlug: string }>;
}) {
  const { partnerSlug } = await params;
  const supabase = createAdminClient();

  const [linksRes, attribRes, payoutRes] = await Promise.all([
    supabase
      .from("affiliate_links")
      .select("id, slug, label, destination_url, active, expires_at, created_at")
      .eq("partner_slug", partnerSlug)
      .order("created_at", { ascending: false }),
    supabase
      .from("affiliate_attributions")
      .select(
        "id, status, user_email, gross_amount_cents, commission_amount_cents, attributed_at, refund_window_closes_at, cleared_at, paid_at"
      )
      .eq("partner_slug", partnerSlug)
      .order("attributed_at", { ascending: false }),
    supabase
      .from("affiliate_payouts")
      .select("id, period_start, period_end, total_commission_cents, status, payment_method, payment_reference, paid_at, created_at")
      .eq("partner_slug", partnerSlug)
      .order("created_at", { ascending: false }),
  ]);

  const links = linksRes.data ?? [];
  const attributions = attribRes.data ?? [];
  const payouts = payoutRes.data ?? [];

  if (links.length === 0 && attributions.length === 0 && payouts.length === 0) {
    notFound();
  }

  const cleared = attributions.filter((a) => a.status === "cleared");

  return (
    <div>
      <p style={{ marginBottom: 12 }}>
        <Link href="/admin/affiliates" style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#6B6B6B" }}>
          ← All affiliates
        </Link>
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
        {partnerSlug}
      </h1>

      {/* Cleared-ready payout helper */}
      {cleared.length > 0 && (
        <div
          style={{
            background: "#1A1A1A",
            color: "#FAF7F2",
            padding: "20px 24px",
            marginBottom: 32,
          }}
          data-surface="dark"
        >
          <p
            style={{
              margin: 0,
              fontFamily: "'Space Mono',monospace",
              fontSize: 10,
              letterSpacing: ".32em",
              textTransform: "uppercase",
              color: "rgba(250,247,242,0.6)",
              marginBottom: 6,
            }}
          >
            Ready for payout
          </p>
          <p
            style={{
              margin: 0,
              fontFamily: "'Playfair Display',Georgia,serif",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 24,
              marginBottom: 12,
            }}
          >
            {dollars(cleared.reduce((s, a) => s + (a.commission_amount_cents ?? 0), 0))}{" "}
            <span style={{ fontSize: 14, fontStyle: "normal", color: "rgba(250,247,242,0.7)" }}>
              across {cleared.length} cleared attributions
            </span>
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(250,247,242,0.7)" }}>
            Bundle these into a payout row via SQL or the (future) one-click button.
            Then mark paid below with the wire reference once the money lands.
          </p>
        </div>
      )}

      {/* Links table */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: ".25em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: 16 }}>
          Links ({links.length})
        </h2>
        <div style={{ background: "#fff", border: "1px solid #E8E4DF", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#FAF7F2", textAlign: "left" }}>
                {["Slug", "Destination", "Label", "Active", "Created"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "#6B6B6B", borderBottom: "1px solid #E8E4DF" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.id} style={{ borderBottom: "1px solid #E8E4DF" }}>
                  <td style={{ padding: "12px 14px", fontFamily: "'Space Mono',monospace" }}>{l.slug}</td>
                  <td style={{ padding: "12px 14px", color: "#6B6B6B", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.destination_url}</td>
                  <td style={{ padding: "12px 14px" }}>{l.label || "—"}</td>
                  <td style={{ padding: "12px 14px" }}>{l.active ? "Yes" : "No"}</td>
                  <td style={{ padding: "12px 14px", color: "#6B6B6B" }}>{dateShort(l.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Attributions */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: ".25em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: 16 }}>
          Attributions ({attributions.length})
        </h2>
        <div style={{ background: "#fff", border: "1px solid #E8E4DF", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#FAF7F2", textAlign: "left" }}>
                {["Date", "Buyer", "Sale", "Commission", "Status", "Refund window"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "#6B6B6B", borderBottom: "1px solid #E8E4DF" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attributions.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #E8E4DF" }}>
                  <td style={{ padding: "12px 14px", color: "#6B6B6B" }}>{dateShort(a.attributed_at)}</td>
                  <td style={{ padding: "12px 14px", fontFamily: "'Space Mono',monospace", fontSize: 13 }}>{a.user_email}</td>
                  <td style={{ padding: "12px 14px" }}>{dollars(a.gross_amount_cents)}</td>
                  <td style={{ padding: "12px 14px", fontWeight: 700 }}>{dollars(a.commission_amount_cents)}</td>
                  <td style={{ padding: "12px 14px", fontFamily: "'Space Mono',monospace", fontSize: 11, textTransform: "uppercase", letterSpacing: ".18em" }}>{a.status}</td>
                  <td style={{ padding: "12px 14px", color: "#6B6B6B", fontSize: 12 }}>
                    {a.status === "pending" ? `closes ${dateShort(a.refund_window_closes_at)}` :
                     a.status === "cleared" ? `cleared ${dateShort(a.cleared_at)}` :
                     a.status === "paid" ? `paid ${dateShort(a.paid_at)}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Payouts */}
      <section>
        <h2 style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: ".25em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: 16 }}>
          Payouts ({payouts.length})
        </h2>
        {payouts.length === 0 ? (
          <p style={{ color: "#6B6B6B" }}>
            No payouts created yet. Bundle cleared attributions into an{" "}
            <code>affiliate_payouts</code> row via SQL when you&rsquo;re
            ready to pay, then mark it paid here.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {payouts.map((p) => (
              <article key={p.id} style={{ background: "#fff", border: "1px solid #E8E4DF", padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <strong>
                    {dateShort(p.period_start)} → {dateShort(p.period_end)}
                  </strong>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, textTransform: "uppercase", letterSpacing: ".18em", color: p.status === "paid" ? "#1A1A1A" : "#8B1A1A" }}>
                    {p.status}
                  </span>
                </div>
                <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic", fontWeight: 900, fontSize: 24, margin: "0 0 12px" }}>
                  {dollars(p.total_commission_cents)}
                </p>
                {p.status === "paid" ? (
                  <p style={{ color: "#6B6B6B", fontSize: 13 }}>
                    Paid {dateShort(p.paid_at)} via {p.payment_method || "?"}
                    {p.payment_reference ? ` · ref ${p.payment_reference}` : ""}
                  </p>
                ) : (
                  <form action={markPayoutPaid} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
                    <input type="hidden" name="payoutId" value={p.id} />
                    <div>
                      <label style={{ display: "block", fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#6B6B6B", marginBottom: 4 }}>
                        Method
                      </label>
                      <select name="paymentMethod" defaultValue="ach" style={{ padding: "6px 10px", border: "1px solid #B5B0A8", fontFamily: "Georgia,serif", fontSize: 13 }}>
                        <option value="ach">ACH</option>
                        <option value="wise">Wise</option>
                        <option value="paypal">PayPal</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#6B6B6B", marginBottom: 4 }}>
                        Reference
                      </label>
                      <input name="paymentReference" type="text" placeholder="wire / txn id" style={{ padding: "6px 10px", border: "1px solid #B5B0A8", fontFamily: "Georgia,serif", fontSize: 13 }} />
                    </div>
                    <button type="submit" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: ".15em", textTransform: "uppercase", color: "#fff", background: "#8B1A1A", border: "none", padding: "8px 16px", cursor: "pointer" }}>
                      Mark paid
                    </button>
                  </form>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
