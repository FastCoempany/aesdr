"use client";

import { useEffect, useRef } from "react";
import s from "./LandingSequence.module.css";

/* ── Typed confession scenes ── */
const SCENES = [
  { segments: [{ text: "So here's the scenario.", style: "" }], charDelay: 38, holdAfter: 1000, exit: "fade-out", exitWait: 600 },
  { segments: [{ text: "You're an ", style: "" }, { text: "AE", style: "iris" }, { text: ". Or an ", style: "" }, { text: "SDR", style: "iris" }, { text: ".", style: "" }], charDelay: 42, holdAfter: 1200, exit: "dissolve", exitWait: 800 },
  { segments: [{ text: 'You set your alarm for 6am on Sunday to "lock in" this week.', style: "" }], charDelay: 28, holdAfter: 500, exit: null, exitWait: 0 },
  { segments: [{ text: "It's Saturday again.", style: "" }], charDelay: 52, holdAfter: 700, exit: null, exitWait: 0 },
  { segments: [{ text: "You didn't lock in at all.", style: "" }], charDelay: 40, holdAfter: 0, exit: null, exitWait: 0 },
];

const TERM_LINES = [
  "> scanning your phone...",
  "> found: morning routine app. habit tracker. focus timer. cold plunge video.",
  "> total: 11 productivity apps.",
  "> diagnosis: least productive person you know.",
  "> screen time: 7 hours. 4 downloading apps about using your phone less.",
];

const ZOOM_CARDS: {
  voice: "rowan" | "michael";
  ghost?: string;
  headline: string;
  sub?: string;
  fontSize: string;
}[] = [
  { voice: "rowan", ghost: "RESET", headline: 'Every month, they reset your number to <span class="iris">zero.</span>', sub: "And every month, you act surprised. You don\u2019t have a pipeline problem. You have a denial problem. The math has been screaming at you for weeks.", fontSize: "clamp(36px,7vw,80px)" },
  { voice: "michael", headline: "My manager asked for a pipeline update. I sent a screenshot of an empty spreadsheet and wrote \u201Cminimalist aesthetic.\u201D He did not laugh. HR laughed. But like, in a concerned way.", fontSize: "clamp(22px,3.5vw,42px)" },
  { voice: "rowan", ghost: "LOST", headline: 'You are not building a career. You are <span class="iris">surviving</span> one.', sub: "The next promotion is not coming. Not because you\u2019re bad \u2014 because nobody has taught you what good looks like. You\u2019re guessing. Loudly.", fontSize: "clamp(36px,7vw,80px)" },
  { voice: "michael", headline: "My mom asked about my five-year plan. I said \u201Csurvive Q3.\u201D She said that\u2019s three months, not five years. I said we don\u2019t really plan past three months in SaaS. She started crying. I started crying. We had pasta.", fontSize: "clamp(22px,3.5vw,42px)" },
  { voice: "rowan", ghost: "NOISE", headline: 'The people advising you haven\u2019t carried a bag in a <span class="iris">decade.</span>', sub: "\u201CJust add value.\u201D \u201CBe a trusted advisor.\u201D \u201CCrush it.\u201D None of it is actionable. All of it is noise from people who forgot what it feels like to miss.", fontSize: "clamp(32px,6vw,72px)" },
  { voice: "michael", headline: "LinkedIn told me to \u201Clead with value on every call.\u201D So I told a prospect about a really good taco place near their office. Very detailed review. Salsa rankings. They did not buy. But the tacos are genuinely excellent. I stand by the recommendation.", fontSize: "clamp(22px,3.5vw,42px)" },
  { voice: "rowan", ghost: "ALONE", headline: 'Your onboarding was a <span class="iris">crime scene.</span>', sub: "A week of shadowing. A Gong playlist. A prayer. That is not training. That is abandonment with a Slack channel.", fontSize: "clamp(32px,6vw,72px)" },
  { voice: "michael", headline: "It\u2019s 11:47pm. I\u2019m watching a YouTube video called \u201CCRUSH Cold Calls in 2024.\u201D The guy has a ring light and a Ferrari poster. I\u2019m taking notes. In my phone. This is my professional development. I have a degree. From a university. With a campus.", fontSize: "clamp(22px,3.5vw,42px)" },
];

