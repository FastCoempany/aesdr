/**
 * Server component — reads the Course 04 lesson HTML, injects a CSS+JS
 * transform that:
 *   1. Hides everything except the #s2 screen (the Sort-the-Survival-Strategies
 *      widget). Topbar, sidebar, footer, every other screen — all gone.
 *      The prospect sees ONE interactive exercise, not the whole section.
 *   2. Re-skins the body so the visible widget sits centered on cream
 *      without the sidebar grid pushing it.
 *   3. Polls the in-page #siloCount element; when it reports "5", posts
 *      a {type:"aesdr_silo_complete"} message to the parent window. The
 *      parent (CourseFrameInteractive) listens and triggers the reveal.
 *
 * Reading lesson HTML at request time is supported via outputFileTracingIncludes
 * in next.config.ts — the file ships with the Vercel build.
 */
import fs from "node:fs";
import path from "node:path";
import CourseFrameInteractive from "./CourseFrameInteractive";

const LESSON_FILE = "content/lessons/html/lesson-04/aesdr_course04_1_v1.html";

const INJECT = `
<style>
  /* Hide all course chrome — we only want the one widget visible */
  .topbar, .sidebar, .bottomnav, .gn-wrap, .ghost-n { display: none !important; }

  /* Hide all screens except #s2; force s2 visible regardless of .active state */
  .screen { display: none !important; }
  .screen#s2 { display: block !important; opacity: 1 !important; transform: none !important; }

  /* Collapse the layout grid since the sidebar is gone */
  .app { display: block !important; padding: 0 !important; }
  .main {
    grid-template-columns: 1fr !important;
    padding: 24px 28px 48px !important;
    max-width: 880px !important;
    margin: 0 auto !important;
  }
  body { background: var(--white, #FFFFFF) !important; }

  /* Tighten the widget so it presents at one-screen density */
  #s2 .lh { padding-top: 12px !important; padding-bottom: 16px !important; }
  #s2 .silo-wrap { margin-top: 8px !important; }
</style>
<script>
  // Watch the widget's own counter; when the lesson's drop logic increments
  // it to 5, the prospect has matched all archetypes. Post once to parent.
  (function () {
    var fired = false;
    var t = setInterval(function () {
      try {
        var el = document.getElementById("siloCount");
        if (!el) return;
        var n = parseInt((el.textContent || "").trim(), 10);
        if (!fired && n >= 5) {
          fired = true;
          clearInterval(t);
          try { window.parent.postMessage({ type: "aesdr_silo_complete" }, "*"); } catch (e) {}
        }
      } catch (e) {}
    }, 250);
    // Stop polling after 30 minutes so a forgotten tab doesn't run forever
    setTimeout(function () { clearInterval(t); }, 30 * 60 * 1000);
  })();
</script>
`;

function readLessonHtml(): string {
  try {
    return fs.readFileSync(path.join(process.cwd(), LESSON_FILE), "utf8");
  } catch {
    return "<html><body><p>Preview unavailable.</p></body></html>";
  }
}

function injectIntoHead(html: string, injection: string): string {
  const headCloseIdx = html.toLowerCase().indexOf("</head>");
  if (headCloseIdx === -1) {
    // No </head>? Prepend to <body> as a fallback.
    return html.replace(/<body[^>]*>/i, (m) => m + injection);
  }
  return html.slice(0, headCloseIdx) + injection + html.slice(headCloseIdx);
}

export default function CourseFramePreview() {
  const html = injectIntoHead(readLessonHtml(), INJECT);
  return <CourseFrameInteractive html={html} />;
}
