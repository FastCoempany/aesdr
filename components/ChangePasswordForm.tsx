"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setPassword("");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "320px" }}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password (min 6 characters)"
        aria-label="New password"
        minLength={6}
        required
        className="px-4 py-3"
        style={{
          fontFamily: "var(--serif)",
          fontSize: "16px",
          background: "#fff",
          border: "1px solid var(--light)",
          color: "var(--ink)",
        }}
      />
      {error && (
        <p style={{ fontFamily: "var(--serif)", fontSize: "13px", color: "var(--crimson)", margin: 0 }}>
          {error}
        </p>
      )}
      {success && (
        <p style={{ fontFamily: "var(--serif)", fontSize: "13px", color: "var(--crimson)", margin: 0 }}>
          Password updated.
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="cursor-pointer disabled:cursor-wait disabled:opacity-50"
        style={{
          fontFamily: "var(--cond)",
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: ".12em",
          textTransform: "uppercase" as const,
          padding: "14px 20px",
          background: "var(--ink)",
          color: "var(--cream)",
          border: "none",
          alignSelf: "flex-start",
        }}
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
