"use client";

import { useState } from "react";

export default function UnlockArtifactTile({
  artifactType,
  email,
  bgImage,
  artifactImage,
  label,
}: {
  artifactType: "playbill" | "redline";
  email: string;
  bgImage: string;
  artifactImage: string;
  label: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleUnlock() {
    if (loading) return;
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: "artifact_unlock", artifact_type: artifactType, email }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));
      const urlHost = data.url ? new URL(data.url).hostname : "";
      if (data.url && (urlHost === "stripe.com" || urlHost.endsWith(".stripe.com"))) {
        window.location.href = data.url;
      } else {
        setLoading(false);
      }
    } catch {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleUnlock}
      disabled={loading}
      style={{
        all: "unset",
        display: "block",
        width: 200,
        height: 260,
        borderRadius: 6,
        overflow: "hidden",
        backgroundImage: `url('${bgImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        boxShadow: "0 4px 16px rgba(0,0,0,.1)",
        filter: "brightness(.65) saturate(.4)",
        cursor: loading ? "wait" : "pointer",
        transition: "filter .3s ease, transform .3s ease",
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.filter = "brightness(.75) saturate(.6)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = "brightness(.65) saturate(.4)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img
          src={artifactImage}
          alt="Sealed"
          style={{ width: "65%", height: "auto", filter: "drop-shadow(0 8px 16px rgba(0,0,0,.3)) blur(1px)" }}
        />
      </div>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        <span style={{
          fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28,
          fontWeight: 900, fontStyle: "italic", color: "#FAF7F2",
          textShadow: "0 2px 8px rgba(0,0,0,.5)",
        }}>
          {loading ? "..." : "$40"}
        </span>
      </div>
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 12px 12px",
        background: "linear-gradient(transparent, rgba(0,0,0,.6))",
        fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: ".25em",
        textTransform: "uppercase", color: "rgba(250,247,242,.6)", textAlign: "center",
      }}>
        {label} &middot; Unlock
      </div>
    </button>
  );
}
