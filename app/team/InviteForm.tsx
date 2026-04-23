"use client";

import { useState } from "react";

export default function InviteForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMessage({ text: "Invite sent!", ok: true });
      setEmail("");
    } else {
      setMessage({ text: data.error || "Something went wrong", ok: false });
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "12px", alignItems: "flex-start", flexWrap: "wrap" }}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="colleague@company.com"
        style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: "14px",
          padding: "14px 16px",
          border: "1px solid #E8E4DF",
          background: "#FAF7F2",
          color: "#1A1A1A",
          flex: "1 1 240px",
          minWidth: "200px",
        }}
      />
      <button
        type="submit"
        disabled={loading}
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: ".15em",
          textTransform: "uppercase",
          padding: "14px 24px",
          background: "#1A1A1A",
          color: "#FAF7F2",
          border: "none",
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Sending..." : "Send Invite"}
      </button>
      {message && (
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "11px",
          letterSpacing: ".05em",
          color: message.ok ? "#10B981" : "#8B1A1A",
          width: "100%",
          marginTop: "4px",
        }}>
          {message.text}
        </p>
      )}
    </form>
  );
}
