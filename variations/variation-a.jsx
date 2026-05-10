/* Variation A — Editorial Spread
 * Print-style one-pager. Heavy editorial vibe.
 * Crimson hero block · Manifesto · 12-lesson typographic index
 * · Two voices · Pricing strip · Operator chrome footer.
 * Width 720px to read like a tall print column. Cream throughout.
 */

const A_W = 720;

function VariationA() {
  const styles = a_styles;
  return (
    <article style={styles.page}>
      {/* Operator chrome top strip */}
      <header style={styles.topStrip}>
        <Eyebrow>AESDR · OPERATING MANUAL · ONE-PAGER</Eyebrow>
        <Eyebrow>FILE 001 / V1.1 · CANON</Eyebrow>
      </header>

      {/* HERO — full-bleed crimson */}
      <section style={styles.hero}>
        <GhostNumeral n="01" size={420} color="rgba(255,255,255,0.06)" style={{ right: -40, bottom: -160 }} />
        <div style={styles.heroInner}>
          <Wordmark size={56} dark={true} dotIris={true} />
          <Eyebrow light style={{ marginTop: 28, display: 'block' }}>
            FOR FIRST-1-TO-2-YEAR SDRS &amp; AES · NOT FOR LINKEDIN
          </Eyebrow>
          <h1 style={styles.heroH1}>
            Stop surviving.<br/>Start owning it.
          </h1>
          <p style={styles.heroLead}>
            Twelve interactive, field-tested sessions for AEs and SDRs serious about
            controlling chaos, managing toxic leadership, and protecting their commission —
            and their future.
          </p>
          <div style={styles.heroFacts}>
            <div style={styles.fact}>
              <span style={styles.factN}>12</span>
              <span style={styles.factL}>LESSONS</span>
            </div>
            <span style={styles.factDiv} />
            <div style={styles.fact}>
              <span style={styles.factN}>5</span>
              <span style={styles.factL}>TOOLS</span>
            </div>
            <span style={styles.factDiv} />
            <div style={styles.fact}>
              <span style={styles.factN}>14d</span>
              <span style={styles.factL}>REFUND</span>
            </div>
            <span style={styles.factDiv} />
            <div style={styles.fact}>
              <span style={styles.factN}>∞</span>
              <span style={styles.factL}>ACCESS</span>
            </div>
          </div>
        </div>
      </section>

      {/* WHISPER — italic mute one-liner under hero */}
      <div style={styles.whisper}>
        <em>Keep reading. It has to get worse before it gets better.</em>
      </div>

      {/* MANIFESTO BLOCK */}
      <section style={styles.bodySec}>
        <Eyebrow style={{ display: 'block', marginBottom: 18 }}>MANIFESTO · 02</Eyebrow>
        <p style={styles.manifesto}>
          Your commission check is not income. It is a verdict on
          how you lived the last 30 days. AESDR is the operating
          manual nobody handed you on day one — written by operators,
          tested in the seat, allergic to motivation. <span style={styles.crimsonInline}>This is not a course about mindset. It is a course about Tuesday.</span>
        </p>
        <p style={styles.michaelPull}>
          "My manager said I have 'so much potential.' That was six months ago.
          I still have the same amount of potential. Like, exactly the same amount.
          It's just sitting there. Being potential."
        </p>
        <Eyebrow style={{ display: 'block', textAlign: 'right', marginTop: -4, color: '#8B1A1A' }}>
          — MICHAEL · 2AM CONFESSION
        </Eyebrow>
      </section>

      <IrisRule style={{ margin: '0 64px' }} />

      {/* 12 LESSON INDEX — typographic */}
      <section style={styles.bodySec}>
        <div style={styles.indexHead}>
          <div>
            <Eyebrow>SECTION · 03 · CURRICULUM</Eyebrow>
            <h2 style={styles.h2}>Twelve lessons. <em style={styles.h2em}>One operating manual.</em></h2>
          </div>
          <span style={styles.indexCounter}>012<span style={styles.indexCounterMute}>/012</span></span>
        </div>
        <ol style={styles.lessonList}>
          {LESSONS.map(([n, title, blurb]) => (
            <li key={n} style={styles.lessonRow}>
              <span style={styles.lessonN}>{n}</span>
              <span style={styles.lessonTitle}>{title}</span>
              <span style={styles.lessonDots} />
              <span style={styles.lessonBlurb}>{blurb}</span>
            </li>
          ))}
        </ol>
      </section>

      <IrisRule style={{ margin: '0 64px' }} />

      {/* 5 TOOLS — short list */}
      <section style={styles.bodySec}>
        <Eyebrow style={{ display: 'block', marginBottom: 18 }}>SECTION · 04 · TAKEAWAY TOOLS</Eyebrow>
        <h2 style={styles.h2}>Five things you keep<br/>after the screen goes dark.</h2>
        <div style={styles.toolGrid}>
          {TOOLS.map(([n, title, blurb]) => (
            <div key={n} style={styles.toolCell}>
              <span style={styles.toolN}>{n}</span>
              <div>
                <div style={styles.toolT}>{title}</div>
                <div style={styles.toolB}>{blurb}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <IrisRule style={{ margin: '0 64px' }} />

      {/* PRICING STRIP */}
      <section style={styles.bodySec}>
        <Eyebrow style={{ display: 'block', marginBottom: 18 }}>SECTION · 05 · PRICING</Eyebrow>
        <h2 style={styles.h2}>Three doors.<br/><em style={styles.h2em}>Same operating manual.</em></h2>
        <div style={styles.priceRow}>
          <div style={styles.priceCell}>
            <Eyebrow>SDR · LIFETIME</Eyebrow>
            <div style={styles.priceN}>$249</div>
            <p style={styles.priceB}>For first-year SDRs who can already see what's broken — they just don't have the language for it yet.</p>
          </div>
          <div style={{ ...styles.priceCell, ...styles.priceCellHot }}>
            <span style={styles.priceFlag}>OPERATOR PICK</span>
            <Eyebrow>AE · LIFETIME</Eyebrow>
            <div style={styles.priceN}>$299</div>
            <p style={styles.priceB}>For 1–2 year AEs running real deals with no real cover. The math fork that protects your commission first.</p>
          </div>
          <div style={styles.priceCell}>
            <Eyebrow>TEAM · UP TO 10</Eyebrow>
            <div style={styles.priceN}>$1,499</div>
            <p style={styles.priceB}>For managers who want their reps to feel less alone — and want to stop being the manager who lies.</p>
          </div>
        </div>
      </section>

      {/* HONESTY BLOCK — who shouldn't buy */}
      <section style={{ ...styles.bodySec, paddingTop: 32 }}>
        <div style={styles.honesty}>
          <CornerBrackets color="#8B1A1A" opacity={0.4} inset={10} size={14} />
          <Eyebrow crimson style={{ display: 'block', marginBottom: 14 }}>
            ⚠ WHO SHOULDN'T BUY THIS
          </Eyebrow>
          <p style={styles.honestyP}>
            Sales leaders looking for a team-building activity. Anyone who needs to be
            told they're a rockstar. Anyone whose LinkedIn bio contains the words
            "ninja," "passionate about," or "lead with value." We will not be a good fit.
            <span style={styles.michaelInline}> If it doesn't deliver value, we don't want your money.</span>
          </p>
        </div>
      </section>

      {/* FOOTER STRIP — CTA + chrome */}
      <footer style={styles.footer}>
        <GhostNumeral n="12" size={300} color="rgba(255,255,255,0.05)" style={{ left: -30, bottom: -110 }} />
        <div style={styles.footInner}>
          <div style={styles.ctaBlock}>
            <h3 style={styles.ctaH}>Get the operating manual.</h3>
            <p style={styles.ctaP}>Lifetime access. 14-day refund, no questions, no exit interview.</p>
            <button style={styles.ctaBtn} className="iris-shimmer-btn">
              Enroll Now &nbsp;·&nbsp; $249 SDR / $299 AE &nbsp;→
            </button>
            <div style={styles.ctaSubLine}>
              <Eyebrow light style={{ color: 'rgba(255,255,255,0.55)' }}>
                UNTAMED DISCORD · LIFETIME ACCESS · NO HUSTLE
              </Eyebrow>
            </div>
          </div>
          <div style={styles.footMeta}>
            <Wordmark size={28} dark dotIris />
            <div style={{ marginTop: 8 }}>
              <Eyebrow light style={{ color: 'rgba(255,255,255,0.45)' }}>
                AESDR.COM · v1.1 · CANON
              </Eyebrow>
            </div>
            <IrisRule width={120} style={{ marginTop: 18 }} />
          </div>
        </div>
      </footer>
    </article>
  );
}

const a_styles = {
  page: {
    width: A_W, background: '#FAF7F2', color: '#1A1A1A',
    font: "16px/1.55 'Source Serif 4', Georgia, serif",
    position: 'relative', overflow: 'hidden',
  },
  topStrip: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 32px', borderBottom: '1px solid #E8E4DF',
  },
  hero: {
    background: '#8B1A1A', color: '#FAF7F2', position: 'relative',
    overflow: 'hidden', padding: '56px 64px 64px',
  },
  heroInner: { position: 'relative', zIndex: 1 },
  heroH1: {
    margin: '24px 0 22px',
    font: "italic 900 64px/1.02 'Playfair Display', Georgia, serif",
    color: '#FAF7F2', letterSpacing: '-0.005em', textWrap: 'balance',
  },
  heroLead: {
    margin: 0, maxWidth: 520,
    font: "17px/1.6 'Source Serif 4', Georgia, serif",
    color: 'rgba(255,255,255,0.85)',
  },
  heroFacts: {
    display: 'flex', alignItems: 'center', gap: 24, marginTop: 36,
    paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.25)',
  },
  fact: { display: 'flex', flexDirection: 'column', gap: 6 },
  factN: { font: "italic 900 36px/1 'Playfair Display', Georgia, serif", color: '#FAF7F2' },
  factL: { font: "10px/1 'Space Mono', monospace", letterSpacing: '0.3em', color: 'rgba(255,255,255,0.55)' },
  factDiv: { width: 1, height: 36, background: 'rgba(255,255,255,0.25)' },

  whisper: {
    padding: '20px 64px', borderBottom: '1px solid #E8E4DF',
    font: "italic 14px/1.5 'Source Serif 4', Georgia, serif",
    color: '#6B6B6B', textAlign: 'center',
  },

  bodySec: { padding: '52px 64px' },
  manifesto: {
    margin: 0, font: "20px/1.55 'Source Serif 4', Georgia, serif",
    color: '#1A1A1A', textWrap: 'pretty',
  },
  crimsonInline: { color: '#8B1A1A', fontStyle: 'italic' },
  michaelPull: {
    margin: '32px 0 4px',
    font: "26px/1.45 'Caveat', cursive", color: '#8B1A1A',
    transform: 'rotate(-0.3deg)',
  },

  indexHead: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28,
  },
  h2: {
    margin: '12px 0 0',
    font: "italic 900 38px/1.05 'Playfair Display', Georgia, serif",
    color: '#1A1A1A', letterSpacing: '-0.005em', textWrap: 'balance',
  },
  h2em: { fontStyle: 'italic', color: '#6B6B6B', fontWeight: 900 },
  indexCounter: {
    font: "italic 900 56px/1 'Playfair Display', Georgia, serif", color: '#1A1A1A',
  },
  indexCounterMute: { color: '#E8E4DF' },

  lessonList: { listStyle: 'none', padding: 0, margin: '12px 0 0' },
  lessonRow: {
    display: 'grid',
    gridTemplateColumns: '40px auto 1fr auto',
    columnGap: 12,
    alignItems: 'baseline',
    padding: '14px 0',
    borderBottom: '1px solid #E8E4DF',
  },
  lessonN: {
    font: "italic 900 22px/1 'Playfair Display', Georgia, serif",
    color: '#8B1A1A',
  },
  lessonTitle: {
    font: "700 18px/1.15 'Barlow Condensed', sans-serif",
    letterSpacing: '0.02em', color: '#1A1A1A', textTransform: 'none',
  },
  lessonDots: {
    height: 1, background: 'rgba(0,0,0,0.10)',
    backgroundImage: 'radial-gradient(circle, #C9C4BD 1px, transparent 1px)',
    backgroundSize: '6px 2px', backgroundRepeat: 'repeat-x',
    backgroundPosition: 'center', alignSelf: 'center',
    margin: '0 14px',
  },
  lessonBlurb: {
    font: "italic 14px/1.5 'Source Serif 4', Georgia, serif",
    color: '#6B6B6B', maxWidth: 320, textAlign: 'right',
  },

  toolGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 32px', marginTop: 28,
  },
  toolCell: { display: 'flex', gap: 14, alignItems: 'flex-start' },
  toolN: {
    font: "italic 900 32px/1 'Playfair Display', Georgia, serif",
    color: '#E8E4DF', minWidth: 40,
  },
  toolT: {
    font: "700 16px/1.1 'Barlow Condensed', sans-serif",
    letterSpacing: '0.02em', color: '#1A1A1A',
  },
  toolB: {
    font: "14px/1.5 'Source Serif 4', Georgia, serif",
    color: '#6B6B6B', marginTop: 4,
  },

  priceRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 28 },
  priceCell: {
    background: '#FFFFFF', border: '1px solid #E8E4DF', padding: '20px 18px 22px',
    display: 'flex', flexDirection: 'column', gap: 10, position: 'relative',
  },
  priceCellHot: { borderColor: '#1A1A1A' },
  priceFlag: {
    position: 'absolute', top: -10, left: 18, background: '#1A1A1A', color: '#FAF7F2',
    font: "700 9px/1 'Barlow Condensed', sans-serif", letterSpacing: '0.25em',
    textTransform: 'uppercase', padding: '5px 10px',
  },
  priceN: {
    font: "italic 900 56px/1 'Playfair Display', Georgia, serif",
    color: '#1A1A1A',
  },
  priceB: { margin: 0, font: "13px/1.45 'Source Serif 4', Georgia, serif", color: '#6B6B6B' },

  honesty: {
    position: 'relative', padding: '28px 28px 26px',
    border: '1px solid rgba(139,26,26,0.20)', background: 'rgba(139,26,26,0.03)',
  },
  honestyP: {
    margin: 0, font: "16px/1.55 'Source Serif 4', Georgia, serif",
    color: '#1A1A1A',
  },
  michaelInline: {
    font: "20px/1.4 'Caveat', cursive", color: '#8B1A1A', marginLeft: 4,
  },

  footer: {
    background: '#1A1A1A', color: '#FAF7F2', position: 'relative', overflow: 'hidden',
    padding: '52px 64px 44px',
  },
  footInner: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, position: 'relative', zIndex: 1 },
  ctaBlock: { maxWidth: 460 },
  ctaH: {
    margin: 0, font: "italic 900 36px/1.1 'Playfair Display', Georgia, serif",
    color: '#FAF7F2', textWrap: 'balance',
  },
  ctaP: {
    margin: '12px 0 22px',
    font: "16px/1.5 'Source Serif 4', Georgia, serif",
    color: 'rgba(255,255,255,0.7)',
  },
  ctaBtn: {
    border: 0, padding: '16px 22px', cursor: 'pointer',
    font: "700 13px/1 'Barlow Condensed', sans-serif",
    letterSpacing: '0.18em', textTransform: 'uppercase', color: '#FAF7F2',
    background: 'linear-gradient(90deg,#FF006E,#FF6B00,#F59E0B,#10B981,#38BDF8,#8B5CF6,#FF006E)',
    backgroundSize: '200% 100%',
    animation: 'iris-flow 8s linear infinite',
  },
  ctaSubLine: { marginTop: 14 },
  footMeta: { textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
};

window.VariationA = VariationA;
window.A_W = A_W;
