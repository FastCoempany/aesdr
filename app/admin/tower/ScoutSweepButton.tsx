"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./tower.module.css";

/**
 * One scout-sweep button. Fires the rebuilt agentic sweep, then POLLS its run
 * row and shows real state: a live "searching… reading…" readout while it
 * works, the iris shimmer "Sweep complete · N found" ONLY when clean candidates
 * actually land, plain copy for empty, and — on empty/error — a one-click
 * "why?" that opens the full diagnostic log + the real reason. Degrades to a
 * timed refresh if the status table isn't there yet (pre-migration).
 */

type RunState = {
  status: "running" | "done" | "empty" | "failed";
  phase: string | null;
  searches: number;
  pages_read: number;
  candidates_found: number;
  seen: number;
  log: string[];
  error: string | null;
};

type Note = { kind: "shimmer" | "ok" | "err"; text: string };

export default function ScoutSweepButton({
  sweep,
  label,
}: {
  sweep: string;
  label: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState<string | null>(null);
  const [note, setNote] = useState<Note | null>(null);
  const [detail, setDetail] = useState<RunState | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stopped = useRef(false);

  useEffect(
    () => () => {
      stopped.current = true;
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  function settle(result: Note, runDetail: RunState | null = null) {
    setBusy(false);
    setLive(null);
    setNote(result);
    setDetail(runDetail);
  }

  // No live-status row (pre-migration): degrade to a timed refresh.
  function fallback() {
    setLive(null);
    setNote({
      kind: "ok",
      text: "Running in the background — candidates appear within ~3 min; the list will refresh.",
    });
    [90_000, 175_000].forEach((t) => timers.current.push(setTimeout(() => router.refresh(), t)));
    timers.current.push(setTimeout(() => setBusy(false), 180_000));
  }

  async function poll(runId: string, misses: number, tries: number) {
    if (stopped.current) return;
    if (tries > 140) {
      router.refresh();
      settle({ kind: "ok", text: "Still working after a while — refresh in a moment to check." });
      return;
    }

    let run: RunState | null = null;
    let ok = false;
    try {
      const res = await fetch(`/api/admin/run-sweep?runId=${encodeURIComponent(runId)}`);
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; run?: RunState | null }
        | null;
      ok = !!data?.ok;
      run = data?.run ?? null;
    } catch {
      /* transient — retry below */
    }

    if (ok && run === null) {
      // table missing / unknown id — confirm once, then fall back
      if (misses >= 1) return fallback();
      timers.current.push(setTimeout(() => poll(runId, misses + 1, tries + 1), 2500));
      return;
    }

    if (run) {
      if (run.status === "running") {
        setLive(run.phase ?? "Working…");
        timers.current.push(setTimeout(() => poll(runId, 0, tries + 1), 2500));
        return;
      }
      if (run.status === "done") {
        router.refresh();
        settle({ kind: "shimmer", text: run.phase || `Sweep complete · ${run.candidates_found} found` });
        return;
      }
      if (run.status === "empty") {
        const base = run.phase ? `${run.phase}. ` : "Nothing clean surfaced. ";
        settle({ kind: "ok", text: `${base}Run it again.` }, run);
        return;
      }
      settle({ kind: "err", text: run.error || "Hit an error — run it again." }, run);
      return;
    }

    // fetch hiccup, no data — keep polling
    timers.current.push(setTimeout(() => poll(runId, misses, tries + 1), 2500));
  }

  async function start() {
    if (
      !confirm(
        `Run "${label}"? It runs a live web search in the background (~2–4 min) and shows progress here as it goes.`,
      )
    ) {
      return;
    }
    stopped.current = false;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setNote(null);
    setDetail(null);
    setLive("Starting…");
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/run-sweep?sweep=${encodeURIComponent(sweep)}`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; runId?: string | null }
        | null;
      if (!data?.ok) {
        settle({ kind: "err", text: "Couldn't start the sweep — run it again." });
        return;
      }
      if (!data.runId) return fallback(); // started, but no status row (pre-migration)
      poll(data.runId, 0, 0);
    } catch {
      settle({ kind: "err", text: "Couldn't start the sweep — run it again." });
    }
  }

  const showWhy =
    note && note.kind !== "shimmer" && detail && ((detail.log?.length ?? 0) > 0 || !!detail.error);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <button
        type="button"
        className={`${styles.btn} ${styles.outline}`}
        disabled={busy}
        aria-busy={busy}
        onClick={start}
      >
        {busy ? "Searching…" : label}
      </button>
      {live && <span className={styles.sweepLive}>{live}</span>}
      {note &&
        (note.kind === "shimmer" ? (
          <span className={styles.sweepShimmer}>{note.text}</span>
        ) : (
          <span
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: "12px",
              lineHeight: 1.3,
              maxWidth: "250px",
              color: note.kind === "err" ? "#8B1A1A" : "#6B6B6B",
            }}
          >
            {note.text}
          </span>
        ))}
      {showWhy && detail && (
        <details style={{ maxWidth: "260px" }}>
          <summary
            style={{
              cursor: "pointer",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "11px",
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: note?.kind === "err" ? "#8B1A1A" : "#6B6B6B",
            }}
          >
            why?
          </summary>
          <div
            style={{
              marginTop: "4px",
              fontFamily: "'Space Mono', monospace",
              fontSize: "10px",
              lineHeight: 1.5,
              color: "#6B6B6B",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {detail.error && <div style={{ color: "#8B1A1A" }}>{detail.error}</div>}
            <div>
              searched {detail.searches} · read {detail.pages_read} · surfaced {detail.seen} · clean{" "}
              {detail.candidates_found}
            </div>
            {(detail.log ?? []).map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
