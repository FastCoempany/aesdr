"use client";

/**
 * Branded body renderer for the long-tail kit docs (positioning brief,
 * approved claims, disclosure pack, banned vocab, lockup usage, co-promoting,
 * sample agreement). Takes the rendered-markdown HTML and wraps it in a
 * scoped style block that applies AESDR editorial typography — Playfair for
 * h2/h3, Source Serif 4 for body, Barlow Condensed for h4 eyebrows,
 * Space Mono for code/blockquote callouts, Caveat for em-italic asides on
 * pull-quotes.
 *
 * Scope class is React-id-derived (not Math.random) to satisfy the
 * components-must-be-pure rule.
 */
import { useId } from "react";

export default function KitMarkdownBody({ html }: { html: string }) {
  const scopeClass = `kit-md-${useId().replace(/[:]/g, "")}`;

  return (
    <>
      <style>{`
        .${scopeClass} {
          font-family: var(--serif, 'Source Serif 4', Georgia, serif);
          color: var(--ink, #1A1A1A);
          font-size: 17px;
          line-height: 1.75;
          max-width: 760px;
        }
        .${scopeClass} > :first-child { margin-top: 0; }
        .${scopeClass} > :last-child { margin-bottom: 0; }
        .${scopeClass} p { margin: 0 0 18px; }
        .${scopeClass} h2 {
          font-family: var(--display, 'Playfair Display', Georgia, serif);
          font-style: italic;
          font-weight: 700;
          font-size: 30px;
          line-height: 1.2;
          letter-spacing: -0.01em;
          margin: 52px 0 18px;
          color: var(--ink, #1A1A1A);
        }
        .${scopeClass} h3 {
          font-family: var(--display, 'Playfair Display', Georgia, serif);
          font-style: italic;
          font-weight: 700;
          font-size: 22px;
          margin: 36px 0 12px;
          color: var(--ink, #1A1A1A);
        }
        .${scopeClass} h4 {
          font-family: var(--cond, 'Barlow Condensed', sans-serif);
          text-transform: uppercase;
          letter-spacing: .2em;
          font-size: 13px;
          font-weight: 700;
          color: var(--crimson, #8B1A1A);
          margin: 28px 0 10px;
        }
        .${scopeClass} ul, .${scopeClass} ol { margin: 0 0 18px; padding-left: 22px; }
        .${scopeClass} li { margin-bottom: 8px; }
        .${scopeClass} li::marker { color: var(--crimson, #8B1A1A); }
        .${scopeClass} strong { font-weight: 700; }
        .${scopeClass} em { font-style: italic; }
        .${scopeClass} a {
          color: var(--ink, #1A1A1A);
          border-bottom: 1px solid var(--crimson, #8B1A1A);
          text-decoration: none;
          padding-bottom: 1px;
        }
        .${scopeClass} a:hover { background: rgba(139, 26, 26, 0.06); }
        .${scopeClass} blockquote {
          margin: 28px 0;
          padding: 22px 26px 22px 30px;
          border-left: 4px solid var(--crimson, #8B1A1A);
          background: var(--cream, #FAF7F2);
          font-style: italic;
          font-size: 18px;
          color: var(--ink, #1A1A1A);
          position: relative;
        }
        .${scopeClass} blockquote p { margin: 0 0 12px; }
        .${scopeClass} blockquote p:last-child { margin-bottom: 0; }
        .${scopeClass} code {
          font-family: var(--mono, 'Space Mono', monospace);
          background: rgba(26, 26, 26, 0.06);
          padding: 1px 6px;
          font-size: 14px;
          border-radius: 2px;
        }
        .${scopeClass} pre {
          background: var(--ink, #1A1A1A);
          color: #FAF7F2;
          padding: 24px 26px;
          border-radius: 4px;
          font-family: var(--mono, 'Space Mono', monospace);
          font-size: 13px;
          line-height: 1.7;
          overflow-x: auto;
          margin: 24px 0;
          border-left: 3px solid var(--crimson, #8B1A1A);
        }
        .${scopeClass} pre code {
          background: transparent;
          color: inherit;
          padding: 0;
          font-size: inherit;
        }
        .${scopeClass} hr {
          border: none;
          height: 1px;
          background: var(--light, #E8E4DF);
          margin: 44px 0;
        }
        .${scopeClass} table {
          width: 100%;
          border-collapse: collapse;
          margin: 24px 0;
          font-size: 15px;
        }
        .${scopeClass} th, .${scopeClass} td {
          padding: 12px 14px;
          text-align: left;
          border-bottom: 1px solid var(--light, #E8E4DF);
        }
        .${scopeClass} th {
          font-family: var(--cond, 'Barlow Condensed', sans-serif);
          text-transform: uppercase;
          letter-spacing: .14em;
          font-size: 12px;
          color: var(--crimson, #8B1A1A);
          border-bottom: 2px solid var(--ink, #1A1A1A);
        }
      `}</style>
      <div
        className={scopeClass}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
