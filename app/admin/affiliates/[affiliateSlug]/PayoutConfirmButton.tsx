"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import { runAffiliatePayoutBatch } from "@/app/actions/affiliate";
import { ConfirmDialog } from "@/components/ConfirmDialog";

/**
 * The affiliate-detail "Pay out via Stripe Connect" button (R5-EE-4).
 * Previously a bare submit with no confirm and no pending state — a second
 * unguarded real-money payout trigger (reinforces P0-1 / R3-AD-1). Now it
 * confirms before firing and disables + relabels while in flight so it can't
 * be double-submitted from this surface.
 */
function SubmitButton({ amountLabel }: { amountLabel: string }) {
  const { pending } = useFormStatus();
  const [asking, setAsking] = useState(false);
  return (
    <>
      <button
        type="button"
        disabled={pending}
        aria-busy={pending}
        onClick={() => setAsking(true)}
        style={{
          fontFamily: "'Barlow Condensed',sans-serif",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: ".18em",
          textTransform: "uppercase",
          color: "#1A1A1A",
          background: "#FAF7F2",
          border: "none",
          padding: "10px 22px",
          cursor: pending ? "wait" : "pointer",
          opacity: pending ? 0.7 : 1,
        }}
      >
        {pending ? "Sending…" : "Pay out via Stripe Connect →"}
      </button>
      {asking && (
        <ConfirmDialog
          eyebrow="Move real money"
          message={`Pay out ${amountLabel} to this affiliate via Stripe now? This moves real money.`}
          confirmLabel="Pay out"
          confirmType="submit"
          onConfirm={() => setAsking(false)}
          onCancel={() => setAsking(false)}
        />
      )}
    </>
  );
}

export default function PayoutConfirmButton({
  affiliateId,
  amountLabel,
}: {
  affiliateId: string;
  amountLabel: string;
}) {
  return (
    <form action={runAffiliatePayoutBatch}>
      <input type="hidden" name="affiliateId" value={affiliateId} />
      <SubmitButton amountLabel={amountLabel} />
    </form>
  );
}
