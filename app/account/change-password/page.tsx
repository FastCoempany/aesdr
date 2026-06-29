"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitHover, setSubmitHover] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!currentPassword) {
      setError("Enter your current password.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    if (password === currentPassword) {
      setError("Your new password must be different from your current one.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // Confirm a live session and grab the email to re-authenticate against.
    const { data: userData } = await supabase.auth.getUser();
    const email = userData.user?.email;

    if (!email) {
      setError("You're not signed in. Please sign in again to change your password.");
      setLoading(false);
      return;
    }

    // Re-authenticate with the current password before allowing the change.
    // This blocks a walk-up takeover or hijacked session from silently
    // resetting the key.
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (reauthError) {
      setError("Your current password is incorrect.");
      setLoading(false);
      return;
    }

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
      router.push("/");
      router.refresh();
    }, 1500);
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-6 py-12"
      style={{ background: "var(--cream)" }}
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
                <Link href="/dashboard" style={{ textDecoration: "none" }} aria-label="AESDR — dashboard">AESDR</Link>
              </span>
            </p>

            <div style={irisHairlineStyle} aria-hidden />

            <h1
              style={{
                fontFamily: "var(--display)",
                fontSize: "clamp(40px, 5.4vw, 48px)",
                lineHeight: "1.02",
                color: "var(--ink)",
                fontWeight: 400,
                letterSpacing: "-0.015em",
                margin: 0,
                fontStyle: "italic",
              }}
            >
              Change Your Password
            </h1>
            <p
              style={{
                fontFamily: "var(--mono)",
                fontSize: "10px",
                letterSpacing: ".36em",
                textTransform: "uppercase" as const,
                color: "var(--muted)",
                margin: 0,
              }}
            >
              Account <span style={{ opacity: 0.6 }}>·</span> Security
            </p>
            <p
              style={{
                fontFamily: "var(--serif)",
                fontSize: "16px",
                color: "var(--muted)",
                lineHeight: 1.55,
                margin: "8px auto 0",
                maxWidth: "340px",
                fontStyle: "italic",
              }}
            >
              Enter your current password, then choose a new one.
            </p>
          </div>

          {success ? (
            <div
              role="status"
              className="px-5 py-6 text-center"
              style={{
                borderLeft: "3px solid var(--crimson)",
                background: "rgba(139,26,26,0.05)",
              }}
            >
              <p style={{ fontFamily: "var(--serif)", fontSize: "16px", color: "var(--crimson)" }}>
                Password updated.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="current-password" style={labelStyle}>
                  Current Password
                </label>
                <input
                  id="current-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 outline-none transition"
                  style={inputStyle}
                  placeholder="Your existing password"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" style={labelStyle}>
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
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
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-3 outline-none transition"
                  style={inputStyle}
                  placeholder="Re-enter password"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="px-4 py-3"
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "14px",
                    borderLeft: "3px solid var(--crimson)",
                    background: "rgba(139,26,26,0.05)",
                    color: "var(--crimson)",
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
  color: "var(--muted)",
  display: "block",
};

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: "16px",
  background: "#fff",
  border: "1px solid var(--form-border)",
  color: "var(--ink)",
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
    background: hover ? "var(--iris)" : "var(--ink)",
    backgroundSize: hover ? "200% 100%" : undefined,
    animation: hover ? "iris 3s linear infinite" : undefined,
    color: "var(--cream)",
    border: "1px solid var(--ink)",
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
    color: "var(--muted)",
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
