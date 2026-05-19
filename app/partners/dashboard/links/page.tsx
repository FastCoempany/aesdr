import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import AesdrBrand from "@/components/AesdrBrand";
import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@/utils/supabase/server";
import LinkForm from "./LinkForm";

export const metadata: Metadata = {
  title: "Create a tracking link | AESDR Partners",
};

export default async function CreateLinkPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/partners/dashboard/links");

  const isAffiliate = user.user_metadata?.is_affiliate === true;
  if (!isAffiliate) redirect("/partners/dashboard");

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

      <section style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px 96px" }}>
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
          <Link href="/partners/dashboard" style={{ color: "var(--muted)" }}>
            ← Dashboard
          </Link>
        </p>
        <h1
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: "clamp(28px,4vw,40px)",
            lineHeight: 1.05,
            marginBottom: 12,
          }}
        >
          Create a tracking link.
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--muted)", marginBottom: 32 }}>
          One short URL per promotion. The slug is generated for you.
          Pick the page you want the link to land on, label it for your
          own records, and ship.
        </p>

        <LinkForm />
      </section>
    </main>
  );
}
