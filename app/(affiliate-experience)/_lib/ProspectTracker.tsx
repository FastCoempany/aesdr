"use client";

/**
 * Mounted once in the affiliate-experience layout. On first load it:
 *  1. identifies the visitor to PostHog by their prospect slug, and
 *  2. records the `link_opened` event (every load with a ?p= present —
 *     repeated opens are how the dashboard surfaces return visits).
 */
import { useEffect } from "react";
import { identifyProspect, trackProspect } from "./track";

export default function ProspectTracker() {
  useEffect(() => {
    identifyProspect();
    trackProspect("link_opened");
  }, []);
  return null;
}
