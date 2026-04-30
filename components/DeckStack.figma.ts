/**
 * Code Connect mapping — components/DeckStack.tsx ↔ Figma `pattern/deck-peel-card`
 *
 * To activate:
 *   1. Build the Figma library per design-canon-seed/07-figma-prep/figma-assembly-guide.md
 *   2. Right-click the `pattern/deck-peel-card` component in Figma → Copy link.
 *   3. Replace FIGMA_NODE_URL_TBD below.
 *   4. Run `figma connect publish`.
 *
 * Component signature (from DeckStack.tsx):
 *   { standalone?: boolean = false }
 *   Wheel-driven 12-card peel. Cards are sourced from the exported LESSONS
 *   constant in DeckStack.tsx — Figma file should mirror those 12 lesson titles.
 */

import { figma } from '@figma/code-connect';
import DeckStack from './DeckStack';

figma.connect(
  DeckStack,
  'FIGMA_NODE_URL_TBD',
  {
    props: {
      // In Figma, the Standalone variant is the deck rendered outside the
      // landing-sequence flow (e.g., pinned to a syllabus page).
      standalone: figma.boolean('Standalone'),
    },
    example: ({ standalone }) => <DeckStack standalone={standalone} />,
  }
);
