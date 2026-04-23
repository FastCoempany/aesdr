"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/utils/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [submitHover, setSubmitHover] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("you didn't put your email");
      return;
    }
    if (!password.trim()) {
      setError("you forgot your password — ironic, right?");
      return;
    }
    setLoading(true);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user?.user_metadata?.needs_password_change) {
      router.push("/welcome");
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  }

  async function handleForgotPassword() {
    if (!email) {
      setError("you didn't put your email");
      return;
    }
    setResetLoading(true);
    setError(null);
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aesdr.com";
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/account/reset-password`,
    });
    if (resetError) {
      setError("Failed to send reset email. Please try again.");
      setResetLoading(false);
      return;
    }
    setResetSent(true);
    setResetLoading(false);
  }

  return (
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

          {/* Iris-gradient hairline */}
          <div style={irisHairlineStyle} aria-hidden />

          <h1
            style={{
              fontFamily: "var(--display)",
              fontSize: "clamp(40px, 5.4vw, 48px)",
              lineHeight: "1.02",
              color: "#1A1A1A",
              fontWeight: 400,
              letterSpacing: "-0.015em",
              margin: 0,
              fontStyle: "italic",
            }}
          >
            Welcome Back
          </h1>
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: "10px",
              letterSpacing: ".36em",
              textTransform: "uppercase" as const,
              color: "#6B6B6B",
              margin: 0,
            }}
          >
            Members <span style={{ color: "#6B6B6B", opacity: 0.6 }}>·</span> Only
          </p>
        </div>

        {reason === "no_purchase" && (
          <div
            className="px-4 py-3"
            style={{
              fontFamily: "var(--serif)",
              fontSize: "14px",
              borderLeft: "3px solid #8B1A1A",
              background: "rgba(139,26,26,0.06)",
              color: "#8B1A1A",
            }}
          >
            You do not have a paid subscription.{" "}
            <Link href="/" style={{ color: "#1A1A1A", textDecoration: "underline" }}>Purchase access here</Link>{" "}
            or <a href="mailto:support@aesdr.com" style={{ color: "#1A1A1A", textDecoration: "underline" }}>contact support</a> if you believe this is an error.
          </div>
        )}

        {resetSent && (
          <div
            className="px-4 py-3"
            style={{
              fontFamily: "var(--serif)",
              fontSize: "14px",
              borderLeft: "3px solid #1A1A1A",
              background: "rgba(26,26,26,0.04)",
              color: "#1A1A1A",
            }}
          >
            Password reset link sent. Check your email.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" style={labelStyle}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 transition outline-none"
              style={inputStyle}
              placeholder="you@company.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" style={labelStyle}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 transition outline-none"
              style={inputStyle}
              placeholder="Your password"
            />
          </div>

          <div style={{ textAlign: "right" }}>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              style={{
                fontFamily: "var(--mono)",
                fontSize: "10px",
                letterSpacing: ".18em",
                textTransform: "uppercase" as const,
                color: "#6B6B6B",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
                textUnderlineOffset: "4px",
                textDecorationColor: "rgba(26,26,26,0.2)",
              }}
            >
              {resetLoading ? "Sending..." : "what's my password?"}
            </button>
          </div>

          {error && (
            <div
              className="px-4 py-3"
              style={{
                fontFamily: "var(--hand)",
                fontSize: "16px",
                borderLeft: "3px solid #8B1A1A",
                background: "rgba(139,26,26,0.06)",
                color: "#8B1A1A",
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
              {loading ? "Signing In…" : "Sign In"}
            </span>
          </button>
        </form>

        <div style={{ paddingTop: "8px" }}>
          <div style={{ height: "1px", background: "#D4C5AD", marginBottom: "20px" }} aria-hidden />
          <p
            className="text-center"
            style={{
              fontFamily: "var(--serif)",
              fontSize: "15px",
              color: "#6B6B6B",
              margin: 0,
              fontStyle: "italic",
            }}
          >
            Not a member yet?{" "}
            <Link
              href="/#pricing"
              style={{
                textDecoration: "none",
                fontStyle: "normal",
                fontFamily: "var(--mono)",
                fontSize: "11px",
                letterSpacing: ".18em",
                textTransform: "uppercase",
                marginLeft: "4px",
                background: "var(--iris)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "iris 3s linear infinite",
              }}
            >
              Get Access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--mono)",
  fontSize: "10px",
  letterSpacing: ".22em",
  textTransform: "uppercase",
  color: "#6B6B6B",
  display: "block",
};

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: "16px",
  background: "#FAF7F2",
  border: "1px solid #D4C5AD",
  color: "#1A1A1A",
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
    background: hover ? "var(--iris)" : "#1A1A1A",
    backgroundSize: hover ? "200% 100%" : undefined,
    animation: hover ? "iris 3s linear infinite" : undefined,
    color: hover ? "#1A1A1A" : "#FAF7F2",
    border: "1px solid #1A1A1A",
    borderRadius: "2px",
    transition: "background 180ms ease, color 180ms ease, letter-spacing 180ms ease",
  };
}

function bracketStyle(
  corner: "top-left" | "top-right" | "bottom-left" | "bottom-right"
): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    fontFamily: "var(--mono)",
    fontSize: "18px",
    color: "#6B6B6B",
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

export default function LoginPage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center px-6 py-12"
      style={{ background: "#E5D5BE" }}
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
