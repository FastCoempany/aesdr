"use client";

/**
 * The kit's single call-to-action. In this isolated environment we don't send
 * the prospect anywhere else — clicking records the strongest intent signal we
 * have (request_conversation_clicked) and confirms inline. The founder sees it
 * on the /x/ops dashboard and reaches out by hand.
 */
import { useState } from "react";
import { trackProspect } from "../_lib/track";

export default function KitCta() {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <p
        style={{
          fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
          fontStyle: "italic",
          fontSize: 17,
          color: "var(--crimson, #8B1A1A)",
        }}
      >
        Noted — we&rsquo;ll be in touch directly. No forms, no queue.
      </p>
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
