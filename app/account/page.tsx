import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import SignOutButton from "@/components/SignOutButton";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import RoleSwitcher from "@/components/RoleSwitcher";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Account | AESDR",
  description: "Manage your AESDR account settings.",
};

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: purchase } = await supabase
    .from("purchases")
    .select("plan, amount_cents, purchased_at, status")
    .or(`user_email.eq."${user.email}",user_id.eq.${user.id}`)
    .eq("status", "active")
    .order("purchased_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const planLabel = purchase?.plan === "team" ? "Team" : "Individual";
  const amount = purchase ? `$${(purchase.amount_cents / 100).toFixed(2)}` : null;
  const purchaseDate = purchase?.purchased_at
    ? new Date(purchase.purchased_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <main
      className="min-h-screen px-6 py-0"
      style={{ background: "var(--bg-main)" }}
    >
      {/* Top nav */}
      <nav
        className="sticky top-0 z-50 -mx-6 flex items-center justify-between border-b px-[5%] py-5"
        style={{
          borderColor: "var(--line)",
          background: "rgba(2,6,23,0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          className="flex items-center gap-3"
          style={{
            fontFamily: "var(--cond)",
            fontSize: "18px",
            fontWeight: 800,
            letterSpacing: ".2em",
            textTransform: "uppercase" as const,
          }}
        >
          <span
            style={{
              background: "var(--iris)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "iris 3s linear infinite",
            }}
          >
            AESDR
          </span>
        </div>
        <div
          className="flex items-center gap-4"
          style={{
            fontFamily: "var(--cond)",
            fontWeight: 600,
            fontSize: "13px",
            letterSpacing: ".1em",
            textTransform: "uppercase" as const,
          }}
        >
          <Link href="/dashboard" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
            Lessons
          </Link>
          <SignOutButton />
        </div>
      </nav>

      <div className="mx-auto w-full max-w-xl py-16" style={{ color: "var(--text-main)" }}>
        <h1
          style={{
            fontFamily: "var(--display)",
            fontSize: "clamp(32px, 5vw, 48px)",
            lineHeight: ".95",
            marginBottom: "40px",
          }}
        >
          Account
        </h1>

        {/* Email */}
        <section className="mb-10">
          <h2
            style={{
              fontFamily: "var(--mono)",
              fontSize: "10px",
              letterSpacing: ".2em",
              textTransform: "uppercase" as const,
              color: "var(--text-muted)",
              marginBottom: "8px",
            }}
          >
            Email
          </h2>
          <p style={{ fontFamily: "var(--serif)", fontSize: "16px" }}>
            {user.email}
          </p>
        </section>

        {/* Purchase info */}
        {purchase && (
          <section className="mb-10">
            <h2
              style={{
                fontFamily: "var(--mono)",
                fontSize: "10px",
                letterSpacing: ".2em",
                textTransform: "uppercase" as const,
                color: "var(--text-muted)",
                marginBottom: "8px",
              }}
            >
              Purchase
            </h2>
            <div
              style={{
                padding: "16px 20px",
                background: "var(--bg-panel)",
                border: "1px solid var(--line)",
              }}
            >
              <p style={{ fontFamily: "var(--serif)", fontSize: "15px", marginBottom: "4px" }}>
                <strong>Plan:</strong> AESDR {planLabel}
              </p>
              {amount && (
                <p style={{ fontFamily: "var(--serif)", fontSize: "15px", marginBottom: "4px" }}>
                  <strong>Amount:</strong> {amount}
                </p>
              )}
              {purchaseDate && (
                <p style={{ fontFamily: "var(--serif)", fontSize: "15px", marginBottom: "4px" }}>
                  <strong>Date:</strong> {purchaseDate}
                </p>
              )}
              <p style={{ fontFamily: "var(--serif)", fontSize: "15px", margin: 0 }}>
                <strong>Status:</strong>{" "}
                <span style={{ color: "var(--theme)" }}>Active</span>
              </p>
            </div>
            <p
              style={{
                fontFamily: "var(--mono)",
                fontSize: "10px",
                letterSpacing: ".1em",
                color: "var(--text-muted)",
                marginTop: "8px",
              }}
            >
              Need an invoice? Email{" "}
              <a href="mailto:support@aesdr.com" style={{ color: "var(--theme)" }}>
                support@aesdr.com
              </a>
            </p>
          </section>
        )}

        {/* Role */}
        <section className="mb-10">
          <h2
            style={{
              fontFamily: "var(--mono)",
              fontSize: "10px",
              letterSpacing: ".2em",
              textTransform: "uppercase" as const,
              color: "var(--text-muted)",
              marginBottom: "8px",
            }}
          >
            Course Role
          </h2>
          <RoleSwitcher currentRole={user.user_metadata?.role ?? null} />
        </section>

        {/* Change password */}
        <section className="mb-10">
          <h2
            style={{
              fontFamily: "var(--mono)",
              fontSize: "10px",
              letterSpacing: ".2em",
              textTransform: "uppercase" as const,
              color: "var(--text-muted)",
              marginBottom: "12px",
            }}
          >
            Change Password
          </h2>
          <ChangePasswordForm />
        </section>

        {/* Support */}
        <section
          style={{
            borderTop: "1px solid var(--line)",
            paddingTop: "24px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: "14px",
              color: "var(--text-muted)",
            }}
          >
            Questions or issues?{" "}
            <a href="mailto:support@aesdr.com" style={{ color: "var(--theme)" }}>
              support@aesdr.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
