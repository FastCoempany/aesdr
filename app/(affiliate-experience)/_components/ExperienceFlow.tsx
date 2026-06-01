"use client";

/**
 * Orchestrates the prospect flow as in-page stages so transitions are smooth
 * (no full reload):
 *   gate  -> Leponeus "Step 1" screen
 *   landing -> the real (forked) landing, skip disabled, full typing
 *   (bottom reached) -> iris timer starts
 *   (timer completes) -> directed to the isolated kit at /x/kit
 *
 * Every step is recorded for the /x/ops dashboard via trackProspect().
 */
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import LeponeusGate from "./LeponeusGate";
import IrisTimer from "./IrisTimer";
import ExperienceLanding from "../_landing/ExperienceLanding";
import { trackProspect } from "../_lib/track";
import type { Role } from "@/lib/role";

export default function ExperienceFlow() {
  const router = useRouter();
  const [stage, setStage] = useState<"gate" | "landing">("gate");
  const [showTimer, setShowTimer] = useState(false);
  const [endReached, setEndReached] = useState(false);

  const goKit = useCallback(() => {
    trackProspect("directed_to_kit");
    router.push("/x/kit");
  }, [router]);

  if (stage === "gate") {
    return (
      <LeponeusGate
        onBegin={() => {
          trackProspect("animation_started");
          setStage("landing");
        }}
      />
    );
  }

  return (
    <>
      <ExperienceLanding
        hideAccessCta
        onRolePicked={(role: Role) => trackProspect("role_picked", { role })}
        onReachedEnd={() => {
          if (endReached) return;
          setEndReached(true);
          trackProspect("landing_completed");
          trackProspect("timer_started");
          setShowTimer(true);
        }}
      />
      {showTimer && (
        <IrisTimer
          seconds={30}
          onComplete={goKit}
          onStop={() => {
            trackProspect("timer_stopped");
            setShowTimer(false);
          }}
        />
      )}
    </>
  );
}
