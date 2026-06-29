import Link from "next/link";
import { notFound } from "next/navigation";

import {
  markPayoutPaid,
  setAffiliateSophisticationTier,
  setAffiliateStatus,
  setAffiliateWorkshop,
} from "@/app/actions/affiliate";
import { getAffiliateBySlug } from "@/lib/affiliate-entity";
import { createAdminClient } from "@/utils/supabase/admin";
import PayoutConfirmButton from "./PayoutConfirmButton";

export const dynamic = "force-dynamic";

function dollars(cents: number | null | undefined): string {
  // Guard a null/NaN amount so a missing column renders "$0", not "$NaN".
  const safe = Number.isFinite(cents) ? (cents as number) : 0;
  return `$${(safe / 100).toLocaleString("en-US")}`;
}

function dateShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toISOString().slice(0, 10);
}

export default async function AffiliateDetailPage({
  params,
}: {
  params: Promise<{ affiliateSlug: string }>;
}) {
  const { affiliateSlug } = await params;
  const supabase = createAdminClient();
  const affiliate = await getAffiliateBySlug(affiliateSlug);

  const [linksRes, attribRes, payoutRes] = await Promise.all([
    supabase
      .from("affiliate_links")
      .select("id, slug, label, destination_url, active, expires_at, created_at")
      .eq("affiliate_slug", affiliateSlug)
      .order("created_at", { ascending: false }),
    supabase
      .from("affiliate_attributions")
      .select(
        "id, status, user_email, gross_amount_cents, commission_amount_cents, attributed_at, refund_window_closes_at, cleared_at, paid_at"
      )
      .eq("affiliate_slug", affiliateSlug)
      .order("attributed_at", { ascending: false }),
    supabase
      .from("affiliate_payouts")
      .select("id, period_start, period_end, total_commission_cents, net_paid_cents, status, payment_method, payment_reference, paid_at, created_at")
      .eq("affiliate_slug", affiliateSlug)
      .order("created_at", { ascending: false }),
  ]);

  const links = linksRes.data ?? [];
  const attributions = attribRes.data ?? [];
  const payouts = payoutRes.data ?? [];

  if (!affiliate && links.length === 0 && attributions.length === 0 && payouts.length === 0) {
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
          marginBottom: 8,
        }}
      >
        {affiliate?.display_name ?? affiliateSlug}
      </h1>
      <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#6B6B6B", marginBottom: 24 }}>
        {affiliateSlug}
        {affiliate?.email && ` · ${affiliate.email}`}
      </p>

      {/* Entity panel: status + tier + Stripe Connect */}
      {affiliate && (
        <section
          style={{
            background: "#fff",
            border: "1px solid #E8E4DF",
            padding: "20px 24px",
            marginBottom: 32,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 24,
          }}
        >
          <div>
            <p style={{ margin: 0, fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "#6B6B6B", marginBottom: 8 }}>
              Status
            </p>
            <form action={setAffiliateStatus} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="hidden" name="affiliateId" value={affiliate.id} />
              <select name="status" defaultValue={affiliate.status} style={{ padding: "6px 10px", border: "1px solid #B5B0A8", fontFamily: "Georgia,serif", fontSize: 13 }}>
                {["vetting", "active", "paused", "sunset", "cut"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button type="submit" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", color: "#1A1A1A", background: "transparent", border: "1px solid #1A1A1A", padding: "5px 12px", cursor: "pointer" }}>
                Save
              </button>
            </form>
          </div>
          <div>
            <p style={{ margin: 0, fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "#6B6B6B", marginBottom: 8 }}>
              Sophistication tier
            </p>
            <form action={setAffiliateSophisticationTier} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="hidden" name="affiliateId" value={affiliate.id} />
              <select name="sophistication_tier" defaultValue={affiliate.sophistication_tier} style={{ padding: "6px 10px", border: "1px solid #B5B0A8", fontFamily: "Georgia,serif", fontSize: 13 }}>
                <option value="developing">developing</option>
                <option value="proven">proven</option>
              </select>
              <button type="submit" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", color: "#1A1A1A", background: "transparent", border: "1px solid #1A1A1A", padding: "5px 12px", cursor: "pointer" }}>
                Save
              </button>
            </form>
          </div>
          <div>
            <p style={{ margin: 0, fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "#6B6B6B", marginBottom: 8 }}>
              Gate / strikes
            </p>
            <p style={{ margin: 0, fontFamily: "Georgia,serif", fontSize: 14 }}>
              {affiliate.approved_pieces_count} approved · {affiliate.strike_count} strikes
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "#6B6B6B", marginBottom: 8 }}>
              Stripe Connect
            </p>
            <p style={{ margin: 0, fontFamily: "Georgia,serif", fontSize: 14 }}>
              {affiliate.stripe_account_status ?? "not connected"}
            </p>
            {affiliate.stripe_account_id && (
              <code style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#6B6B6B" }}>
                {affiliate.stripe_account_id}
              </code>
            )}
          </div>
        </section>
      )}

      {/* Workshop pilot config — sets fields read by /[affiliateSlug]/workshop */}
      {affiliate && (
        <section
          style={{
            background: "#fff",
            border: "1px solid #E8E4DF",
            padding: "20px 24px",
            marginBottom: 32,
          }}
        >
          <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
            <h2 style={{ margin: 0, fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: 22, color: "#1A1A1A" }}>
              Workshop pilot
            </h2>
            {affiliate.workshop_registration_open && affiliate.workshop_date_iso && (
              <Link
                href={`/${affiliate.slug}/workshop`}
                target="_blank"
                style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "#8B1A1A", textDecoration: "underline" }}
              >
                Open page ↗
              </Link>
            )}
          </header>
          <p style={{ margin: "0 0 16px", fontFamily: "Georgia,serif", fontSize: 13, color: "#6B6B6B", fontStyle: "italic" }}>
            Sets fields read by <code style={{ fontFamily: "'Space Mono',monospace", fontSize: 12 }}>/{affiliate.slug}/workshop</code>.
            Page renders only when the master switch is ON and title + date are set.
            Per D07 spec; title default ratified 2026-05-28 in D08.
          </p>

          <form action={setAffiliateWorkshop}>
            <input type="hidden" name="affiliateId" value={affiliate.id} />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 16 }}>
              {/* Master switch */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", border: "1px solid #B5B0A8", background: affiliate.workshop_registration_open ? "#F0E8D8" : "transparent", cursor: "pointer", gridColumn: "1 / -1" }}>
                <input
                  type="checkbox"
                  name="workshop_registration_open"
                  defaultChecked={affiliate.workshop_registration_open}
                  style={{ marginTop: 3 }}
                />
                <span style={{ fontFamily: "Georgia,serif", fontSize: 14, color: "#1A1A1A" }}>
                  <strong>Registration open</strong> — master switch. Off = page 404s. On requires title + date set.
                </span>
              </label>

              {/* Title */}
              <label style={{ gridColumn: "1 / -1" }}>
                <span style={{ display: "block", fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "#6B6B6B", marginBottom: 6 }}>
                  Workshop title
                </span>
                <input
                  name="workshop_title"
                  type="text"
                  defaultValue={affiliate.workshop_title ?? "What good actually looks like in startup SaaS"}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #B5B0A8", fontFamily: "Georgia,serif", fontSize: 14 }}
                />
              </label>

              {/* Audience descriptor */}
              <label style={{ gridColumn: "1 / -1" }}>
                <span style={{ display: "block", fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "#6B6B6B", marginBottom: 6 }}>
                  Audience descriptor (per pilot)
                </span>
                <textarea
                  name="workshop_audience_descriptor"
                  rows={2}
                  defaultValue={affiliate.workshop_audience_descriptor ?? ""}
                  placeholder="e.g. Apex BDR Club members in their first 18 months"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #B5B0A8", fontFamily: "Georgia,serif", fontSize: 14, resize: "vertical" }}
                />
              </label>

              {/* Date + TZ */}
              <label>
                <span style={{ display: "block", fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "#6B6B6B", marginBottom: 6 }}>
                  Workshop date (ISO 8601 with offset)
                </span>
                <input
                  name="workshop_date_iso"
                  type="text"
                  defaultValue={affiliate.workshop_date_iso ?? ""}
                  placeholder="2026-06-15T18:00:00-04:00"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #B5B0A8", fontFamily: "'Space Mono',monospace", fontSize: 13 }}
                />
                <span style={{ display: "block", marginTop: 4, fontFamily: "Georgia,serif", fontSize: 11, color: "#6B6B6B", fontStyle: "italic" }}>
                  Include offset for DST correctness (-04:00 = EDT, -05:00 = EST).
                </span>
              </label>

              <label>
                <span style={{ display: "block", fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "#6B6B6B", marginBottom: 6 }}>
                  Display timezone
                </span>
                <select
                  name="workshop_timezone"
                  defaultValue={affiliate.workshop_timezone ?? "America/New_York"}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #B5B0A8", fontFamily: "Georgia,serif", fontSize: 14 }}
                >
                  <option value="America/New_York">Eastern (America/New_York)</option>
                  <option value="America/Chicago">Central (America/Chicago)</option>
                  <option value="America/Denver">Mountain (America/Denver)</option>
                  <option value="America/Phoenix">Arizona (America/Phoenix)</option>
                  <option value="America/Los_Angeles">Pacific (America/Los_Angeles)</option>
                  <option value="America/Anchorage">Alaska (America/Anchorage)</option>
                  <option value="Pacific/Honolulu">Hawaii (Pacific/Honolulu)</option>
                </select>
              </label>

              {/* Host */}
              <label>
                <span style={{ display: "block", fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "#6B6B6B", marginBottom: 6 }}>
                  Host first name
                </span>
                <input
                  name="host_first_name"
                  type="text"
                  defaultValue={affiliate.host_first_name ?? ""}
                  placeholder="(blank = falls back to “Admissions, AESDR.”)"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #B5B0A8", fontFamily: "Georgia,serif", fontSize: 14 }}
                />
              </label>

              <label>
                <span style={{ display: "block", fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "#6B6B6B", marginBottom: 6 }}>
                  Host last name
                </span>
                <input
                  name="host_last_name"
                  type="text"
                  defaultValue={affiliate.host_last_name ?? ""}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #B5B0A8", fontFamily: "Georgia,serif", fontSize: 14 }}
                />
              </label>

              <label>
                <span style={{ display: "block", fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "#6B6B6B", marginBottom: 6 }}>
                  Host tenure (years)
                </span>
                <input
                  name="host_tenure_years"
                  type="number"
                  min={0}
                  max={50}
                  defaultValue={affiliate.host_tenure_years ?? ""}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #B5B0A8", fontFamily: "Georgia,serif", fontSize: 14 }}
                />
              </label>

              <label style={{ gridColumn: "1 / -1" }}>
                <span style={{ display: "block", fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "#6B6B6B", marginBottom: 6 }}>
                  Host background beat (one line)
                </span>
                <input
                  name="host_background_beat"
                  type="text"
                  defaultValue={affiliate.host_background_beat ?? ""}
                  placeholder="e.g. Carried bags at Brex, Front, and a Series A you've never heard of"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #B5B0A8", fontFamily: "Georgia,serif", fontSize: 14 }}
                />
              </label>

              {/* Partner quote */}
              <label style={{ gridColumn: "1 / -1" }}>
                <span style={{ display: "block", fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "#6B6B6B", marginBottom: 6 }}>
                  Partner quote (optional)
                </span>
                <textarea
                  name="workshop_partner_quote"
                  rows={2}
                  defaultValue={affiliate.workshop_partner_quote ?? ""}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #B5B0A8", fontFamily: "Georgia,serif", fontSize: 14, resize: "vertical" }}
                />
              </label>

              <label style={{ gridColumn: "1 / -1" }}>
                <span style={{ display: "block", fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "#6B6B6B", marginBottom: 6 }}>
                  Partner quote attribution
                </span>
                <input
                  name="workshop_partner_quote_attribution"
                  type="text"
                  defaultValue={affiliate.workshop_partner_quote_attribution ?? ""}
                  placeholder="e.g. Apex BDR Club founder"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #B5B0A8", fontFamily: "Georgia,serif", fontSize: 14 }}
                />
              </label>

              {/* SMS */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", border: "1px solid #B5B0A8", cursor: "pointer", gridColumn: "1 / -1" }}>
                <input
                  type="checkbox"
                  name="sms_enabled"
                  defaultChecked={affiliate.sms_enabled}
                  style={{ marginTop: 3 }}
                />
                <span style={{ fontFamily: "Georgia,serif", fontSize: 14, color: "#1A1A1A" }}>
                  <strong>SMS enabled for this pilot</strong> — when on, the registration form shows the canon §10.5 opt-in checkbox + phone field. Keep off until 10DLC clears and you actually want SMS reminders on this pilot.
                </span>
              </label>
            </div>

            <button
              type="submit"
              style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: ".18em", textTransform: "uppercase", color: "#fff", background: "#8B1A1A", border: "none", padding: "12px 24px", cursor: "pointer" }}
            >
              Save workshop config
            </button>
          </form>
        </section>
      )}

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
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "rgba(250,247,242,0.7)" }}>
            {affiliate?.stripe_account_status === "enabled"
              ? "Run the Stripe Connect Transfer below — payout, attribution stamp, and affiliate email all happen in one click."
              : "Stripe Connect isn't enabled for this affiliate yet. They need to finish onboarding before automatic payout works. Use the legacy manual mark-paid flow until then."}
          </p>
          {affiliate?.stripe_account_status === "enabled" && (
            <PayoutConfirmButton
              affiliateId={affiliate.id}
              amountLabel={dollars(cleared.reduce((s, a) => s + (a.commission_amount_cents ?? 0), 0))}
            />
          )}
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
              {links.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "16px 14px", color: "#6B6B6B", fontStyle: "italic" }}>
                    No links minted yet.
                  </td>
                </tr>
              )}
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
              {attributions.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "16px 14px", color: "#6B6B6B", fontStyle: "italic" }}>
                    No attributions yet — no tracked sales for this affiliate.
                  </td>
                </tr>
              )}
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
                {p.net_paid_cents != null ? (
                  <>
                    <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic", fontWeight: 900, fontSize: 24, margin: "0 0 2px" }}>
                      {dollars(p.net_paid_cents)}{" "}
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fontStyle: "normal", fontWeight: 400, textTransform: "uppercase", letterSpacing: ".18em", color: "#6B6B6B" }}>
                        net paid
                      </span>
                    </p>
                    <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#6B6B6B", margin: "0 0 12px" }}>
                      {dollars(p.total_commission_cents)} gross commission earned
                      {p.net_paid_cents !== p.total_commission_cents
                        ? ` · ${dollars(p.total_commission_cents - p.net_paid_cents)} netted as clawback`
                        : ""}
                    </p>
                  </>
                ) : (
                  <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic", fontWeight: 900, fontSize: 24, margin: "0 0 12px" }}>
                    {dollars(p.total_commission_cents)}{" "}
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fontStyle: "normal", fontWeight: 400, textTransform: "uppercase", letterSpacing: ".18em", color: "#6B6B6B" }}>
                      gross commission earned
                    </span>
                  </p>
                )}
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
