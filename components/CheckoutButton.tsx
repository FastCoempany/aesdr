"use client";

import { useState } from "react";

export default function CheckoutButton({
  tier,
  label,
  className,
}: {
  tier: "individual" | "team";
  label: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");

  async function handleCheckout() {
    if (!email || !email.includes("@")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, email }),
      });

      const data = await res.json();
      if (data.url && new URL(data.url).hostname.endsWith("stripe.com")) {
        window.location.href = data.url;
      } else if (data.url) {
        alert("Unexpected checkout URL. Please contact support@aesdr.com.");
        setLoading(false);
      } else {
        alert("Something went wrong. Please try again or contact support@aesdr.com.");
        setLoading(false);
      }
    } catch {
      alert("Connection error. Please try again.");
      setLoading(false);
    }
  }

  if (showEmail) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCheckout()}
          placeholder="Your work email"
          autoFocus
          style={{
            fontFamily: "var(--serif)",
            fontSize: "16px",
            padding: "14px 16px",
            background: "var(--bg-panel, #0F172A)",
            border: "1px solid var(--line, #1E293B)",
            color: "var(--text-main, #F8FAFC)",
            width: "100%",
            outline: "none",
          }}
        />
        <button
          onClick={handleCheckout}
          className={className}
          disabled={loading || !email.includes("@")}
          style={loading ? { opacity: 0.6, cursor: "wait" } : undefined}
        >
          {loading ? "Loading..." : "Continue to Payment"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowEmail(true)}
      className={className}
      disabled={loading}
    >
      {label}
    </button>
  );
}
