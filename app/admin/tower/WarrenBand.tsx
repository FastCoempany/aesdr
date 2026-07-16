"use client";

import Link from "next/link";
import { useState } from "react";

import twr from "./tower.module.css";

/**
 * The warren's band (founder pick 2026-07-16: "chambers"):
 *   · THE CHAMBERS — the working depth is no longer one long carousel. Cards
 *     are sorted into verdict CHAMBERS you switch between — reach out · your
 *     call · waiting · talking · skip · researching — and you flip through one
 *     stack at a time. A card is a door; everything happens in the room.
 *   · THE TERRITORY — the same band pulled back: every candidate a dot, sweeps
 *     as rings, live conversations glowing. Click a dot, land in its room.
 * The toggle flips in place — no navigation.
 */

/**
 * Six words, no more (founder 2026-07-16, "too many states"): a card leads
 * with the verdict, and everything else — draft written, address missing,
 * legacy review — lives in the sub-line. The room's takeover card carries
 * the matching seat.
 */
export type WarrenCard = {
  id: string;
  name: string;
  kind: "reach_out" | "skip" | "your_call" | "preparing" | "waiting" | "talking";
  sub: string;
  origin: string | null;
  hasEmail: boolean;
};

export type SweepRing = { label: string; note: string };

const WORD: Record<WarrenCard["kind"], { text: string; cls: "iris" | "ink" | "muted" | "green" | "crimson" }> = {
  reach_out: { text: "reach out.", cls: "iris" },
  skip: { text: "skip.", cls: "ink" },
  your_call: { text: "your call.", cls: "ink" },
  preparing: { text: "researching…", cls: "muted" },
  waiting: { text: "waiting.", cls: "muted" },
  talking: { text: "talking.", cls: "green" },
};

// Chamber order — needs-you first, world last. The chamber label drops the
// trailing period the cards carry.
const CHAMBERS: { key: WarrenCard["kind"]; label: string }[] = [
  { key: "reach_out", label: "reach out" },
  { key: "your_call", label: "your call" },
  { key: "waiting", label: "waiting" },
  { key: "talking", label: "talking" },
  { key: "skip", label: "skip" },
  { key: "preparing", label: "researching" },
];

function wordColor(cls: "iris" | "ink" | "muted" | "green" | "crimson"): string | undefined {
  return cls === "green" ? "#2E7D32" : cls === "muted" ? "var(--muted)" : cls === "crimson" ? "#8B1A1A" : undefined;
}

