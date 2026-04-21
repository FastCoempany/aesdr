"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitHover, setSubmitHover] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

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
      className="flex min-h-screen items-center justify-center px-6 py-12"
      style={{ background: "var(--bg-main)" }}
    >
      <div className="w-full max-w-[420px]" style={{ position: "relative" }}>
        {/* Corner brackets — ornamental */}
        <span aria-hidden style={bracketStyle("top-left")}>[</span>
        <span aria-hidden style={bracketStyle("top-right")}>]</span>
        <span aria-hidden style={bracketStyle("bottom-left")}>[</span>
        <span aria-hidden style={bracketStyle("bottom-right")}>]</span>

        <div className="space-y-10" style={{ padding: "48px 32px" }}>
          <div className="space-y-5 text-center">
            <p
              style={{
                fontFamily: "var(--cond)",
                fontSize: "22px",
                fontWeight: 800,
                letterSpacing: ".32em",
                textTransform: "uppercase" as const,
                margin: 0,
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

            <div style={irisHairlineStyle} aria-hidden />

            <h1
              style={{
                fontFamily: "var(--display)",
                fontSize: "clamp(36px, 5vw, 44px)",
                lineHeight: "1.05",
                color: "var(--text-main)",
                fontWeight: 400,
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              Set New Password
            </h1>
            <p
              style={{
                fontFamily: "var(--mono)",
                fontSize: "10px",
                letterSpacing: ".36em",
                textTransform: "uppercase" as const,
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              Recovery <span style={{ opacity: 0.6 }}>·</span> Verified
            </p>
            <p
              style={{
                fontFamily: "var(--serif)",
                fontSize: "16px",
                color: "var(--text-muted)",
                lineHeight: 1.55,
                margin: "8px auto 0",
                maxWidth: "340px",
                fontStyle: "italic",
              }}
            >
              Choose a new key. The old one is forgotten.
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
              <p style={{ fontFamily: "var(--serif)", fontSize: "16px", color: "var(--theme)", margin: 0 }}>
                Password updated. Redirecting to your dashboard…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="password" style={labelStyle}>
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
                  style={inputStyle}
                  placeholder="Min 6 characters"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm" style={labelStyle}>
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
                  style={inputStyle}
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
                onMouseEnter={() => setSubmitHover(true)}
                onMouseLeave={() => setSubmitHover(false)}
                className="relative w-full overflow-hidden cursor-pointer disabled:cursor-wait disabled:opacity-60"
                style={primaryButtonStyle(submitHover)}
              >
                <span style={{ position: "relative", zIndex: 1 }}>
                  {loading ? "Updating…" : "Update Password"}
                </span>
              </button>
            </form>
          )}

          <div style={{ paddingTop: "8px" }}>
            <div style={{ height: "1px", background: "var(--line)", marginBottom: "20px" }} aria-hidden />
            <p
              className="text-center"
              style={{
                fontFamily: "var(--serif)",
                fontSize: "15px",
                color: "var(--text-muted)",
                margin: 0,
                fontStyle: "italic",
              }}
            >
              Remembered it after all?{" "}
              <Link
                href="/login"
                style={{
                  color: "var(--text-main)",
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                  textDecorationColor: "rgba(255,255,255,0.35)",
                  fontStyle: "normal",
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  marginLeft: "4px",
                }}
              >
                Return to Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--mono)",
  fontSize: "10px",
  letterSpacing: ".22em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  display: "block",
};

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: "16px",
  background: "var(--bg-panel)",
  border: "1px solid var(--line)",
  color: "var(--text-main)",
  borderRadius: "2px",
};

const irisHairlineStyle: React.CSSProperties = {
  height: "1px",
  width: "48px",
  margin: "0 auto",
  background: "var(--iris)",
  backgroundSize: "200% 100%",
  animation: "iris 3s linear infinite",
  opacity: 0.85,
};

function primaryButtonStyle(hover: boolean): React.CSSProperties {
  return {
    fontFamily: "var(--cond)",
    fontSize: "14px",
    fontWeight: 800,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    padding: "16px 28px",
    background: hover ? "var(--iris)" : "var(--text-main)",
    backgroundSize: hover ? "200% 100%" : undefined,
    animation: hover ? "iris 3s linear infinite" : undefined,
    color: "var(--bg-main)",
    border: "1px solid var(--text-main)",
    borderRadius: "2px",
    transition: "background 180ms ease, color 180ms ease",
  };
}

function bracketStyle(
  corner: "top-left" | "top-right" | "bottom-left" | "bottom-right"
): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    fontFamily: "var(--mono)",
    fontSize: "18px",
    color: "var(--text-muted)",
    opacity: 0.5,
    lineHeight: 1,
    pointerEvents: "none",
    userSelect: "none",
  };
  const offset = "0px";
  if (corner === "top-left") return { ...base, top: offset, left: offset };
  if (corner === "top-right") return { ...base, top: offset, right: offset };
  if (corner === "bottom-left") return { ...base, bottom: offset, left: offset };
  return { ...base, bottom: offset, right: offset };
}
