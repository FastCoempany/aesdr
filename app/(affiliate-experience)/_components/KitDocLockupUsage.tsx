import { Mascot, MASCOT_SIZE } from "@/components/brand/Mascot";
import { Icon, type IconName } from "@/components/brand/Icon";
import {
  Wordmark,
  CornerBracket,
  GhostNumeral,
} from "@/components/brand/BrandAssets";

/**
 * Custom branded view for /x/kit/lockup-usage.
 *
 * Treatment: a brand-rules sheet that demonstrates the rules visually.
 * The hero shows an actual AESDR × [Your Mark] lockup specimen in
 * three variants (horizontal, stacked, on-cream) so the affiliate sees
 * the artifact before they read about it. Then the three placement
 * surfaces, the three Don't rules with crimson strike-throughs, and
 * what arrives in the after-signing deliverable.
 */
export default function KitDocLockupUsage() {
  return (
    <div style={{ color: "var(--ink, #1A1A1A)" }}>
      {/* ── Hero with actual lockup specimen ── */}
      <section
        style={{
          background: "var(--cream, #FAF7F2)",
          border: "1px solid var(--ink, #1A1A1A)",
          padding: "36px 36px 34px",
          marginBottom: 56,
          position: "relative",
        }}
      >
        <CornerBracket
          position="tl"
          size={24}
          color="rgba(26,26,26,0.22)"
          style={{ position: "absolute", top: 10, left: 10 }}
        />
        <CornerBracket
          position="tr"
          size={24}
          color="rgba(26,26,26,0.22)"
          style={{ position: "absolute", top: 10, right: 10 }}
        />
        <Eyebrow icon="mile">The co-brand mark</Eyebrow>
        <h2
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "clamp(26px, 3.2vw, 36px)",
            lineHeight: 1.18,
            margin: 0,
            letterSpacing: "-0.005em",
          }}
        >
          AESDR <span style={{ color: "var(--crimson, #8B1A1A)" }}>×</span>{" "}
          Affiliate. Not a logo placement — an operator credit.
        </h2>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontStyle: "italic",
            fontSize: 17,
            color: "var(--muted, #6B6B6B)",
            margin: "16px 0 28px",
            lineHeight: 1.6,
            maxWidth: 720,
          }}
        >
          The actual files are built to your mark and ship after the
          partnership agreement is signed. Until then, this is the rule
          sheet they arrive with.
        </p>

        {/* Three lockup specimens — the artifact, demonstrated */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
            marginTop: 16,
          }}
        >
          <Specimen variant="horizontal" />
          <Specimen variant="stacked" />
          <Specimen variant="on-cream" />
        </div>
      </section>

      {/* ── Where it goes ── */}
      <section style={{ marginBottom: 56 }}>
        <SectionLabel icon="mile">Where it goes</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 14,
            marginTop: 22,
          }}
        >
          {PLACEMENTS.map((p) => (
            <article
              key={p.surface}
              style={{
                padding: "22px 22px 24px",
                background: "var(--cream, #FAF7F2)",
                border: "1px solid var(--light, #E8E4DF)",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: "var(--crimson, #8B1A1A)",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <Icon
                  name={p.icon}
                  size={18}
                  style={{ color: "var(--crimson, #8B1A1A)" }}
                />
                <h3
                  style={{
                    fontFamily:
                      "var(--display, 'Playfair Display', Georgia, serif)",
                    fontStyle: "italic",
                    fontWeight: 700,
                    fontSize: 18,
                    margin: 0,
                  }}
                >
                  {p.surface}
                </h3>
              </div>
              <p
                style={{
                  fontFamily:
                    "var(--serif, 'Source Serif 4', Georgia, serif)",
                  fontSize: 15,
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {p.where}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Color + Spacing rules ── */}
      <section style={{ marginBottom: 56 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
          }}
        >
          <div
            style={{
              padding: "26px 26px 28px",
              background: "var(--cream, #FAF7F2)",
              border: "1px solid var(--ink, #1A1A1A)",
            }}
          >
            <SectionLabel icon="signal">Color</SectionLabel>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "16px 0 0",
                display: "grid",
                gap: 10,
              }}
            >
              <Swatch
                color="#1A1A1A"
                label="AESDR mark — ink (#1A1A1A)"
              />
              <Swatch
                color="var(--crimson, #8B1A1A)"
                label="Your brand color (your call)"
              />
              <Swatch
                color="#1A1A1A"
                label="× separator — ink, matched x-height"
              />
            </ul>
          </div>
          <div
            style={{
              padding: "26px 26px 28px",
              background: "var(--cream, #FAF7F2)",
              border: "1px solid var(--ink, #1A1A1A)",
            }}
          >
            <SectionLabel icon="weight">Spacing</SectionLabel>
            <p
              style={{
                fontFamily:
                  "var(--serif, 'Source Serif 4', Georgia, serif)",
                fontSize: 16,
                lineHeight: 1.65,
                margin: "16px 0 0",
              }}
            >
              Minimum <strong>24px clearspace</strong> around the lockup on
              all sides. Never inside a colored panel that fights either
              brand. If the surface forces a tight crop, shrink the
              lockup before you shrink the clearspace.
            </p>
          </div>
        </div>
      </section>

      {/* ── Three things never to do — strike-through treatment ── */}
      <section style={{ marginBottom: 56 }}>
        <SectionLabel icon="warn">Three things never to do</SectionLabel>
        <div style={{ display: "grid", gap: 14, marginTop: 22 }}>
          {DONTS.map((d, i) => (
            <Dont key={d.heading} index={i + 1} entry={d} />
          ))}
        </div>
      </section>

      {/* ── What you'll receive after signing ── */}
      <section
        style={{
          padding: "30px 32px 32px",
          background: "var(--ink, #1A1A1A)",
          color: "#FAF7F2",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background:
              "linear-gradient(90deg, var(--crimson, #8B1A1A), #b4455d, #8B5CF6)",
          }}
        />
        <Eyebrow icon="ledger" tone="dark">
          What ships after signing
        </Eyebrow>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 18,
            marginTop: 16,
          }}
        >
          {DELIVERABLES.map((dv) => (
            <div key={dv.heading}>
              <div
                style={{
                  fontFamily:
                    "var(--cond, 'Barlow Condensed', sans-serif)",
                  textTransform: "uppercase",
                  letterSpacing: ".22em",
                  fontSize: 11,
                  color: "#b4455d",
                  marginBottom: 8,
                }}
              >
                {dv.heading}
              </div>
              <p
                style={{
                  fontFamily:
                    "var(--serif, 'Source Serif 4', Georgia, serif)",
                  fontSize: 15,
                  lineHeight: 1.55,
                  margin: 0,
                  color: "rgba(250,247,242,0.88)",
                }}
              >
                {dv.body}
              </p>
            </div>
          ))}
        </div>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontSize: 15,
            lineHeight: 1.6,
            margin: "22px 0 0",
            color: "rgba(250,247,242,0.72)",
            fontStyle: "italic",
          }}
        >
          Plus a one-page composition guide that shows you exactly where
          the mark sits on your registration page out of the gate, with
          the clearspace already worked out.
        </p>
      </section>
    </div>
  );
}