/** Deterministic 0..1 hash from an id — stable dot placement, no Math.random. */
function hash01(s: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

export default function WarrenBand({
  cards,
  rings,
  coverage,
}: {
  cards: WarrenCard[];
  rings: SweepRing[];
  coverage: string;
}) {
  const [view, setView] = useState<"strip" | "territory">("strip");

  const hot = (k: WarrenCard["kind"]) => k === "reach_out";
  const dim = (k: WarrenCard["kind"]) => k === "skip";

  // Bucket the cards by verdict and keep only chambers that have someone in
  // them. Default to the first non-empty chamber in the needs-you-first order.
  const counts: Record<string, number> = {};
  for (const c of cards) counts[c.kind] = (counts[c.kind] ?? 0) + 1;
  const openChambers = CHAMBERS.filter((ch) => (counts[ch.key] ?? 0) > 0);
  const [chamber, setChamber] = useState<WarrenCard["kind"] | null>(
    openChambers[0]?.key ?? null,
  );
  // If the selected chamber emptied out (e.g. after a refresh), fall back.
  const active = chamber && (counts[chamber] ?? 0) > 0 ? chamber : (openChambers[0]?.key ?? null);
  const stack = active ? cards.filter((c) => c.kind === active) : [];

  return (
    <section>
      <div className={twr.togWrap}>
        <button
          type="button"
          className={`${twr.togWord} ${view === "strip" ? twr.togWordOn : ""}`}
          onClick={() => setView("strip")}
          aria-pressed={view === "strip"}
        >
          <span className={twr.togU}>the strip<i /></span>
        </button>
        <button
          type="button"
          className={`${twr.togWord} ${view === "territory" ? twr.togWordOn : ""}`}
          onClick={() => setView("territory")}
          aria-pressed={view === "territory"}
        >
          <span className={twr.terrGlyph} aria-hidden>
            <i style={{ left: 4, top: 8 }} />
            <i style={{ left: 13, top: 4 }} />
            <i className={twr.hotDot} style={{ left: 10, top: 12 }} />
          </span>
          <span className={twr.togU}>the territory<i /></span>
        </button>
        <span className={twr.togNote}>
          {view === "strip"
            ? "— pick a chamber, flip its stack; a card is a door to its room"
            : "— pulled back; click a dot to land in its room"}
        </span>
      </div>

      {view === "strip" ? (
        cards.length === 0 ? (
          <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 14, color: "var(--muted)", border: "1px solid #E8E4DF", background: "#FFFFFF", padding: "14px 16px" }}>
            The floor is empty — send him out above.
          </p>
        ) : (
          <>
            {/* The chambers — one per verdict, switch between the stacks. */}
            <div className={twr.chambers} role="tablist" aria-label="verdict chambers">
              {openChambers.map((ch) => {
                const w = WORD[ch.key];
                const on = ch.key === active;
                return (
                  <button
                    key={ch.key}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    className={`${twr.chamber} ${on ? twr.chamberOn : ""}`}
                    onClick={() => setChamber(ch.key)}
                  >
                    <span
                      className={`${twr.chamberW} ${w.cls === "iris" ? twr.wordHotIris : ""}`}
                      style={wordColor(w.cls) ? { color: wordColor(w.cls) } : undefined}
                    >
                      {ch.label}
                    </span>
                    <span className={twr.chamberC}>{counts[ch.key]}</span>
                  </button>
                );
              })}
            </div>
          <div className={twr.strip}>
            {stack.map((c) => {
              const w = WORD[c.kind];
              return (
                <Link
                  key={c.id || c.name}
                  href={c.id ? `/admin/tower/candidate/${c.id}` : "/admin/tower"}
                  className={`${twr.stripCard} ${hot(c.kind) ? twr.stripHot : ""} ${dim(c.kind) ? twr.stripDim : ""}`}
                >
                  {c.origin && <span className={twr.cardOrigin}>caught in: {c.origin}</span>}
                  <span
                    className={`${twr.cardWord} ${w.cls === "iris" ? twr.wordHotIris : ""}`}
                    style={
                      w.cls === "green"
                        ? { color: "#2E7D32" }
                        : w.cls === "muted"
                          ? { color: "var(--muted)" }
                          : w.cls === "crimson"
                            ? { color: "#8B1A1A" }
                            : undefined
                    }
                  >
                    {w.text}
                  </span>
                  <span className={twr.cardName}>{c.name}</span>
                  <span className={twr.cardSub}>
                    {c.sub}
                    {c.kind !== "preparing" && (
                      <>
                        <br />
                        {c.hasEmail ? "✉ address on file" : "no address — manual channel"}
                      </>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
          </>
        )
      ) : (
        <div className={twr.terr}>
          {[300, 420, 540].map((d) => (
            <span
              key={d}
              className={twr.terrRing}
              style={{ width: d, height: d, left: `calc(50% - ${d / 2}px)`, top: `calc(56% - ${d / 2}px)` }}
              aria-hidden
            />
          ))}
          {rings.map((r, i) => (
            <span
              key={r.label}
              className={twr.terrLbl}
              style={{ left: `calc(50% - ${[36, 96, 180][i] ?? 60}px)`, top: `calc(56% - ${[152, 212, 272][i] ?? 170}px)` }}
            >
              {r.label} · {r.note}
            </span>
          ))}
          {cards.map((c) => {
            if (!c.id) return null;
            const x = 6 + hash01(c.id, 1) * 86;
            const y = 8 + hash01(c.id, 2) * 78;
            const cls =
              c.kind === "talking"
                ? twr.dotHot
                : c.kind === "waiting"
                  ? twr.dotSent
                  : hot(c.kind)
                    ? twr.dotYou
                    : "";
            return (
              <Link
                key={c.id}
                href={`/admin/tower/candidate/${c.id}`}
                className={`${twr.terrDot} ${cls}`}
                style={{ left: `${x}%`, top: `${y}%` }}
                title={`${c.name} — ${c.sub}`}
                aria-label={`${c.name} — open their room`}
              >
                <span aria-hidden />
              </Link>
            );
          })}
          <span className={twr.terrNote}>
            {coverage}
            <br />
            <span className={twr.wordHotIris} style={{ fontWeight: 700 }}>glowing = in conversation</span>
            {" · "}crimson = sent, waiting{" · "}green = waiting on you{" · "}grey = seen
          </span>
        </div>
      )}
    </section>
  );
}
