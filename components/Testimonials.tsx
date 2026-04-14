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

// FAUX TESTIMONIALS — Replace with real quotes from beta testers before launch.
// See docs/content/A09-testimonials.md for the full set and guidelines.
const TESTIMONIALS: Testimonial[] = [
  {
    quote: "I've been an SDR for 14 months and nobody taught me half of what's in Course 1. The manager archetypes alone changed how I handle my 1:1s.",
    name: "Jordan M.",
    role: "SDR, Series B SaaS",
  },
  {
    quote: "No motivational BS. No 'crush your quota' energy. Just practical frameworks I use every week. That's rare.",
    name: "Taylor H.",
    role: "BDR Lead",
  },
  {
    quote: "I used the AE/SDR Alignment Contract from Course 3 in my actual job. My AE and I went from passive-aggressive Slack messages to a real working relationship.",
    name: "Marcus T.",
    role: "SDR, recently promoted to AE",
  },
  {
    quote: "The 72-hour strike plan in Course 12 saved my quarter. I was spiraling after losing two big deals and this framework gave me a concrete plan instead of panic.",
    name: "David L.",
    role: "AE, Series C Startup",
  },
  {
    quote: "I bought the team license for my 6 SDRs. The interactive format actually kept them engaged — I've never seen my team finish a training program before.",
    name: "Sarah W.",
    role: "SDR Manager",
  },
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
        Already Changing Lives
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
