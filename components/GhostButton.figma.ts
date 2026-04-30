/**
 * Code Connect mapping — components/GhostButton.tsx ↔ Figma `component/ghost-button`
 *
 * To activate:
 *   1. Build the Figma library per design-canon-seed/07-figma-prep/figma-assembly-guide.md
 *   2. Right-click the `component/ghost-button` component in Figma → Copy link.
 *   3. Replace FIGMA_NODE_URL_TBD below.
 *   4. Run `figma connect publish`.
 *
 * Component signature (from GhostButton.tsx):
 *   () — no public props.
 *   The hidden bypass button — 10px circle, barely-visible border. Insider-
 *   culture artifact. Figma component should be 10×10 with --light border at
 *   low opacity. Document its position semantics in the component description.
 */

import { figma } from '@figma/code-connect';
import GhostButton from './GhostButton';

figma.connect(
  GhostButton,
  'FIGMA_NODE_URL_TBD',
  {
    example: () => <GhostButton />,
  }
);
