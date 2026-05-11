/* Variation C — The Verdict
 * Big Rowan-led typography. Single dominant headline.
 * Hero verdict · Stats strip · Lessons as ghost-numeral grid ·
 * Single CTA block. Minimal, editorial, confident.
 * Width 720px.
 */

const C_W = 720;

function VariationC() {
  const s = c_styles;
  return (
    <article style={s.page}>
      {/* Top operator chrome */}
      <header style={s.top}>
        <Wordmark size={28} dotIris />
        <Eyebrow>AESDR · 12 LESSONS · A BETTER YOU</Eyebrow>
      </header>

      {/* HUGE verdict */}
      <section style={s.verdictSec}>
        <GhostNumeral n="01" size={360} color="rgba(0,0,0,0.05)" style={{ right: -20, top: -40 }} />
        <Eyebrow style={{ display: 'block', marginBottom: 22 }}>VERDICT · ROWAN · 01 / 01</Eyebrow>
        <h1 style={s.verdictH}>
          Stop<br/>
          surviving.<br/>
          <span style={s.verdictHcrim}>Start owning it.</span>
        </h1>
        <div style={s.verdictRule}>
          <IrisRule width={120} />
        </div>
        <p style={s.verdictLead}>
          The operating manual nobody handed you on day one.
          12 lessons. 5 takeaway tools. Lifetime access. Anti-LinkedIn by design —
          for first-1-to-2-year SDRs and AEs.
        </p>
      </section>

      {/* Michael margin annotation — single Caveat moment */}
      <aside style={s.michaelStrip}>
        <p style={s.michael}>
          "Last month I made $8,200. This month I made $2,100. I bought a $300 jacket
          during the $8,200 month. I'm now wearing it while eating ramen I bought with a coupon. Fashion."
        </p>
        <Eyebrow crimson style={{ display: 'block', textAlign: 'right', marginTop: 6 }}>
          — MICHAEL · 2AM
        </Eyebrow>
      </aside>

      {/* Stats strip — high-impact numbers */}
      <section style={s.statsSec}>
        <div style={s.stat}>
          <span style={s.statN}>12</span>
          <Eyebrow>LESSONS</Eyebrow>
        </div>
        <div style={s.statDiv} />
        <div style={s.stat}>
          <span style={s.statN}>5</span>
          <Eyebrow>TOOLS</Eyebrow>
        </div>
        <div style={s.statDiv} />
        <div style={s.stat}>
          <span style={s.statN}>14d</span>
          <Eyebrow>REFUND</Eyebrow>
        </div>
        <div style={s.statDiv} />
        <div style={s.stat}>
          <span style={s.statN}>∞</span>
          <Eyebrow>ACCESS</Eyebrow>
        </div>
      </section>

      {/* Lessons grid — 4×3 ghost-numeral cards */}
      <section style={s.bodySec}>
        <Eyebrow style={{ display: 'block', marginBottom: 14 }}>CURRICULUM · 12 LESSONS</Eyebrow>
        <h2 style={s.h2}>The whole manual<br/><em style={s.h2em}>at a glance.</em></h2>

        <div style={s.lessonGrid}>
          {LESSONS.map(([n, title]) => (
            <div key={n} style={s.lessonCard}>
              <span style={s.lessonGhost}>{n}</span>
              <span style={s.lessonTitle}>{title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Honesty block — small, punchy */}
      <section style={s.honestySec}>
        <div style={s.honestyGrid}>
          <div style={s.honestyCol}>
            <Eyebrow>WHO IT'S FOR</Eyebrow>
            <ul style={s.honestyList}>
              <li>SDRs in their first year, 62% of quota, no language for what's wrong.</li>
              <li>AEs running deals with no real cover from a manager who lies softly.</li>
              <li>Managers who want their reps to feel less alone.</li>
            </ul>
          </div>
          <div style={s.honestyDiv} />
          <div style={s.honestyCol}>
            <Eyebrow crimson>WHO IT ISN'T</Eyebrow>
            <ul style={s.honestyList}>
              <li>Anyone whose LinkedIn bio says "rockstar," "ninja," or "passionate about."</li>
              <li>Sales leaders looking for a team-building activity.</li>
              <li>Anyone who needs to be told they're amazing.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA — full-bleed crimson with single button */}
      <section style={s.ctaSec}>
        <GhostNumeral n="12" size={380} color="rgba(255,255,255,0.06)" style={{ left: -40, bottom: -150 }} />
        <div style={s.ctaInner}>
          <Eyebrow light style={{ color: 'rgba(255,255,255,0.65)', display: 'block', marginBottom: 18 }}>
            ENROLL · LIFETIME · 14-DAY REFUND
          </Eyebrow>
          <h2 style={s.ctaH}>
            Three doors.<br/>
            <em style={s.ctaHem}>Same operating manual.</em>
          </h2>

          <div style={s.priceRow}>
            <div style={s.priceCell}>
              <Eyebrow light style={{ color: 'rgba(255,255,255,0.65)' }}>SDR</Eyebrow>
              <div style={s.priceN}>$249</div>
            </div>
            <div style={s.priceCellHot}>
              <Eyebrow light style={{ color: 'rgba(255,255,255,0.85)' }}>AE · OPERATOR PICK</Eyebrow>
              <div style={s.priceN}>$299</div>
            </div>
            <div style={s.priceCell}>
              <Eyebrow light style={{ color: 'rgba(255,255,255,0.65)' }}>TEAM · 10</Eyebrow>
              <div style={s.priceN}>$1,499</div>
            </div>
          </div>

          <button style={s.ctaBtn} className="iris-shimmer-btn">
            Get The Operating Manual &nbsp;→
          </button>

          <p style={s.refundLine}>
            <em>If it doesn't deliver value, we don't want your money. 14 days. No questions. No exit interview.</em>
          </p>
        </div>
      </section>

      {/* Footer mark */}
      <footer style={s.foot}>
        <Eyebrow>AESDR.COM · UNTAMED DISCORD · v1.1 CANON</Eyebrow>
        <Eyebrow>© AESDR · NO HUSTLE</Eyebrow>
      </footer>
    </article>
  );
}

const c_styles = {
  page: {
    width: C_W, background: '#FAF7F2', color: '#1A1A1A',
    font: "16px/1.55 'Source Serif 4', Georgia, serif", position: 'relative', overflow: 'hidden',
  },
  top: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 48px', borderBottom: '1px solid #E8E4DF',
  },

  verdictSec: { padding: '60px 48px 40px', position: 'relative', overflow: 'hidden' },
  verdictH: {
    margin: 0,
    font: "italic 900 110px/0.95 'Playfair Display', Georgia, serif",
    color: '#1A1A1A', letterSpacing: '-0.015em', textWrap: 'balance', position: 'relative',
  },
  verdictHcrim: { color: '#8B1A1A' },
  verdictRule: { margin: '32px 0 22px' },
  verdictLead: {
    margin: 0, maxWidth: 540,
    font: "18px/1.65 'Source Serif 4', Georgia, serif", color: '#6B6B6B',
  },

  michaelStrip: {
    padding: '20px 48px 28px', borderBottom: '1px solid #E8E4DF',
  },
  michael: {
    margin: 0, maxWidth: 520, marginLeft: 'auto',
    font: "24px/1.4 'Caveat', cursive", color: '#8B1A1A',
    transform: 'rotate(-0.3deg)', textAlign: 'right',
  },

  statsSec: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '32px 48px', borderBottom: '1px solid #E8E4DF', background: '#FFFFFF',
  },
  stat: { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' },
  statN: { font: "italic 900 56px/1 'Playfair Display', Georgia, serif", color: '#1A1A1A' },
  statDiv: { width: 1, height: 48, background: '#E8E4DF' },

  bodySec: { padding: '56px 48px' },
  h2: {
    margin: '6px 0 32px',
    font: "italic 900 44px/1.05 'Playfair Display', Georgia, serif",
    color: '#1A1A1A', letterSpacing: '-0.005em', textWrap: 'balance',
  },
  h2em: { color: '#8B1A1A', fontStyle: 'italic', fontWeight: 900 },

  lessonGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12,
  },
  lessonCard: {
    position: 'relative', padding: '20px 18px 22px',
    background: '#FFFFFF', border: '1px solid #E8E4DF', overflow: 'hidden',
    minHeight: 110,
  },
  lessonGhost: {
    position: 'absolute', right: -8, bottom: -36,
    font: "italic 900 110px/1 'Playfair Display', Georgia, serif",
    color: 'rgba(0,0,0,0.05)', pointerEvents: 'none', userSelect: 'none',
  },
  lessonTitle: {
    position: 'relative', display: 'block',
    font: "700 17px/1.15 'Barlow Condensed', sans-serif",
    letterSpacing: '0.02em', color: '#1A1A1A',
  },

  honestySec: { padding: '40px 48px 56px', borderTop: '1px solid #E8E4DF' },
  honestyGrid: { display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: 32, alignItems: 'flex-start' },
  honestyCol: {},
  honestyDiv: { background: '#E8E4DF', alignSelf: 'stretch' },
  honestyList: {
    listStyle: 'none', padding: 0, margin: '14px 0 0',
    font: "15px/1.6 'Source Serif 4', Georgia, serif", color: '#1A1A1A',
  },

  ctaSec: {
    background: '#8B1A1A', color: '#FAF7F2',
    padding: '56px 48px 60px', position: 'relative', overflow: 'hidden',
  },
  ctaInner: { position: 'relative', zIndex: 1 },
  ctaH: {
    margin: 0,
    font: "italic 900 52px/1.05 'Playfair Display', Georgia, serif",
    color: '#FAF7F2', letterSpacing: '-0.005em', textWrap: 'balance',
  },
  ctaHem: { color: '#FAF7F2', opacity: 0.7, fontStyle: 'italic' },

  priceRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 32,
  },
  priceCell: {
    padding: '18px 18px 20px', border: '1px solid rgba(255,255,255,0.25)',
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  priceCellHot: {
    padding: '18px 18px 20px', border: '1px solid #FAF7F2', background: 'rgba(255,255,255,0.05)',
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  priceN: { font: "italic 900 44px/1 'Playfair Display', Georgia, serif", color: '#FAF7F2' },

  ctaBtn: {
    marginTop: 28, width: '100%', border: 0, padding: '20px',
    font: "700 15px/1 'Barlow Condensed', sans-serif", letterSpacing: '0.22em',
    textTransform: 'uppercase', color: '#FAF7F2', cursor: 'pointer',
    background: 'linear-gradient(90deg,#FF006E,#FF6B00,#F59E0B,#10B981,#38BDF8,#8B5CF6,#FF006E)',
    backgroundSize: '200% 100%', animation: 'iris-flow 8s linear infinite',
  },
  refundLine: {
    margin: '20px 0 0', textAlign: 'center',
    font: "italic 14px/1.5 'Source Serif 4', Georgia, serif", color: 'rgba(255,255,255,0.75)',
  },

  foot: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '18px 48px', background: '#1A1A1A',
  },
};

window.VariationC = VariationC;
window.C_W = C_W;