function Specimen({ variant }: { variant: "horizontal" | "stacked" | "on-cream" }) {
  const label = {
    horizontal: "Horizontal",
    stacked: "Stacked",
    "on-cream": "On-cream",
  }[variant];
  const bg = variant === "on-cream" ? "#FAF7F2" : "#FFFFFF";

  return (
    <div
      style={{
        background: bg,
        border: "1px solid var(--light, #E8E4DF)",
        padding: 22,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        minHeight: 160,
        justifyContent: "center",
      }}
    >
      {/* The lockup itself */}
      {variant === "stacked" ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Wordmark size={92} />
          <span
            style={{
              fontSize: 18,
              fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
              color: "var(--ink, #1A1A1A)",
            }}
          >
            ×
          </span>
          <div
            style={{
              fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
              textTransform: "uppercase",
              letterSpacing: ".18em",
              fontSize: 12,
              color: "var(--crimson, #8B1A1A)",
              padding: "5px 12px",
              border: "1.5px solid var(--crimson, #8B1A1A)",
            }}
          >
            Your Mark
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Wordmark size={82} />
          <span
            style={{
              fontSize: 20,
              fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
              color: "var(--ink, #1A1A1A)",
            }}
          >
            ×
          </span>
          <div
            style={{
              fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
              textTransform: "uppercase",
              letterSpacing: ".18em",
              fontSize: 12,
              color: "var(--crimson, #8B1A1A)",
              padding: "5px 12px",
              border: "1.5px solid var(--crimson, #8B1A1A)",
            }}
          >
            Your Mark
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: 12,
          fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
          textTransform: "uppercase",
          letterSpacing: ".22em",
          fontSize: 10,
          color: "var(--muted, #6B6B6B)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
        fontSize: 14,
        lineHeight: 1.5,
      }}
    >
      <span
        aria-hidden
        style={{
          flexShrink: 0,
          width: 20,
          height: 20,
          background: color,
          border: "1px solid var(--ink, #1A1A1A)",
        }}
      />
      {label}
    </li>
  );
}

