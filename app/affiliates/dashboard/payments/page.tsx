import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import AesdrBrand from "@/components/AesdrBrand";
import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getAffiliateForUser } from "@/lib/affiliate-entity";
import PaymentsControls from "./PaymentsControls";

export const metadata: Metadata = {
  title: "Payments | AESDR Affiliates",
  description:
    "Connect your Stripe account and manage how AESDR sends your commission payouts.",
};

function dollars(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US")}`;
}

function dateShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toISOString().slice(0, 10);
}

export default async function AffiliatePaymentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/affiliates/dashboard/payments");

  const affiliate = await getAffiliateForUser({
    userId: user.id,
    jwtAffiliateSlug: user.user_metadata?.affiliate_slug as string | undefined,
    jwtPartnerSlug: user.user_metadata?.partner_slug as string | undefined,
  });
  if (!affiliate || affiliate.status !== "active") redirect("/affiliates/dashboard");

  const admin = createAdminClient();
  const { data: payouts } = await admin
    .from("affiliate_payouts")
    .select("id, period_start, period_end, total_commission_cents, status, payment_method, payment_reference, paid_at, created_at")
    .eq("affiliate_slug", affiliate.slug)
    .order("created_at", { ascending: false })
    .limit(20);

  const connected = !!affiliate.stripe_account_id;
  const enabled = affiliate.stripe_account_status === "enabled";

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

      <section style={{ maxWidth: 880, margin: "0 auto", padding: "48px 24px 16px" }}>
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
          <Link href="/affiliates/dashboard" style={{ color: "var(--muted)" }}>
            ← Dashboard
          </Link>
          {" · "}Payments
        </p>
        <h1
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: "clamp(32px,4.5vw,44px)",
            lineHeight: 1.05,
            marginBottom: 12,
          }}
        >
          Connect your Stripe account.
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--muted)", marginBottom: 0 }}>
          Payouts run through Stripe Connect. You keep a full Stripe
          dashboard, Stripe collects your tax details during onboarding and
          files your 1099 at year-end, and money lands in your bank account on
          the schedule you set.
        </p>
      </section>

      <section style={{ maxWidth: 880, margin: "0 auto", padding: "16px 24px 32px" }}>
        <PaymentsControls
          connected={connected}
          enabled={enabled}
          status={affiliate.stripe_account_status}
          stripeAccountId={affiliate.stripe_account_id}
        />
      </section>

      <section style={{ maxWidth: 880, margin: "0 auto", padding: "16px 24px 96px" }}>
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
          Payout history
        </p>
        {!payouts || payouts.length === 0 ? (
          <p style={{ fontSize: 15, color: "var(--muted)" }}>
            No payouts yet. Cleared commission gets bundled into a payout
            batch and sent through Stripe — you&rsquo;ll see it here.
          </p>
        ) : (
          <div style={{ background: "#fff", border: "1px solid var(--light)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "var(--cream)", textAlign: "left" }}>
                  {["Period", "Amount", "Status", "Method", "Reference", "Sent"].map((h) => (
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
                {payouts.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--light)" }}>
                    <td style={{ padding: "12px 14px", color: "var(--muted)" }}>
                      {dateShort(p.period_start)} → {dateShort(p.period_end)}
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 700 }}>
                      {dollars(p.total_commission_cents)}
                    </td>
                    <td style={{ padding: "12px 14px", fontFamily: "var(--mono)", fontSize: 11, color: p.status === "paid" ? "var(--ink)" : "var(--muted)" }}>
                      {p.status}
                    </td>
                    <td style={{ padding: "12px 14px", color: "var(--muted)" }}>{p.payment_method || "—"}</td>
                    <td style={{ padding: "12px 14px", fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
                      {p.payment_reference || "—"}
                    </td>
                    <td style={{ padding: "12px 14px", color: "var(--muted)" }}>{dateShort(p.paid_at)}</td>
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
