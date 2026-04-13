"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // Update password and clear the needs_password_change flag
    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { needs_password_change: false },
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
              fontFamily: "var(--display)",
              fontSize: "32px",
              lineHeight: "1",
              color: "var(--text-main)",
            }}
          >
            Set Your Password
          </h1>
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: "15px",
              color: "var(--text-muted)",
              lineHeight: "1.6",
            }}
          >
            You signed in with a temporary password. Choose a permanent one before accessing your courses.
          </p>
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
              Password set. Redirecting to your courses...
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
                  textTransform: "uppercase",
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

            <div className="space-y-2">
              <label
                htmlFor="confirm"
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "10px",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                }}
              >
                Confirm Password
              </label>
              <input
                id="confirm"
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-4 py-3 outline-none transition"
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "16px",
                  background: "var(--bg-panel)",
                  border: "1px solid var(--line)",
                  color: "var(--text-main)",
                }}
                placeholder="Re-enter password"
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
                textTransform: "uppercase",
                padding: "14px 28px",
                background: "var(--text-main)",
                color: "var(--bg-main)",
                border: "none",
              }}
            >
              {loading ? "Setting password..." : "Set Password & Continue"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
