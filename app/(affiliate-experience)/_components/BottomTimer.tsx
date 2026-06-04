"use client";

/**
 * Watches the whole landing page and, when the prospect scrolls to the very
 * bottom, starts the 30s iris timer that directs them to the kit. When they
 * click "Stop — still reading", the timer card collapses into a small
 * persistent "Open the kit when you're ready →" pill in the same
 * bottom-right slot so they can leave for the kit on their own schedule.
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import IrisTimer from "./IrisTimer";
import { trackProspect } from "../_lib/track";

export default function BottomTimer() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [showPill, setShowPill] = useState(false);
  const armed = useRef(true);
  const completedOnce = useRef(false);
  // Once the prospect has clicked "Stop — still reading" and seen the pill,
  // the timer must never fire again. Previously the scroll-up/scroll-back
  // path re-armed `armed.current` and re-triggered setShow(true), popping
  // the countdown a second time even with the pill already visible.
  const pillShown = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 6;
      if (!nearBottom) {
        armed.current = true;
        return;
      }
      // Hard stop: once the pill has appeared, the timer is permanently
      // retired for the rest of this session. The pill is the persistent
      // affordance from this point on.
      if (pillShown.current) return;
      if (nearBottom && armed.current) {
        armed.current = false;
        if (!completedOnce.current) {
          completedOnce.current = true;
          trackProspect("landing_completed");
        }
        trackProspect("timer_started");
        setShow(true);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {show && (
        <IrisTimer
          seconds={30}
          onComplete={() => {
            trackProspect("directed_to_kit");
            router.push("/x/kit");
          }}
          onStop={() => {
            trackProspect("timer_stopped");
            // Retire the timer permanently for this session. The pill below
            // replaces it as the persistent affordance; scrolling up + back
            // down must NOT re-trigger the countdown.
            pillShown.current = true;
            setShow(false);
            setShowPill(true);
          }}
        />
      )}

      {showPill && (
        <button
          type="button"
          onClick={() => {
            trackProspect("kit_pill_clicked");
            router.push("/x/kit");
          }}
          aria-label="Open the affiliate kit"
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            zIndex: 60,
            background: "var(--ink, #1A1A1A)",
            color: "#FAF7F2",
            border: "1px solid var(--ink, #1A1A1A)",
            borderRadius: 999,
            padding: "12px 22px 12px 18px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
            textTransform: "uppercase",
            letterSpacing: ".16em",
            fontSize: 12,
            boxShadow: "0 18px 40px rgba(26,26,26,0.22), 0 0 0 4px rgba(139,26,26,0.10)",
            animation: "kit-pill-pop 360ms ease-out",
          }}
        >
          <style>{`
            @keyframes kit-pill-pop {
              0%   { transform: translateY(12px); opacity: 0; }
              100% { transform: translateY(0);    opacity: 1; }
            }
          `}</style>
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, var(--crimson, #8B1A1A), #8B5CF6)",
            }}
          />
          Open the kit when you&rsquo;re ready →
        </button>
      )}
    </>
  );
}
