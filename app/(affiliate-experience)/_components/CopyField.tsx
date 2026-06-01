"use client";

/** Read-only field with a one-click copy button, for prospect links. */
import { useState } from "react";

export default function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const mono = "var(--mono, 'Space Mono', monospace)";
  const ink = "var(--ink, #1A1A1A)";
  const crimson = "var(--crimson, #8B1A1A)";

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
      <input
        readOnly
        value={value}
        onFocus={(e) => e.currentTarget.select()}
        style={{
          flex: 1,
          fontFamily: mono,
          fontSize: 12,
          padding: "8px 10px",
          border: `1px solid var(--light, #E8E4DF)`,
          background: "transparent",
          color: ink,
        }}
      />
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            // clipboard blocked — the field is selectable as a fallback
          }
        }}
        style={{
          fontFamily: mono,
          textTransform: "uppercase",
          letterSpacing: ".1em",
          fontSize: 11,
          color: copied ? "#FAF7F2" : crimson,
          background: copied ? crimson : "transparent",
          border: `1px solid ${crimson}`,
          padding: "0 14px",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {copied ? "copied" : "copy"}
      </button>
    </div>
  );
}
