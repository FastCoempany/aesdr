"use client";

/** Fires a single prospect event on mount (e.g. kit_viewed). */
import { useEffect } from "react";
import { trackProspect } from "../_lib/track";

export default function KitTracker({
  event,
  props,
}: {
  event: string;
  props?: Record<string, unknown>;
}) {
  useEffect(() => {
    trackProspect(event, props || {});
    // mount-only: the event identity is fixed per render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
  return null;
}