/* ── Helpers ── */
type Seg = { text: string; style: string };
type Char = { ch: string; style: string };

function flattenSegs(segs: Seg[]): Char[] {
  const out: Char[] = [];
  for (const seg of segs) for (const ch of seg.text) out.push({ ch, style: seg.style });
  return out;
}

function buildHTML(arr: Char[], irisClass: string): string {
  let h = "", cur: string | null = null;
  for (const { ch, style } of arr) {
    if (style !== cur) {
      if (cur) h += "</span>";
      if (style) h += `<span class="${style === "iris" ? irisClass : ""}">`;
      cur = style;
    }
    h += ch;
  }
  if (cur) h += "</span>";
  return h;
}

export default function LandingSequence() {
  const heroRef = useRef<HTMLDivElement>(null);
  const confessionRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const termBodyRef = useRef<HTMLDivElement>(null);
  const termOutputRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollSpaceRef = useRef<HTMLDivElement>(null);
  const sideMarkerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /* ── Mutable animation state ── */
    let paused = false;
    let done = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let sceneIdx = 0;
    let charIdx = 0;
    let typedChars: Char[] = [];
    let lineEl: HTMLDivElement | null = null;
    let scrollHandler: (() => void) | null = null;
    let resizeHandler: (() => void) | null = null;

    document.body.style.overflow = "hidden";

    /* ── Confession typing ── */
    function typeSceneChar(flat: Char[], scene: typeof SCENES[0]) {
      if (paused || done || !lineEl) return;
      if (charIdx >= flat.length) {
        lineEl.innerHTML = buildHTML(typedChars, s.irisText);
        timer = setTimeout(() => {
          if (paused || done) return;
          if (scene.exit && lineEl) {
            lineEl.classList.add(scene.exit === "fade-out" ? s.tlineFadeOut : s.tlineDissolve);
            timer = setTimeout(() => { sceneIdx++; startScene(); }, scene.exitWait);
          } else { sceneIdx++; startScene(); }
        }, scene.holdAfter);
        return;
      }
      typedChars.push(flat[charIdx]);
      charIdx++;
      lineEl.innerHTML = buildHTML(typedChars, s.irisText) + `<span class="${s.cursor}"></span>`;
      timer = setTimeout(() => typeSceneChar(flat, scene), scene.charDelay + Math.random() * 18);
    }

    function startScene() {
      if (paused || done) return;
      if (sceneIdx >= SCENES.length) {
        timer = setTimeout(showTerminal, 800);
        return;
      }
      typedChars = [];
      charIdx = 0;
      const el = document.createElement("div");
      el.className = s.tline;
      typingRef.current?.appendChild(el);
      lineEl = el;
      typeSceneChar(flattenSegs(SCENES[sceneIdx].segments), SCENES[sceneIdx]);
    }

    /* ── Terminal ── */
    function showTerminal() {
      done = true;
      if (confessionRef.current) {
        confessionRef.current.style.transition = "opacity 0.5s ease";
        confessionRef.current.style.opacity = "0";
      }
      setTimeout(() => {
        terminalRef.current?.classList.add(s.terminalLayerActive);
        typeTermLines(0);
      }, 500);
    }

    function typeTermLines(idx: number) {
      const lines = termBodyRef.current?.querySelectorAll<HTMLElement>(`.${s.termLine}`);
      if (!lines || idx >= lines.length) {
        setTimeout(() => {
          termOutputRef.current?.classList.add(s.termOutputVisible);
          setTimeout(() => {
            scrollHintRef.current?.classList.add(s.scrollHintVisible);
            unlockScroll();
          }, 800);
        }, 500);
        return;
      }
      const line = lines[idx];
      const span = line.querySelector("span:last-child") as HTMLElement;
      const fullText = (line.getAttribute("data-text") ?? "").replace(/^> /, "");
      line.classList.add(s.termLineVisible);
      let ci = 0;
      function typeChar() {
        if (ci >= fullText.length) {
          span.textContent = fullText;
          setTimeout(() => typeTermLines(idx + 1), 300);
          return;
        }
        ci++;
        span.innerHTML = fullText.substring(0, ci) + `<span class="${s.termCursor}"></span>`;
        setTimeout(typeChar, 18 + Math.random() * 12);
      }
      typeChar();
    }

    /* ── Scroll + Zoom ── */
    function unlockScroll() {
      document.body.style.overflow = "visible";
      document.body.style.overflowX = "hidden";

      setTimeout(() => {
        viewportRef.current?.classList.add(s.viewportActive);
        sideMarkerRef.current?.classList.add(s.sideMarkerActive);
        progressRef.current?.classList.add(s.scrollProgressActive);
      }, 200);

      scrollHandler = function updateZoom() {
        const sp = scrollSpaceRef.current;
        const vp = viewportRef.current;
        if (!sp || !vp) return;

        const heroH = window.innerHeight;
        const scrollY = Math.max(0, window.scrollY - heroH);
        const zoomHeight = sp.offsetHeight;
        const maxScroll = zoomHeight - window.innerHeight;
        if (maxScroll <= 0) return;

        const pastZoom = window.scrollY > heroH + zoomHeight;
        if (pastZoom) {
          vp.style.opacity = "0";
          vp.style.pointerEvents = "none";
          if (sideMarkerRef.current) sideMarkerRef.current.style.opacity = "0";
          if (progressRef.current) progressRef.current.style.opacity = "0";
          ctaRef.current?.classList.remove(s.ctaOverlayVisible);
          if (ctaRef.current) {
            ctaRef.current.style.transition = "none";
            ctaRef.current.style.opacity = "0";
            ctaRef.current.style.display = "none";
            ctaRef.current.style.pointerEvents = "none";
          }
          return;
        }
        vp.style.opacity = "";
        vp.style.pointerEvents = "";
        if (sideMarkerRef.current) sideMarkerRef.current.style.opacity = "";
        if (progressRef.current) progressRef.current.style.opacity = "";
        if (ctaRef.current) {
          ctaRef.current.style.pointerEvents = "";
          ctaRef.current.style.transition = "";
          ctaRef.current.style.display = "";
        }

        const progress = Math.min(1, scrollY / maxScroll);
        if (progressRef.current) progressRef.current.style.width = (progress * 100) + "%";

        const totalCards = ZOOM_CARDS.length;
        const cardProgress = progress * totalCards;
        const activeIndex = Math.min(Math.floor(cardProgress), totalCards - 1);
        const cardFrac = cardProgress - activeIndex;

        const cards = vp.querySelectorAll<HTMLElement>(`.${s.zcard}`);
        cards.forEach((card, i) => {
          if (i === activeIndex) {
            let scale: number, op: number;
            if (cardFrac < 0.12) { const t = cardFrac / 0.12; scale = 2.5 - 1.5 * t; op = t; }
            else if (cardFrac < 0.78) { scale = 1; op = 1; }
            else { const t = (cardFrac - 0.78) / 0.22; scale = 1 - 0.6 * t; op = 1 - t; }
            card.style.transform = `scale(${scale})`;
            card.style.opacity = String(op);
          } else {
            card.style.opacity = "0";
          }
        });

        const dots = sideMarkerRef.current?.querySelectorAll<HTMLElement>(`.${s.markerDot}`);
        dots?.forEach((dot, i) => dot.classList.toggle(s.markerDotActive, i === activeIndex));

        if (progress > 0.88 && progress < 0.97) {
          const fadeIn = Math.min(1, (progress - 0.88) / 0.02);
          const fadeOut = progress > 0.93 ? 1 - Math.min(1, (progress - 0.93) / 0.03) : 1;
          const op = fadeIn * fadeOut;
          if (ctaRef.current) {
            ctaRef.current.classList.add(s.ctaOverlayVisible);
            ctaRef.current.style.opacity = String(op);
          }
        } else {
          ctaRef.current?.classList.remove(s.ctaOverlayVisible);
          if (ctaRef.current) {
            ctaRef.current.style.opacity = "0";
            ctaRef.current.style.display = progress >= 0.97 ? "none" : "";
          }
        }

        if (scrollY > 50 && heroRef.current) {
          if (terminalRef.current) terminalRef.current.style.opacity = "0";
          heroRef.current.style.opacity = String(Math.max(0, 1 - scrollY / 300));
        }
      };

      resizeHandler = scrollHandler;
      window.addEventListener("scroll", scrollHandler, { passive: true });
      window.addEventListener("resize", resizeHandler);
      scrollHandler();
    }


    /* ── Start sequence — go straight to typed confession ── */
    const initTimer = setTimeout(() => {
      confessionRef.current?.classList.add(s.confessionLayerActive);
      setTimeout(startScene, 400);
    }, 1200);

    /* ── Cleanup ── */
    return () => {
      clearTimeout(initTimer);
      if (timer) clearTimeout(timer);
      if (scrollHandler) window.removeEventListener("scroll", scrollHandler);
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      document.body.style.overflow = "";
      document.body.style.overflowX = "";
    };
  }, []);

  return (
    <>
      <div className={s.hero} ref={heroRef}>
        <div className={s.ambientLine} />
        <div className={`${s.corner} ${s.cornerTL}`} />
        <div className={`${s.corner} ${s.cornerTR}`} />
        <div className={`${s.corner} ${s.cornerBL}`} />
        <div className={`${s.corner} ${s.cornerBR}`} />

        <div className={s.confessionLayer} ref={confessionRef}>
          <div className={s.typingArea} ref={typingRef} />
        </div>

        <div className={s.terminalLayer} ref={terminalRef}>
          <div className={s.terminal}>
            <div className={s.termBar}>
              <div className={`${s.termDot} ${s.termDotR}`} />
              <div className={`${s.termDot} ${s.termDotY}`} />
              <div className={`${s.termDot} ${s.termDotG}`} />
              <span className={s.termTitle}>you_already_knew.exe</span>
            </div>
            <div className={s.termBody} ref={termBodyRef}>
              {TERM_LINES.map((line, i) => (
                <div key={i} className={s.termLine} data-text={line}>
                  <span className={s.prompt}>&gt;</span>{" "}
                  <span />
                </div>
              ))}
              <div className={s.termOutput} ref={termOutputRef}>
                This course will change your life a few times throughout. Afterward, you&rsquo;ll never make the same money again.
                <div className={s.termWhisper}>Keep scrolling. It has to get worse before it gets better.</div>
              </div>
            </div>
          </div>
        </div>

        <div className={s.scrollHint} ref={scrollHintRef}>
          <span className={s.scrollHintText}>scroll</span>
          <div className={s.scrollHintBar} />
        </div>
      </div>

      {/* Zoom section — all hidden via CSS until JS activates */}
      <div className={s.scrollProgress} ref={progressRef} />

      <div className={s.sideMarker} ref={sideMarkerRef}>
        {ZOOM_CARDS.map((_, i) => <div key={i} className={s.markerDot} />)}
      </div>

      <div className={s.scrollSpace} ref={scrollSpaceRef} />

      <div className={s.viewport} ref={viewportRef} style={{ display: "none" }}>
        {ZOOM_CARDS.map((card, i) => (
          <div key={i} className={s.zcard}>
            {card.ghost && <div className={s.ghost}>{card.ghost}</div>}
            <div className={s.zcardInner}>
              <div
                className={card.voice === "rowan" ? s.zRowan : s.zMichael}
                style={{ fontSize: card.fontSize }}
                dangerouslySetInnerHTML={{
                  __html: card.headline.replace(/class="iris"/g, `class="${s.irisText}"`),
                }}
              />
              {card.sub && <div className={s.zSub}>{card.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className={s.ctaOverlay} ref={ctaRef} style={{ display: "none" }}>
        <div className={`${s.ctaBrand} ${s.irisText}`}>AESDR</div>
        <div className={s.ctaTag}>12 lessons &bull; at your own pace &bull; 1 you</div>
        <div className={s.ctaNote}>Nobody gave you real answers on day one. We built this after years of figuring it out alone.</div>
        <a href="#pricing" className={s.ctaButton}>Get Access &rarr;</a>
      </div>
    </>
  );
}
