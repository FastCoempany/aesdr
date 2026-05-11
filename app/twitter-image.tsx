// Twitter / X uses the same card as Open Graph. The image function is
// imported and re-exported as default, but Next.js route-segment config
// values (`runtime`, `alt`, `size`, `contentType`) must be local const
// declarations — Next's static analysis at compile time can only parse
// them from the file that defines them, not from a re-export.
//
// Source of truth for the actual rendered image is `./opengraph-image.tsx`.
import OpenGraphImage from "./opengraph-image";

export const runtime = "nodejs";
export const alt =
  "AESDR · The 12-lesson sales survival course, built by operators";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default OpenGraphImage;
