"use client";

import { useEffect, useRef, useCallback } from "react";
import s from "./LandingSequence.module.css";

/* ── Typed confession scenes ── */
type Segment = { text: string; style: string };
type Scene = {
  segments: Segment[];
  charDelay: number;
  holdAfter: number;
  exit: string | null;
  exitWait: number;
};

const SCENES: Scene[] = [
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

/* ── Zoom card data ── */
const ZOOM_CARDS: {
  voice: "rowan" | "michael";
  ghost?: string;
  headline: string;
  sub?: string;
  fontSize: string;
}[] = [
  {
    voice: "rowan", ghost: "RESET",
    headline: 'Every month, they reset your number to <span class="iris">zero.</span>',
    sub: "And every month, you act surprised. You don\u2019t have a pipeline problem. You have a denial problem. The math has been screaming at you for weeks.",
    fontSize: "clamp(36px,7vw,80px)",
  },
  {
    voice: "michael",
    headline: "My manager asked for a pipeline update.<br>I sent a screenshot of an empty spreadsheet<br>and wrote \u201Cminimalist aesthetic.\u201D<br><br>He did not laugh.<br>HR laughed. But like, in a concerned way.",
    fontSize: "clamp(22px,3.5vw,42px)",
  },
  {
    voice: "rowan", ghost: "LOST",
    headline: 'You are not building a career. You are <span class="iris">surviving</span> one.',
    sub: "The next promotion is not coming. Not because you\u2019re bad \u2014 because nobody has taught you what good looks like. You\u2019re guessing. Loudly.",
    fontSize: "clamp(36px,7vw,80px)",
  },
  {
    voice: "michael",
    headline: "My mom asked about my five-year plan.<br>I said \u201Csurvive Q3.\u201D<br>She said that\u2019s three months, not five years.<br><br>I said we don\u2019t really plan past three months in SaaS.<br>She started crying. I started crying.<br>We had pasta.",
    fontSize: "clamp(22px,3.5vw,42px)",
  },
  {
    voice: "rowan", ghost: "NOISE",
    headline: 'The people advising you haven\u2019t carried a bag in a <span class="iris">decade.</span>',
    sub: "\u201CJust add value.\u201D \u201CBe a trusted advisor.\u201D \u201CCrush it.\u201D None of it is actionable. All of it is noise from people who forgot what it feels like to miss.",
    fontSize: "clamp(32px,6vw,72px)",
  },
  {
    voice: "michael",
    headline: "LinkedIn told me to \u201Clead with value on every call.\u201D<br>So I told a prospect about a really good taco place<br>near their office. Very detailed review. Salsa rankings.<br><br>They did not buy.<br>But the tacos are genuinely excellent.<br>I stand by the recommendation.",
    fontSize: "clamp(22px,3.5vw,42px)",
  },
  {
    voice: "rowan", ghost: "ALONE",
    headline: 'Your onboarding was a <span class="iris">crime scene.</span>',
    sub: "A week of shadowing. A Gong playlist. A prayer. That is not training. That is abandonment with a Slack channel.",
    fontSize: "clamp(32px,6vw,72px)",
  },
  {
    voice: "michael",
    headline: "It\u2019s 11:47pm. I\u2019m watching a YouTube video called<br>\u201CCRUSH Cold Calls in 2024.\u201D<br>The guy has a ring light and a Ferrari poster.<br><br>I\u2019m taking notes. In my phone.<br>This is my professional development.<br>I have a degree. From a university. With a campus.",
    fontSize: "clamp(22px,3.5vw,42px)",
  },
];

/* ── Helpers ── */
function flattenSegs(segs: Segment[]) {
  const out: { ch: string; style: string }[] = [];
  for (const seg of segs) for (const ch of seg.text) out.push({ ch, style: seg.style });
  return out;
}
function buildHTML(arr: { ch: string; style: string }[]) {
  let h = "", cur: string | null = null;
  for (const { ch, style } of arr) {
    if (style !== cur) {
      if (cur) h += "</span>";
      if (style) h += `<span class="${style === "iris" ? s.irisText : ""}">`;
      cur = style;
    }
    h += ch;
  }
  if (cur) h += "</span>";
  return h;
}

export default function LandingSequence() {
  /* Refs for DOM nodes */
  const heroRef = useRef<HTMLDivElement>(null);
  const warningRef = useRef<HTMLDivElement>(null);
  const confessionRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const termBodyRef = useRef<HTMLDivElement>(null);
  const termOutputRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const rereadRef = useRef<HTMLDivElement>(null);
  const continueRef = useRef<HTMLDivElement>(null);

  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollSpaceRef = useRef<HTMLDivElement>(null);
  const sideMarkerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  /* Mutable state for animation control */
  const state = useRef({
    paused: false,
    done: false,
    timer: null as ReturnType<typeof setTimeout> | null,
    sceneIdx: 0,
    charIdx: 0,
    typedChars: [] as { ch: string; style: string }[],
    lineEl: null as HTMLDivElement | null,
  });

  /* ── Confession typing engine ── */
  const typeSceneChar = useCallback((flat: { ch: string; style: string }[], scene: Scene) => {
    const st = state.current;
    if (st.paused || st.done || !st.lineEl) return;
    if (st.charIdx >= flat.length) {
      st.lineEl.innerHTML = buildHTML(st.typedChars);
      st.timer = setTimeout(() => {
        if (st.paused || st.done) return;
        if (scene.exit && st.lineEl) {
          st.lineEl.classList.add(scene.exit === "fade-out" ? s.tlineFadeOut : s.tlineDissolve);
          st.timer = setTimeout(() => { st.sceneIdx++; startScene(); }, scene.exitWait);
        } else { st.sceneIdx++; startScene(); }
      }, scene.holdAfter);
      return;
    }
    st.typedChars.push(flat[st.charIdx]);
    st.charIdx++;
    st.lineEl.innerHTML = buildHTML(st.typedChars) + `<span class="${s.cursor}"></span>`;
    st.timer = setTimeout(() => typeSceneChar(flat, scene), scene.charDelay + Math.random() * 18);
  }, []);

  const startScene = useCallback(() => {
    const st = state.current;
    if (st.paused || st.done) return;
    if (st.sceneIdx >= SCENES.length) {
      st.timer = setTimeout(showTerminal, 800);
      return;
    }
    st.typedChars = [];
    st.charIdx = 0;
    const el = document.createElement("div");
    el.className = s.tline;
    typingRef.current?.appendChild(el);
    st.lineEl = el;
    typeSceneChar(flattenSegs(SCENES[st.sceneIdx].segments), SCENES[st.sceneIdx]);
  }, [typeSceneChar]);

  /* ── Terminal typing ── */
  const showTerminal = useCallback(() => {
    const st = state.current;
    st.done = true;
    rereadRef.current?.classList.remove(s.rereadLinkVisible);

    if (confessionRef.current) {
      confessionRef.current.style.transition = "opacity 0.5s ease";
      confessionRef.current.style.opacity = "0";
    }
    if (warningRef.current) {
      warningRef.current.style.transition = "opacity 0.3s ease";
      warningRef.current.style.opacity = "0";
    }

    setTimeout(() => {
      terminalRef.current?.classList.add(s.terminalLayerActive);
      typeTermLines(0);
    }, 500);
  }, []);

  const typeTermLines = useCallback((idx: number) => {
    const lines = termBodyRef.current?.querySelectorAll(`.${s.termLine}`);
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

    const line = lines[idx] as HTMLElement;
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
  }, []);

  /* ── Unlock scroll + zoom engine ── */
  const unlockScroll = useCallback(() => {
    document.body.style.overflow = "visible";
    document.body.style.overflowX = "hidden";

    setTimeout(() => {
      viewportRef.current?.classList.add(s.viewportActive);
      sideMarkerRef.current?.classList.add(s.sideMarkerActive);
      progressRef.current?.classList.add(s.scrollProgressActive);
    }, 200);

    function updateZoom() {
      const sp = scrollSpaceRef.current;
      const vp = viewportRef.current;
      if (!sp || !vp) return;

      const heroH = window.innerHeight;
      const scrollY = Math.max(0, window.scrollY - heroH);
      const zoomHeight = sp.offsetHeight;
      const maxScroll = zoomHeight - window.innerHeight;
      if (maxScroll <= 0) return;

      /* Past the zoom section — hide fixed UI */
      const pastZoom = window.scrollY > heroH + zoomHeight;
      if (pastZoom) {
        vp.style.opacity = "0";
        sideMarkerRef.current && (sideMarkerRef.current.style.opacity = "0");
        progressRef.current && (progressRef.current.style.opacity = "0");
        ctaRef.current?.classList.remove(s.ctaOverlayVisible);
        return;
      }
      vp.style.opacity = "";
      sideMarkerRef.current && (sideMarkerRef.current.style.opacity = "");
      progressRef.current && (progressRef.current.style.opacity = "");

      const progress = Math.min(1, scrollY / maxScroll);
      if (progressRef.current) progressRef.current.style.width = (progress * 100) + "%";

      const totalCards = ZOOM_CARDS.length;
      const cardProgress = progress * totalCards;
      const activeIndex = Math.min(Math.floor(cardProgress), totalCards - 1);
      const cardFrac = cardProgress - activeIndex;

      const cards = vp.querySelectorAll(`.${s.zcard}`) as NodeListOf<HTMLElement>;
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

      const dots = sideMarkerRef.current?.querySelectorAll(`.${s.markerDot}`) as NodeListOf<HTMLElement> | undefined;
      dots?.forEach((dot, i) => dot.classList.toggle(s.markerDotActive, i === activeIndex));

      if (progress > 0.95) ctaRef.current?.classList.add(s.ctaOverlayVisible);
      else ctaRef.current?.classList.remove(s.ctaOverlayVisible);

      /* Fade hero */
      if (scrollY > 50 && heroRef.current) {
        if (terminalRef.current) terminalRef.current.style.opacity = "0";
        heroRef.current.style.opacity = String(Math.max(0, 1 - scrollY / 300));
      }
    }

    window.addEventListener("scroll", updateZoom, { passive: true });
    window.addEventListener("resize", updateZoom);
    updateZoom();
  }, []);

  /* ── Kick off animation on mount ── */
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const beginConfession = () => {
      warningRef.current?.classList.add(s.warningBoxPushed);
      setTimeout(() => {
        confessionRef.current?.classList.add(s.confessionLayerActive);
        rereadRef.current?.classList.add(s.rereadLinkVisible);
        setTimeout(startScene, 400);
      }, 300);
    };

    const initTimer = setTimeout(beginConfession, 6000);

    return () => {
      clearTimeout(initTimer);
      if (state.current.timer) clearTimeout(state.current.timer);
      document.body.style.overflow = "";
      document.body.style.overflowX = "";
    };
  }, [startScene]);

  /* ── Re-read / Continue handlers ── */
  const handleReread = useCallback(() => {
    const st = state.current;
    if (st.done) return;
    st.paused = true;
    if (st.timer) clearTimeout(st.timer);
    confessionRef.current?.classList.remove(s.confessionLayerActive);
    rereadRef.current?.classList.remove(s.rereadLinkVisible);
    warningRef.current?.classList.remove(s.warningBoxPushed);
    setTimeout(() => continueRef.current?.classList.add(s.continueLinkVisible), 600);
  }, []);

  const handleContinue = useCallback(() => {
    const st = state.current;
    continueRef.current?.classList.remove(s.continueLinkVisible);
    st.paused = false;
    warningRef.current?.classList.add(s.warningBoxPushed);
    setTimeout(() => {
      confessionRef.current?.classList.add(s.confessionLayerActive);
      rereadRef.current?.classList.add(s.rereadLinkVisible);
      setTimeout(() => {
        if (st.sceneIdx >= SCENES.length) st.timer = setTimeout(showTerminal, 800);
        else typeSceneChar(flattenSegs(SCENES[st.sceneIdx].segments), SCENES[st.sceneIdx]);
      }, 300);
    }, 300);
  }, [showTerminal, typeSceneChar]);

  return (
    <>
      {/* ── Hero / Animation Layer ── */}
      <div className={s.hero} ref={heroRef}>
        <div className={s.ambientLine} />
        <div className={`${s.corner} ${s.cornerTL}`} />
        <div className={`${s.corner} ${s.cornerTR}`} />
        <div className={`${s.corner} ${s.cornerBL}`} />
        <div className={`${s.corner} ${s.cornerBR}`} />

        <div className={s.warningBox} ref={warningRef}>
          <div className={s.warningHeader}>
            <div className={s.warningIcon}>!</div>
            <div className={s.warningTitle}>Content Warning</div>
          </div>
          <div className={s.warningBody}>
            This course contains uncomfortable truths about your{" "}
            <span className={s.highlight}>pipeline</span>, your{" "}
            <span className={s.highlight}>apartment</span>, your{" "}
            <span className={s.highlight}>bar tab</span>, your{" "}
            <span className={s.highlight}>commission check</span>, and your{" "}
            <span className={s.highlight}>relationship status</span>.
            <br /><br />
            Keep scrolling. It has to get worse before it gets better.
          </div>
          <div className={s.warningTag}>AESDR — 12 lessons / at your own pace / classified</div>
          <div
            className={s.continueLink}
            ref={continueRef}
            onClick={handleContinue}
          >
            continue &rarr;
          </div>
        </div>

        <div className={s.rereadLink} ref={rereadRef} onClick={handleReread}>
          <span className={s.rereadIcon}>!</span> re-read warning
        </div>

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
              </div>
            </div>
          </div>
        </div>

        <div className={s.scrollHint} ref={scrollHintRef}>
          <span className={s.scrollHintText}>scroll</span>
          <div className={s.scrollHintBar} />
        </div>
      </div>

      {/* ── Scroll-driven zoom ── */}
      <div className={s.scrollProgress} ref={progressRef} />

      <div className={s.sideMarker} ref={sideMarkerRef}>
        {ZOOM_CARDS.map((_, i) => (
          <div key={i} className={s.markerDot} />
        ))}
      </div>

      <div className={s.scrollSpace} ref={scrollSpaceRef} />

      <div className={s.viewport} ref={viewportRef}>
        {ZOOM_CARDS.map((card, i) => (
          <div key={i} className={s.zcard}>
            {card.ghost && <div className={s.ghost}>{card.ghost}</div>}
            <div className={s.zcardInner}>
              <div
                className={card.voice === "rowan" ? s.zRowan : s.zMichael}
                style={{ fontSize: card.fontSize }}
                dangerouslySetInnerHTML={{
                  __html: card.headline.replace(
                    /class="iris"/g,
                    `class="${s.irisText}"`
                  ),
                }}
              />
              {card.sub && <div className={s.zSub}>{card.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className={s.ctaOverlay} ref={ctaRef}>
        <div className={`${s.ctaBrand} ${s.irisText}`}>AESDR</div>
        <div className={s.ctaTag}>12 lessons &bull; at your own pace &bull; 1 you</div>
        <div className={s.ctaNote}>Nobody gave you a real answer on day one. We built this after years of figuring it out alone.</div>
        <a href="#pricing" className={s.ctaButton}>Get Access &rarr;</a>
      </div>
    </>
  );
}
