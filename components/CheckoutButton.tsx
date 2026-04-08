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

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Something went wrong. Please try again or contact support@aesdr.com.");
        setLoading(false);
      }
    } catch {
      alert("Connection error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      className={className}
      disabled={loading}
      style={loading ? { opacity: 0.6, cursor: "wait" } : undefined}
    >
      {loading ? "Loading..." : label}
    </button>
  );
}
