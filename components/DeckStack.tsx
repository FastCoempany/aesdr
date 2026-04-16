"use client";

import { useEffect, useRef } from "react";
import s from "./DeckStack.module.css";

const LESSONS = [
  { num: "01", title: "Building Real Camaraderie", q: "When\u2019s the last time your team felt like an actual team?", titleStyle: undefined as string | undefined },
  { num: "02", title: "Breaking Down Silos", q: "How many deals died in the handoff you never talked about?", titleStyle: undefined as string | undefined },
  { num: "03", title: "Performance Pitfalls", q: "Are you getting better \u2014 or just getting by?", titleStyle: undefined as string | undefined },
  { num: "04", title: "Navigating Manager Madness", q: "Does your manager coach you\u2026 or just count your calls and faults?", titleStyle: undefined as string | undefined },
  { num: "05", title: "tHe SaLeS pLaYbOoK", q: "What\u2019s your system? And if you don\u2019t have one \u2014 what have you been doing?\n(If you got it from somewhere on LinkedIn \u2014 you\u2019ll need more than this course can offer, but definitely start here. Now.)", titleStyle: "none" },
  { num: "06", title: "bEyOnD tHe SaLeS pLaYbOoK", q: "What do you do when the script runs out and you\u2019re live?", titleStyle: "none" },
  { num: "07", title: "Prospecting & Pipeline", q: "If inbound dried up tomorrow, would you survive?", titleStyle: undefined as string | undefined },
  { num: "08", title: "The 30% Rule", q: "What\u2019s your actual close rate? Not the one you told your VP.", titleStyle: undefined as string | undefined },
  { num: "09", title: "CRM Survival Guide", q: "Is your CRM protecting you \u2014 or building the case against you?", titleStyle: undefined as string | undefined },
  { num: "10", title: "Breaking Down the Commission Myth", q: "Can you survive three bad months in a row? Mentally? Financially?", titleStyle: undefined as string | undefined },
  { num: "11", title: "Sober Selling", q: "What if the problem is bigger than your process \u2014 what if it\u2019s what you\u2019re doing when no one\u2019s watching?\n(21+ sober \u2014 not metaphorical sober.)", titleStyle: undefined as string | undefined },
  { num: "12", title: "Leveling Up SaaS Relationships", q: "Who would vouch for you if you changed companies tomorrow?", titleStyle: undefined as string | undefined },
];

const TOTAL = LESSONS.length;
const EDGE_ZONE = 0.12; // 12% on each side = edge scroll zone

