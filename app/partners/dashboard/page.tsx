import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import AesdrBrand from "@/components/AesdrBrand";
import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import StatTile from "./_components/StatTile";

export const metadata: Metadata = {
  title: "Partners dashboard | AESDR",
  description:
    "Live view of your affiliate clicks, attributed enrollments, projected commission, and paid commission.",
};

const DAY = 24 * 60 * 60 * 1000;

function dollars(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function dateShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toISOString().slice(0, 10);
}

function statusPill(status: string): React.ReactElement {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    pending: { bg: "#FAF7F2", fg: "#8B1A1A", label: "Pending" },
    cleared: { bg: "#1A1A1A", fg: "#FAF7F2", label: "Cleared" },
    paid: { bg: "#1A1A1A", fg: "#FAF7F2", label: "Paid" },
    refunded: { bg: "#E8E4DF", fg: "#6B6B6B", label: "Refunded" },
  };
  const s = map[status] || { bg: "#E8E4DF", fg: "#6B6B6B", label: status };
  return (
    <span
      style={{
        display: "inline-block",
        background: s.bg,
        color: s.fg,
        fontFamily: "var(--mono)",
        fontSize: 9,
        letterSpacing: ".22em",
        textTransform: "uppercase",
        padding: "3px 9px",
      }}
    >
      {s.label}
    </span>
  );
}

