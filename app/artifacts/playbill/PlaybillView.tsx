"use client";

import { useState } from "react";
import type { PlaybillData } from "@/lib/artifacts/types";

type Folio = "programme" | "reviews" | "notes";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function fmtDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "";
  }
}

function stars(pct: number): { filled: number; empty: number } {
  const filled = Math.max(1, Math.min(5, Math.round(pct / 20)));
  return { filled, empty: 5 - filled };
}

export default function PlaybillView({ data }: { data: PlaybillData }) {
  const [folio, setFolio] = useState<Folio>("programme");
  const roleLabel = data.role === "ae" ? "AE" : "SDR";
  const dateLabel = fmtDate(data.generatedAt);
  const acts = data.programme.acts ?? [];

  return (
    <main className="playbill">
      <style>{CSS}</style>

      {/* Marquee header */}
      <header className="marquee">
        <div className="mq-eye">Artifact — The Playbill</div>
        <div className="mq-presents">AESDR Theatre Presents</div>
        <h1 className="mq-title">
          <span className="mq-name">{data.studentName}</span>
        </h1>
        <p className="mq-by">
          a one-person show in twelve acts, written and performed by the subject
        </p>
        <div className="mq-rule" />
        <div className="mq-run">{data.programme.tagline}</div>
        <div className="mq-venue">
          {roleLabel} · Twelve Lessons · {dateLabel}
        </div>
      </header>

      {/* Folio tabs */}
      <nav className="acts" aria-label="Folio navigation">
        <button
          className={`act ${folio === "programme" ? "active" : ""}`}
          onClick={() => setFolio("programme")}
          type="button"
        >
          <span className="act-num">Act I</span>
          The Programme
        </button>
        <button
          className={`act ${folio === "reviews" ? "active" : ""}`}
          onClick={() => setFolio("reviews")}
          type="button"
        >
          <span className="act-num">Act II</span>
          The Reviews
        </button>
        <button
          className={`act ${folio === "notes" ? "active" : ""}`}
          onClick={() => setFolio("notes")}
          type="button"
        >
          <span className="act-num">Act III</span>
          Director&apos;s Notes
        </button>
      </nav>

      {/* ═══ FOLIO I — The Programme ═══ */}
      {folio === "programme" && (
        <section className="panel">
          <div className="panel-header">
            <div className="ph-act">Act I</div>
            <h2 className="ph-title">The Programme</h2>
            <p className="ph-sub">
              Read before the performance. Describes who is on stage, what they
              are playing, and in what order the scenes unfold.
            </p>
          </div>

          <article className="program">
            <div className="prog-section">
              <div className="prog-h">Tempo Mark</div>
              <div className="prog-tempo">{data.programme.tempoMark}</div>
              <div className="prog-tagline">{data.programme.tagline}</div>
            </div>

            <div className="prog-section">
              <div className="prog-h">Six Acts of the Play</div>
              <h3 className="prog-title">The Running Order</h3>
              <div className="acts-grid">
                {acts.map((act) => (
                  <div key={act.category} className="act-row">
                    <div className="act-head">
                      <span className="act-roman">{ROMAN[act.act - 1] ?? act.act}</span>
                      <span className="act-cat">{act.categoryName}</span>
                      <span className={`act-pct ${act.pct >= 70 ? "strong" : ""}`}>
                        {Math.round(act.pct)}%
                      </span>
                    </div>
                    <div className="act-meta">
                      <span className="act-role">{act.role}</span>
                      <span className="act-dot">·</span>
                      <span className="act-dynamic">{act.dynamic}</span>
                    </div>
                    <div className="act-note">{act.programmeNote}</div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </section>
      )}

      {/* ═══ FOLIO II — The Reviews ═══ */}
      {folio === "reviews" && (
        <section className="panel">
          <div className="panel-header">
            <div className="ph-act">Act II</div>
            <h2 className="ph-title">The Reviews</h2>
            <p className="ph-sub">
              How the performance was received versus how it was intended. The
              divergence between the billing and the ticket stub.
            </p>
          </div>

          <div className="reviews">
            <div className="rv-intro">
              <div className="rv-intro-lead">
                &ldquo;The critics and the box office rarely agree. On this play,
                they agree completely.&rdquo;
              </div>
              <div className="rv-intro-sub">
                — {data.reviews.length} notices, {data.reviews.length} verdicts
              </div>
            </div>

            {data.reviews.map((rv) => {
              const s = stars(rv.pct);
              return (
                <article key={rv.category} className="review">
                  <div className="rv-outlet">
                    <div className="rv-outlet-name">{rv.critic}</div>
                    <div className="rv-outlet-sub">{rv.categoryName}</div>
                    <div className="rv-stars" aria-label={`${s.filled} of 5 stars`}>
                      {"★".repeat(s.filled)}
                      <span className="empty">{"★".repeat(s.empty)}</span>
                    </div>
                  </div>
                  <div className="rv-body">
                    <blockquote className="rv-quote">{rv.critique}</blockquote>
                    <div className="rv-by">— {rv.verdict}</div>
                  </div>
                  <aside className="rv-box">
                    <div className="rv-box-t">Box Office</div>
                    <div className="rv-box-num">{Math.round(rv.pct)}%</div>
                    <div className="rv-box-d">{rv.boxOffice}</div>
                  </aside>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══ FOLIO III — Director's Notes ═══ */}
      {folio === "notes" && (
        <section className="panel">
          <div className="panel-header">
            <div className="ph-act">Act III</div>
            <h2 className="ph-title">Director&apos;s Notes</h2>
            <p className="ph-sub">
              Between performances. The stage manager&apos;s notebook, the
              blocking changes, the rewrites the lead must learn before next
              curtain.
            </p>
          </div>

          <div className="directors">
            <div className="dn-paper">
              <div className="dn-salut">For the cast of {data.studentName} —</div>
              <p className="dn-intro">
                The run has closed. What follows is the blocking for the next
                performance. <em>Everything below is binding.</em>
              </p>

              {data.directorNotes.map((note) => (
                <div key={note.category} className="note-item">
                  <div className="note-head">
                    <div className="note-scene">{note.categoryName}</div>
                  </div>
                  <div className="note-title">{note.blocking}</div>
                  <div className="note-body">{note.rehearsalFocus}</div>
                </div>
              ))}

              <div className="dn-sign">
                <div className="dn-sign-hand">
                  — {data.studentName.split(" ").map((n) => n[0]).join(". ")}.
                </div>
                <div className="dn-sign-line">
                  Director, producer, lead. Accountable to all three.
                </div>
              </div>
            </div>

            <div className="curtain">
              <div className="curtain-stamp">Curtain Call</div>
              <p className="curtain-text">
                &ldquo;The Programme was who you said you are. The Reviews were
                who the audience saw. The Director&apos;s Notes are who you
                choose to play next.&rdquo;
              </p>
              <div className="curtain-meta">
                12 acts · 36 scenes · one rewritten script
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

const CSS = `
.playbill {
  min-height: 100vh;
  background: #FAF7F2;
  color: #1A1A1A;
  font-family: 'Source Serif 4', Georgia, serif;
}
.playbill * { box-sizing: border-box; }

/* Marquee header */
.playbill .marquee { background: #1A1A1A; color: #FAF7F2; padding: 48px 5% 32px; text-align: center; border-bottom: 6px double #A68B4E; }
.playbill .mq-eye { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: #A68B4E; margin-bottom: 10px; }
.playbill .mq-presents { font-family: 'Bebas Neue', 'Barlow Condensed', sans-serif; font-size: 22px; letter-spacing: .3em; color: #FAF7F2; opacity: .7; margin-bottom: 4px; }
.playbill .mq-title { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(44px, 6vw, 72px); font-weight: 900; font-style: italic; line-height: .95; letter-spacing: -.01em; margin-bottom: 10px; }
.playbill .mq-name { background: linear-gradient(90deg,#FF006E 0%,#FF6B00 17%,#F59E0B 34%,#10B981 51%,#38BDF8 68%,#8B5CF6 85%,#FF006E 100%); background-size: 200% 100%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: irisPlaybill 3s linear infinite; }
.playbill .mq-by { font-family: 'Source Serif 4', Georgia, serif; font-size: 14px; font-style: italic; color: #D8D0C0; margin-top: 6px; letter-spacing: .05em; }
.playbill .mq-rule { width: 40%; height: 1px; background: #A68B4E; margin: 14px auto; }
.playbill .mq-run { font-family: 'Source Serif 4', Georgia, serif; font-size: 16px; font-style: italic; color: #A68B4E; }
.playbill .mq-venue { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: .2em; text-transform: uppercase; color: #D8D0C0; margin-top: 8px; }
@keyframes irisPlaybill { from { background-position: 0% 50%; } to { background-position: 200% 50%; } }

/* Folio tabs */
.playbill .acts { display: flex; justify-content: center; background: #F4EFE4; border-bottom: 1px solid #D8D0C0; position: sticky; top: 0; z-index: 10; }
.playbill .act { padding: 20px 36px; cursor: pointer; border: none; background: transparent; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-style: italic; color: #6B6B6B; border-bottom: 3px solid transparent; transition: all .2s; }
.playbill .act:hover { color: #1A1A1A; }
.playbill .act.active { color: #8B1A1A; border-bottom-color: #8B1A1A; }
.playbill .act-num { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 11px; letter-spacing: .3em; display: block; color: inherit; margin-bottom: 2px; opacity: .7; text-transform: uppercase; }

/* Panels */
.playbill .panel { background: #F4EFE4; padding: 56px 6% 80px; }
.playbill .panel-header { text-align: center; margin: 0 auto 48px; max-width: 800px; }
.playbill .ph-act { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: .4em; color: #A68B4E; text-transform: uppercase; }
.playbill .ph-title { font-family: 'Playfair Display', Georgia, serif; font-size: 42px; font-style: italic; font-weight: 700; margin-top: 6px; line-height: 1.1; }
.playbill .ph-sub { font-family: 'Source Serif 4', Georgia, serif; font-size: 15px; font-style: italic; color: #6B6B6B; margin-top: 12px; max-width: 560px; margin-left: auto; margin-right: auto; line-height: 1.5; }

/* Programme card */
.playbill .program { max-width: 900px; margin: 0 auto; background: #FAF7F2; padding: 48px 56px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); border: 1px solid #D8D0C0; }
.playbill .prog-section { margin-bottom: 40px; padding-bottom: 32px; border-bottom: 1px solid #D8D0C0; }
.playbill .prog-section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.playbill .prog-h { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: .3em; color: #8B1A1A; margin-bottom: 14px; text-align: center; text-transform: uppercase; }
.playbill .prog-tempo { font-family: 'Playfair Display', Georgia, serif; font-size: 32px; font-style: italic; text-align: center; color: #1A1A1A; }
.playbill .prog-tagline { font-family: 'Source Serif 4', Georgia, serif; font-size: 16px; font-style: italic; text-align: center; color: #6B6B6B; margin-top: 10px; max-width: 560px; margin-left: auto; margin-right: auto; line-height: 1.5; }
.playbill .prog-title { font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-style: italic; text-align: center; margin-bottom: 28px; }

/* Act rows */
.playbill .acts-grid { display: flex; flex-direction: column; gap: 20px; }
.playbill .act-row { padding: 20px 0; border-bottom: 1px dotted #D8D0C0; }
.playbill .act-row:last-child { border-bottom: none; }
.playbill .act-head { display: flex; align-items: baseline; gap: 16px; margin-bottom: 6px; }
.playbill .act-roman { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-style: italic; font-weight: 700; color: #A68B4E; min-width: 40px; }
.playbill .act-cat { flex: 1; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-style: italic; font-weight: 700; color: #1A1A1A; }
.playbill .act-pct { font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 700; color: #8B1A1A; }
.playbill .act-pct.strong { color: #1A1A1A; }
.playbill .act-meta { font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: .08em; color: #6B6B6B; text-transform: uppercase; margin-bottom: 10px; }
.playbill .act-role { color: #8B1A1A; font-weight: 700; }
.playbill .act-dot { margin: 0 8px; }
.playbill .act-dynamic { font-style: italic; }
.playbill .act-note { font-family: 'Source Serif 4', Georgia, serif; font-size: 16px; font-style: italic; color: #1A1A1A; line-height: 1.6; padding-left: 56px; }

/* Reviews */
.playbill .reviews { max-width: 1000px; margin: 0 auto; }
.playbill .rv-intro { text-align: center; margin-bottom: 40px; padding: 24px; border-top: 1px solid #1A1A1A; border-bottom: 1px solid #1A1A1A; }
.playbill .rv-intro-lead { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-style: italic; }
.playbill .rv-intro-sub { font-family: 'Source Serif 4', Georgia, serif; font-size: 14px; color: #6B6B6B; margin-top: 6px; font-style: italic; }
.playbill .review { display: grid; grid-template-columns: 220px 1fr 240px; gap: 32px; margin-bottom: 36px; padding: 28px; background: #FAF7F2; border: 1px solid #D8D0C0; align-items: center; }
.playbill .rv-outlet { text-align: center; }
.playbill .rv-outlet-name { font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 900; font-style: italic; line-height: 1.1; margin-bottom: 6px; }
.playbill .rv-outlet-sub { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: .2em; text-transform: uppercase; color: #6B6B6B; }
.playbill .rv-stars { font-size: 18px; color: #A68B4E; margin-top: 10px; letter-spacing: .12em; }
.playbill .rv-stars .empty { opacity: .25; }
.playbill .rv-body { padding: 0 20px; border-left: 1px solid #D8D0C0; border-right: 1px solid #D8D0C0; }
.playbill .rv-quote { font-family: 'Playfair Display', Georgia, serif; font-size: 17px; font-style: italic; line-height: 1.5; color: #1A1A1A; margin-bottom: 10px; border: none; padding: 0; }
.playbill .rv-quote::before { content: "\\201C"; font-size: 42px; color: #8B1A1A; line-height: 0; position: relative; top: 14px; margin-right: 4px; }
.playbill .rv-quote::after { content: "\\201D"; font-size: 42px; color: #8B1A1A; line-height: 0; position: relative; top: 14px; margin-left: 2px; }
.playbill .rv-by { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: .15em; text-transform: uppercase; color: #6B6B6B; margin-top: 8px; text-align: right; }
.playbill .rv-box { background: #1A1A1A; color: #FAF7F2; padding: 16px 18px; }
.playbill .rv-box-t { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 11px; letter-spacing: .3em; color: #A68B4E; margin-bottom: 6px; text-transform: uppercase; }
.playbill .rv-box-num { font-family: 'Playfair Display', Georgia, serif; font-size: 32px; font-weight: 900; line-height: 1; margin-bottom: 6px; }
.playbill .rv-box-d { font-family: 'Source Serif 4', Georgia, serif; font-size: 13px; line-height: 1.4; color: #D8D0C0; }

/* Director's Notes */
.playbill .directors { max-width: 1000px; margin: 0 auto; }
.playbill .dn-paper { background: #FAF7F2; padding: 48px 56px; border: 1px solid #D8D0C0; position: relative; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.playbill .dn-salut { font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-style: italic; margin-bottom: 6px; }
.playbill .dn-intro { font-family: 'Source Serif 4', Georgia, serif; font-size: 16px; line-height: 1.6; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid #D8D0C0; }
.playbill .dn-intro em { color: #8B1A1A; font-weight: 600; font-style: italic; }
.playbill .note-item { margin-bottom: 26px; padding: 20px 24px; background: #F4EFE4; border-left: 4px solid #8B1A1A; }
.playbill .note-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
.playbill .note-scene { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: .3em; color: #8B1A1A; text-transform: uppercase; }
.playbill .note-title { font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-style: italic; margin-bottom: 8px; }
.playbill .note-body { font-family: 'Source Serif 4', Georgia, serif; font-size: 15px; line-height: 1.6; color: #1A1A1A; }
.playbill .dn-sign { margin-top: 32px; padding-top: 24px; border-top: 1px solid #D8D0C0; text-align: right; }
.playbill .dn-sign-hand { font-family: 'Caveat', cursive; font-size: 34px; color: #8B1A1A; line-height: 1; }
.playbill .dn-sign-line { font-family: 'Source Serif 4', Georgia, serif; font-size: 13px; font-style: italic; color: #6B6B6B; margin-top: 4px; }
.playbill .curtain { text-align: center; margin-top: 56px; padding-top: 28px; border-top: 2px solid #1A1A1A; }
.playbill .curtain-stamp { display: inline-block; padding: 10px 28px; background: #8B1A1A; color: #FAF7F2; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 15px; letter-spacing: .4em; text-transform: uppercase; }
.playbill .curtain-text { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-style: italic; margin-top: 18px; max-width: 600px; margin-left: auto; margin-right: auto; line-height: 1.4; }
.playbill .curtain-meta { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: .25em; text-transform: uppercase; color: #6B6B6B; margin-top: 14px; }

/* Responsive */
@media (max-width: 768px) {
  .playbill .acts { flex-wrap: wrap; }
  .playbill .act { padding: 14px 20px; font-size: 15px; }
  .playbill .program { padding: 32px 24px; }
  .playbill .act-note { padding-left: 0; }
  .playbill .review { grid-template-columns: 1fr; gap: 20px; }
  .playbill .rv-body { padding: 0; border: none; border-top: 1px solid #D8D0C0; border-bottom: 1px solid #D8D0C0; padding: 16px 0; }
  .playbill .dn-paper { padding: 32px 24px; }
}
`;
