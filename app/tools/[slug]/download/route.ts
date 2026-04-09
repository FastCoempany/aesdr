import fs from "node:fs/promises";
import path from "node:path";

import { createClient } from "@/utils/supabase/server";

const TOOLS_ROOT = path.join(process.cwd(), "tools", "standalone-html");

/**
 * Map tool slugs to the lesson that must be completed before download.
 */
const TOOL_LESSON_GATE: Record<string, string> = {
  "3.3-aesdr-alignment-contract": "3",
  "6.3-idk-framework": "6",
  "9.2-time-reclaimed-calculator": "9",
  "10.1-ROI-commission-defense-tracker": "10",
  "12.3-72-hr-strike-plan": "12",
};

/**
 * Serves a tool HTML wrapped in a print-friendly page.
 * Gated: user must be authenticated AND have completed the lesson.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const requiredLesson = TOOL_LESSON_GATE[slug];

  if (!requiredLesson) {
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

  const { data: progress } = await supabase
    .from("course_progress")
    .select("is_completed")
    .eq("user_id", user.id)
    .eq("lesson_id", requiredLesson)
    .maybeSingle();

  if (!progress?.is_completed) {
    return new Response(
      gatePage(
        `Complete Lesson ${requiredLesson} to unlock this download.`,
        true
      ),
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
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
    background: #020617; color: #F8FAFC; padding: 12px 24px;
    display: flex; align-items: center; justify-content: space-between;
    font-family: 'Barlow Condensed', sans-serif; font-size: 13px;
    font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
    border-bottom: 2px solid #10B981;
  }
  .dl-bar button {
    background: #10B981; color: #020617; border: none; padding: 8px 20px;
    font-family: inherit; font-size: 12px; font-weight: 700;
    letter-spacing: .12em; text-transform: uppercase; cursor: pointer;
  }
  .dl-bar button:hover { background: #34D399; }
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
    justify-content: center; background: #020617; color: #F8FAFC;
    font-family: 'Cormorant Garamond', Georgia, serif; font-size: 20px;
    text-align: center; padding: 24px;
  }
  .lock { font-size: 48px; margin-bottom: 16px; }
  .msg { color: #94A3B8; max-width: 400px; line-height: 1.6; }
  a { color: #10B981; text-decoration: none; }
</style>
</head>
<body>
<div>
  <div class="lock">🔒</div>
  <div class="msg">${message}</div>
  ${showBackLink ? '<p style="margin-top:24px"><a href="/dashboard">← Back to Dashboard</a></p>' : '<p style="margin-top:24px"><a href="/login">Sign In</a></p>'}
</div>
</body>
</html>`;
}
