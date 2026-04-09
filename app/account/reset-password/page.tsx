"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1500);
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: "var(--bg-main)" }}
    >
      <div className="w-full max-w-sm space-y-10">
        <div className="space-y-4 text-center">
          <p
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
          </p>
          <h1
            style={{
              fontFamily: "var(--display)",
              fontSize: "32px",
              lineHeight: "1",
              color: "var(--text-main)",
            }}
          >
            Set New Password
          </h1>
        </div>

        {success ? (
          <div
            className="px-5 py-6 text-center"
            style={{
              borderLeft: "3px solid var(--theme)",
              background: "rgba(16,185,129,0.05)",
            }}
          >
            <p style={{ fontFamily: "var(--serif)", fontSize: "16px", color: "var(--theme)" }}>
              Password updated. Redirecting to your dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="password"
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "10px",
                  letterSpacing: ".14em",
                  textTransform: "uppercase" as const,
                  color: "var(--text-muted)",
                }}
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 outline-none transition"
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "16px",
                  background: "var(--bg-panel)",
                  border: "1px solid var(--line)",
                  color: "var(--text-main)",
                }}
                placeholder="Min 6 characters"
              />
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

            <button
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden cursor-pointer disabled:cursor-wait disabled:opacity-50"
              style={{
                fontFamily: "var(--cond)",
                fontSize: "13px",
                fontWeight: 800,
                letterSpacing: ".15em",
                textTransform: "uppercase" as const,
                padding: "14px 28px",
                background: "var(--text-main)",
                color: "var(--bg-main)",
                border: "none",
              }}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
