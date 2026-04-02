"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/utils/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // If email confirmations are disabled, user is signed in immediately
    setSuccess(true);
    setLoading(false);

    // Redirect to dashboard after short delay
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 1500);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#020617_0%,_#0f172a_55%,_#111827_100%)] px-6 text-white">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.38em] text-emerald-300/80">
            AESDR Course
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create Account
          </h1>
        </div>

        {success ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-6 text-center">
            <p className="text-sm text-emerald-300">
              Account created. Redirecting to your dashboard...
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm text-slate-400"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/30"
                  placeholder="you@company.com"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm text-slate-400"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/30"
                  placeholder="Min 6 characters"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-70"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-emerald-300 transition hover:text-emerald-200"
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
