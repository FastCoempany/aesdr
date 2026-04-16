"use client";

import { useState } from "react";

export default function RefundButton({ purchaseId, email }: { purchaseId: string; email: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleRefund() {
    setLoading(true);
    const res = await fetch("/api/admin/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purchaseId }),
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
      setConfirming(false);
    }
  }

  if (done) {
    return (
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "9px", letterSpacing: ".1em", textTransform: "uppercase", color: "#8B1A1A" }}>
        Refunded
      </span>
    );
  }

  if (confirming) {
    return (
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <button
          onClick={handleRefund}
          disabled={loading}
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "9px",
            letterSpacing: ".1em",
            textTransform: "uppercase",
            padding: "4px 10px",
            background: "#8B1A1A",
            color: "#FAF7F2",
            border: "none",
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "..." : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "9px",
            padding: "4px 8px",
            background: "none",
            border: "1px solid #E8E4DF",
            color: "#6B6B6B",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: "9px",
        letterSpacing: ".1em",
        textTransform: "uppercase",
        padding: "4px 10px",
        background: "none",
        border: "1px solid #E8E4DF",
        color: "#6B6B6B",
        cursor: "pointer",
      }}
    >
      Refund
    </button>
  );
}
