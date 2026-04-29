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

    const fade = (el: HTMLElement | null, t = 0.6) => {
      if (!el) return;
      el.style.transition = `opacity ${t}s ease`;
      el.style.opacity = "0";
      el.style.pointerEvents = "none";
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
    attachZoomScroll();
  }

  /* ─────────── Zoom scroll (preserved from original) ─────────── */

  function attachZoomScroll() {
    function update() {
      const sp = refs.scrollSpace;
      const vp = refs.viewport;
      if (!sp || !vp) return;

      const scrollY = window.scrollY;
      const zoomHeight = sp.offsetHeight;
      const maxScroll = zoomHeight - window.innerHeight;
      if (maxScroll <= 0) return;

      const pastZoom = scrollY > zoomHeight;
      if (pastZoom) {
        vp.style.display = "none";
        if (refs.hero) {
          refs.hero.style.opacity = "0";
          refs.hero.style.pointerEvents = "none";
        }
        if (refs.sideMarker) refs.sideMarker.style.opacity = "0";
        if (refs.progress) refs.progress.style.opacity = "0";
        if (refs.cta) {
          refs.cta.classList.remove(c.ctaOverlayVisible);
          refs.cta.style.display = "none";
          refs.cta.style.pointerEvents = "none";
        }
        return;
      }

      const heroZone = window.innerHeight * 0.35;
      if (refs.hero) {
        const heroOp = Math.max(0, 1 - scrollY / heroZone);
        refs.hero.style.opacity = String(heroOp);
        refs.hero.style.pointerEvents = heroOp > 0.1 ? "auto" : "none";
        if (heroOp > 0.5) {
          vp.style.opacity = "0";
          if (refs.sideMarker) refs.sideMarker.style.opacity = "0";
          if (refs.progress) refs.progress.style.opacity = "0";
          return;
        }
      }

      vp.style.display = "";
      vp.style.opacity = "";
      vp.style.pointerEvents = "";
      if (refs.sideMarker) refs.sideMarker.style.opacity = "";
      if (refs.progress) refs.progress.style.opacity = "";
      if (refs.cta) {
        refs.cta.style.pointerEvents = "";
        refs.cta.style.transition = "";
        refs.cta.style.display = "";
      }

      const progress = Math.min(1, scrollY / maxScroll);
      if (refs.progress) refs.progress.style.width = progress * 100 + "%";

      const total = opts.zoomCards.length;
      const CARD_END = 0.78;
      const cardProgress = Math.min(total, (progress / CARD_END) * total);
      const activeIndex = Math.min(Math.floor(cardProgress), total - 1);
      const cardFrac = cardProgress - activeIndex;

      const cards = vp.querySelectorAll<HTMLElement>(`.${c.zcard}`);
      cards.forEach((card, i) => {
        if (i === activeIndex) {
          let scale: number, op: number;
          if (activeIndex === 0 && cardFrac < 0.12) {
            const t = cardFrac / 0.12;
            scale = 1.3 - 0.3 * t;
            op = 0.8 + 0.2 * t;
          } else if (cardFrac < 0.12) {
            const t = cardFrac / 0.12;
            scale = 2.5 - 1.5 * t;
            op = t;
          } else if (cardFrac < 0.78) {
            scale = 1;
            op = 1;
          } else {
            const t = (cardFrac - 0.78) / 0.22;
            scale = 1 - 0.6 * t;
            op = 1 - t;
          }
          card.style.transform = `scale(${scale})`;
          card.style.opacity = String(op);
        } else {
          card.style.opacity = "0";
        }
      });

      const dots = refs.sideMarker?.querySelectorAll<HTMLElement>(`.${c.markerDot}`);
      dots?.forEach((dot, i) => dot.classList.toggle(c.markerDotActive, i === activeIndex));

      if (progress > 0.84 && progress < 0.97) {
        const fadeIn = Math.min(1, (progress - 0.84) / 0.03);
        const fadeOut = progress > 0.93 ? 1 - Math.min(1, (progress - 0.93) / 0.03) : 1;
        const op = fadeIn * fadeOut;
        if (refs.cta) {
          refs.cta.classList.add(c.ctaOverlayVisible);
          refs.cta.style.opacity = String(op);
        }
      } else {
        refs.cta?.classList.remove(c.ctaOverlayVisible);
        if (refs.cta) {
          refs.cta.style.opacity = "0";
          refs.cta.style.display = progress >= 0.97 ? "none" : "";
        }
      }

      if (scrollY > 50 && refs.terminal) {
        refs.terminal.style.opacity = "0";
        refs.terminal.style.pointerEvents = "none";
      }
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    listeners.push(() => window.removeEventListener("scroll", update));
    listeners.push(() => window.removeEventListener("resize", update));
    update();
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

  // 25-second safety: if anything stalls, jump to hero.
  schedule(() => {
    if (!scrollUnlocked) unlockScroll(role);
  }, 25000);

  schedule(() => {
    if (role) {
      // Member with prefilled role: skip opener + fork.
      runBranchedScenes(role, () => runTerminal(role, () => unlockScroll(role)));
    } else {
      runOpener(() =>
        runFork((picked) => {
          role = picked;
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
