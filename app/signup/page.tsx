"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { clearRole, getRole } from "@/lib/role";
import { createClient } from "@/utils/supabase/client";

// Only honor relative, same-app redirect targets — never an absolute URL — so
// `?next=` can't be turned into an open-redirect off the signup form.
function safeNext(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Team invites (and any gated flow) round-trip through here: they pass the
  // page to return to in `next` and prefill the invited address with `email`.
  const next = safeNext(searchParams.get("next"));
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    // Promote the anonymous fork pick (if any) to user_metadata so the role
    // sticks across sessions and the landing page can skip the fork next time.
    const role = getRole();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: role ? { data: { role } } : undefined,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Anonymous role is now persisted on the user; sessionStorage can be cleared.
    clearRole();

    setSuccess(true);
    setLoading(false);

    // Honor the round-trip target (e.g. /team/accept?token=…) so an invite
    // isn't dropped; otherwise fall back to sign-in.
    const destination = next ?? "/login";
    setTimeout(() => {
      router.push(destination);
      router.refresh();
    }, 1500);
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: "var(--cream)" }}
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
              <Link href="/" style={{ textDecoration: "none" }} aria-label="AESDR — home">AESDR</Link>
            </span>
          </p>
          <h1
            style={{
              fontFamily: "var(--display)",
              fontSize: "32px",
              lineHeight: "1",
              color: "var(--ink)",
            }}
          >
            Create Account
          </h1>
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
            <p
              style={{
                fontFamily: "var(--serif)",
                fontSize: "16px",
                color: "var(--crimson)",
              }}
            >
              {next
                ? "Account created. Taking you back to finish up..."
                : "Account created. Taking you to sign in..."}
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "10px",
                    letterSpacing: ".14em",
                    textTransform: "uppercase" as const,
                    color: "var(--muted)",
                  }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 transition"
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "16px",
                    background: "#fff",
                    border: "1px solid var(--form-border)",
                    color: "var(--ink)",
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
                    color: "var(--muted)",
                  }}
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 transition"
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "16px",
                    background: "#fff",
                    border: "1px solid var(--form-border)",
                    color: "var(--ink)",
                  }}
                  placeholder="Min 6 characters"
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
                className="relative w-full overflow-hidden cursor-pointer disabled:cursor-wait disabled:opacity-50"
                style={{
                  fontFamily: "var(--cond)",
                  fontSize: "13px",
                  fontWeight: 800,
                  letterSpacing: ".15em",
                  textTransform: "uppercase" as const,
                  padding: "14px 28px",
                  background: "var(--ink)",
                  color: "var(--cream)",
                  border: "none",
                }}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p
              className="text-center"
              style={{
                fontFamily: "var(--serif)",
                fontSize: "16px",
                color: "var(--muted)",
              }}
            >
              Already have an account?{" "}
              <Link
                href={
                  next
                    ? `/login?next=${encodeURIComponent(next)}${email ? `&email=${encodeURIComponent(email)}` : ""}`
                    : "/login"
                }
                style={{ color: "var(--crimson)" }}
              >
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}

export default function SignupPage() {
  // useSearchParams (for next/email round-trip) requires a Suspense boundary.
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
