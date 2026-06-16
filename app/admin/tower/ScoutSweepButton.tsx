"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./tower.module.css";

/**
 * One scout-sweep button. It POSTs to /api/admin/run-sweep (a route handler with
 * a long maxDuration) and waits for the JSON, rather than submitting a Server
 * Action. A Server Action's POST gets killed by the platform when the Anthropic
 * call runs long, and the client surfaces that as the "unexpected response"
 * turtle. A plain fetch to a route handler holds the request open for the whole
 * call and always comes back as readable JSON — slow or failed, never the turtle.
 *
 * Confirms first (it spends API tokens), shows its own pending + result state,
 * and refreshes the tower so new `sourced` rows appear in place.
 */
export default function ScoutSweepButton({
  sweep,
  label,
}: {
  sweep: string;
  label: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function run() {
    if (
      !confirm(
        `Run "${label}"? This calls the Anthropic API and may take up to ~2 minutes. New candidates land at status='sourced' for you to review.`,
      )
    ) {
      return;
    }
    setPending(true);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/run-sweep?sweep=${encodeURIComponent(sweep)}`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => null)) as
        | { ok: boolean; inserted?: number; seen?: number; error?: string }
        | null;

      if (data?.ok) {
        const inserted = data.inserted ?? 0;
        const seen = data.seen ?? 0;
        setResult({
          kind: "ok",
          text:
            inserted > 0
              ? `Added ${inserted} new candidate${inserted === 1 ? "" : "s"} (surfaced ${seen}).`
              : seen > 0
                ? `Surfaced ${seen}, all already in the pipeline.`
                : "Nothing surfaced this time — run it again.",
        });
        router.refresh();
      } else {
        setResult({ kind: "err", text: data?.error || "Sweep didn't complete — run it again." });
      }
    } catch {
      // Network drop or the request never returned cleanly — retryable, and
      // honest about it rather than a generic failure page.
      setResult({ kind: "err", text: "Sweep didn't complete — run it again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <button
        type="button"
        className={`${styles.btn} ${styles.outline}`}
        disabled={pending}
        aria-busy={pending}
        onClick={run}
      >
        {pending ? "Running… (up to ~2 min)" : label}
      </button>
      {result && (
        <span
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: "12px",
            lineHeight: 1.3,
            maxWidth: "240px",
            color: result.kind === "ok" ? "#6B6B6B" : "#8B1A1A",
          }}
        >
          {result.text}
        </span>
      )}
    </div>
  );
}
