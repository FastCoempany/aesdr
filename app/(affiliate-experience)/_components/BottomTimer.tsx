"use client";

/**
 * Watches the whole landing page and, when the prospect scrolls to the very
 * bottom (past everything — pricing, FAQ, footer), starts the 30s iris timer
 * that directs them to the kit. "Stop timer" disarms it; scrolling back down
 * to the bottom re-arms and re-shows it, so a prospect who wanted more reading
 * time still gets sent on when they're done.
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import IrisTimer from "./IrisTimer";
import { trackProspect } from "../_lib/track";

export default function BottomTimer() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const armed = useRef(true);
  const completedOnce = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 6;
      if (!nearBottom) {
        armed.current = true;
        return;
      }
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

  if (!show) return null;

  return (
    <IrisTimer
      seconds={30}
      onComplete={() => {
        trackProspect("directed_to_kit");
        router.push("/x/kit");
      }}
      onStop={() => {
        trackProspect("timer_stopped");
        setShow(false);
        // armed stays false; scrolling up then back down re-arms via onScroll
      }}
    />
  );
}