export default async function PartnersDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/partners/dashboard");

  const partnerSlug = user.user_metadata?.partner_slug as string | undefined;
  const isAffiliate = user.user_metadata?.is_affiliate === true;
  if (!isAffiliate || !partnerSlug) {
    return (
      <NoAccessNotice />
    );
  }

  // Admin client for the aggregated queries — RLS would be fine here
  // too but we want consistent counts regardless of policy edge cases.
  const admin = createAdminClient();

  // Per-request timestamp in a server component is safe; React's
  // purity lint is a false positive on Date.now() at module top.
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now();
  const since30dIso = new Date(nowMs - 30 * DAY).toISOString();

  const [linksRes, clicks30Res, clicksLifetimeRes, attribRes] = await Promise.all([
    admin
      .from("affiliate_links")
      .select("id, slug, label, destination_url, active, expires_at, created_at")
      .eq("partner_slug", partnerSlug)
      .order("created_at", { ascending: false }),
    admin
      .from("affiliate_clicks")
      .select("id", { count: "exact", head: true })
      .eq("partner_slug", partnerSlug)
      .gte("clicked_at", since30dIso),
    admin
      .from("affiliate_clicks")
      .select("id", { count: "exact", head: true })
      .eq("partner_slug", partnerSlug),
    admin
      .from("affiliate_attributions")
      .select(
        "id, status, gross_amount_cents, commission_amount_cents, attributed_at, refund_window_closes_at, user_email"
      )
      .eq("partner_slug", partnerSlug)
      .order("attributed_at", { ascending: false })
      .limit(50),
  ]);

  const links = linksRes.data ?? [];
  const clicks30 = clicks30Res.count ?? 0;
  const clicksLifetime = clicksLifetimeRes.count ?? 0;
  const attributions = attribRes.data ?? [];

  const pending = attributions.filter((a) => a.status === "pending");
  const cleared = attributions.filter((a) => a.status === "cleared");
  const paid = attributions.filter((a) => a.status === "paid");
  const refunded = attributions.filter((a) => a.status === "refunded");

  const pendingCents = pending.reduce((s, a) => s + (a.commission_amount_cents ?? 0), 0);
  const clearedCents = cleared.reduce((s, a) => s + (a.commission_amount_cents ?? 0), 0);
  const paidCents = paid.reduce((s, a) => s + (a.commission_amount_cents ?? 0), 0);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aesdr.com";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--cream)",
        color: "var(--ink)",
        fontFamily: "var(--serif)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 5%",
          borderBottom: "1px solid var(--light)",
          background: "rgba(250,247,242,0.95)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <AesdrBrand
          style={{
            textDecoration: "none",
            color: "inherit",
            fontFamily: "var(--display)",
            fontSize: 18,
            fontWeight: 900,
            fontStyle: "italic",
            letterSpacing: ".05em",
            background: "var(--iris)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "iris 3s linear infinite",
          }}
        />
        <SignOutButton />
      </header>

      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 24px 24px" }}>
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: ".32em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 12,
          }}
        >
          Partners · {partnerSlug}
        </p>
        <h1
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: "clamp(32px,4.5vw,48px)",
            lineHeight: 1.05,
            marginBottom: 8,
          }}
        >
          What your audience is doing.
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--muted)" }}>
          Same numbers AESDR sees on our side, refreshed every page load.
          Pending = inside the 14-day refund window. Cleared = refund
          window closed, owed but not yet sent. Paid = money out.
        </p>
      </section>

      {/* Stat row */}
      <section
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 24px 24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
        }}
      >
        <StatTile label="Clicks · 30d" value={clicks30} sub={`${clicksLifetime} lifetime`} />
        <StatTile label="Pending commission" value={dollars(pendingCents)} sub={`${pending.length} attributions inside refund window`} />
        <StatTile label="Cleared · owed" value={dollars(clearedCents)} sub={`${cleared.length} ready for the next payout`} emphasis />
        <StatTile label="Paid · lifetime" value={dollars(paidCents)} sub={`${paid.length} attributions settled`} />
        {refunded.length > 0 && (
          <StatTile label="Refunded" value={refunded.length} sub="Commission voided" />
        )}
      </section>

      {/* Active links */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: ".25em",
              textTransform: "uppercase",
              color: "var(--crimson)",
              margin: 0,
            }}
          >
            Your links
          </p>
          <Link
            href="/partners/dashboard/links"
            style={{
              fontFamily: "var(--cond)",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: ".15em",
              textTransform: "uppercase",
              color: "#fff",
              background: "var(--crimson)",
              padding: "10px 20px",
              textDecoration: "none",
            }}
          >
            Create a new link →
          </Link>
        </div>
        {links.length === 0 ? (
          <p style={{ fontSize: 15, color: "var(--muted)" }}>
            No links yet. Create your first one with the button above —
            you&rsquo;ll get a short URL like <code>{siteUrl}/r/abc23xyz</code>{" "}
            to share with your audience.
          </p>
        ) : (
          <div style={{ background: "#fff", border: "1px solid var(--light)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "var(--cream)", textAlign: "left" }}>
                  {["Short URL", "Destination", "Label", "Status", "Created"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        fontFamily: "var(--mono)",
                        fontSize: 10,
                        letterSpacing: ".22em",
                        textTransform: "uppercase",
                        color: "var(--muted)",
                        borderBottom: "1px solid var(--light)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {links.map((l) => (
                  <tr key={l.id} style={{ borderBottom: "1px solid var(--light)" }}>
                    <td style={{ padding: "12px 14px" }}>
                      <code style={{ fontFamily: "var(--mono)", fontSize: 13 }}>
                        {siteUrl}/r/{l.slug}
                      </code>
                    </td>
                    <td style={{ padding: "12px 14px", color: "var(--muted)", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {l.destination_url}
                    </td>
                    <td style={{ padding: "12px 14px" }}>{l.label || "—"}</td>
                    <td style={{ padding: "12px 14px" }}>
                      {l.active ? statusPill("cleared") : statusPill("refunded")}
                    </td>
                    <td style={{ padding: "12px 14px", color: "var(--muted)" }}>
                      {dateShort(l.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent attributions */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px 96px" }}>
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: ".25em",
            textTransform: "uppercase",
            color: "var(--crimson)",
            marginBottom: 16,
          }}
        >
          Recent attributions
        </p>
        {attributions.length === 0 ? (
          <p style={{ fontSize: 15, color: "var(--muted)" }}>
            No attributions yet. Once your audience clicks a link and
            buys within 30 days, the enrolment shows up here.
          </p>
        ) : (
          <div style={{ background: "#fff", border: "1px solid var(--light)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "var(--cream)", textAlign: "left" }}>
                  {["Date", "Buyer", "Sale", "Commission", "Status", "Refund window"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        fontFamily: "var(--mono)",
                        fontSize: 10,
                        letterSpacing: ".22em",
                        textTransform: "uppercase",
                        color: "var(--muted)",
                        borderBottom: "1px solid var(--light)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attributions.map((a) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid var(--light)" }}>
                    <td style={{ padding: "12px 14px", color: "var(--muted)" }}>
                      {dateShort(a.attributed_at)}
                    </td>
                    <td style={{ padding: "12px 14px", fontFamily: "var(--mono)", fontSize: 13 }}>
                      {a.user_email.replace(/(.{2}).*(@.*)/, "$1***$2")}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {dollars(a.gross_amount_cents)}
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 700 }}>
                      {dollars(a.commission_amount_cents)}
                    </td>
                    <td style={{ padding: "12px 14px" }}>{statusPill(a.status)}</td>
                    <td style={{ padding: "12px 14px", color: "var(--muted)", fontSize: 12 }}>
                      {a.status === "pending"
                        ? `closes ${dateShort(a.refund_window_closes_at)}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function NoAccessNotice() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--cream)",
        color: "var(--ink)",
        fontFamily: "var(--serif)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
      }}
    >
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: ".32em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 16,
          }}
        >
          Partners dashboard · No access
        </p>
        <h1
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: "clamp(28px,4vw,40px)",
            lineHeight: 1.05,
            marginBottom: 16,
          }}
        >
          Your account isn&rsquo;t set up for the Partners program yet.
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--muted)", marginBottom: 24 }}>
          The dashboard becomes available after a partnership conversation
          and an admin sets up your affiliate account. If you applied
          recently, give us a couple of business days.
        </p>
        <Link
          href="/partners/apply"
          style={{
            display: "inline-block",
            fontFamily: "var(--cond)",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: ".15em",
            textTransform: "uppercase",
            color: "#fff",
            background: "var(--crimson)",
            padding: "14px 28px",
            textDecoration: "none",
          }}
        >
          Apply to the program →
        </Link>
      </div>
    </main>
  );
}
