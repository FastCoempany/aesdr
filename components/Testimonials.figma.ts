/**
 * Code Connect mapping — components/Testimonials.tsx ↔ Figma `pattern/testimonial-gallery`
 *
 * To activate:
 *   1. Build the Figma library per design-canon-seed/07-figma-prep/figma-assembly-guide.md
 *   2. Right-click the `pattern/testimonial-gallery` component in Figma → Copy link.
 *   3. Replace FIGMA_NODE_URL_TBD below.
 *   4. Run `figma connect publish`.
 *
 * Component signature (from Testimonials.tsx):
 *   () — no public props.
 *   Horizontal-scroll gallery — cream cards, --serif italic quotes, --cond
 *   name labels. Sources testimonials from production data; Figma component
 *   should mirror the visual frame, not the data.
 */

import { figma } from '@figma/code-connect';
import Testimonials from './Testimonials';

figma.connect(
  Testimonials,
  'FIGMA_NODE_URL_TBD',
  {
    example: () => <Testimonials />,
  }
);
