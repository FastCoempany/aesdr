"use client";

/**
 * The kit's call-to-action. Click tracks `request_conversation_clicked` (the
 * strongest intent signal in the funnel — surfaced on /x/ops). After click,
 * the prospect sees the confirmation AND a kit-browse link so they don't
 * dead-end while waiting for the founder to reach out.
 */
import { useState } from "react";
import Link from "next/link";
import { trackProspect } from "../_lib/track";

export default function KitCta() {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div
        style={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontStyle: "italic",
            fontSize: 19,
            color: "var(--crimson, #8B1A1A)",
            margin: 0,
            lineHeight: 1.45,
          }}
        >
          Noted — we&rsquo;ll be in touch directly. No forms, no queue.
        </p>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontSize: 15,
            color: "var(--muted, #6B6B6B)",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          While you wait, keep reading.
        </p>
        <Link
          href="/x/kit"
          style={{
            fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
            textTransform: "uppercase",
            letterSpacing: ".18em",
            fontSize: 12,
            color: "var(--ink, #1A1A1A)",
            textDecoration: "none",
            borderBottom: "2px solid var(--crimson, #8B1A1A)",
            paddingBottom: 2,
          }}
        >
          Browse the rest of the kit →
        </Link>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        trackProspect("request_conversation_clicked");
        setDone(true);
      }}
      style={{
        fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
        textTransform: "uppercase",
        letterSpacing: ".14em",
        fontSize: 15,
        color: "#FAF7F2",
        background: "var(--crimson, #8B1A1A)",
        border: "none",
        borderRadius: 2,
        padding: "14px 30px",
        cursor: "pointer",
      }}
    >
      Request an affiliate conversation →
    </button>
  );
}
