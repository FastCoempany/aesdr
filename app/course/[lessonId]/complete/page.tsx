import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Mascot } from "@/components/brand/Mascot";
import { poseForLesson } from "@/utils/brand/lesson-poses";
import { LESSONS } from "@/utils/progress/types";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Lesson-to-lesson narrative bridges. Surfaces the editorial through-line
 * the May-22 audit named as "invisible" — each completion page now
 * contextualizes what the next course picks up from this one, rather than
 * just naming the next course's number.
 *
 * Keyed by the just-completed lesson ID. Bridges 1→2 through 11→12.
 * Course 12's completion uses the existing isLast message.
 */
const NARRATIVE_BRIDGES: Record<string, string> = {
  "1": "Course 1 built structure with your manager. Course 2 expands that structure across the floor — silos, home office, AE-SDR friction.",
  "2": "Course 2 mapped the floor's hidden dynamics. Course 3 is the survival kit for when those dynamics turn against you.",
  "3": "Course 3 was about surviving the worst weeks. Course 4 is about navigating the everyday — the manager, the culture, the async-life.",
  "4": "Course 4 read the rooms you sit in. Course 5 is the playbook for what to do once you're in them.",
  "5": "Course 5 gave you the playbook. Course 6 is what the playbook leaves out — the networking, the curiosity, the moves nobody coaches.",
  "6": "Course 6 expanded your toolkit beyond the playbook. Course 7 forces the harder question: is prospecting your job too?",
  "7": "Course 7 confronted whose pipeline this really is. Course 8 confronts who's responsible when it breaks.",
  "8": "Course 8 made you the variable. Course 9 takes a hard look at the tools that quietly ruin you.",
  "9": "Course 9 audited the tools. Course 10 audits the comp plan — and what the math actually says about your year.",
  "10": "Course 10 was the financial math. Course 11 is the off-the-clock math — selling sober, conferences, professional presence.",
  "11": "Course 11 was about who you are at the conference. Course 12 is about who you are on the other 350 days.",
};

interface PageProps {
  params: Promise<{ lessonId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lessonId } = await params;
  return {
    title: `Lesson ${lessonId} complete | AESDR`,
  };
}

/**
 * Post-lesson celebration screen. New route landed by the brand port.
 *
 * Trigger: this page is intended to be the redirect destination after the
 * lesson iframe fires `aesdr:complete` and the user wants to move on.
 * Wiring of that redirect is intentionally NOT in this commit — see the
 * PR description for the rationale (avoids touching the 12 lesson HTML
 * files in content/lessons/html/, which is out of scope for the brand
 * port). For now, the route is reachable manually:
 *
 *     /course/{lessonId}/complete
 *
 * Access is gated server-side on actual lesson completion, so this can't
 * be used as a backdoor.
 */
export default async function LessonCompletePage({ params }: PageProps) {
  const { lessonId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const lesson = LESSONS.find((l) => l.id === lessonId);
  if (!lesson) redirect("/dashboard");

  // Gate: the user must have actually completed this lesson. Without this,
  // someone could navigate directly to /course/X/complete and see a fake
  // celebration. We don't want that.
  const { data: progress } = await supabase
    .from("course_progress")
    .select("is_completed")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (!progress?.is_completed) {
    redirect(`/course/${lessonId}`);
  }

  const userRole = (user.user_metadata?.role as string) || "sdr";
  const displayTitle =
    userRole === "ae" && lesson.titleAe ? lesson.titleAe : lesson.title;

  const currentIdx = LESSONS.findIndex((l) => l.id === lessonId);
  const nextLesson = LESSONS[currentIdx + 1] ?? null;
  const isLast = nextLesson === null;

  const btnPrimary: React.CSSProperties = {
    display: "inline-block",
    padding: "14px 32px",
    background: "var(--ink)",
    color: "var(--cream)",
    textDecoration: "none",
    fontFamily: "var(--cond)",
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
  };

  const btnSecondary: React.CSSProperties = {
    display: "inline-block",
    padding: "13px 30px",
    background: "transparent",
    color: "var(--ink)",
    textDecoration: "none",
    fontFamily: "var(--cond)",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    border: "1px solid var(--ink)",
  };

  return (
    <main
      style={{
        background: "var(--cream)",
        color: "var(--ink)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <Mascot pose={poseForLesson(lessonId)} size={360} priority />
      </div>

      <p
        style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "var(--crimson)",
          marginBottom: 16,
        }}
      >
        Lesson {lessonId} &middot; Complete
      </p>

      <h1
        style={{
          fontFamily: "var(--display)",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: "clamp(36px, 5vw, 56px)",
          lineHeight: 1.1,
          color: "var(--ink)",
          margin: "0 0 16px",
          maxWidth: 720,
        }}
      >
        {displayTitle}.
      </h1>

      <p
        style={{
          fontFamily: "var(--serif)",
          fontStyle: "italic",
          fontSize: 17,
          lineHeight: 1.7,
          color: "var(--muted)",
          marginBottom: 36,
          maxWidth: 520,
        }}
      >
        {isLast
          ? "You made it through all twelve. The shell did not stop."
          : NARRATIVE_BRIDGES[lessonId] ?? `Lesson ${nextLesson.id} is harder.`}
      </p>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {isLast ? (
          <Link href="/reveal" style={btnPrimary}>
            Choose your keeper &rarr;
          </Link>
        ) : (
          <Link href={`/course/${nextLesson.id}`} style={btnPrimary}>
            Lesson {nextLesson.id} &rarr;
          </Link>
        )}
        <Link href="/dashboard" style={btnSecondary}>
          Back to the dashboard
        </Link>
      </div>
    </main>
  );
}
