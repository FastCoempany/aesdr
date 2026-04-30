/**
 * Code Connect mapping — components/LandingSequence.tsx ↔ Figma `pattern/editorial-split-hero`
 *
 * To activate:
 *   1. Build the Figma library per design-canon-seed/07-figma-prep/figma-assembly-guide.md
 *   2. Right-click the `pattern/editorial-split-hero` component in Figma → Copy link.
 *   3. Replace FIGMA_NODE_URL_TBD below.
 *   4. Run `figma connect publish`.
 *
 * Component signature (from LandingSequence.tsx):
 *   () — no public props.
 *   Renders the full editorial-split → confession overlay → terminal block →
 *   zoom cards → CTA overlay sequence. The Figma component should be the
 *   first frame (the editorial-split hero); the rest are described in the
 *   layout-pattern frames as separate scrolled states.
 */

import { figma } from '@figma/code-connect';
import LandingSequence from './LandingSequence';

figma.connect(
  LandingSequence,
  'FIGMA_NODE_URL_TBD',
  {
    example: () => <LandingSequence />,
  }
);
