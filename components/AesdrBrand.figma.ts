/**
 * Code Connect mapping — components/AesdrBrand.tsx ↔ Figma `brand/wordmark`
 *
 * To activate:
 *   1. Build the Figma library per design-canon-seed/07-figma-prep/figma-assembly-guide.md
 *   2. In Figma, right-click the `brand/wordmark` component → Copy/paste as → Copy link.
 *   3. Replace FIGMA_NODE_URL_TBD below with that URL.
 *   4. Run `figma connect publish`.
 *
 * Component signature (from AesdrBrand.tsx):
 *   { className?: string; style?: CSSProperties; children?: ReactNode = "AESDR" }
 *   Server component — wraps Next.js <Link> with auth-aware href.
 */

import { figma } from '@figma/code-connect';
import AesdrBrand from './AesdrBrand';

figma.connect(
  AesdrBrand,
  'FIGMA_NODE_URL_TBD',
  {
    props: {
      // The wordmark text. Default in code is "AESDR" — keep this in sync with
      // the Figma component's text-layer default.
      children: figma.textContent('Wordmark'),
    },
    example: ({ children }) => <AesdrBrand>{children}</AesdrBrand>,
  }
);
