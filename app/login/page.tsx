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
  const authError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleForgotPassword() {
    if (!email) {
      setError("Enter your email above first.");
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
          Sign In
        </h1>
      </div>

      {authError === "rate-limit" && (
        <div
          className="px-4 py-3"
          style={{
            fontFamily: "var(--serif)",
            fontSize: "14px",
            borderLeft: "3px solid var(--coral, #EF4444)",
            background: "rgba(239,68,68,0.05)",
            color: "var(--coral, #EF4444)",
          }}
        >
          Too many attempts. Please wait a few minutes and try again.
        </div>
      )}

      {reason === "no_purchase" && (
        <div
          className="px-4 py-3"
          style={{
            fontFamily: "var(--serif)",
            fontSize: "14px",
            borderLeft: "3px solid var(--coral, #EF4444)",
            background: "rgba(239,68,68,0.05)",
            color: "var(--coral, #EF4444)",
          }}
        >
          You do not have a paid subscription.{" "}
          <a href="/" style={{ color: "var(--theme)", textDecoration: "underline" }}>Purchase access here</a>{" "}
          or <a href="mailto:support@aesdr.com" style={{ color: "var(--theme)", textDecoration: "underline" }}>contact support</a> if you believe this is an error.
        </div>
      )}

      {resetSent && (
        <div
          className="px-4 py-3"
          style={{
            fontFamily: "var(--serif)",
            fontSize: "14px",
            borderLeft: "3px solid var(--theme)",
            background: "rgba(16,185,129,0.05)",
            color: "var(--theme)",
          }}
        >
          Password reset link sent. Check your email.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="email"
            style={{
              fontFamily: "var(--mono)",
              fontSize: "10px",
              letterSpacing: ".14em",
              textTransform: "uppercase" as const,
              color: "var(--text-muted)",
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 outline-none transition"
            style={{
              fontFamily: "var(--serif)",
              fontSize: "16px",
              background: "var(--bg-panel)",
              border: "1px solid var(--line)",
              color: "var(--text-main)",
            }}
            placeholder="you@company.com"
          />
        </div>

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
            Password
          </label>
          <input
            id="password"
            type="password"
            required
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
              letterSpacing: ".1em",
              textTransform: "uppercase" as const,
              color: "var(--text-muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            {resetLoading ? "Sending..." : "Forgot password?"}
          </button>
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
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p
        className="text-center"
        style={{ fontFamily: "var(--serif)", fontSize: "16px", color: "var(--text-muted)" }}
      >
        Don&apos;t have an account?{" "}
        <Link href="/signup" style={{ color: "var(--theme)" }}>
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: "var(--bg-main)" }}
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
