"use client";

import { useEffect, useRef } from "react";

import { getRole, setRole as persistRole, type Role } from "@/lib/role";

import { Mascot, MASCOT_SIZE } from "@/components/brand/Mascot";

import { runAnimator, type AnimatorRefs } from "./animator";
import { FORK_HALVES, FORK_PICK_HEADER, HERO_DESCRIPTOR } from "./copy";
import { ZOOM_CARDS } from "./zoom-cards";
import s from "./ExperienceLanding.module.css";

type Props = {
  initialRole?: Role | null;
  /** Called once when the animation begins. */
  onStarted?: () => void;
  /** Called when the AE/SDR fork is chosen (in addition to role persistence). */
  onRolePicked?: (role: Role) => void;
  /** Called once when the user scrolls to the very bottom of the experience. */
  onReachedEnd?: () => void;
  /**
   * When true, the final "Get Access" CTA overlay is not rendered (this flow
   * ends elsewhere, not at checkout). onReachedEnd still fires.
   */
  hideAccessCta?: boolean;
};

export default function ExperienceLanding({
  initialRole = null,
  onStarted,
  onRolePicked,
  onReachedEnd,
  hideAccessCta = false,
}: Props) {
  const heroRef = useRef<HTMLDivElement>(null);
  const descriptorRef = useRef<HTMLParagraphElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const confessionRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef<HTMLDivElement>(null);
  const forkRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const termBodyRef = useRef<HTMLDivElement>(null);
  const termOutputRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollSpaceRef = useRef<HTMLDivElement>(null);
  const sideMarkerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  // Mirror the latest callback props into refs so the animator effect can stay
  // keyed on `initialRole` only — calling an updated callback without tearing
  // down and restarting the whole animation.
  const onStartedRef = useRef(onStarted);
  const onRolePickedRef = useRef(onRolePicked);
  const onReachedEndRef = useRef(onReachedEnd);
  useEffect(() => {
    onStartedRef.current = onStarted;
    onRolePickedRef.current = onRolePicked;
    onReachedEndRef.current = onReachedEnd;
  });

  useEffect(() => {
    const refs: AnimatorRefs = {
      backdrop: backdropRef.current,
      hero: heroRef.current,
      descriptor: descriptorRef.current,
      confession: confessionRef.current,
      typingArea: typingRef.current,
      fork: forkRef.current,
      split: splitRef.current,
      divider: dividerRef.current,
      terminal: terminalRef.current,
      termBody: termBodyRef.current,
      termOutput: termOutputRef.current,
      scrollHint: scrollHintRef.current,
      viewport: viewportRef.current,
      scrollSpace: scrollSpaceRef.current,
      sideMarker: sideMarkerRef.current,
      progress: progressRef.current,
      cta: ctaRef.current,
      liveRegion: liveRegionRef.current,
    };

    // initialRole comes from server-side user_metadata (members only); it's
    // null for anonymous visitors. Fall back to the role persisted in
    // localStorage so a returning anonymous visitor who already picked SDR/AE
    // gets the prefilled hero + skipped fork instead of being re-forked as new.
    // getRole() is read here (client-only effect) to avoid an SSR hydration
    // mismatch — the hero server-renders the neutral descriptor, and the
    // animator updates it imperatively after mount.
    const resolvedRole = initialRole ?? getRole();

    return runAnimator(refs, {
      initialRole: resolvedRole,
      zoomCards: ZOOM_CARDS,
      classes: s as unknown as Record<string, string>,
      hideAccessCta,
      onRolePick: (role) => {
        persistRole(role);
      },
      onStarted: () => onStartedRef.current?.(),
      onRolePicked: (role) => onRolePickedRef.current?.(role),
      onReachedEnd: () => onReachedEndRef.current?.(),
    });
  }, [initialRole, hideAccessCta]);

  const initialDescriptor = initialRole
    ? HERO_DESCRIPTOR[initialRole]
    : HERO_DESCRIPTOR.default;

  return (
    <>
      {/* Polite live region — announces the role selection to assistive
          tech, since the fork is a visual split with no native form
          semantics. (WCAG 4.1.3) */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="visually-hidden"
      />

      {/* Opaque cream backdrop guards every overlay fade against page bleed-through */}
      <div className={s.animationBackdrop} ref={backdropRef} />

      {/* Branded hero — visible after animation or on return visits */}
      <div className={s.landingHero} ref={heroRef}>
        <div className={s.heroMascotWrap}>
          <Mascot pose="doctrine" size={MASCOT_SIZE.landing} priority />
        </div>
        <div className={s.heroLabel}>12 Interactive Courses &middot; Built by Operators &middot; Not by Course-People</div>
        <h1 className={`${s.heroBrand} ${s.irisText}`}>AESDR</h1>
        <p className={s.heroTagline}>Become the same you, just way, way better.</p>
        <p className={s.heroDescriptor} ref={descriptorRef}>
          {initialDescriptor}
        </p>
        <a href="#pricing" className={s.heroCta}>
          Get Access{" "}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ display: "inline", verticalAlign: "middle", marginLeft: 4 }}
          >
            <path d="M2 3h8v8" />
            <path d="M7 8l3 3 3-3" />
          </svg>
        </a>
      </div>

      {/* Shared opener confession */}
      <div className={s.confessionLayer} ref={confessionRef}>
        <div className={s.typingArea} ref={typingRef} />
      </div>

      {/* Editorial split fork (Mockup C) */}
      <div className={s.forkLayer} ref={forkRef} role="group" aria-label="Choose your role">
        <div className={s.forkLabel}>{FORK_PICK_HEADER}</div>
        <div className={s.split} ref={splitRef}>
          <button
            type="button"
            className={`${s.half} ${s.halfSdr}`}
            data-role="sdr"
            aria-label={`Choose the Sales Development Representative track. ${FORK_HALVES.sdr.body.strong}${FORK_HALVES.sdr.body.rest}`}
          >
            <span className={`${s.halfCorner} ${s.cornerTLh}`} />
            <span className={`${s.halfCorner} ${s.cornerTRh}`} />
            <span className={`${s.halfCorner} ${s.cornerBLh}`} />
            <span className={`${s.halfCorner} ${s.cornerBRh}`} />
            <span className={s.ghostNum}>{FORK_HALVES.sdr.ghostNum}</span>
            <span className={s.halfMono}>{FORK_HALVES.sdr.monoLabel}</span>
            <span className={s.halfRoleLabel}>{FORK_HALVES.sdr.label}</span>
            <span className={s.halfIdText}>
              <strong>{FORK_HALVES.sdr.body.strong}</strong>
              {FORK_HALVES.sdr.body.rest}
            </span>
            <span className={s.halfPickCta}>{FORK_HALVES.sdr.cta}</span>
          </button>
          <button
            type="button"
            className={`${s.half} ${s.halfAe}`}
            // data-role intentionally omitted — the animator's
            // querySelectorAll("[data-role]") click target collection
            // skips this element entirely, so clicks register as inert.
            // Visually presented as a grayed-out future track so the
            // prospect knows the AE path exists but isn't open today.
            aria-disabled="true"
            aria-label="Account Executive track — not currently available for this preview"
            disabled
            style={{
              opacity: 0.35,
              pointerEvents: "none",
              filter: "saturate(0.4)",
              cursor: "not-allowed",
            }}
          >
            <span className={`${s.halfCorner} ${s.cornerTLh}`} />
            <span className={`${s.halfCorner} ${s.cornerTRh}`} />
            <span className={`${s.halfCorner} ${s.cornerBLh}`} />
            <span className={`${s.halfCorner} ${s.cornerBRh}`} />
            <span className={s.ghostNum}>{FORK_HALVES.ae.ghostNum}</span>
            <span className={s.halfMono}>{FORK_HALVES.ae.monoLabel}</span>
            <span className={s.halfRoleLabel}>{FORK_HALVES.ae.label}</span>
            <span className={s.halfIdText}>
              <strong>{FORK_HALVES.ae.body.strong}</strong>
              {FORK_HALVES.ae.body.rest}
            </span>
            <span className={s.halfPickCta}>{FORK_HALVES.ae.cta}</span>
          </button>
        </div>
        <div className={s.forkDivider} ref={dividerRef} />
      </div>

      {/* Terminal */}
      <div className={s.terminalLayer} ref={terminalRef}>
        <div className={s.terminal}>
          <div className={s.termBar}>
            <div className={`${s.termDot} ${s.termDotR}`} />
            <div className={`${s.termDot} ${s.termDotY}`} />
            <div className={`${s.termDot} ${s.termDotG}`} />
            <span className={s.termTitle}>you_already_knew.exe</span>
          </div>
          <div className={s.termBody} ref={termBodyRef}>
            <div className={s.termOutput} ref={termOutputRef} />
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className={s.scrollHint} ref={scrollHintRef}>
        <span className={s.scrollHintText}>scroll</span>
        <div className={s.scrollHintBar} />
      </div>

      {/* Zoom section */}
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
                  __html: card.headline.replace(/class="iris"/g, `class="${s.irisText}"`),
                }}
              />
              {card.sub && <div className={s.zSub}>{card.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* CTA Overlay (final card moment) — suppressed when hideAccessCta is set;
          this flow ends elsewhere, not at checkout. */}
      {!hideAccessCta && (
        <div className={s.ctaOverlay} ref={ctaRef}>
          <div className={`${s.ctaBrand} ${s.irisText}`}>AESDR</div>
          <div className={s.ctaTag}>12 interactive courses &bull; built by operators &bull; not by course-people</div>
          <div className={s.ctaNote}>
            Nobody gave you real answers on day one. We built this after years of figuring it out alone.
          </div>
          <a href="#pricing" className={s.ctaButton}>
            Get Access{" "}
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ display: "inline", verticalAlign: "middle", marginLeft: 4 }}
            >
              <path d="M2 3h8v8" />
              <path d="M7 8l3 3 3-3" />
            </svg>
          </a>
        </div>
      )}
    </>
  );
}
