import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import AesdrBrand from "@/components/AesdrBrand";
import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@/utils/supabase/server";
import { LESSONS } from "@/utils/progress/types";

export const metadata: Metadata = {
  title: "Alumni | AESDR",
  description:
    "Private alumni surface for AEs and SDRs who completed the course.",
};

const TOOLS = [
  { slug: "3.3-aesdr-alignment-contract", title: "AE/SDR Alignment Contract", lesson: "3" },
  { slug: "6.3-idk-framework", title: "I Don't Know Framework", lesson: "6" },
  { slug: "9.2-time-reclaimed-calculator", title: "Time Reclaimed Calculator", lesson: "9" },
  { slug: "10.1-ROI-commission-defense-tracker", title: "ROI & Commission Defense Tracker", lesson: "10" },
  { slug: "12.3-72-hr-strike-plan", title: "72-Hour Strike Plan", lesson: "12" },
];

export default async function AlumniPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/alumni");

  // Gate: must have all 12 courses completed.
  const { data: progress } = await supabase
    .from("course_progress")
    .select("lesson_id, is_completed")
    .eq("user_id", user.id);
  const completedCount = (progress ?? []).filter((r) => r.is_completed).length;
  if (completedCount < LESSONS.length) {
    redirect("/dashboard");
  }

  const firstName =
    (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ||
    user.email?.split("@")[0] ||
    "AE/SDR";
  const role = user.user_metadata?.role === "ae" ? "AE" : "SDR";
  const shareUrl = "https://aesdr.com/";
  const shareSummary = `I just finished AESDR — twelve lessons on the part of SaaS sales nobody actually teaches. Worth it for any ${role} in their first 18 months.`;

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

      <section
        style={{
          maxWidth: 880,
          margin: "0 auto",
          padding: "64px 24px 24px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: ".32em",
            textTransform: "uppercase",
            color: "var(--crimson)",
            marginBottom: 16,
          }}
        >
          Alumni · {role} · Class of {new Date().getUTCFullYear()}
        </p>
        <h1
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: "clamp(36px,6vw,64px)",
            lineHeight: 1.04,
            marginBottom: 16,
          }}
        >
          You&rsquo;re <span
            style={{
              background: "var(--iris)",
              backgroundSize: "300% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "iris 4s linear infinite",
            }}
          >
            AESDR-trained
          </span>, {firstName}.
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.7, color: "var(--muted)", maxWidth: 640 }}>
          The course doesn&rsquo;t stop being yours when you finish it. Below
          are the takeaway tools you earned, the share surfaces if you want
          them, and the way back into the dashboard if a lesson is worth a
          re-read.
        </p>
      </section>

      <section
        style={{ maxWidth: 880, margin: "0 auto", padding: "32px 24px 16px" }}
      >
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
          Your tools — re-downloadable, lifetime
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {TOOLS.map((t) => (
            <a
              key={t.slug}
              href={`/tools/${encodeURIComponent(t.slug)}/download`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                background: "#fff",
                border: "1px solid var(--light)",
                padding: "20px 20px",
                textDecoration: "none",
                color: "var(--ink)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  letterSpacing: ".25em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: 6,
                }}
              >
                Lesson {t.lesson}
              </p>
              <p
                style={{
                  fontFamily: "var(--display)",
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 20,
                  lineHeight: 1.2,
                  marginBottom: 10,
                }}
              >
                {t.title}
              </p>
              <span
                style={{
                  fontFamily: "var(--cond)",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: ".15em",
                  textTransform: "uppercase",
                  color: "var(--crimson)",
                }}
              >
                Download →
              </span>
            </a>
          ))}
        </div>
      </section>

      <section
        data-surface="dark"
        style={{
          maxWidth: 880,
          margin: "32px auto",
          padding: "32px 24px",
          background: "var(--ink)",
          color: "var(--cream)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: ".32em",
            textTransform: "uppercase",
            color: "rgba(250,247,242,0.6)",
            marginBottom: 12,
          }}
        >
          If it was useful
        </p>
        <p
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 24,
            lineHeight: 1.2,
            marginBottom: 16,
          }}
        >
          Bring another AE or SDR in.
        </p>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.7,
            color: "rgba(250,247,242,0.85)",
            marginBottom: 20,
          }}
        >
          One LinkedIn share, two minutes. We don&rsquo;t do a referral
          program — but every AE or SDR who shows up because of you
          shortens someone else&rsquo;s eighteen-month accident.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(`${shareSummary} ${shareUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--cond)",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: ".15em",
              textTransform: "uppercase",
              color: "var(--ink)",
              background: "var(--cream)",
              padding: "12px 22px",
              textDecoration: "none",
            }}
          >
            Share on LinkedIn →
          </a>
          <Link
            href="/account/review"
            style={{
              fontFamily: "var(--cond)",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: ".15em",
              textTransform: "uppercase",
              color: "var(--cream)",
              border: "1px solid rgba(250,247,242,0.4)",
              padding: "12px 22px",
              textDecoration: "none",
            }}
          >
            Leave a review
          </Link>
          <Link
            href="/free/manager-archetype-map"
            style={{
              fontFamily: "var(--cond)",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: ".15em",
              textTransform: "uppercase",
              color: "var(--cream)",
              border: "1px solid rgba(250,247,242,0.4)",
              padding: "12px 22px",
              textDecoration: "none",
            }}
          >
            Forward the free map
          </Link>
        </div>
      </section>

      <section
        style={{
          maxWidth: 880,
          margin: "0 auto 96px",
          padding: "16px 24px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: ".18em",
            color: "var(--muted)",
            textAlign: "center",
            lineHeight: 1.7,
          }}
        >
          Re-read any lesson any time —{" "}
          <Link
            href="/dashboard"
            style={{ color: "var(--crimson)", textDecoration: "underline" }}
          >
            back to the dashboard
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
