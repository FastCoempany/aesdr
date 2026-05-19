import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import AesdrBrand from "@/components/AesdrBrand";
import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@/utils/supabase/server";
import TestimonialForm from "./TestimonialForm";

export const metadata: Metadata = {
  title: "Leave a review | AESDR",
};

export default async function ReviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/review");

  const { data: existing } = await supabase
    .from("testimonials")
    .select("rating, body, display_name, permit_publish, status, status_note")
    .eq("user_id", user.id)
    .maybeSingle();

  const firstName =
    (user.user_metadata?.first_name as string | undefined) ||
    (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ||
    user.email?.split("@")[0] ||
    "";

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
          Review · ~60 seconds
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
          How was it, honestly?
        </h1>

        <p
          style={{
            fontSize: 17,
            lineHeight: 1.7,
            color: "var(--muted)",
            marginBottom: 32,
          }}
        >
          One rating. One sentence. If you grade us 1–3, tell me what to fix
          — I'd rather hear it than not. If you grade us 4–5 and the line is
          good, check the box and we may publish it (first name + role only,
          never your company).
        </p>

        {existing?.status === "approved" && (
          <div
            style={{
              background: "#fff",
              border: "1px solid var(--light)",
              padding: "16px 20px",
              marginBottom: 24,
            }}
          >
            <p
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: ".25em",
                textTransform: "uppercase",
                color: "var(--crimson)",
                marginBottom: 4,
              }}
            >
              Published
            </p>
            <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>
              Your review is live on the site. Thank you.
            </p>
          </div>
        )}

        <TestimonialForm
          initial={{
            rating: existing?.rating ?? null,
            body: existing?.body ?? "",
            displayName: existing?.display_name ?? firstName,
            permitPublish: existing?.permit_publish ?? true,
            status: (existing?.status as "pending" | "approved" | "rejected" | undefined) ?? null,
          }}
        />

        <p
          style={{
            marginTop: 32,
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: ".15em",
            color: "var(--muted)",
            textAlign: "center",
          }}
        >
          <Link href="/dashboard" style={{ color: "var(--muted)" }}>
            ← Back to dashboard
          </Link>
        </p>
      </section>
    </main>
  );
}
