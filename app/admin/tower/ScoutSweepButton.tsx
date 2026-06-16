"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./tower.module.css";

/**
 * One scout-sweep button. A sweep is a ~150s live-web research call, and the
 * platform won't hold a request open that long — the connection drops and the
 * function is torn down before it writes anything (the turtle, or "didn't
 * complete"). So this fires the sweep and returns immediately: POST to
 * /api/admin/run-sweep, which schedules the research with after()/waitUntil and
 * responds in well under a second. The candidates land in the background; we
 * refresh the tower a few times across the ~2-minute window to reveal them as
 * they arrive (and they persist in the pipeline regardless, on any later load).
 */
export default function ScoutSweepButton({
  sweep,
  label,
}: {
  sweep: string;
  label: string;
}) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clear any pending refresh timers on unmount.
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  async function run() {
    if (
      !confirm(
        `Run "${label}"? This calls the Anthropic API. It runs in the background (~1–2 min) and new candidates appear here when it's done.`,
      )
    ) {
      return;
    }
    setResult(null);
    setRunning(true);
    try {
      const res = await fetch(`/api/admin/run-sweep?sweep=${encodeURIComponent(sweep)}`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; started?: boolean; error?: string }
        | null;

      if (!data?.ok) {
        setResult({ kind: "err", text: data?.error || "Couldn't start the sweep — run it again." });
        setRunning(false);
        return;
      }

      setResult({
        kind: "ok",
        text: "Sweep running in the background — new candidates appear here within ~2 min. You can keep working.",
      });
      // Reveal candidates as the background job writes them; they persist in the
      // pipeline either way, so a missed refresh just means reload to see them.
      timers.current.forEach(clearTimeout);
      timers.current = [
        setTimeout(() => router.refresh(), 60_000),
        setTimeout(() => router.refresh(), 120_000),
        setTimeout(() => router.refresh(), 165_000),
        setTimeout(() => {
          router.refresh();
          setRunning(false);
          setResult({
            kind: "ok",
            text: "Done. If no new candidates appeared above, run it again.",
          });
        }, 175_000),
      ];
    } catch {
      setResult({ kind: "err", text: "Couldn't start the sweep — run it again." });
      setRunning(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <button
        type="button"
        className={`${styles.btn} ${styles.outline}`}
        disabled={running}
        aria-busy={running}
        onClick={run}
      >
        {running ? "Running in background…" : label}
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
