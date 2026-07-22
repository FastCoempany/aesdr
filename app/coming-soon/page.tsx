import type { Metadata } from "next";

import ComingSoonInteractive from "./ComingSoonInteractive";
import { joinWaitlistAction } from "./actions";
import styles from "./gate.module.css";

/**
 * The gate — what anonymous traffic sees while AESDR opens by letter.
 * Founder pick 2026-07-22: "the iris payout."
 *
 * One server-rendered screen, no JS required to render or to act:
 *   · the threshold — Invitation only., the key slot (a plain GET form into
 *     /x/access?p=…, the same door a letter's link opens), and the waitlist
 *     (a server-action form into free_leads)
 *   · the lit skyline + the syllabus ghosting by, with the engraved money
 *     payout after every third word — all pure CSS on a 14.4s clock
 *   · Leponeus, full size, introducing himself
 *
 * Bypass mechanisms are unchanged from the old gate:
 *   1. URL `?bypass=<code>` — handled at the edge in proxy.ts. Zero JS.
 *   2. Keyboard buffer with 700ms debounce → `submitBypassAction()`.
 *   3. Click the mascot → prompt → `submitBypassAction()`.
 * (2) and (3) live in ComingSoonInteractive, overlaid on Leponeus.
 */

export const metadata: Metadata = {
  title: "AESDR — Invitation only",
  description:
    "AESDR is a sales curriculum built by operators, for SDRs and AEs in their first two years — the part of the job nobody trains you on.",
};

// The syllabus that ghosts by — the tease is the course itself.
const WORDS = ["cold calls.", "discovery.", "objections.", "the ramp.", "your manager.", "the close."];
// 1.4s per word; the payout owns 4.2–7.2 and 11.4–14.4.
const WORD_DELAYS = [0, 1.4, 2.8, 7.2, 8.6, 10];

// Deterministic flight paths for the two payout volleys:
// [mx, my, tx, ty, rot, scale, delay] — mid-arc point, landing point, spin.
// Precomputed constants (not Math.random) so the server render stays pure.
type Flight = [number, number, number, number, number, number, number];
const BAGS: Flight[] = [
  [-125, -394, -251, 168, 145, 0.55, 4.27], [-132, -393, -264, 181, -159, 0.85, 4.36],
  [-13, -367, -26, 218, 141, 1.0, 4.39], [50, -349, 100, 132, -24, 0.7, 4.32],
  [-246, -398, -493, 69, -391, 1.0, 4.28],
  [47, -230, 94, 92, 336, 0.55, 11.41], [-20, -283, -40, 130, -126, 0.7, 11.69],
  [161, -337, 323, 147, -130, 1.0, 11.43], [0, -234, 1, 160, 352, 0.45, 11.54],
  [87, -276, 175, 208, -44, 0.45, 11.43],
];
const BILLS: Flight[] = [
  [251, -313, 458, 268, -197, 1.0, 4.35], [127, -254, 232, 261, -165, 0.8, 4.31],
  [-96, -260, -176, 63, -436, 0.8, 4.41], [-165, -184, -300, 200, 390, 0.8, 4.37],
  [180, -191, 329, 154, -331, 1.25, 4.43], [-85, -290, -155, 151, 362, 1.25, 4.23],
  [209, -306, 380, 62, 328, 1.5, 4.4], [248, -271, 451, 224, 544, 0.8, 4.33],
  [59, -276, 108, 177, -504, 1.0, 4.31], [-188, -289, -342, 208, 276, 1.5, 4.42],
  [26, -197, 49, 246, 400, 1.5, 4.32], [-226, -222, -411, 179, 70, 1.5, 4.37],
  [-134, -217, -245, 68, -183, 1.0, 11.48], [-12, -334, -23, 234, -406, 1.0, 11.45],
  [-145, -173, -264, 93, -95, 0.8, 11.47], [-3, -312, -7, 244, -357, 1.25, 11.53],
  [17, -290, 31, 231, 121, 1.5, 11.5], [35, -205, 64, 112, 387, 1.0, 11.55],
  [225, -299, 410, 218, -372, 1.0, 11.63], [-187, -266, -341, 244, 50, 1.0, 11.57],
  [261, -205, 475, 240, 441, 1.0, 11.59], [-215, -172, -392, 71, 500, 1.0, 11.41],
  [-220, -149, -400, 112, -419, 0.8, 11.64], [266, -154, 484, 201, 12, 1.25, 11.61],
];
const PAYOUT_DELAYS = [4.2, 11.4];
const MONEY_DELAYS = [
  { cls: "m1", delay: 4.55 }, { cls: "m2", delay: 5.3 }, { cls: "m3", delay: 6.05 },
  { cls: "m1", delay: 11.75 }, { cls: "m2", delay: 12.5 }, { cls: "m3", delay: 13.25 },
];

function BagSvg() {
  return (
    <svg viewBox="0 0 100 110" aria-hidden="true">
      <path
        d="M38 18 Q50 8 62 18 L58 28 Q70 34 76 52 Q84 76 68 92 Q50 104 32 92 Q16 76 24 52 Q30 34 42 28 Z"
        className={styles.bagBody}
      />
      <path d="M40 26 L60 26" className={styles.bagTie} />
      <text x="50" y="72" className={styles.bagSign}>$</text>
    </svg>
  );
}

