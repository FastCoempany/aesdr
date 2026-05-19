/**
 * Imperative animation engine for LandingSequence.
 *
 * Phases:
 *   ANON      → opener (shared scenes 1+2) → fork → branched scenes → terminal → hero
 *   MEMBER    → branched scenes (initialRole) → terminal → hero  (opener + fork skipped)
 *
 * Click-to-advance fast-forwards the current typing step. The skip button
 * jumps straight to the hero with a default (no-role) descriptor.
 *
 * Returns a cleanup function that clears every timer + listener — safe under
 * StrictMode double-invocation and HMR.
 */

import type { Role } from "@/lib/role";

import {
  BRANCHED_SCENES,
  BRANCHED_TERM_LINES,
  HERO_DESCRIPTOR,
  SHARED_SCENES,
  TERMINAL_FINAL,
  TERMINAL_WHISPER,
} from "./copy";
import type { Seg } from "./copy";
import type { ZoomCard } from "./zoom-cards";
import { buildHTML, flattenSegs } from "./typing";

export type AnimatorRefs = {
  backdrop: HTMLDivElement | null;
  hero: HTMLDivElement | null;
  descriptor: HTMLParagraphElement | null;
  confession: HTMLDivElement | null;
  typingArea: HTMLDivElement | null;
  fork: HTMLDivElement | null;
  split: HTMLDivElement | null;
  divider: HTMLDivElement | null;
  terminal: HTMLDivElement | null;
  termBody: HTMLDivElement | null;
  termOutput: HTMLDivElement | null;
  scrollHint: HTMLDivElement | null;
  viewport: HTMLDivElement | null;
  scrollSpace: HTMLDivElement | null;
  sideMarker: HTMLDivElement | null;
  progress: HTMLDivElement | null;
  cta: HTMLDivElement | null;
  skipBtn: HTMLButtonElement | null;
};

export type AnimatorOptions = {
  initialRole: Role | null;
  zoomCards: ZoomCard[];
  classes: Record<string, string>;
  onRolePick: (role: Role) => void;
  onSkip: () => void;
};

