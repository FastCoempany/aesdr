"use client";

import { executePayout } from "./actions";

/**
 * The money gate. A real Stripe Connect transfer runs on click, so it asks for
 * an explicit confirm first. Disabled (with a reason) when the affiliate hasn't
 * finished Stripe onboarding — the batch processor would reject it anyway.
 */
export default function PayoutButton({
  affiliateId,
  amountLabel,
  enabled,
}: {
  affiliateId: string;
  amountLabel: string;
  enabled: boolean;
}) {
  if (!enabled) {
    return (
      <span
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "11px",
          color: "#a14400",
        }}
      >
        Stripe not connected — onboard first
      </span>
    );
  }
  return (
    <form
      action={executePayout}
      onSubmit={(e) => {
        if (!confirm(`Send ${amountLabel} to this affiliate via Stripe now? This moves real money.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="affiliateId" value={affiliateId} />
      <button
        type="submit"
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: "#FFFFFF",
          background: "#8B1A1A",
          border: "none",
          padding: "9px 18px",
          cursor: "pointer",
        }}
      >
        Pay {amountLabel}
      </button>
    </form>
  );
}
