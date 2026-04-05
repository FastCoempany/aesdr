/**
 * Social proof sandbox — ready for real testimonials.
 *
 * To add a testimonial, add an object to the TESTIMONIALS array below.
 * The component will not render if the array is empty.
 */

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

const TESTIMONIALS: Testimonial[] = [
  // Uncomment and replace with real testimonials when ready:
  //
  // {
  //   quote: "This course completely changed how I approach my pipeline.",
  //   name: "J.R.",
  //   role: "Enterprise AE",
  // },
  // {
  //   quote: "I went from dreading Mondays to owning them.",
  //   name: "A.K.",
  //   role: "SDR, Series B SaaS",
  // },
  // {
  //   quote: "The 72-Hour Strike Plan paid for itself in week one.",
  //   name: "M.T.",
  //   role: "Mid-Market AE",
  // },
];

export default function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section
      style={{
        position: "relative",
        zIndex: 2,
        padding: "0 24px 48px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--mono)",
          fontSize: "9px",
          letterSpacing: ".2em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          opacity: 0.6,
        }}
      >
        From the Trenches
      </p>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: "900px",
        }}
      >
        {TESTIMONIALS.map((t, i) => (
          <div
            key={i}
            style={{
              flex: "1 1 240px",
              maxWidth: "280px",
              padding: "20px 24px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--serif)",
                fontSize: "15px",
                lineHeight: "1.7",
                color: "var(--text-muted)",
                marginBottom: "16px",
              }}
            >
              &ldquo;{t.quote}&rdquo;
            </p>
            <div>
              <p
                style={{
                  fontFamily: "var(--cond)",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  color: "var(--text-main)",
                }}
              >
                {t.name}
              </p>
              <p
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "9px",
                  letterSpacing: ".08em",
                  color: "var(--text-muted)",
                  opacity: 0.7,
                }}
              >
                {t.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
