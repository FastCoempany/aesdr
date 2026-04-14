"use client";

import { useEffect, useRef } from "react";
import s from "./DeckStack.module.css";

const LESSONS = [
  { num: "01", title: "Building Real Camaraderie", q: "When\u2019s the last time your team felt like an actual team?" },
  { num: "02", title: "Breaking Down Silos", q: "How many deals died in the handoff you never talked about?" },
  { num: "03", title: "Performance Pitfalls", q: "Are you getting better \u2014 or just getting by?" },
  { num: "04", title: "Navigating Manager Madness", q: "Does your manager coach you\u2026 or just count your calls?" },
  { num: "05", title: "The Sales Playbook", q: "What\u2019s your system? And if you don\u2019t have one \u2014 what have you been doing?" },
  { num: "06", title: "Beyond the Sales Playbook", q: "What do you do when the script runs out and you\u2019re live?" },
  { num: "07", title: "Prospecting & Pipeline", q: "If inbound dried up tomorrow, would you survive?" },
  { num: "08", title: "The 30% Rule", q: "What\u2019s your actual close rate? Not the one you told your VP." },
  { num: "09", title: "Salesforce Survival Guide", q: "Is your CRM protecting you \u2014 or building the case against you?" },
  { num: "10", title: "Breaking Down the Commission Myth", q: "Can you survive three bad months in a row? Financially?" },
  { num: "11", title: "Sober Selling", q: "What if the problem isn\u2019t your energy \u2014 it\u2019s your process?" },
  { num: "12", title: "Leveling Up SaaS Relationships", q: "Who would vouch for you if you changed companies tomorrow?" },
];

export default function DeckStack() {
  const scrollSpaceRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const shadow1Ref = useRef<HTMLDivElement>(null);
  const shadow2Ref = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    function update() {
      const sp = scrollSpaceRef.current;
      const vp = viewportRef.current;
      if (!sp || !vp) return;

      const rect = sp.getBoundingClientRect();
      const spTop = window.scrollY + rect.top;
      const scrollY = Math.max(0, window.scrollY - spTop);
      const maxScroll = sp.offsetHeight - window.innerHeight;
      if (maxScroll <= 0) return;

      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      const pastSection = rect.bottom <= 0;

      if (!inView || pastSection) {
        headerRef.current?.classList.remove(s.sectionHeaderVisible);
        counterRef.current?.classList.remove(s.cardCounterVisible);
        viewportRef.current?.classList.remove(s.deckViewportVisible);
        hintRef.current?.classList.remove(s.scrollHintVisible);
        return;
      }

      headerRef.current?.classList.add(s.sectionHeaderVisible);
      counterRef.current?.classList.add(s.cardCounterVisible);
      viewportRef.current?.classList.add(s.deckViewportVisible);

      const progress = Math.min(1, scrollY / maxScroll);
      const totalCards = LESSONS.length;
      const cardProgress = progress * totalCards;
      const activeIndex = Math.min(Math.floor(cardProgress), totalCards - 1);
      const cardFrac = cardProgress - activeIndex;

      // Counter
      if (counterRef.current) {
        const current = Math.min(activeIndex + 1, totalCards);
        counterRef.current.textContent =
          String(current).padStart(2, "0") + " / " + totalCards;
      }

      // Scroll hint
      if (activeIndex > 0) hintRef.current?.classList.remove(s.scrollHintVisible);
      else hintRef.current?.classList.add(s.scrollHintVisible);

      // Animate cards
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
            const x = t * -120;
            const r = t * -8;
            card.style.transform = `translateX(${x}%) rotate(${r}deg)`;
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

      // Shadows
      const remaining = totalCards - activeIndex;
      if (shadow1Ref.current) shadow1Ref.current.style.opacity = remaining > 1 ? "1" : "0";
      if (shadow2Ref.current) shadow2Ref.current.style.opacity = remaining > 2 ? "1" : "0";
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <>
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
            style={{ zIndex: LESSONS.length - i }}
            ref={(el) => { cardsRef.current[i] = el; }}
          >
            <div className={s.cardNum}>{lesson.num}</div>
            <div className={s.cardTitle}>{lesson.title}</div>
            <div className={s.cardQuestion}>&ldquo;{lesson.q}&rdquo;</div>
          </div>
        ))}
      </div>

      <div className={s.scrollHint} ref={hintRef}>
        <span className={s.scrollHintText}>scroll to peel</span>
        <div className={s.scrollHintBar} />
      </div>

      <div className={s.scrollSpace} ref={scrollSpaceRef} />
    </>
  );
}