export default function DeckStack() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const shadow1Ref = useRef<HTMLDivElement>(null);
  const shadow2Ref = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef(0);
  const mouseXRef = useRef(0);
  const snappingRef = useRef(false);

  useEffect(() => {
    let raf: number | null = null;

    function renderCards() {
      const progress = progressRef.current;
      const activeIndex = Math.min(Math.floor(progress), TOTAL - 1);
      const cardFrac = progress - activeIndex;

      if (counterRef.current) {
        const current = Math.min(activeIndex + 1, TOTAL);
        counterRef.current.textContent =
          String(current).padStart(2, "0") + " / " + TOTAL;
      }

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        if (i < activeIndex) {
          card.style.transform = "translateX(-120%) rotate(-8deg)";
          card.style.opacity = "0";
        } else if (i === activeIndex) {
          if (cardFrac < 0.7) {
            card.style.transform = "translateX(0) rotate(0deg)";
            card.style.opacity = "1";
          } else {
            const t = (cardFrac - 0.7) / 0.3;
            card.style.transform = `translateX(${t * -120}%) rotate(${t * -8}deg)`;
            card.style.opacity = String(1 - t);
          }
        } else {
          const depth = i - activeIndex;
          if (depth <= 3) {
            card.style.transform = `translate(${depth * 3}px, ${depth * 3}px) rotate(${depth * 0.5}deg)`;
            card.style.opacity = String(Math.max(0.3, 1 - depth * 0.25));
          } else {
            card.style.opacity = "0";
          }
        }
      });

      const remaining = TOTAL - activeIndex;
      if (shadow1Ref.current) shadow1Ref.current.style.opacity = remaining > 1 ? "1" : "0";
      if (shadow2Ref.current) shadow2Ref.current.style.opacity = remaining > 2 ? "1" : "0";
    }

    function isInCenterZone(): boolean {
      const x = mouseXRef.current;
      const w = window.innerWidth;
      const leftEdge = w * EDGE_ZONE;
      const rightEdge = w * (1 - EDGE_ZONE);
      return x > leftEdge && x < rightEdge;
    }

    function handleWheel(e: WheelEvent) {
      const el = sectionRef.current;
      if (!el) return;
      if (!isInCenterZone()) return;

      const rect = el.getBoundingClientRect();
      const progress = progressRef.current;

      // While snapping to section, block all wheel events
      if (snappingRef.current) {
        e.preventDefault();
        return;
      }

      // Section approaching from below — snap to it
      if (rect.top > 0 && rect.top < window.innerHeight * 0.7 && e.deltaY > 0 && progress <= 0) {
        e.preventDefault();
        snappingRef.current = true;
        const targetY = window.scrollY + rect.top;
        window.scrollTo({ top: targetY, behavior: "smooth" });
        setTimeout(() => { snappingRef.current = false; }, 600);
        return;
      }

      // Section must be roughly filling the viewport for card peel
      const aligned = rect.top <= 80 && rect.bottom >= window.innerHeight - 80;
      if (!aligned) return;

      // At boundaries, let page scroll through
      if (progress <= 0 && e.deltaY < 0) return;
      if (progress >= TOTAL && e.deltaY > 0) return;

      e.preventDefault();

      // Normalize deltaY: mouse wheel ~100, trackpad ~1-30
      const delta = Math.abs(e.deltaY) > 50
        ? (e.deltaY > 0 ? 1 : -1) * 0.18
        : (e.deltaY / 100) * 0.18;

      progressRef.current = Math.max(0, Math.min(TOTAL, progress + delta));

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(renderCards);
    }

    function handleMouseMove(e: MouseEvent) {
      mouseXRef.current = e.clientX;
    }

    function handleScroll() {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;

      if (inView) {
        headerRef.current?.classList.add(s.sectionHeaderVisible);
        counterRef.current?.classList.add(s.cardCounterVisible);
        viewportRef.current?.classList.add(s.deckViewportVisible);
      } else {
        headerRef.current?.classList.remove(s.sectionHeaderVisible);
        counterRef.current?.classList.remove(s.cardCounterVisible);
        viewportRef.current?.classList.remove(s.deckViewportVisible);
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial render
    renderCards();
    handleScroll();

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className={s.section} ref={sectionRef}>
      <div className={s.sectionHeader} ref={headerRef}>
        <div className={s.sectionLabel}>What you get</div>
        <h2 className={s.sectionTitle}>12 Lessons. Peel to preview.</h2>
      </div>

      <div className={s.cardCounter} ref={counterRef}>01 / 12</div>

      <div className={s.deckViewport} ref={viewportRef}>
        <div
          className={s.deckShadow}
          ref={shadow2Ref}
          style={{ transform: "translate(8px, 8px) rotate(1.5deg)" }}
        />
        <div
          className={s.deckShadow}
          ref={shadow1Ref}
          style={{ transform: "translate(4px, 4px) rotate(0.7deg)" }}
        />
        {LESSONS.map((lesson, i) => (
          <div
            key={i}
            className={s.deckCard}
            style={{ zIndex: TOTAL - i }}
            ref={(el) => { cardsRef.current[i] = el; }}
          >
            <div className={s.cardNum}>{lesson.num}</div>
            <div className={s.cardTitle} style={lesson.titleStyle ? { textTransform: "none" } : undefined}>{lesson.title}</div>
            <div className={s.cardQuestion}>&ldquo;{lesson.q}&rdquo;</div>
          </div>
        ))}
      </div>
    </div>
  );
}