function Dont({
  index,
  entry,
}: {
  index: number;
  entry: { heading: string; body: string };
}) {
  return (
    <article
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 24,
        padding: "24px 26px 26px",
        background: "var(--cream, #FAF7F2)",
        border: "1px solid var(--light, #E8E4DF)",
        borderLeft: "3px solid var(--crimson, #8B1A1A)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
          fontStyle: "italic",
          fontWeight: 900,
          fontSize: 44,
          lineHeight: 1,
          color: "var(--crimson, #8B1A1A)",
          letterSpacing: "-0.02em",
        }}
      >
        {String(index).padStart(2, "0")}
      </div>
      <div>
        <h3
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 20,
            margin: "0 0 8px",
            letterSpacing: "-0.005em",
          }}
        >
          {entry.heading}
        </h3>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontSize: 15.5,
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          {entry.body}
        </p>
      </div>
    </article>
  );
}

function Eyebrow({
  icon,
  children,
  tone = "light",
}: {
  icon: IconName;
  children: React.ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
        textTransform: "uppercase",
        letterSpacing: ".24em",
        fontSize: 12,
        color: tone === "dark" ? "#b4455d" : "var(--crimson, #8B1A1A)",
        marginBottom: 14,
      }}
    >
      <Icon name={icon} size={14} />
      {children}
    </div>
  );
}

function SectionLabel({
  icon,
  children,
}: {
  icon: IconName;
  children: React.ReactNode;
}) {
  return (
    <h2
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
        textTransform: "uppercase",
        letterSpacing: ".22em",
        fontSize: 13,
        color: "var(--crimson, #8B1A1A)",
        margin: 0,
      }}
    >
      <Icon name={icon} size={14} />
      {children}
    </h2>
  );
}

const PLACEMENTS: Array<{
  surface: string;
  where: string;
  icon: IconName;
}> = [
  {
    surface: "Registration page",
    icon: "mile",
    where: "Top-center, above the fold.",
  },
  {
    surface: "Workshop deck",
    icon: "team",
    where: "Top-left of every slide template.",
  },
  {
    surface: "Affiliate-specific email",
    icon: "quill",
    where: "Footer only — never the header.",
  },
];

const DONTS = [
  {
    heading: 'No "presented by" / "in association with" / "powered by"',
    body: "The lockup is the credit. Adding language defeats it.",
  },
  {
    heading: "No third logo",
    body:
      "AESDR × Affiliate is two marks, not three. If a sponsor or platform mark is required by your channel, place it in a separate band — not inside the lockup.",
  },
  {
    heading: "No proportion edits",
    body:
      "Don't squish, stretch, or recompose the supplied files. If a placement needs an aspect ratio we didn't ship, ask — we'll build it.",
  },
];

const DELIVERABLES: Array<{ heading: string; body: string }> = [
  {
    heading: "Horizontal",
    body: "AESDR + your mark side-by-side on one line, with the × separator. For top-center registration-page placement and the workshop deck slide template.",
  },
  {
    heading: "Stacked",
    body: "AESDR above your mark, two lines, separator centered. For tight-aspect placements — email footers, social profile squares, small-format print.",
  },
  {
    heading: "On-cream",
    body: "Same horizontal composition, optimized for printing or embedding into PDFs and slide decks with light backgrounds.",
  },
];
