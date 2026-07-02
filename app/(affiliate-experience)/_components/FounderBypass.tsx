"use client";

import { useState, type FormEvent } from "react";

/**
 * The founder's "let me in" control on the private-preview wall — pinned to the
 * bottom-right corner so it's always in the same, findable spot. A small ringed
 * dot, muted at rest and lit crimson on hover; click it, type the bypass code
 * (COMING_SOON_BYPASS_CODE), and you're routed through /x/access?k= which drops
 * the founder cookie (independent of the HMAC gate secret). Quiet enough that a
 * prospect ignores it; even a curious click hits a code prompt they can't pass.
 */
const mono = "var(--mono, 'Space Mono', monospace)";
const ink = "var(--ink, #1A1A1A)";
const crimson = "var(--crimson, #8B1A1A)";
const cream = "var(--cream, #FAF7F2)";

export default function FounderBypass() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [hover, setHover] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    const c = code.trim();
    if (c) window.location.href = `/x/access?k=${encodeURIComponent(c)}`;
  }

  return (
    <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 50 }}>
      {open ? (
        <form
          onSubmit={submit}
          style={{
            display: "flex",
            gap: 6,
            background: cream,
            border: `1px solid ${ink}`,
            padding: 8,
            boxShadow: "0 8px 24px rgba(26,26,26,0.18)",
          }}
        >
          <input
            type="password"
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="founder code"
            aria-label="Founder bypass code"
            style={{
              fontFamily: mono,
              fontSize: 12,
              padding: "7px 10px",
              width: 160,
              border: `1px solid ${ink}`,
              background: "transparent",
              color: ink,
              outline: "none",
            }}
          />
          <button
            type="submit"
            aria-label="Enter"
            style={{
              fontFamily: mono,
              fontSize: 13,
              padding: "7px 12px",
              border: "none",
              background: crimson,
              color: "#FAF7F2",
              cursor: "pointer",
            }}
          >
            →
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            style={{
              fontFamily: mono,
              fontSize: 12,
              padding: "7px 9px",
              border: `1px solid ${ink}`,
              background: "transparent",
              color: ink,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          aria-label="Founder access"
          title="Founder access"
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: `1px solid ${hover ? crimson : ink}`,
            background: hover ? crimson : "transparent",
            color: hover ? "#FAF7F2" : ink,
            opacity: hover ? 1 : 0.4,
            cursor: "pointer",
            fontFamily: mono,
            fontSize: 12,
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "opacity .15s, background .15s, border-color .15s, color .15s",
          }}
        >
          ·
        </button>
      )}
    </div>
  );
}
