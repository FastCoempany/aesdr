import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Open Graph card for every shared aesdr.com URL.
 *
 * Next.js App Router auto-injects the <meta property="og:image"> tag for
 * any route that exports this file. Same image is reused for Twitter via
 * the sibling `twitter-image.tsx` re-export.
 *
 * Image spec:
 *   - 1200 × 630 (the universal OG card aspect, 1.91:1)
 *   - Cream background, doctrine pose left, wordmark + tagline right
 *   - Tagline pulled verbatim from live landing copy — do not invent.
 */
export const runtime = "nodejs";
export const alt = "AESDR · The 12-lesson sales survival course, built by operators";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  // Read the doctrine PNG from disk and inline as data URI so the
  // ImageResponse doesn't need to fetch over HTTP at render time.
  const png = readFileSync(
    join(process.cwd(), "public/mascot/leponeus-doctrine.png")
  );
  const mascotUri = `data:image/png;base64,${png.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#FAF7F2",
          color: "#1A1A1A",
          padding: "60px 80px",
          fontFamily: "serif",
        }}
      >
        <img
          src={mascotUri}
          width={420}
          height={420}
          style={{ alignSelf: "center", flexShrink: 0 }}
          alt=""
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            marginLeft: 60,
          }}
        >
          <div
            style={{
              fontSize: 124,
              fontStyle: "italic",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            AESDR
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 36,
              marginTop: 28,
              color: "#6B6B6B",
              fontStyle: "italic",
              lineHeight: 1.3,
            }}
          >
            <div>12-lesson sales survival course.</div>
            <div>Built by operators, not course-people.</div>
          </div>
          <div
            style={{
              fontSize: 20,
              marginTop: 40,
              letterSpacing: ".2em",
              color: "#8B1A1A",
              textTransform: "uppercase",
              fontFamily: "monospace",
            }}
          >
            aesdr.com
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
