"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

const ROLES = [
  {
    id: "sdr",
    label: "SDR",
    title: "Sales Development Rep",
    desc: "You prospect, qualify, and book meetings. You're building the pipeline.",
  },
  {
    id: "ae",
    label: "AE",
    title: "Account Executive",
    desc: "You run demos, manage deals, and close. You own the revenue.",
  },
] as const;

export default function SelectRolePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(role: string) {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      data: { role },
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: "var(--bg-main)" }}
    >
      <div className="w-full max-w-lg space-y-10">
        <div className="space-y-4 text-center">
          <p
            style={{
              fontFamily: "var(--cond)",
              fontSize: "18px",
              fontWeight: 800,
              letterSpacing: ".2em",
              textTransform: "uppercase",
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
              <Link href="/" style={{ textDecoration: "none" }}>AESDR</Link>
            </span>
          </p>
          <h1
            style={{
              fontFamily: "var(--cond)",
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 800,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              lineHeight: "1",
              color: "var(--text-main)",
            }}
          >
            What&rsquo;s your role?
          </h1>
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: "15px",
              color: "var(--text-muted)",
              lineHeight: "1.6",
            }}
          >
            This tailors every lesson, quiz, and scenario to your actual job. You
            can change this later in Account settings.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          {ROLES.map((role) => (
            <button
              key={role.id}
              disabled={loading}
              onClick={() => handleSelect(role.id)}
              className="flex-1 cursor-pointer text-left transition disabled:cursor-wait disabled:opacity-50"
              style={{
                padding: "28px 24px",
                background: "var(--bg-panel)",
                border: "1px solid var(--line)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--cond)",
                  fontSize: "32px",
                  fontWeight: 800,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "var(--text-main)",
                  marginBottom: "4px",
                }}
              >
                {role.label}
              </p>
              <p
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "10px",
                  letterSpacing: ".15em",
                  textTransform: "uppercase",
                  color: "var(--theme)",
                  marginBottom: "12px",
                }}
              >
                {role.title}
              </p>
              <p
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: "var(--text-muted)",
                }}
              >
                {role.desc}
              </p>
            </button>
          ))}
        </div>

        {error && (
          <div
            className="px-4 py-3"
            style={{
              fontFamily: "var(--serif)",
              fontSize: "14px",
              borderLeft: "3px solid var(--coral)",
              background: "rgba(239,68,68,0.05)",
              color: "var(--coral)",
            }}
          >
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
