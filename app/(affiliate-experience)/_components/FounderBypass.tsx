"use client";

import { useState, type FormEvent } from "react";

/**
 * The founder's hidden "let me in" control on the private-preview wall. Renders
 * as a faint dot; click it, type the bypass code (COMING_SOON_BYPASS_CODE), and
 * you're routed through /x/access?k= which drops the founder cookie and lets you
 * in — independent of the HMAC gate secret. Invisible enough that a prospect
 * won't notice, findable if you know it's there.
 */
const mono = "var(--mono, 'Space Mono', monospace)";
const ink = "var(--ink, #1A1A1A)";
const crimson = "var(--crimson, #8B1A1A)";

export default function FounderBypass() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const c = code.trim();
    if (c) window.location.href = `/x/access?k=${encodeURIComponent(c)}`;
  }

  return (
    <div
      style={{
        marginTop: 44,
        height: 30,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {open ? (
        <form onSubmit={submit} style={{ display: "flex", gap: 6 }}>
          <input
            type="password"
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="code"
            aria-label="Founder bypass code"
            style={{
              fontFamily: mono,
              fontSize: 12,
              padding: "6px 10px",
              width: 150,
              border: `1px solid ${ink}`,
              background: "transparent",
              color: ink,
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              fontFamily: mono,
              fontSize: 12,
              padding: "6px 12px",
              border: "none",
              background: crimson,
              color: "#FAF7F2",
              cursor: "pointer",
            }}
          >
            →
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-hidden="true"
          tabIndex={-1}
          style={{
            fontFamily: mono,
            fontSize: 14,
            lineHeight: 1,
            color: ink,
            opacity: 0.12,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 8,
          }}
        >
          ·
        </button>
      )}
    </div>
  );
}
