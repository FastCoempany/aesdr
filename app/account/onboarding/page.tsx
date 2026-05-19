import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AesdrBrand from "@/components/AesdrBrand";
import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@/utils/supabase/server";
import OnboardingForm from "./OnboardingForm";

export const metadata: Metadata = {
  title: "Set your study window | AESDR",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.user_metadata?.needs_password_change) redirect("/account/set-password");
  if (!user.user_metadata?.role) redirect("/account/select-role");
  if (user.user_metadata?.onboarding_completed) redirect("/dashboard");

  const role = user.user_metadata.role === "ae" ? "AE" : "SDR";

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

      <section
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "48px 24px 96px",
        }}
      >
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
          One screen · ~60 seconds · {role} track
        </p>

        <h1
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: "clamp(32px,5vw,48px)",
            lineHeight: 1.05,
            marginBottom: 16,
          }}
        >
          Pick your <span
            style={{
              background: "var(--iris)",
              backgroundSize: "300% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "iris 4s linear infinite",
            }}
          >
            25-minute window
          </span>.
        </h1>

        <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--muted)", marginBottom: 8 }}>
          Naming <em>when</em>, <em>where</em>, and <em>what</em> roughly triples
          the odds you&rsquo;ll actually do it. (Gollwitzer 1999. Boring research.
          Works anyway.)
        </p>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--muted)", marginBottom: 32 }}>
          Pick a real window. Block it in your calendar after you submit.
        </p>

        <OnboardingForm />
      </section>
    </main>
  );
}
