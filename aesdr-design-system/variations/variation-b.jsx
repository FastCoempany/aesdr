/* Variation B — Operator Dossier
 * Terminal-led, dossier/classified aesthetic.
 * Header strip · Diagnosis terminal · Two voices · Lessons as filing index ·
 * Classified Q&A · Pricing as command-line · Sign-off.
 * Width 720px.
 */

const B_W = 720;

function VariationB() {
  const s = b_styles;
  return (
    <article style={s.page}>
      {/* Top dossier strip */}
      <header style={s.dossierTop}>
        <CornerBrackets color="#1A1A1A" opacity={0.6} inset={6} size={10} />
        <div style={s.dossierTopInner}>
          <div style={s.dossierMeta}>
            <Eyebrow>FILE · AESDR-001</Eyebrow>
            <span style={s.dossierDot}>·</span>
            <Eyebrow>OPERATOR</Eyebrow>
          </div>
          <Eyebrow crimson>⚠ CANDOR</Eyebrow>
        </div>
      </header>

      {/* Wordmark + tagline strip */}
      <section style={s.brandStrip}>
        <Wordmark size={64} dotIris />
        <IrisRule width={140} style={{ marginTop: 14 }} />
        <Eyebrow style={{ marginTop: 14, display: 'block' }}>
          THE OPERATING MANUAL · NOT THE MOTIVATION ENGINE
        </Eyebrow>
      </section>

      {/* Headline verdict */}
      <section style={s.verdictSec}>
        <Eyebrow style={{ display: 'block', marginBottom: 14 }}>VERDICT · 01</Eyebrow>
        <h1 style={s.verdictH}>
          Your commission check<br/>
          is not income.<br/>
          <em style={s.verdictHem}>It is a verdict.</em>
        </h1>
        <p style={s.verdictSub}>
          12 lessons. 5 takeaway tools. Lifetime access. Anti-LinkedIn by design —
          for first-1-to-2-year SDRs and AEs at startup SaaS companies who already
          know what's wrong, and just need the language for it.
        </p>
      </section>

      {/* Terminal block */}
      <section style={s.termSec}>
        <Eyebrow style={{ display: 'block', marginBottom: 12 }}>DIAGNOSIS · 02</Eyebrow>
        <div style={s.term}>
          <div style={s.termHead}>
            <TerminalDots />
            <span style={s.termFile}>DIAGNOSE.SH · LINE 47</span>
          </div>
          <div style={s.termBody}>
            <div style={s.termLine}><span style={s.prompt}>$</span>./diagnose --honest</div>
            <div style={s.termLine}><span style={s.prompt}>&gt;</span>scanning your week…</div>
            <div style={s.termLine}><span style={s.prompt}>&gt;</span>scanning your calendar…</div>
            <div style={s.termLine}><span style={s.prompt}>&gt;</span>scanning your pipeline notes…</div>
            <div style={s.termLine}>
              <span style={s.prompt}>&gt;</span>diagnosis:&nbsp;
              <span className="iris-text iris-shimmer-text">least productive person you know</span>
              <span style={s.cur} />
            </div>
          </div>
        </div>
        <p style={s.termCaption}>
          <em>You set your alarm for 6am on Sunday to "lock in" this week. It's Saturday again. You didn't lock in at all.</em>
        </p>
      </section>

      {/* Two voices */}
      <section style={s.twoVoices}>
        <Eyebrow style={{ display: 'block', textAlign: 'center', marginBottom: 10 }}>
          CHARACTER-LED · NEVER FOUNDER-LED
        </Eyebrow>
        <h2 style={s.voicesH}>Two voices.<br/><em style={s.h2em}>One verdict.</em></h2>

        <div style={s.voicesGrid}>
          <div style={s.voiceCol}>
            <Eyebrow style={{ display: 'block', marginBottom: 18 }}>ROWAN · THE VERDICT</Eyebrow>
            <p style={s.rowanLine}>
              "Stop surviving. Start owning it."
            </p>
            <p style={s.rowanCap}>
              SURGICAL · DECLARATIVE · HIGH-STATUS
            </p>
          </div>
          <div style={s.voiceDiv} />
          <div style={s.voiceCol}>
            <Eyebrow style={{ display: 'block', marginBottom: 18 }}>MICHAEL · 2AM CONFESSION</Eyebrow>
            <p style={s.michael}>
              "Last month I made $8,200. This month I made $2,100. I bought a $300 jacket
              during the $8,200 month. I'm now wearing the $300 jacket while eating ramen
              I bought with a coupon. Fashion."
            </p>
          </div>
        </div>

        <div style={s.merge}>
          <span style={s.mergeRule} className="iris-shimmer" />
          <span style={s.mergeText}>— THE TWO BECOME ONE —</span>
          <span style={s.mergeRule} className="iris-shimmer" />
        </div>
      </section>

      {/* Lessons as filing index */}
      <section style={s.bodySec}>
        <div style={s.indexHead}>
          <div>
            <Eyebrow>SECTION · 03 · CURRICULUM INDEX</Eyebrow>
            <h2 style={s.h2}>The 12 lessons.</h2>
          </div>
          <Eyebrow>012 / 012 · COMPLETE</Eyebrow>
        </div>

        <div style={s.fileGrid}>
          {LESSONS.map(([n, title]) => (
            <div key={n} style={s.fileRow}>
              <span style={s.fileN}>{n}</span>
              <span style={s.fileTitle}>{title}</span>
              <span style={s.fileTag}>L{n}</span>
            </div>
          ))}
        </div>

        <div style={s.toolsBar}>
          <Eyebrow crimson style={{ display: 'block', marginBottom: 12 }}>+ 5 TAKEAWAY TOOLS</Eyebrow>
          <div style={s.toolsLine}>
            {TOOLS.map(([n, t], i) => (
              <React.Fragment key={n}>
                <span style={s.toolChip}><span style={s.toolChipN}>{n}</span> {t}</span>
                {i < TOOLS.length - 1 && <span style={s.toolDot}>·</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Classified Q&A — single dossier card */}
      <section style={s.bodySec}>
        <Eyebrow style={{ display: 'block', marginBottom: 14 }}>SECTION · 04 · DOSSIER</Eyebrow>
        <div style={s.classified}>
          <CornerBrackets color="#1A1A1A" opacity={0.5} inset={6} size={16} />
          <span style={s.stamp}>Classified</span>
          <div style={s.dossierMetaRow}>
            <Eyebrow>FAQ · 03 / 03</Eyebrow>
            <Eyebrow>DOSSIER.AESDR</Eyebrow>
          </div>

          <div style={s.qaBlock}>
            <h3 style={s.q}>Q · Who shouldn't buy this?</h3>
            <p style={s.a}>
              Sales leaders looking for a team-building activity. Anyone who needs to be
              told they're a rockstar. Anyone whose LinkedIn bio contains the words "ninja,"
              "passionate about," or "lead with value." We will not be a good fit.
            </p>
          </div>
          <div style={s.qaDiv} />
          <div style={s.qaBlock}>
            <h3 style={s.q}>Q · What if it doesn't deliver value?</h3>
            <p style={s.a}>
              14-day refund, no questions, no exit interview. If it doesn't deliver value,
              we don't want your money. That's not a generous policy — it's a sober one.
            </p>
          </div>
          <div style={s.qaDiv} />
          <div style={s.qaBlock}>
            <h3 style={s.q}>Q · Will this work if I'm not crushing it right now?</h3>
            <p style={s.a}>
              Specifically designed for reps who aren't. If you're already at 180% of quota
              and your manager loves you, save your money. If you're at 62% with a $300
              jacket and a coupon-noodle dinner, this is your operating manual.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing as command-line */}
      <section style={s.bodySec}>
        <Eyebrow style={{ display: 'block', marginBottom: 14 }}>SECTION · 05 · ENROLL</Eyebrow>
        <h2 style={s.h2}>Three doors. <em style={s.h2em}>Same operating manual.</em></h2>

        <div style={s.cliBlock}>
          <div style={s.cliHead}>
            <TerminalDots />
            <span style={s.termFile}>ENROLL.SH</span>
          </div>
          <div style={s.cliBody}>
            <div style={s.cliRow}>
              <span style={s.prompt}>$</span>
              <span style={s.cliCmd}>aesdr enroll <span style={s.cliFlag}>--role=sdr</span></span>
              <span style={s.cliPrice}>$249</span>
            </div>
            <div style={s.cliBlurb}>
              First-year SDRs who can already see what's broken — they just need the language for it.
            </div>

            <div style={{ ...s.cliRow, marginTop: 18 }}>
              <span style={s.prompt}>$</span>
              <span style={s.cliCmd}>aesdr enroll <span style={s.cliFlag}>--role=ae</span></span>
              <span style={s.cliPrice}>$299 <span style={s.cliPick}>← OPERATOR PICK</span></span>
            </div>
            <div style={s.cliBlurb}>
              1–2 year AEs running real deals with no real cover. The math fork that protects your commission first.
            </div>

            <div style={{ ...s.cliRow, marginTop: 18 }}>
              <span style={s.prompt}>$</span>
              <span style={s.cliCmd}>aesdr enroll <span style={s.cliFlag}>--role=team --seats=10</span></span>
              <span style={s.cliPrice}>$1,499</span>
            </div>
            <div style={s.cliBlurb}>
              Managers who want their reps to feel less alone — and want to stop being the manager who lies.
            </div>

            <div style={{ ...s.cliRow, marginTop: 22, opacity: 0.7 }}>
              <span style={s.prompt}>&gt;</span>
              <span style={s.cliCmd}>refund: <span style={s.cliFlag}>--days=14 --reason=none</span></span>
            </div>
            <div style={{ ...s.cliRow, opacity: 0.7 }}>
              <span style={s.prompt}>&gt;</span>
              <span style={s.cliCmd}>access: <span style={s.cliFlag}>--lifetime --discord=untamed</span></span>
              <span style={s.cur} />
            </div>
          </div>
        </div>

        <button style={s.cliCta} className="iris-shimmer-btn">
          → Enroll Now
        </button>
      </section>

      {/* Sign-off */}
      <footer style={s.signoff}>
        <CornerBrackets color="rgba(255,255,255,0.4)" opacity={1} inset={8} size={12} />
        <Eyebrow light style={{ color: 'rgba(255,255,255,0.55)' }}>END OF FILE · AESDR-001 · v1.1</Eyebrow>
        <p style={s.signoffP}>
          <em>Built by operators who got tired of LinkedIn telling them to rise and grind.</em>
        </p>
        <Eyebrow light style={{ color: 'rgba(255,255,255,0.45)' }}>
          AESDR.COM · SUPPORT@AESDR.COM · NO HUSTLE
        </Eyebrow>
      </footer>
    </article>
  );
}

const b_styles = {
  page: {
    width: B_W, background: '#FAF7F2', color: '#1A1A1A',
    font: "16px/1.55 'Source Serif 4', Georgia, serif", position: 'relative',
    border: '2px solid #1A1A1A',
  },
  dossierTop: {
    position: 'relative', padding: '14px 28px',
    borderBottom: '1px solid #1A1A1A',
  },
  dossierTopInner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  dossierMeta: { display: 'flex', alignItems: 'center', gap: 8 },
  dossierDot: { color: '#6B6B6B' },

  brandStrip: { padding: '36px 32px 30px', borderBottom: '1px solid #E8E4DF' },

  verdictSec: { padding: '40px 32px 44px', borderBottom: '1px solid #E8E4DF' },
  verdictH: {
    margin: '0 0 72px',
    font: "italic 900 56px/1.15 'Playfair Display', Georgia, serif",
    color: '#1A1A1A', letterSpacing: '-0.005em', textWrap: 'balance',
  },
  verdictHem: { color: '#8B1A1A', fontStyle: 'italic' },
  verdictSub: {
    margin: 0, maxWidth: 560,
    font: "17px/1.6 'Source Serif 4', Georgia, serif", color: '#6B6B6B',
  },

  termSec: { padding: '40px 32px', borderBottom: '1px solid #E8E4DF' },
  term: {
    background: '#FFFFFF', border: '1px solid #E8E4DF',
    boxShadow: '0 4px 32px rgba(0,0,0,0.04)',
  },
  termHead: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 18px', borderBottom: '1px solid #E8E4DF',
  },
  termFile: { font: "10px/1 'Space Mono', monospace", letterSpacing: '0.20em', color: '#6B6B6B', textTransform: 'uppercase' },
  termBody: { padding: '18px 22px 22px' },
  termLine: { font: "15px/1.95 'Space Mono', monospace", color: '#1A1A1A' },
  prompt: { color: '#6B6B6B', marginRight: 10 },
  cur: { display: 'inline-block', width: 10, height: 17, verticalAlign: -3, background: '#8B1A1A', marginLeft: 4, animation: 'blink 1s steps(2) infinite' },
  termCaption: {
    margin: '14px 0 0', font: "italic 14px/1.5 'Source Serif 4', Georgia, serif", color: '#6B6B6B', textAlign: 'center',
  },

  twoVoices: { padding: '52px 32px 44px', borderBottom: '1px solid #E8E4DF' },
  voicesH: {
    margin: '0 0 36px', textAlign: 'center',
    font: "italic 900 40px/1.05 'Playfair Display', Georgia, serif",
    color: '#1A1A1A', textWrap: 'balance',
  },
  h2em: { color: '#8B1A1A', fontStyle: 'italic', fontWeight: 900 },
  voicesGrid: { display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: 28, alignItems: 'flex-start' },
  voiceCol: {},
  voiceDiv: { background: '#E8E4DF', alignSelf: 'stretch' },
  rowanLine: { margin: '0 0 14px', font: "italic 900 28px/1.15 'Playfair Display', Georgia, serif", color: '#1A1A1A' },
  rowanCap: { margin: 0, font: "700 14px/1.2 'Barlow Condensed', sans-serif", letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6B6B6B' },
  michael: { margin: 0, font: "24px/1.4 'Caveat', cursive", color: '#8B1A1A', transform: 'rotate(-0.4deg)' },

  merge: { display: 'flex', alignItems: 'center', gap: 14, marginTop: 44 },
  mergeRule: { flex: 1, height: 2, display: 'block' },
  mergeText: { font: "italic 900 18px/1 'Playfair Display', Georgia, serif", color: '#1A1A1A', whiteSpace: 'nowrap' },

  bodySec: { padding: '44px 32px', borderBottom: '1px solid #E8E4DF' },
  indexHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 },
  h2: {
    margin: '10px 0 0',
    font: "italic 900 36px/1.05 'Playfair Display', Georgia, serif",
    color: '#1A1A1A', letterSpacing: '-0.005em', textWrap: 'balance',
  },

  fileGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', borderTop: '1px solid #E8E4DF' },
  fileRow: {
    display: 'grid', gridTemplateColumns: '36px 1fr auto',
    alignItems: 'center', columnGap: 10, padding: '12px 4px',
    borderBottom: '1px solid #E8E4DF',
  },
  fileN: { font: "italic 900 18px/1 'Playfair Display', Georgia, serif", color: '#8B1A1A' },
  fileTitle: { font: "700 15px/1.15 'Barlow Condensed', sans-serif", letterSpacing: '0.02em', color: '#1A1A1A' },
  fileTag: { font: "9px/1 'Space Mono', monospace", letterSpacing: '0.20em', color: '#6B6B6B', border: '1px solid #E8E4DF', padding: '4px 6px', textTransform: 'uppercase' },

  toolsBar: { marginTop: 22, paddingTop: 18, borderTop: '1px dashed rgba(139,26,26,0.3)' },
  toolsLine: {
    display: 'flex', flexWrap: 'wrap', gap: 6,
    font: "13px/1.6 'Source Serif 4', Georgia, serif", color: '#1A1A1A',
  },
  toolChip: {},
  toolChipN: { font: "italic 900 14px/1 'Playfair Display', Georgia, serif", color: '#8B1A1A', marginRight: 4 },
  toolDot: { color: '#C9C4BD' },

  classified: {
    position: 'relative', background: '#FFFFFF', border: '1px solid #E8E4DF',
    padding: '28px 28px 26px', boxShadow: '0 4px 32px rgba(0,0,0,0.04)',
  },
  stamp: {
    position: 'absolute', top: 18, right: 22,
    border: '1px solid rgba(139,26,26,0.20)', color: 'rgba(139,26,26,0.55)',
    font: "700 11px/1 'Barlow Condensed', sans-serif", letterSpacing: '0.18em',
    textTransform: 'uppercase', padding: '6px 14px', transform: 'rotate(-6deg)',
  },
  dossierMetaRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 18 },
  qaBlock: { padding: '4px 0' },
  q: { margin: '0 0 8px', font: "700 17px/1.2 'Barlow Condensed', sans-serif", letterSpacing: '0.02em', color: '#1A1A1A', textTransform: 'none' },
  a: { margin: 0, font: "14px/1.6 'Source Serif 4', Georgia, serif", color: '#1A1A1A' },
  qaDiv: { height: 1, background: '#E8E4DF', margin: '16px 0' },

  cliBlock: {
    marginTop: 22, background: '#FFFFFF', border: '1px solid #E8E4DF',
    boxShadow: '0 4px 32px rgba(0,0,0,0.04)',
  },
  cliHead: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 18px', borderBottom: '1px solid #E8E4DF',
  },
  cliBody: { padding: '20px 22px 24px' },
  cliRow: { display: 'flex', alignItems: 'baseline', gap: 12 },
  cliCmd: { font: "14px/1.6 'Space Mono', monospace", color: '#1A1A1A', flex: 1 },
  cliFlag: { color: '#8B1A1A' },
  cliPrice: { font: "italic 900 22px/1 'Playfair Display', Georgia, serif", color: '#1A1A1A' },
  cliPick: { font: "9px/1 'Space Mono', monospace", letterSpacing: '0.25em', color: '#8B1A1A', marginLeft: 8 },
  cliBlurb: { font: "italic 13px/1.5 'Source Serif 4', Georgia, serif", color: '#6B6B6B', marginLeft: 30, marginTop: 4 },

  cliCta: {
    marginTop: 24, width: '100%', border: 0, padding: '18px',
    font: "700 14px/1 'Barlow Condensed', sans-serif", letterSpacing: '0.20em',
    textTransform: 'uppercase', color: '#FAF7F2', cursor: 'pointer',
    background: 'linear-gradient(90deg,#FF006E,#FF6B00,#F59E0B,#10B981,#38BDF8,#8B5CF6,#FF006E)',
    backgroundSize: '200% 100%', animation: 'iris-flow 8s linear infinite',
  },

  signoff: {
    position: 'relative', background: '#1A1A1A', color: '#FAF7F2',
    padding: '32px 32px 36px', textAlign: 'center',
  },
  signoffP: { margin: '14px 0', font: "italic 16px/1.5 'Source Serif 4', Georgia, serif", color: 'rgba(255,255,255,0.85)' },
};

window.VariationB = VariationB;
window.B_W = B_W;
