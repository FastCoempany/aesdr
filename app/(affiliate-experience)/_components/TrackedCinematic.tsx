"use client";

/**
 * The forked cinematic intro (typing animation + role fork + zoom cards),
 * wrapped so we can attach prospect tracking. The "Get Access" overlay is
 * hidden because in this flow the real pricing section sits right below; the
 * bottom-of-page timer (BottomTimer) handles advancing to the kit.
 */
import ExperienceLanding from "../_landing/ExperienceLanding";
import { trackProspect } from "../_lib/track";
import type { Role } from "@/lib/role";

export default function TrackedCinematic() {
  return (
    <ExperienceLanding
      hideAccessCta
      onStarted={() => trackProspect("animation_started")}
      onRolePicked={(r: Role) => trackProspect("role_picked", { role: r })}
    />
  );
}
