"use client";

import { runScoutSweepAction } from "./actions";

/**
 * One scout-sweep button. Asks for confirm (it spends API tokens) and the
 * action takes a few seconds to return, so the button shows "Running…" while
 * the form is submitting (via React's useFormStatus would be cleaner, but a
 * plain disabled-on-submit is enough here).
 */
export default function ScoutSweepButton({
  sweep,
  label,
}: {
  sweep: string;
  label: string;
}) {
  return (
    <form
      action={runScoutSweepAction}
      onSubmit={(e) => {
        if (!confirm(`Run "${label}"? This calls the Anthropic API and may take 10–30 seconds. New candidates land at status='sourced' for you to review.`)) {
          e.preventDefault();
          return;
        }
        const btn = e.currentTarget.querySelector("button");
        if (btn) {
          btn.disabled = true;
          btn.textContent = "Running…";
        }
      }}
    >
      <input type="hidden" name="sweep" value={sweep} />
      <button
        type="submit"
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: "#1A1A1A",
          background: "#FAF7F2",
          border: "1px solid #1A1A1A",
          padding: "9px 16px",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </button>
    </form>
  );
}
