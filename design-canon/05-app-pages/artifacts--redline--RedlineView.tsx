"use client";

import { useState } from "react";
import type { RedlineData } from "@/lib/artifacts/types";

type Folio = "assessment" | "redlines" | "accepted";

function fmtDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "";
  }
}

function gradeOk(grade: string): boolean {
  return grade.toUpperCase().startsWith("A") || grade.toUpperCase().startsWith("B");
}

function scoreOk(pct: number): boolean {
  return pct >= 70;
}

export default function RedlineView({ data }: { data: RedlineData }) {
  const [folio, setFolio] = useState<Folio>("assessment");
  const roleLabel = data.role === "ae" ? "AE" : "SDR";
  const dateLabel = fmtDate(data.generatedAt);
  const initials = data.studentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <main className="redline">
      <style>{CSS}</style>

      <div className="page">
        {/* Title page */}
        <header className="cover">
          <div className="cover-eye">Draft Manuscript — Self-Assessment</div>
          <h1 className="cover-title">
            <span className="cover-name">{data.studentName}</span>
          </h1>
          <p className="cover-sub">A self-portrait in twelve lessons</p>
          <div className="cover-meta">
            Submitted {dateLabel} · {roleLabel}
          </div>
          <div className="cover-stamp">Returned with edits</div>
        </header>

        {/* Folio tabs */}
        <nav className="folios" aria-label="Folio navigation">
          <button
            className={`folio ${folio === "assessment" ? "active" : ""}`}
            onClick={() => setFolio("assessment")}
            type="button"
          >
            <span className="folio-num">Folio I</span>
            The Assessment
          </button>
          <button
            className={`folio ${folio === "redlines" ? "active" : ""}`}
            onClick={() => setFolio("redlines")}
            type="button"
          >
            <span className="folio-num">Folio II</span>
            The Redlines
          </button>
          <button
            className={`folio ${folio === "accepted" ? "active" : ""}`}
            onClick={() => setFolio("accepted")}
            type="button"
          >
            <span className="folio-num">Folio III</span>
            Accepted Manuscript
          </button>
        </nav>

        {/* ═══ FOLIO I — The Assessment ═══ */}
        {folio === "assessment" && (
          <section className="panel">
            <div className="panel-head">
              <div className="ph-num">Folio I</div>
              <h2 className="ph-t">The Assessment</h2>
              <p className="ph-s">
                The editor&apos;s reader&apos;s report. Chapter grades before
                the redlines. What survives the first pass — and what will not.
              </p>
            </div>

            <div className="editor-note">
              <div className="en-from">Reader&apos;s Report</div>
              <p className="en-text">{data.assessment.readersReport}</p>
            </div>

            {data.assessment.chapters.map((ch) => (
              <div key={ch.category} className="assess-row">
                <div className="ar-ch">Ch. {ch.chapter}</div>
                <div>
                  <div className="ar-cat">{ch.categoryName}</div>
                </div>
                <div className="ar-verdict">&ldquo;{ch.verdict}&rdquo;</div>
                <div className={`ar-score ${scoreOk(ch.pct) ? "ok" : ""}`}>
                  {Math.round(ch.pct)}%
                </div>
                <div className={`ar-grade ${gradeOk(ch.grade) ? "ok" : ""}`}>
                  {ch.grade}
                </div>
              </div>
            ))}

            <div className="overall">
              <div className="ov-stamp">Overall Verdict</div>
              <div className="ov-grade">{data.assessment.overallGrade}</div>
              <p className="ov-text">&ldquo;{data.assessment.overallVerdict}&rdquo;</p>
            </div>

            <div className="curtain">
              <div className="curtain-t">
                &ldquo;The grade is not the verdict. The rewrite is.&rdquo;
              </div>
              <div className="curtain-m">
                {data.assessment.chapters.length} chapters · Editor&apos;s desk ·{" "}
                {dateLabel}
              </div>
            </div>
          </section>
        )}

        {/* ═══ FOLIO II — The Redlines ═══ */}
        {folio === "redlines" && (
          <section className="panel">
            <div className="panel-head">
              <div className="ph-num">Folio II</div>
              <h2 className="ph-t">The Redlines</h2>
              <p className="ph-s">
                The draft as submitted. The pen marks where your words and your
                data disagree. Strikethroughs are what you wrote; inserts are
                what is actually true.
              </p>
            </div>

            <div className="editor-note">
              <div className="en-from">Editor&apos;s Note</div>
              <p className="en-text">
                {data.studentName.split(" ")[0]} — you submitted this as a
                finished draft. It isn&apos;t. I&apos;ve marked where the
                narrative breaks down. The version of you that you described
                and the version your scores describe are not the same person.
                Fix the gaps and resubmit.
              </p>
            </div>

            {data.markups.map((m, idx) => (
              <div key={m.category}>
                <div className="ms-section">
                  <div className="ms-chapter">
                    Chapter {m.chapter} — {m.categoryName}
                  </div>
                  <div className="ms-draft">
                    {m.draftOpening}
                    <aside className="ms-margin">{m.marginNote}</aside>
                  </div>
                  <div className="ms-draft ms-draft-edit">
                    <span className="ms-strike">{m.struckClaim}</span>{" "}
                    <span className="ms-insert">{m.insertedTruth}</span>
                    <aside className="ms-score-box">
                      <div className="ms-score-num">{Math.round(m.pct)}%</div>
                      <div className="ms-score-cat">{m.scoreAnnotation}</div>
                      <div className="ms-score-note">{m.scoreNote}</div>
                    </aside>
                  </div>
                </div>
                {idx < data.markups.length - 1 && (
                  <div className="ms-break">
                    <span className="ms-break-inner">Page Break</span>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* ═══ FOLIO III — Accepted Manuscript ═══ */}
        {folio === "accepted" && (
          <section className="panel">
            <div className="panel-head">
              <div className="ph-num">Folio III</div>
              <h2 className="ph-t">The Accepted Manuscript</h2>
              <p className="ph-s">
                The corrected final. What remains after the redlines are
                honored. The version of the story the author has chosen to
                commit to next.
              </p>
            </div>

            <div className="accepted">
              <div className="acc-stamp">Accepted Manuscript</div>
              <h3 className="acc-title">The version that survives the edit.</h3>

              {data.accepted.map((item) => (
                <div key={item.category} className="acc-item">
                  <div className="acc-cat">{item.categoryName}</div>
                  <div className="acc-text">{item.commitment}</div>
                </div>
              ))}
            </div>

            <div className="closing-hand">
              <p className="ch-text">
                The first draft was who you think you are. The redline is who
                you actually are. The accepted manuscript is who you&apos;re
                choosing to become.
              </p>
              <div className="ch-sig">
                — {initials.toUpperCase()}.
              </div>
              <div className="ch-meta">
                12 lessons · 36 units · Your words, fact-checked
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

const CSS = `
.redline {
  min-height: 100vh;
  background: #FAF7F2;
  color: #1A1A1A;
  font-family: 'Source Serif 4', Georgia, serif;
  line-height: 1.8;
}
.redline * { box-sizing: border-box; }
.redline .page { max-width: 820px; margin: 0 auto; padding: 48px 32px 100px; }

/* Cover */
.redline .cover { text-align: center; padding: 48px 0 40px; margin-bottom: 48px; border-bottom: 2px solid #1A1A1A; }
.redline .cover-eye { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: #C53030; margin-bottom: 16px; }
.redline .cover-title { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(40px, 6vw, 60px); font-weight: 900; font-style: italic; line-height: 1; margin-bottom: 8px; }
.redline .cover-name { background: linear-gradient(90deg,#FF006E 0%,#FF6B00 17%,#F59E0B 34%,#10B981 51%,#38BDF8 68%,#8B5CF6 85%,#FF006E 100%); background-size: 200% 100%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: irisRedline 3s linear infinite; }
.redline .cover-sub { font-family: 'Source Serif 4', Georgia, serif; font-size: 18px; font-style: italic; color: #6B6B6B; margin-bottom: 20px; }
.redline .cover-meta { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: .15em; text-transform: uppercase; color: #6B6B6B; }
.redline .cover-stamp { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #C53030; border: 3px solid #C53030; padding: 6px 20px; margin-top: 20px; transform: rotate(-3deg); }
@keyframes irisRedline { from { background-position: 0% 50%; } to { background-position: 200% 50%; } }

/* Folio tabs */
.redline .folios { display: flex; justify-content: center; border-bottom: 2px solid #1A1A1A; background: #FAF7F2; position: sticky; top: 0; z-index: 10; margin: 0 -32px; }
.redline .folio { padding: 16px 28px; cursor: pointer; border: none; background: transparent; font-family: 'Playfair Display', Georgia, serif; font-size: 17px; font-style: italic; color: #6B6B6B; border-bottom: 3px solid transparent; margin-bottom: -2px; transition: all .2s; }
.redline .folio:hover { color: #1A1A1A; }
.redline .folio.active { color: #C53030; border-bottom-color: #C53030; }
.redline .folio-num { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: .25em; display: block; color: inherit; margin-bottom: 3px; opacity: .8; text-transform: uppercase; }

/* Panel head */
.redline .panel-head { text-align: center; margin: 48px 0 32px; }
.redline .ph-num { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: #C53030; }
.redline .ph-t { font-family: 'Playfair Display', Georgia, serif; font-size: 36px; font-style: italic; margin-top: 4px; }
.redline .ph-s { font-family: 'Source Serif 4', Georgia, serif; font-size: 15px; font-style: italic; color: #6B6B6B; margin-top: 8px; max-width: 560px; margin-left: auto; margin-right: auto; line-height: 1.5; }

/* Editor's note block */
.redline .editor-note { background: rgba(197,48,48,0.08); border-left: 4px solid #C53030; padding: 20px 24px; margin-bottom: 48px; }
.redline .en-from { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: .2em; text-transform: uppercase; color: #C53030; margin-bottom: 6px; }
.redline .en-text { font-family: 'Source Serif 4', Georgia, serif; font-size: 16px; color: #1A1A1A; line-height: 1.65; font-style: italic; }

/* Assessment grid */
.redline .assess-row { display: grid; grid-template-columns: auto 1fr auto auto auto; gap: 20px; padding: 20px 0; border-bottom: 1px solid #E8E4DF; align-items: center; }
.redline .assess-row:last-of-type { border-bottom: 2px solid #1A1A1A; }
.redline .ar-ch { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: .2em; color: #6B6B6B; min-width: 48px; text-transform: uppercase; }
.redline .ar-cat { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-style: italic; }
.redline .ar-verdict { font-family: 'Caveat', cursive; font-size: 18px; color: #C53030; line-height: 1.3; max-width: 320px; text-align: right; }
.redline .ar-score { font-family: 'Playfair Display', Georgia, serif; font-size: 30px; font-style: italic; color: #C53030; min-width: 70px; text-align: right; line-height: 1; }
.redline .ar-score.ok { color: #1A1A1A; }
.redline .ar-grade { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 700; font-style: italic; min-width: 36px; text-align: center; color: #C53030; }
.redline .ar-grade.ok { color: #15803D; }

.redline .overall { margin-top: 32px; padding: 28px; background: rgba(197,48,48,0.08); border: 2px solid #C53030; text-align: center; }
.redline .ov-stamp { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 800; letter-spacing: .25em; text-transform: uppercase; color: #C53030; margin-bottom: 10px; }
.redline .ov-grade { font-family: 'Playfair Display', Georgia, serif; font-size: 56px; font-style: italic; color: #C53030; line-height: 1; }
.redline .ov-text { font-family: 'Source Serif 4', Georgia, serif; font-size: 16px; font-style: italic; margin-top: 12px; line-height: 1.55; max-width: 520px; margin-left: auto; margin-right: auto; }

.redline .curtain { text-align: center; margin-top: 48px; padding-top: 28px; border-top: 2px solid #1A1A1A; }
.redline .curtain-t { font-family: 'Caveat', cursive; font-size: 22px; color: #C53030; line-height: 1.4; max-width: 560px; margin: 0 auto; }
.redline .curtain-m { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: .25em; text-transform: uppercase; color: #6B6B6B; margin-top: 14px; }

/* Manuscript sections */
.redline .ms-section { margin-bottom: 48px; position: relative; }
.redline .ms-chapter { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #8B1A1A; margin-bottom: 20px; padding-bottom: 8px; border-bottom: 1px solid #E8E4DF; }
.redline .ms-draft { font-family: 'Source Serif 4', Georgia, serif; font-size: 17px; line-height: 2; color: #1A1A1A; position: relative; padding-right: 220px; margin-bottom: 28px; }
.redline .ms-draft-edit { margin-top: 24px; }
.redline .ms-strike { text-decoration: line-through; text-decoration-color: #C53030; text-decoration-thickness: 2px; color: #6B6B6B; }
.redline .ms-insert { color: #C53030; font-weight: 600; text-decoration: none; border-bottom: 2px solid #C53030; }
.redline .ms-margin { position: absolute; right: 0; top: 0; width: 200px; font-family: 'Caveat', cursive; font-size: 16px; color: #C53030; line-height: 1.35; padding-left: 16px; border-left: 2px solid #C53030; font-style: normal; }
.redline .ms-score-box { position: absolute; right: 0; top: 0; width: 200px; padding: 12px 14px; background: rgba(197,48,48,0.08); border: 1px solid #C53030; font-style: normal; }
.redline .ms-score-num { font-family: 'Playfair Display', Georgia, serif; font-size: 32px; font-style: italic; color: #C53030; line-height: 1; }
.redline .ms-score-cat { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: .15em; text-transform: uppercase; color: #C53030; margin-top: 4px; }
.redline .ms-score-note { font-family: 'Caveat', cursive; font-size: 14px; color: #C53030; margin-top: 6px; line-height: 1.3; }
.redline .ms-break { text-align: center; margin: 48px 0; position: relative; }
.redline .ms-break::before { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: #E8E4DF; }
.redline .ms-break-inner { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: .3em; text-transform: uppercase; color: #6B6B6B; background: #FAF7F2; padding: 0 20px; position: relative; }

/* Accepted manuscript */
.redline .accepted { border: 2px solid #15803D; padding: 32px; margin-top: 32px; position: relative; }
.redline .acc-stamp { position: absolute; top: -14px; left: 24px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 800; letter-spacing: .15em; text-transform: uppercase; background: #FAF7F2; color: #15803D; border: 2px solid #15803D; padding: 4px 14px; }
.redline .acc-title { font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-style: italic; margin-bottom: 16px; margin-top: 8px; }
.redline .acc-item { padding: 16px 0; border-bottom: 1px solid #E8E4DF; display: flex; gap: 20px; align-items: flex-start; }
.redline .acc-item:last-child { border-bottom: none; }
.redline .acc-cat { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #8B1A1A; min-width: 110px; padding-top: 6px; }
.redline .acc-text { font-family: 'Source Serif 4', Georgia, serif; font-size: 15px; color: #1A1A1A; line-height: 1.7; flex: 1; }

.redline .closing-hand { text-align: center; margin-top: 48px; }
.redline .ch-text { font-family: 'Caveat', cursive; font-size: 22px; color: #C53030; line-height: 1.4; max-width: 560px; margin: 0 auto; font-style: normal; }
.redline .ch-sig { font-family: 'Caveat', cursive; font-size: 28px; color: #1A1A1A; margin-top: 16px; }
.redline .ch-meta { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: .2em; text-transform: uppercase; color: #6B6B6B; margin-top: 14px; }

/* Responsive */
@media (max-width: 768px) {
  .redline .page { padding: 32px 20px 80px; }
  .redline .folios { flex-wrap: wrap; }
  .redline .folio { padding: 12px 16px; font-size: 15px; }
  .redline .assess-row { grid-template-columns: 1fr auto auto; gap: 12px; }
  .redline .ar-ch, .redline .ar-verdict { display: none; }
  .redline .ms-draft { padding-right: 0; }
  .redline .ms-margin, .redline .ms-score-box { position: static; width: 100%; margin-top: 12px; }
  .redline .acc-item { flex-direction: column; gap: 6px; }
}
`;
