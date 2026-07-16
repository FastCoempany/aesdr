"use client";

import Link from "next/link";
import { useState } from "react";

import twr from "./tower.module.css";

/**
 * The warren's band — one space, two distances (founder direction I, revised):
 *   · THE STRIP — working depth: finished cards you flip through, reach-outs
 *     first, skips dim at the back. A card is a door; everything happens in
 *     the room it opens (draft, edit, the ceramic send).
 *   · THE TERRITORY — the same band pulled back: every working candidate a
 *     dot, sweeps as rings, live conversations glowing. Click a dot, land in
 *     its room.
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
            ? "— work the cards; a card is a door to its room"
            : "— pulled back; click a dot to land in its room"}
        </span>
      </div>

      {view === "strip" ? (
        cards.length === 0 ? (
          <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 14, color: "var(--muted)", border: "1px solid #E8E4DF", background: "#FFFFFF", padding: "14px 16px" }}>
            The floor is empty — send him out above.
          </p>
        ) : (
          <div className={twr.strip}>
            {cards.map((c) => {
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
