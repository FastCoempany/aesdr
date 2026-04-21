"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import s from "./DeckStack.module.css";

export const LESSONS = [
  { num: "01", title: "Building Real Camaraderie", q: "When’s the last time your team felt like an actual team?", titleStyle: undefined as string | undefined },
  { num: "02", title: "Breaking Down Silos", q: "How many deals died in the handoff you never talked about?", titleStyle: undefined as string | undefined },
  { num: "03", title: "Performance Pitfalls", q: "Are you getting better — or just getting by?", titleStyle: undefined as string | undefined },
  { num: "04", title: "Navigating Manager Madness", q: "Does your manager coach you… or just count your calls and faults?", titleStyle: undefined as string | undefined },
  { num: "05", title: "tHe SaLeS pLaYbOoK", q: "What’s your system? And if you don’t have one — what have you been doing?\n(If you got it from somewhere on LinkedIn — you’ll need more than this course can offer, but definitely start here. Now.)", titleStyle: "none" },
  { num: "06", title: "bEyOnD tHe SaLeS pLaYbOoK", q: "What do you do when the script runs out and you’re live?", titleStyle: "none" },
  { num: "07", title: "Prospecting & Pipeline", q: "If inbound dried up tomorrow, would you survive?", titleStyle: undefined as string | undefined },
  { num: "08", title: "The 30% Rule", q: "What’s your actual close rate? Not the one you told your VP.", titleStyle: undefined as string | undefined },
  { num: "09", title: "CRM Survival Guide", q: "Is your CRM protecting you — or building the case against you?", titleStyle: undefined as string | undefined },
  { num: "10", title: "Breaking Down the Commission Myth", q: "Can you survive three bad months in a row? Mentally? Financially?", titleStyle: undefined as string | undefined },
  { num: "11", title: "Sober Selling", q: "What if the problem is bigger than your process — what if it’s what you’re doing when no one’s watching?\n(21+ sober — not metaphorical sober.)", titleStyle: undefined as string | undefined },
  { num: "12", title: "Leveling Up SaaS Relationships", q: "Who would vouch for you if you changed companies tomorrow?", titleStyle: undefined as string | undefined },
];

const TOTAL = LESSONS.length;

type DeckStackProps = {
  /**
   * When true, renders without the `id="curriculum"` anchor and removes the
   * 100vh section framing — for use on a dedicated /syllabus page.
   */
  standalone?: boolean;
};

export default function DeckStack({ standalone = false }: DeckStackProps) {
  const [index, setIndex] = useState(0); // index of the top (active) card
  const viewportRef = useRef<HTMLDivElement>(null);

  const active = Math.min(index, TOTAL - 1);
  const done = index >= TOTAL;

  const next = useCallback(() => {
    setIndex((i) => Math.min(i + 1, TOTAL));
  }, []);
  const prev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);
  const reset = useCallback(() => setIndex(0), []);

  // Keyboard: arrow keys advance/retreat when the viewport is in view
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = viewportRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const inView =
        rect.bottom > 0 && rect.top < window.innerHeight && rect.height > 0;
      if (!inView) return;

      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        prev();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // Styles for each card based on its offset from the active one.
  // Peeling uses a 3D rotateY flip around the card's left edge — so the
  // right edge lifts toward the viewer and sweeps left, revealing the
  // next card underneath. This reads as a real "page peel" rather than
  // a slide-off.
  const cardStyle = useCallback(
    (i: number): React.CSSProperties => {
      if (i < active) {
        // Peeled away — flipped left around its left edge
        return {
          transform:
            "translateX(-8%) rotateY(-155deg) rotateZ(-4deg)",
          opacity: 0,
          pointerEvents: "none",
          zIndex: 0,
        };
      }
      if (i === active && !done) {
        return {
          transform: "translate(0, 0) rotateY(0deg) rotateZ(0deg)",
          opacity: 1,
          zIndex: TOTAL,
          cursor: "pointer",
        };
      }
      if (done) {
        return {
          transform:
            "translateX(-8%) rotateY(-155deg) rotateZ(-4deg)",
          opacity: 0,
          pointerEvents: "none",
        };
      }
      const depth = i - active;
      if (depth <= 3) {
        return {
          transform: `translate(${depth * 4}px, ${depth * 4}px) rotate(${depth * 0.6}deg)`,
          opacity: Math.max(0.35, 1 - depth * 0.22),
          zIndex: TOTAL - depth,
          pointerEvents: "none",
        };
      }
      return { opacity: 0, pointerEvents: "none", zIndex: 0 };
    },
    [active, done]
  );

  const counter = useMemo(() => {
    const current = Math.min(active + 1, TOTAL);
    return `${String(current).padStart(2, "0")} / ${TOTAL}`;
  }, [active]);

  const containerClass = standalone ? s.standalone : s.section;

  return (
    <div
      id={standalone ? undefined : "curriculum"}
      className={containerClass}
      ref={viewportRef}
    >
      {!standalone && (
        <div className={`${s.sectionHeader} ${s.sectionHeaderVisible}`}>
          <div className={s.sectionLabel}>What you get</div>
          <h2 className={s.sectionTitle}>12 Lessons. Peel to preview.</h2>
        </div>
      )}

      <div className={`${s.cardCounter} ${s.cardCounterVisible}`}>
        {done ? `${TOTAL} / ${TOTAL}` : counter}
      </div>

      <div className={`${s.deckViewport} ${s.deckViewportVisible}`}>
        <div
          className={s.deckShadow}
          style={{
            transform: "translate(8px, 8px) rotate(1.5deg)",
            opacity: TOTAL - active > 2 ? 1 : 0,
          }}
        />
        <div
          className={s.deckShadow}
          style={{
            transform: "translate(4px, 4px) rotate(0.7deg)",
            opacity: TOTAL - active > 1 ? 1 : 0,
          }}
        />

        {LESSONS.map((lesson, i) => (
          <div
            key={i}
            className={s.deckCard}
            style={cardStyle(i)}
            onClick={() => {
              if (i === active && !done) next();
            }}
            role={i === active && !done ? "button" : undefined}
            aria-label={
              i === active && !done
                ? `Peel lesson ${lesson.num}: ${lesson.title}`
                : undefined
            }
            tabIndex={i === active && !done ? 0 : -1}
            onKeyDown={(e) => {
              if (i !== active || done) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                next();
              }
            }}
          >
            <div className={s.cardNum}>{lesson.num}</div>
            <div
              className={s.cardTitle}
              style={lesson.titleStyle ? { textTransform: "none" } : undefined}
            >
              {lesson.title}
            </div>
            <div className={s.cardQuestion}>&ldquo;{lesson.q}&rdquo;</div>
            {i === active && !done && (
              <div className={s.peelHint}>click / tap / &rarr; to peel</div>
            )}
          </div>
        ))}

        {done && (
          <div className={s.doneCard}>
            <div className={s.doneLabel}>End of deck</div>
            <div className={s.doneTitle}>You&rsquo;ve seen all 12.</div>
            <button type="button" className={s.doneBtn} onClick={reset}>
              Re-stack &larr;
            </button>
          </div>
        )}
      </div>

      <div className={s.controls}>
        <button
          type="button"
          className={s.ctrlBtn}
          onClick={prev}
          disabled={active === 0 && !done}
          aria-label="Previous lesson"
        >
          &larr; Prev
        </button>
        <button
          type="button"
          className={s.ctrlBtn}
          onClick={next}
          disabled={done}
          aria-label="Next lesson"
        >
          Peel &rarr;
        </button>
      </div>
    </div>
  );
}
