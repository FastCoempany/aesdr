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
  /* The PROSPECT sees the real course chrome — topbar with course progress
     + the right-hand sidebar (Sections 01-04, iris-shimmer sidebar quote).
     That context is what sells the curriculum's care. We only restrict the
     content area to the single interactive widget and disable navigation
     that would let them browse the rest of the section. */

  /* Hide the bottom nav (no Next/Back escape) + ghost numerals that the
     lesson layers on the page background */
  .bottomnav, .gn-wrap, .ghost-n { display: none !important; }

  /* Hide every screen except #s2 (Sort the Survival Strategies). Force s2
     visible regardless of the .active class the lesson's own JS toggles. */
  .screen { display: none !important; }
  .screen#s2 {
    display: block !important;
    opacity: 1 !important;
    transform: none !important;
  }

  /* Lock the sidebar's section buttons so the prospect can SEE the four
     sections (The Role, The Framework, Tools & Strategies, Homework) but
     can't click away from the widget. Section 01 stays at full opacity
     since it's where we are; the others read as "locked content ahead." */
  .sidebar .sb-item {
    pointer-events: none !important;
    cursor: default !important;
  }
  .sidebar .sb-item:not(#nav1) {
    opacity: 0.45 !important;
  }
  /* Also lock the topbar progress controls in case they're interactive */
  .topbar a, .topbar button { pointer-events: none !important; }
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
