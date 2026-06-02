/**
 * Faux browser chrome containing the REAL Course 04 — Manager Madness page,
 * served via `<iframe srcdoc>`. Fully live, interactive, gated reveals work,
 * role-conditional content respects ?role=, every brand element of the
 * in-course design — the iris shimmer top bar, the bottom-right quote
 * panels, the gate boxes — renders authentically. Not a screenshot. The
 * actual course page.
 *
 * Reading the HTML at request time on the server (fs.readFileSync) keeps
 * the lesson content out of the client bundle; the iframe sandboxes the
 * script execution against the parent.
 */
import fs from "node:fs";
import path from "node:path";

const LESSON_FILE = "content/lessons/html/lesson-04/aesdr_course04_1_v1.html";

function readLessonHtml(): string {
  try {
    return fs.readFileSync(path.join(process.cwd(), LESSON_FILE), "utf8");
  } catch {
    return "<p>Preview unavailable.</p>";
  }
}

export default function CourseFramePreview() {
  const html = readLessonHtml();

  return (
    <figure
      style={{
        margin: "40px 0 0",
        background: "var(--cream, #FAF7F2)",
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          background: "#1A1A1A",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderRadius: "6px 6px 0 0",
        }}
      >
        {/* Traffic lights */}
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#ff5f56",
          }}
        />
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#ffbd2e",
          }}
        />
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#27c93f",
          }}
        />
        {/* Address bar */}
        <div
          style={{
            flex: 1,
            marginLeft: 12,
            background: "rgba(250, 247, 242, 0.10)",
            color: "rgba(250, 247, 242, 0.85)",
            fontFamily: "var(--mono, 'Space Mono', monospace)",
            fontSize: 12,
            padding: "6px 12px",
            borderRadius: 3,
            letterSpacing: ".04em",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ opacity: 0.55 }}>🔒</span>
          aesdr.com / course / 04 — manager madness / 1
        </div>
        {/* Live label */}
        <span
          style={{
            fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
            fontSize: 10,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "#ffffff",
            background: "var(--crimson, #8B1A1A)",
            padding: "3px 10px",
            borderRadius: 2,
          }}
        >
          Live preview
        </span>
      </div>

      {/* The actual course page */}
      <iframe
        title="Course 04 — Manager Madness · live preview"
        srcDoc={html}
        loading="lazy"
        // sandbox lets in-page scripts + same-document forms run, blocks
        // top-level navigation so a click can't escape the iframe.
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups-to-escape-sandbox"
        style={{
          width: "100%",
          height: "720px",
          border: "1px solid var(--ink, #1A1A1A)",
          borderTop: "none",
          borderRadius: "0 0 6px 6px",
          display: "block",
          background: "#ffffff",
        }}
      />

      <figcaption
        style={{
          fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
          textTransform: "uppercase",
          letterSpacing: ".18em",
          fontSize: 11,
          color: "var(--muted, #6B6B6B)",
          marginTop: 14,
          textAlign: "center",
        }}
      >
        Course 04 · Navigating Manager Madness · scroll the frame, click the
        gates, this is a live page from the actual curriculum.
      </figcaption>
    </figure>
  );
}
