"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import styles from "../../tower.module.css";
import { useConfirm } from "@/components/ConfirmDialog";

/**
 * "Run brief" — fires the rebuilt dossier research in the background, then POLLS
 * its run row and shows real state: a live "searching… reading…" readout, the
 * iris shimmer "Brief ready · <verdict>" when it lands, and a one-click "why?"
 * on failure. Same pattern as the sweep button. Degrades to a timed refresh if
 * the dossier_runs table isn't there yet (pre-migration).
 */

type RunState = {
  status: "running" | "done" | "failed";
  phase: string | null;
  searches: number;
  pages_read: number;
  verdict: string | null;
  log: string[];
  error: string | null;
};

type Note = { kind: "shimmer" | "err"; text: string };

export default function RunBriefButton({
  candidateId,
  label,
  postPath = "/api/admin/run-brief",
  confirmText,
  confirmLabel,
  busyLabel = "Researching…",
  variant = "outline",
}: {
  candidateId: string;
  label: string;
  /** POST target that returns { ok, runId } — status polling always reads
   *  /api/admin/run-brief?runId=…. Accept & prepare posts its own route. */
  postPath?: string;
  confirmText?: string;
  confirmLabel?: string;
  busyLabel?: string;
  variant?: "outline" | "primary";
}) {
  const router = useRouter();
  const [confirm, confirmModal] = useConfirm();
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

  function fallback() {
    setLive(null);
    setNote({ kind: "shimmer", text: "Brief running in the background — it'll appear here in ~2 min." });
    [70_000, 130_000].forEach((t) => timers.current.push(setTimeout(() => router.refresh(), t)));
    timers.current.push(setTimeout(() => setBusy(false), 135_000));
  }

  async function poll(runId: string, misses: number, tries: number) {
    if (stopped.current) return;
    if (tries > 110) {
      router.refresh();
      settle({ kind: "shimmer", text: "Still working — refresh in a moment to check." });
      return;
    }
    let run: RunState | null = null;
    let ok = false;
    try {
      const res = await fetch(`/api/admin/run-brief?runId=${encodeURIComponent(runId)}`);
      const data = (await res.json().catch(() => null)) as { ok?: boolean; run?: RunState | null } | null;
      ok = !!data?.ok;
      run = data?.run ?? null;
    } catch {
      /* transient — retry */
    }

    if (ok && run === null) {
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
        settle({ kind: "shimmer", text: run.phase || "Brief ready" });
        return;
      }
      settle({ kind: "err", text: run.error || "Hit an error — run it again." }, run);
      return;
    }

    timers.current.push(setTimeout(() => poll(runId, misses, tries + 1), 2500));
  }

  async function start() {
    if (
      !(await confirm(
        confirmText ??
          `${label}? It runs a live web-search research call in the background (~1–2 min, ~$0.10–$0.50) and shows progress here.`,
        { confirmLabel: confirmLabel ?? "Run brief" },
      ))
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
      const res = await fetch(`${postPath}?id=${encodeURIComponent(candidateId)}`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        runId?: string | null;
        error?: string | null;
      } | null;
      if (!data?.ok) {
        // A 409 carries a real reason — the $10 wall, a wrong-status card —
        // show it verbatim instead of a generic retry line.
        settle({ kind: "err", text: data?.error || "Couldn't start — run it again." });
        return;
      }
      if (!data.runId) return fallback();
      poll(data.runId, 0, 0);
    } catch {
      settle({ kind: "err", text: "Couldn't start — run it again." });
    }
  }

  const showWhy =
    note && note.kind === "err" && detail && ((detail.log?.length ?? 0) > 0 || !!detail.error);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {confirmModal}
      <button
        type="button"
        className={variant === "primary" ? `${styles.btn} ${styles.primary}` : `${styles.btn} ${styles.outline}`}
        disabled={busy}
        aria-busy={busy}
        onClick={start}
      >
        {busy ? busyLabel : label}
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
              maxWidth: "260px",
              color: "#8B1A1A",
            }}
          >
            {note.text}
          </span>
        ))}
      {showWhy && detail && (
        <details style={{ maxWidth: "280px" }}>
          <summary
            style={{
              cursor: "pointer",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "11px",
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "#8B1A1A",
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
              searched {detail.searches} · read {detail.pages_read}
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
