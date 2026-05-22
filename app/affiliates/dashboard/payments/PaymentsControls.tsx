"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { StripeAccountStatus } from "@/lib/affiliate-entity";

const STATUS_COPY: Record<StripeAccountStatus | "none", { label: string; detail: string }> = {
  none: {
    label: "Not connected",
    detail: "Click connect to start the Stripe Connect Standard onboarding flow.",
  },
  pending: {
    label: "Onboarding in progress",
    detail: "Stripe still needs more information. Finish the form and we'll pick up the rest.",
  },
  restricted: {
    label: "Restricted",
    detail: "Stripe is missing required information. Open your Stripe dashboard to resolve.",
  },
  enabled: {
    label: "Enabled",
    detail: "Your account is fully set up. Payouts will land in your bank account when AESDR runs the next batch.",
  },
  disabled: {
    label: "Disabled",
    detail: "Stripe has flagged this account. Email hello@aesdr.com so we can help untangle it.",
  },
};

export default function PaymentsControls({
  connected,
  enabled,
  status,
  stripeAccountId,
}: {
  connected: boolean;
  enabled: boolean;
  status: StripeAccountStatus | null;
  stripeAccountId: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // After returning from Stripe-hosted onboarding, refresh the account
  // status server-side so the dashboard reflects reality.
  useEffect(() => {
    if (searchParams.get("status") !== "done") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/affiliates/stripe/refresh", { method: "POST" });
        if (!res.ok) return;
        if (!cancelled) router.replace("/affiliates/dashboard/payments");
      } catch {
        // Best-effort; the next page load will reconcile.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  const copy = STATUS_COPY[(status ?? "none") as keyof typeof STATUS_COPY] ?? STATUS_COPY.none;

  async function startOnboarding() {
    if (working) return;
    setWorking(true);
    setError(null);
    try {
      const res = await fetch("/api/affiliates/stripe/connect", { method: "POST" });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        setError(json.error ?? "Couldn't start onboarding.");
        return;
      }
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setWorking(false);
    }
  }

  async function openDashboard() {
    if (working) return;
    setWorking(true);
    setError(null);
    try {
      const res = await fetch("/api/affiliates/stripe/dashboard", { method: "POST" });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        setError(json.error ?? "Couldn't open Stripe dashboard.");
        return;
      }
      window.open(json.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div
      style={{
        background: "#fff",
        border: enabled ? "1px solid var(--light)" : "2px solid var(--crimson)",
        padding: "24px 28px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: ".25em",
            textTransform: "uppercase",
            color: enabled ? "var(--muted)" : "var(--crimson)",
          }}
        >
          Stripe Connect · {copy.label}
        </p>
        {stripeAccountId && (
          <code
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: "var(--muted)",
            }}
          >
            {stripeAccountId}
          </code>
        )}
      </div>
      <p style={{ margin: "0 0 20px", fontSize: 15, lineHeight: 1.65, color: "var(--ink)" }}>
        {copy.detail}
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {!connected || status === "pending" || status === "restricted" ? (
          <button
            type="button"
            onClick={startOnboarding}
            disabled={working}
            style={primaryButton(working)}
          >
            {working ? "Opening Stripe…" : connected ? "Finish onboarding" : "Connect Stripe"}
          </button>
        ) : null}
        {connected && (
          <button
            type="button"
            onClick={openDashboard}
            disabled={working}
            style={secondaryButton(working)}
          >
            {working ? "Opening…" : "Open Stripe dashboard"}
          </button>
        )}
      </div>
      {error && (
        <p
          role="alert"
          style={{
            marginTop: 16,
            fontFamily: "var(--mono)",
            fontSize: 12,
            color: "var(--crimson)",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

function primaryButton(working: boolean): React.CSSProperties {
  return {
    fontFamily: "var(--cond)",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: ".15em",
    textTransform: "uppercase",
    color: "#fff",
    background: "var(--crimson)",
    border: "none",
    padding: "12px 24px",
    cursor: working ? "wait" : "pointer",
    opacity: working ? 0.7 : 1,
  };
}

function secondaryButton(working: boolean): React.CSSProperties {
  return {
    fontFamily: "var(--cond)",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: ".15em",
    textTransform: "uppercase",
    color: "var(--ink)",
    background: "transparent",
    border: "1px solid var(--ink)",
    padding: "11px 24px",
    cursor: working ? "wait" : "pointer",
    opacity: working ? 0.7 : 1,
  };
}
