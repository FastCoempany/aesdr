/**
 * Page: /partners/play (NEW per Q4 ratification 2026-05-04)
 * Spec: AESDR-PARTNER-HUB-SPEC.md §[4] item 7 (build prompt addition)
 * Canon: §1.5 (real operator), §1.6 (honesty), §3.1/§3.2 (the two voices), §4.1 (banned vocab)
 * Five-question check: PASS — game uses real canonical statements + real banned-vocab cliches; no SaaS-game energy; cream + ink + crimson; no congratulatory overlays.
 *
 * 60-second sales-judgment game. Statements appear; player zaps the noise,
 * lets the signal pass. Per Q4: shooting/laser register, but stripped down
 * to fit the brand — crimson zap effect, mono crosshair, no sound effects,
 * no flashing congratulations. The game teaches the canon by playing it.
 */

import type { Metadata } from "next";
import { HubPage } from "@/components/affiliates/HubChrome";
import { MonoEyebrow, CaveatLayer } from "@/components/affiliates/HubElements";
import { PlayGame } from "@/components/affiliates/PlayGame";

export const metadata: Metadata = {
  title: "Signal or Noise · AESDR Partners",
  description:
    "A 60-second judgment game where 12 statements fly past and you zap the noise while letting the signal pass — the game itself teaches the AESDR canon by making you play it.",
};

export default function PlayPage() {
  return (
    <HubPage>
      <div style={{ padding: "64px 24px 0" }}>
        <MonoEyebrow>AESDR · 60-SECOND JUDGMENT TEST</MonoEyebrow>
      </div>

      <PlayGame />

      <CaveatLayer>
        PS — If you scored under 30 and you&rsquo;re still reading, that&rsquo;s also information. The catalog exists for exactly this reason.
      </CaveatLayer>
    </HubPage>
  );
}
