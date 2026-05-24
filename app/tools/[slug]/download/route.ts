import fs from "node:fs/promises";
import path from "node:path";

import { createClient } from "@/utils/supabase/server";

const TOOLS_ROOT = path.join(process.cwd(), "tools", "standalone-html");

/**
 * Map tool slugs to the gating condition.
 * A lesson ID string ("3", "6", etc.) gates on completion of that single
 * lesson. The literal "ALL" gates on completion of all twelve — used for
 * end-of-course bonus downloads.
 */
const TOOL_LESSON_GATE: Record<string, string> = {
  "3.3-aesdr-alignment-contract": "3",
  "6.3-idk-framework": "6",
  "9.2-time-reclaimed-calculator": "9",
  "10.1-ROI-commission-defense-tracker": "10",
  "bonus-72-hr-strike-plan": "ALL",
};

const ALL_LESSON_IDS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

/**
 * Serves a tool HTML wrapped in a print-friendly page.
 * Gated: user must be authenticated AND have completed the lesson (or
 * all twelve lessons, for bonus tools gated with "ALL").
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const gate = TOOL_LESSON_GATE[slug];

  if (!gate) {
    return new Response("Tool not found", { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(
      gatePage("Sign in to download this tool.", false),
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  if (gate === "ALL") {
    const { data: rows } = await supabase
      .from("course_progress")
      .select("lesson_id, is_completed")
      .eq("user_id", user.id)
      .eq("is_completed", true);

    const completedSet = new Set((rows ?? []).map((r) => r.lesson_id));
    const missing = ALL_LESSON_IDS.filter((id) => !completedSet.has(id));

    if (missing.length > 0) {
      const msg =
        missing.length === 1
          ? `Almost there — Lesson ${missing[0]} is the last one before this bonus opens.`
          : `Finish all twelve courses to open this bonus. ${missing.length} left.`;
      return new Response(gatePage(msg, true), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
  } else {
    const { data: progress } = await supabase
      .from("course_progress")
      .select("is_completed")
      .eq("user_id", user.id)
      .eq("lesson_id", gate)
      .maybeSingle();

    if (!progress?.is_completed) {
      return new Response(
        gatePage(
          `Complete Lesson ${gate} first to download this.`,
          true
        ),
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }
  }

  const filePath = path.join(TOOLS_ROOT, `${slug}.html`);
  let html: string;
  try {
    html = await fs.readFile(filePath, "utf-8");
  } catch {
    return new Response("Tool file not found", { status: 500 });
  }

  // Inject a print-trigger script and download header
  const printWrapper = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Download — AESDR Tool</title>
<style>
  .dl-bar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 99999;
    background: #1A1A1A; color: #FAF7F2; padding: 12px 24px;
    display: flex; align-items: center; justify-content: space-between;
    font-family: 'Barlow Condensed', sans-serif; font-size: 13px;
    font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
    border-bottom: 2px solid #8B1A1A;
  }
  .dl-bar button {
    background: #8B1A1A; color: #FAF7F2; border: none; padding: 8px 20px;
    font-family: inherit; font-size: 12px; font-weight: 700;
    letter-spacing: .12em; text-transform: uppercase; cursor: pointer;
  }
  .dl-bar button:hover { background: #6E1414; }
  .dl-spacer { height: 52px; }
  @media print { .dl-bar, .dl-spacer { display: none; } }
</style>
</head>
<body>
<div class="dl-bar">
  <span>AESDR — Save as PDF</span>
  <button onclick="window.print()">Print / Save PDF</button>
</div>
<div class="dl-spacer"></div>
${html}
</body>
</html>`;

  return new Response(printWrapper, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}

function escHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function gatePage(message: string, showBackLink: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Download Locked — AESDR</title>
<style>
  body {
    margin: 0; min-height: 100vh; display: flex; align-items: center;
    justify-content: center; background: #FAF7F2; color: #1A1A1A;
    font-family: 'Source Serif 4', Georgia, serif; font-size: 18px;
    text-align: center; padding: 24px;
  }
  .lock { font-size: 32px; margin-bottom: 16px; opacity: 0.6; }
  .msg { color: #6B6B6B; max-width: 440px; line-height: 1.6; font-style: italic; }
  a { color: #8B1A1A; text-decoration: underline; }
</style>
</head>
<body>
<div>
  <div class="lock">🔒</div>
  <div class="msg">${escHtml(message)}</div>
  ${showBackLink ? '<p style="margin-top:24px"><a href="/dashboard">← Back to Dashboard</a></p>' : '<p style="margin-top:24px"><a href="/login">Sign In</a></p>'}
</div>
</body>
</html>`;
}