function BillSvg() {
  return (
    <svg viewBox="0 0 60 30" aria-hidden="true">
      <rect x="1.2" y="1.2" width="57.6" height="27.6" className={styles.billOuter} />
      <rect x="4" y="4" width="52" height="22" className={styles.billInner} />
      <text x="30" y="19.5" className={styles.billHundred}>100</text>
      <text x="8" y="10" className={styles.billCorner}>100</text>
      <text x="52" y="24" className={styles.billCorner} textAnchor="end">100</text>
    </svg>
  );
}

function flightStyle([mx, my, tx, ty, rot, sc, delay]: Flight): React.CSSProperties {
  return {
    ["--mx" as never]: `${mx}px`,
    ["--my" as never]: `${my}px`,
    ["--tx" as never]: `${tx}px`,
    ["--ty" as never]: `${ty}px`,
    ["--rr" as never]: `${rot}deg`,
    ["--sc" as never]: `${sc}`,
    animationDelay: `${delay}s`,
  };
}

export default async function ComingSoonPage({
  searchParams,
}: {
  searchParams: Promise<{ w?: string }>;
}) {
  const { w } = await searchParams;

  return (
    <main className={styles.gate}>
      {/* the lit skyline */}
      <div className={styles.bgSky} aria-hidden="true">
        <div className={styles.skyFar} />
        <div className={styles.skyNear} />
        <div className={styles.skyLight} />
      </div>

      {/* the syllabus, ghosted */}
      <div className={styles.bgWords} aria-hidden="true">
        {WORDS.map((word, i) => (
          <span key={word} className={styles.gw} style={{ animationDelay: `${WORD_DELAYS[i]}s` }}>
            {word}
          </span>
        ))}
      </div>

      {/* the payout */}
      <div className={styles.burst} aria-hidden="true">
        {PAYOUT_DELAYS.map((d) => (
          <span key={`ring-${d}`} className={styles.ring} style={{ animationDelay: `${d}s` }} />
        ))}
        {PAYOUT_DELAYS.map((d) => (
          <span key={`bag-${d}`} className={styles.bag} style={{ animationDelay: `${d}s` }}>
            <BagSvg />
          </span>
        ))}
        {BAGS.map((f, i) => (
          <i key={`fb-${i}`} className={styles.fbag} style={flightStyle(f)}>
            <BagSvg />
          </i>
        ))}
        {BILLS.map((f, i) => (
          <i key={`bl-${i}`} className={styles.bill} style={flightStyle(f)}>
            <BillSvg />
          </i>
        ))}
        {MONEY_DELAYS.map(({ cls, delay }) => (
          <span
            key={`mw-${delay}`}
            className={`${styles.mw} ${styles[cls]}`}
            style={{ animationDelay: `${delay}s` }}
          >
            money
          </span>
        ))}
      </div>

      {/* the threshold */}
      <div className={styles.fg}>
        <div className={styles.rail}>
          <span className={styles.wordmark}>
            AESDR<i className={styles.irisRule} />
          </span>
          <span className={styles.railNote}>Chicago</span>
        </div>

        <div className={styles.mid}>
          <p className={styles.kicker}>Private — opens by letter</p>
          <h1 className={styles.headline}>Invitation only.</h1>
          <p className={styles.lede}>
            AESDR is a sales curriculum built by operators, for SDRs and AEs in their
            first two years — <em>the part of the job nobody trains you on.</em>
          </p>
          <div className={styles.keyrow}>
            <span className={styles.keylabel}>Have a key?</span>
            <form className={styles.slot} action="/x/access" method="get">
              <input name="p" placeholder="paste your code" aria-label="invite code" maxLength={128} />
              <button type="submit">Unlock</button>
            </form>
            <span className={styles.keynote}>
              Your key is the link inside your letter — it already knows you.
            </span>
          </div>
        </div>

        <div className={styles.doorman}>
          {/* Position anchor for the invisible bypass overlay (click → prompt). */}
          <div style={{ position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mascot/leponeus-verdict-sm.png" alt="Leponeus, the AESDR sales mascot" draggable={false} />
            <ComingSoonInteractive />
          </div>
          <span>hi, i&rsquo;m leponeus — your trusty sales mascot</span>
        </div>

        <div className={styles.foot}>
          <span>No letter yet? Leave an address — one letter, no drip.</span>
          <form className={styles.mailRow} action={joinWaitlistAction}>
            <input
              name="email"
              type="email"
              placeholder="your@address.com"
              aria-label="email address"
              maxLength={254}
              required
            />
            <button type="submit" className={styles.ghostBtn}>
              Write me
            </button>
          </form>
          {w === "ok" && <span className={styles.footNote}>Noted. One letter when the doors open.</span>}
          {w === "invalid" && <span className={styles.footErr}>That address didn&rsquo;t read — check it and try again.</span>}
          {w === "later" && <span className={styles.footErr}>Too many tries from here — come back in a bit.</span>}
        </div>
      </div>
    </main>
  );
}
