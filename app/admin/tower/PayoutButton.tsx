"use client";

import { executePayout } from "./actions";
import TowerButton from "./TowerButton";

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
    <form action={executePayout}>
      <input type="hidden" name="affiliateId" value={affiliateId} />
      <TowerButton
        pendingLabel="Sending…"
        confirmMessage={`Send ${amountLabel} to this affiliate via Stripe now? This moves real money.`}
      >
        Pay {amountLabel}
      </TowerButton>
    </form>
  );
}
