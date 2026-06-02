import CourseFramePreview from "./CourseFramePreview";

/**
 * Custom branded view for /x/kit/curriculum-overview. Replaces plain
 * markdown with an editorial spread: the shape, the four arcs as labeled
 * pillars, the inclusions strip, and the live in-course preview frame.
 */
export default function KitDocCurriculumOverview() {
  return (
    <div style={{ color: "var(--ink, #1A1A1A)" }}>
      {/* ── The shape ── */}
      <Block label="The shape">
        <Lede>
          12 courses. Sequenced from foundational to advanced. Each course pairs
          operating frameworks with one or more interactive worksheets the
          AE/SDR keeps.
        </Lede>
        <p style={para}>
          Seven substantial assets open across the program — the AE/SDR
          Alignment Contract, the ROI &amp; Commission Defense Tracker, the CRM
          Survival Guide, and more — that AEs and SDRs keep using after the
          course ends, including the end-of-course 72-Hour Strike Plan as the
          seventh.
        </p>
        <p style={para}>
          The format is interactive HTML, not video lectures. A section takes
          15–25 minutes. You can do one on a commute, two on a slow Friday, the
          rest the weekend before quarter end.
        </p>
      </Block>

      {/* ── Four arcs as pillars ── */}
      <Block label="The four arcs">
        <p style={para}>
          The 12 courses cluster into four operating concerns AEs and SDRs face
          in their first two years:
        </p>
        <div
          style={{
            marginTop: 28,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {ARCS.map((arc) => (
            <div
              key={arc.title}
              style={{
                background: "var(--cream, #FAF7F2)",
                border: "1px solid var(--light, #E8E4DF)",
                padding: "22px 22px 24px",
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
                  background: arc.accent,
                }}
              />
              <div
                style={{
                  fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
                  textTransform: "uppercase",
                  letterSpacing: ".18em",
                  fontSize: 11,
                  color: "var(--muted, #6B6B6B)",
                  marginBottom: 8,
                }}
              >
                Arc {arc.n}
              </div>
              <h3
                style={{
                  fontFamily:
                    "var(--display, 'Playfair Display', Georgia, serif)",
                  fontStyle: "italic",
                  fontSize: 22,
                  margin: 0,
                  marginBottom: 8,
                }}
              >
                {arc.title}
              </h3>
              <p
                style={{
                  fontFamily:
                    "var(--serif, 'Source Serif 4', Georgia, serif)",
                  fontSize: 15,
                  lineHeight: 1.55,
                  margin: 0,
                  color: "var(--ink, #1A1A1A)",
                }}
              >
                {arc.body}
              </p>
            </div>
          ))}
        </div>
      </Block>

      {/* ── What's NOT in it ── */}
      <Block label="What's not in it">
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "8px 0 0",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {NOTINIT.map((row) => (
            <li
              key={row.k}
              style={{
                padding: "16px 18px",
                borderLeft: "3px solid var(--crimson, #8B1A1A)",
                background: "var(--cream, #FAF7F2)",
                fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
                fontSize: 15,
                lineHeight: 1.55,
              }}
            >
              <strong style={{ fontStyle: "italic" }}>{row.k}.</strong> {row.v}
            </li>
          ))}
        </ul>
      </Block>

      {/* ── License ── */}
      <Block label="What every license includes">
        <p style={para}>
          One-time purchase: all 12 courses, the named substantial assets,
          every future curriculum update at no extra cost. A private alumni
          room opens to buyers who finish all twelve courses — strictly
          post-completion, not a pre-purchase community claim. 14-day,
          no-questions-asked refund. One price, paid once.
        </p>
      </Block>

      {/* ── The live preview ── */}
      <Block label="Try one widget">
        <p style={para}>
          Below is{" "}
          <em>
            one interactive widget from Course 04 — Navigating Manager Madness,
            rendered live
          </em>
          . Click a survival strategy to select it, then match it to the
          manager archetype it&rsquo;s built for. Get all five right and
          we&rsquo;ll tell you what you&rsquo;re actually looking at.
        </p>
        <CourseFramePreview />
      </Block>
    </div>
  );
}

/* ── tiny presentational helpers ── */

const para: React.CSSProperties = {
  fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
  fontSize: 18,
  lineHeight: 1.7,
  margin: "0 0 14px",
};

function Lede({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
        fontStyle: "italic",
        fontSize: 21,
        lineHeight: 1.55,
        color: "var(--ink, #1A1A1A)",
        margin: "0 0 18px",
        borderLeft: "3px solid var(--crimson, #8B1A1A)",
        paddingLeft: 18,
      }}
    >
      {children}
    </p>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 56 }}>
      <h2
        style={{
          fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
          textTransform: "uppercase",
          letterSpacing: ".22em",
          fontSize: 13,
          color: "var(--crimson, #8B1A1A)",
          margin: "0 0 18px",
        }}
      >
        {label}
      </h2>
      {children}
    </section>
  );
}

const ARCS = [
  {
    n: "01",
    title: "Survive ramp.",
    body:
      "First 90 days, manager dynamics, expectation calibration.",
    accent: "var(--crimson, #8B1A1A)",
  },
  {
    n: "02",
    title: "Read your pipeline.",
    body:
      "Distinguishing pipeline that closes from pipeline that's hope. Strike plans, deal hygiene, forecast honesty.",
    accent: "#b4455d",
  },
  {
    n: "03",
    title: "Manage the system.",
    body:
      "Working a CRM that wasn't built for you, fighting for clean data, the math of your commission plan.",
    accent: "#8B5CF6",
  },
  {
    n: "04",
    title: "Build the next role.",
    body:
      "Career capital, network without grovel, the judgment moves that compound.",
    accent: "var(--ink, #1A1A1A)",
  },
];

const NOTINIT = [
  { k: "Mindset work", v: "We don't do mindset." },
  { k: "Cold-call tricks", v: "We do disqualification, not dial volume." },
  {
    k: "Generic scripts",
    v: "The lessons teach the underlying judgment; scripts you copy off LinkedIn rot in a quarter.",
  },
  {
    k: "Certificates / badges",
    v: "AESDR doesn't issue one. Hiring managers want evidence of operating judgment, not paper.",
  },
];
