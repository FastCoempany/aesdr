/**
 * The wall shown when someone reaches the affiliate experience without an
 * invite — the bare domain, or any deep link without the access cookie. Kept
 * deliberately plain and on-brand (cream / crimson / editorial): it should read
 * as "this is private and intentional," not as an error.
 */
const cream = "var(--cream, #FAF7F2)";
const ink = "var(--ink, #1A1A1A)";
const crimson = "var(--crimson, #8B1A1A)";
const muted = "var(--muted, #6B6B6B)";
const mono = "var(--mono, 'Space Mono', monospace)";
const display = "var(--display, 'Playfair Display', Georgia, serif)";
const serif = "var(--serif, 'Source Serif 4', Georgia, serif)";

export default function ExperienceWall() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: cream,
        color: ink,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 440, textAlign: "center" }}>
        <p
          style={{
            fontFamily: mono,
            textTransform: "uppercase",
            letterSpacing: ".28em",
            fontSize: 11,
            color: crimson,
            margin: 0,
          }}
        >
          AESDR · Private Preview
        </p>
        <h1
          style={{
            fontFamily: display,
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "clamp(28px, 5vw, 38px)",
            lineHeight: 1.15,
            margin: "18px 0 0",
            letterSpacing: "-0.01em",
          }}
        >
          This one&rsquo;s by invitation.
        </h1>
        <p
          style={{
            fontFamily: serif,
            fontSize: 16,
            lineHeight: 1.65,
            color: muted,
            margin: "16px auto 0",
            maxWidth: 380,
          }}
        >
          We send this kit to a small number of people whose audience it&rsquo;s
          actually built for. If you were sent a link, open it from your email —
          it carries your access. It won&rsquo;t open from the plain address.
        </p>
        <p
          style={{
            fontFamily: serif,
            fontSize: 15,
            lineHeight: 1.6,
            color: ink,
            margin: "22px 0 0",
          }}
        >
          Think your people would fit?{" "}
          <a
            href="mailto:hello@aesdr.com?subject=Affiliate%20kit"
            style={{
              color: crimson,
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            hello@aesdr.com
          </a>
        </p>
      </div>
    </main>
  );
}