export function runAnimator(refs: AnimatorRefs, opts: AnimatorOptions): () => void {
  const c = opts.classes;
  let paused = false;
  let scrollUnlocked = false;
  let role: Role | null = opts.initialRole;
  let advance: (() => void) | null = null;

  const timers = new Set<ReturnType<typeof setTimeout>>();
  const listeners: Array<() => void> = [];

  function schedule(fn: () => void, delay: number) {
    const id = setTimeout(() => {
      timers.delete(id);
      if (paused) return;
      fn();
    }, delay);
    timers.add(id);
    return id;
  }

  function clearTimers() {
    for (const id of timers) clearTimeout(id);
    timers.clear();
  }

  function setHeroDescriptor(r: Role | null) {
    if (!refs.descriptor) return;
    refs.descriptor.textContent = r ? HERO_DESCRIPTOR[r] : HERO_DESCRIPTOR.default;
  }

  function lockScroll() {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  function restoreScroll() {
    document.documentElement.style.overflow = "";
    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflow = "";
    document.body.style.overflowX = "hidden";
  }

  /* ─────────── Typewriter primitives ─────────── */

  function typeSegs(target: HTMLElement, segs: Seg[], onDone: () => void) {
    const flat = flattenSegs(segs);
    let i = 0;
    let forced = false;

    advance = () => {
      forced = true;
    };

    function step() {
      if (paused) return;
      if (forced || i >= flat.length) {
        target.innerHTML = buildHTML(flat, c.irisText);
        advance = null;
        schedule(onDone, forced ? 120 : 800);
        return;
      }
      i++;
      target.innerHTML = buildHTML(flat.slice(0, i), c.irisText) + `<span class="${c.cursor}"></span>`;
      schedule(step, 32 + Math.random() * 18);
    }
    step();
  }

  function typeString(target: HTMLElement, text: string, onDone: () => void, perChar = 28, hold = 600) {
    let i = 0;
    let forced = false;

    advance = () => {
      forced = true;
    };

    function step() {
      if (paused) return;
      if (forced || i >= text.length) {
        target.innerHTML = text;
        advance = null;
        schedule(onDone, forced ? 120 : hold);
        return;
      }
      i++;
      target.innerHTML = text.slice(0, i) + `<span class="${c.cursor}"></span>`;
      schedule(step, perChar + Math.random() * 14);
    }
    step();
  }

  /* ─────────── Phase runners ─────────── */

  function runOpener(onDone: () => void) {
    refs.confession?.classList.add(c.confessionLayerActive);
    if (!refs.typingArea) return onDone();
    refs.typingArea.innerHTML = "";

    let idx = 0;
    function next() {
      if (paused) return;
      if (idx >= SHARED_SCENES.length) {
        onDone();
        return;
      }
      const line = document.createElement("div");
      line.className = c.tline;
      refs.typingArea!.appendChild(line);
      const segs = SHARED_SCENES[idx];
      idx++;
      typeSegs(line, segs, () => {
        // Fade the line out before the next one types in (matches old motif).
        if (idx < SHARED_SCENES.length) {
          line.classList.add(c.tlineDissolve);
          schedule(next, 600);
        } else {
          schedule(next, 200);
        }
      });
    }
    next();
  }

  function runFork(onDone: (picked: Role) => void) {
    if (!refs.fork || !refs.split) return;
    // Fade out the confession before the fork slides in.
    refs.confession?.classList.remove(c.confessionLayerActive);
    schedule(() => {
      refs.fork?.classList.add(c.forkLayerActive);
    }, 400);

    const halves = refs.split.querySelectorAll<HTMLElement>("[data-role]");
    halves.forEach((half) => {
      const handler = () => {
        const picked = (half.dataset.role === "ae" ? "ae" : "sdr") as Role;
        const collapseClass = picked === "sdr" ? c.splitCollapseAe : c.splitCollapseSdr;
        refs.split?.classList.add(collapseClass);
        refs.divider?.classList.add(c.forkDividerHidden);
        opts.onRolePick(picked);
        schedule(() => {
          refs.fork?.classList.remove(c.forkLayerActive);
          schedule(() => onDone(picked), 500);
        }, 900);
      };
      half.addEventListener("click", handler);
      listeners.push(() => half.removeEventListener("click", handler));
    });
  }

  function runBranchedScenes(r: Role, onDone: () => void) {
    if (!refs.typingArea || !refs.confession) return onDone();
    refs.typingArea.innerHTML = "";
    refs.confession.classList.add(c.confessionLayerActive);

    const lines = BRANCHED_SCENES[r];
    let idx = 0;
    function next() {
      if (paused) return;
      if (idx >= lines.length) {
        onDone();
        return;
      }
      const line = document.createElement("div");
      line.className = c.tline;
      refs.typingArea!.appendChild(line);
      const text = lines[idx];
      idx++;
      typeString(line, text, () => {
        if (idx < lines.length) {
          line.classList.add(c.tlineDissolve);
          schedule(next, 500);
        } else {
          schedule(next, 200);
        }
      });
    }
    next();
  }

  function runTerminal(r: Role, onDone: () => void) {
    refs.confession?.classList.remove(c.confessionLayerActive);
    schedule(() => {
      if (!refs.terminal || !refs.termBody) return onDone();
      refs.terminal.classList.add(c.terminalLayerActive);

      // Build line elements fresh each run.
      refs.termBody.innerHTML = "";
      const lines = BRANCHED_TERM_LINES[r];
      const lineEls = lines.map((text) => {
        const div = document.createElement("div");
        div.className = c.termLine;
        div.dataset.text = text;
        const prompt = document.createElement("span");
        prompt.className = c.prompt;
        prompt.textContent = ">";
        const body = document.createElement("span");
        div.append(prompt, " ", body);
        refs.termBody!.appendChild(div);
        return { el: div, body, text };
      });
      const out = document.createElement("div");
      out.className = c.termOutput;
      out.innerHTML = TERMINAL_FINAL + `<div class="${c.termWhisper}">${TERMINAL_WHISPER}</div>`;
      refs.termBody.appendChild(out);

      let i = 0;
      function nextLine() {
        if (paused) return;
        if (i >= lineEls.length) {
          schedule(() => {
            out.classList.add(c.termOutputVisible);
            schedule(() => {
              refs.scrollHint?.classList.add(c.scrollHintVisible);
              onDone();
            }, 3000);
          }, 400);
          return;
        }
        const { el, body, text } = lineEls[i];
        const stripped = text.replace(/^> /, "");
        el.classList.add(c.termLineVisible);
        let ci = 0;
        let forced = false;
        advance = () => {
          forced = true;
        };
        function typeChar() {
          if (paused) return;
          if (forced || ci >= stripped.length) {
            body.textContent = stripped;
            advance = null;
            i++;
            schedule(nextLine, forced ? 80 : 260);
            return;
          }
          ci++;
          body.innerHTML = stripped.slice(0, ci) + `<span class="${c.termCursor}"></span>`;
          schedule(typeChar, 18 + Math.random() * 12);
        }
        typeChar();
      }
      nextLine();
    }, 500);
  }

  function unlockScroll(finalRole: Role | null) {
    if (scrollUnlocked) return;
    scrollUnlocked = true;
    advance = null;
    setHeroDescriptor(finalRole);

    window.scrollTo(0, 0);
    restoreScroll();

    // Fade overlays to opacity 0, THEN `display: none` after transition completes
    // (Fix 3: stops the ghost-typing layer permanently — even at opacity 0 a
    // `position: fixed; inset: 0` layer is in the rendering tree and can flash
    // during repaints / HMR / GPU compositing hiccups.)
    const fade = (el: HTMLElement | null, t = 0.6) => {
      if (!el) return;
      el.style.transition = `opacity ${t}s ease`;
      el.style.opacity = "0";
      el.style.pointerEvents = "none";
      schedule(() => {
        el.style.display = "none";
      }, t * 1000 + 50);
    };
    fade(refs.backdrop);
    fade(refs.confession, 0.4);
    fade(refs.fork, 0.4);
    fade(refs.terminal);

    if (refs.skipBtn) refs.skipBtn.classList.add(c.skipLinkHidden);

    setTimeout(() => {
      if (refs.hero) {
        refs.hero.style.transition = "opacity 0.8s ease";
        refs.hero.style.opacity = "1";
        refs.hero.style.pointerEvents = "auto";
      }
    }, 600);

    refs.viewport?.classList.add(c.viewportActive);
    refs.sideMarker?.classList.add(c.sideMarkerActive);
    refs.progress?.classList.add(c.scrollProgressActive);

    // After hero's 800ms fade-in finishes, clear CSS transitions on hero +
    // viewport so the scroll handler can drive them frame-perfectly without
    // a 0.4–0.5s catchup lag fighting every scroll event. (Fix 4: single
    // source of truth — scroll position → inline opacity, no transition.)
    schedule(() => {
      if (refs.hero) refs.hero.style.transition = "none";
      if (refs.viewport) refs.viewport.style.transition = "none";
      attachZoomScroll();
    }, 1400);
  }

  /* ─────────── Zoom scroll (refactored — single source of truth + rAF) ───
   *
   * Architecture, post-2026-05-10 refactor:
   *
   *   computeLayerStates(scrollY) → pure function. Single source of truth.
   *   render(states)              → batch DOM writes. No reads.
   *   onScroll                    → rAF-throttled. At most one render/frame.
   *
   * Eliminates the prior class-vs-inline opacity fight that caused jitter
   * around the hero/viewport handoff. Eliminates the early-return path that
   * left stale card opacities. Eliminates the 0.5s CSS transitions trying
   * to catch up to scroll-rate inline opacity changes (transitions are
   * cleared on hero + viewport by unlockScroll once initial fade-in is done).
   */

  type LayerStates = {
    heroOpacity: number;
    viewportOpacity: number;
    auxOpacity: number; // sideMarker + progress
    cardIndex: number;
    cardFrac: number;
    progress: number; // 0..1, drives progress bar width + CTA timing
    ctaOpacity: number;
    ctaVisibleZone: boolean;
    pastZoom: boolean;
  };

  function smoothstep(edge0: number, edge1: number, x: number): number {
    if (edge1 === edge0) return x < edge0 ? 0 : 1;
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  function attachZoomScroll() {
    // Cache layout measurements; refresh on resize, not on scroll.
    let cachedZoomHeight = 0;
    let cachedVh = 0;
    let cachedMaxScroll = 0;

    function recomputeMeasurements() {
      const sp = refs.scrollSpace;
      if (!sp) return;
      cachedZoomHeight = sp.offsetHeight;
      cachedVh = window.innerHeight;
      cachedMaxScroll = Math.max(0, cachedZoomHeight - cachedVh);
    }

    function computeLayerStates(scrollY: number): LayerStates {
      const vh = cachedVh;
      const zoomHeight = cachedZoomHeight;
      const maxScroll = cachedMaxScroll;

      const pastZoom = scrollY > zoomHeight;

      // Hero fades OUT and viewport fades IN across the SAME band. By using
      // one smoothstep with two-sided mapping, the sum stays ≤ 1 and there's
      // no double-render zone where both are visibly opaque. Band: 10vh–40vh.
      const handoff = smoothstep(vh * 0.10, vh * 0.40, scrollY);
      const heroOpacity = pastZoom ? 0 : 1 - handoff;
      const viewportOpacity = pastZoom ? 0 : handoff;
      const auxOpacity = pastZoom ? 0 : handoff;

      // Card animation: drive by overall scroll progress through scrollSpace.
      // CARD_END tracks CTA_START exactly — no dead zone between the last card
      // fading out and the AESDR CTA fading in. CTA tail extends to ~0.99 so
      // we don't leave cream void between CTA fade-out and scrollSpace end.
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
      const total = opts.zoomCards.length;
      const CARD_END = 0.84;
      const cardProgress = Math.min(total, (progress / CARD_END) * total);
      const cardIndex = Math.min(Math.floor(cardProgress), total - 1);
      const cardFrac = cardProgress - cardIndex;

      // CTA: appears immediately as the last card fades out, lingers near
      // the end of scrollSpace.
      let ctaOpacity = 0;
      let ctaVisibleZone = false;
      if (progress > 0.84 && progress < 0.99) {
        const fadeIn = Math.min(1, (progress - 0.84) / 0.03);
        const fadeOut = progress > 0.96 ? 1 - Math.min(1, (progress - 0.96) / 0.03) : 1;
        ctaOpacity = fadeIn * fadeOut;
        ctaVisibleZone = true;
      }

      return {
        heroOpacity,
        viewportOpacity,
        auxOpacity,
        cardIndex,
        cardFrac,
        progress,
        ctaOpacity,
        ctaVisibleZone,
        pastZoom,
      };
    }

    function computeCardScaleOp(activeIndex: number, cardFrac: number): { scale: number; op: number } {
      if (activeIndex === 0 && cardFrac < 0.12) {
        const t = cardFrac / 0.12;
        return { scale: 1.3 - 0.3 * t, op: 0.8 + 0.2 * t };
      }
      if (cardFrac < 0.12) {
        const t = cardFrac / 0.12;
        return { scale: 2.5 - 1.5 * t, op: t };
      }
      if (cardFrac < 0.78) {
        return { scale: 1, op: 1 };
      }
      const t = (cardFrac - 0.78) / 0.22;
      return { scale: 1 - 0.6 * t, op: 1 - t };
    }

    function render(s: LayerStates) {
      // Hero — inline opacity, no transition (transition was cleared post-boot)
      if (refs.hero) {
        refs.hero.style.opacity = String(s.heroOpacity);
        refs.hero.style.pointerEvents = s.heroOpacity > 0.1 ? "auto" : "none";
      }

      // Viewport — single opacity source. Past zoom: display:none for free.
      if (refs.viewport) {
        if (s.pastZoom) {
          refs.viewport.style.display = "none";
          refs.viewport.style.opacity = "0";
        } else {
          refs.viewport.style.display = "flex";
          refs.viewport.style.opacity = String(s.viewportOpacity);
        }
      }

      // Side marker + progress: track viewport visibility.
      if (refs.sideMarker) refs.sideMarker.style.opacity = String(s.auxOpacity);
      if (refs.progress) {
        refs.progress.style.opacity = String(s.auxOpacity);
        refs.progress.style.width = s.progress * 100 + "%";
      }

      // Cards — always reset ALL card opacities, including non-active ones,
      // so no card ever retains a stale value from a previous scroll frame.
      if (refs.viewport && !s.pastZoom) {
        const cards = refs.viewport.querySelectorAll<HTMLElement>(`.${c.zcard}`);
        const { scale, op } = computeCardScaleOp(s.cardIndex, s.cardFrac);
        cards.forEach((card, i) => {
          if (i === s.cardIndex) {
            card.style.transform = `scale(${scale})`;
            card.style.opacity = String(op);
          } else {
            card.style.opacity = "0";
            card.style.transform = "";
          }
        });

        const dots = refs.sideMarker?.querySelectorAll<HTMLElement>(`.${c.markerDot}`);
        dots?.forEach((dot, i) => dot.classList.toggle(c.markerDotActive, i === s.cardIndex));
      }

      // CTA
      if (refs.cta) {
        if (s.ctaVisibleZone) {
          refs.cta.classList.add(c.ctaOverlayVisible);
          refs.cta.style.opacity = String(s.ctaOpacity);
          refs.cta.style.display = "";
          refs.cta.style.pointerEvents = "";
        } else {
          refs.cta.classList.remove(c.ctaOverlayVisible);
          refs.cta.style.opacity = "0";
          refs.cta.style.display = s.progress >= 0.99 || s.pastZoom ? "none" : "";
          refs.cta.style.pointerEvents = "none";
        }
      }

      // Terminal — hidden permanently after any meaningful scroll.
      if (window.scrollY > 50 && refs.terminal) {
        refs.terminal.style.opacity = "0";
        refs.terminal.style.pointerEvents = "none";
      }
    }

    // rAF throttle: at most one render per animation frame, no matter how
    // often scroll fires.
    let rafId: number | null = null;
    function scheduleRender() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        render(computeLayerStates(window.scrollY));
      });
    }

    function onScroll() {
      scheduleRender();
    }

    function onResize() {
      recomputeMeasurements();
      scheduleRender();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    listeners.push(() => window.removeEventListener("scroll", onScroll));
    listeners.push(() => window.removeEventListener("resize", onResize));
    listeners.push(() => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    });

    recomputeMeasurements();
    scheduleRender();
  }

  /* ─────────── Top-level click/keydown advance + skip ─────────── */

  function onAdvanceKey(e: KeyboardEvent) {
    if (scrollUnlocked) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      advance?.();
    }
    if (e.key === "Escape") {
      opts.onSkip();
      unlockScroll(role);
    }
  }
  function onAdvanceClick(e: MouseEvent) {
    if (scrollUnlocked) return;
    // Don't eat clicks on the fork halves or skip button — they have their own handlers.
    const target = e.target as HTMLElement | null;
    if (target?.closest("[data-role]") || target?.closest(`.${c.skipLink}`)) return;
    advance?.();
  }
  function onSkipClick() {
    opts.onSkip();
    unlockScroll(role);
  }

  window.addEventListener("keydown", onAdvanceKey);
  window.addEventListener("click", onAdvanceClick);
  refs.skipBtn?.addEventListener("click", onSkipClick);
  listeners.push(() => window.removeEventListener("keydown", onAdvanceKey));
  listeners.push(() => window.removeEventListener("click", onAdvanceClick));
  listeners.push(() => refs.skipBtn?.removeEventListener("click", onSkipClick));

  /* ─────────── Boot ─────────── */

  setHeroDescriptor(role);
  lockScroll();

  // 60-second safety: if anything truly stalls, jump to hero. Cancelled
  // the moment a fork pick happens (or — for members with prefilled role —
  // as soon as the branched scenes start), since past that point the
  // animation is provably progressing. The previous 25s window was tight
  // enough that a user spending 10+ seconds reading the fork before
  // clicking would trip the safety mid-typing on the first branched line.
  const safetyTimerId = setTimeout(() => {
    timers.delete(safetyTimerId);
    if (paused) return;
    if (!scrollUnlocked) unlockScroll(role);
  }, 60000);
  timers.add(safetyTimerId);

  function cancelSafetyTimer() {
    clearTimeout(safetyTimerId);
    timers.delete(safetyTimerId);
  }

  schedule(() => {
    if (role) {
      // Member with prefilled role: skip opener + fork. Animation
      // is committed to running, so the safety net isn't needed.
      const r = role;
      cancelSafetyTimer();
      runBranchedScenes(r, () => runTerminal(r, () => unlockScroll(r)));
    } else {
      runOpener(() =>
        runFork((picked) => {
          role = picked;
          // User picked — animation is committed, safety no longer needed.
          cancelSafetyTimer();
          runBranchedScenes(picked, () => runTerminal(picked, () => unlockScroll(picked)));
        }),
      );
    }
  }, 500);

  return () => {
    paused = true;
    clearTimers();
    for (const off of listeners) off();
    listeners.length = 0;
    restoreScroll();
  };
}
