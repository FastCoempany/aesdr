import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Mascot } from "@/components/brand/Mascot";
import { poseForLesson } from "@/utils/brand/lesson-poses";
import { LESSONS } from "@/utils/progress/types";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

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
          : `Lesson ${nextLesson.id} is harder.`}
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
          Back to the Journey
        </Link>
      </div>
    </main>
  );
}
