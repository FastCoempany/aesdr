import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import LessonFeedbackForm from "@/components/LessonFeedbackForm";
import { createClient } from "@/utils/supabase/server";
import { LESSONS } from "@/utils/progress/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ lessonId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lessonId } = await params;
  return { title: `Feedback · Lesson ${lessonId} | AESDR` };
}

export default async function LessonFeedbackPage({ params }: PageProps) {
  const { lessonId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const lesson = LESSONS.find((l) => l.id === lessonId);
  if (!lesson) redirect("/dashboard");

  const userRole = (user.user_metadata?.role as string) || "sdr";
  const displayTitle =
    userRole === "ae" && lesson.titleAe ? lesson.titleAe : lesson.title;

  const { data: progress } = await supabase
    .from("course_progress")
    .select("last_screen")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--cream)",
        color: "var(--ink)",
        fontFamily: "var(--serif)",
        padding: "48px 24px",
      }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: ".32em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 8,
          }}
        >
          Lesson {lessonId} · Tell us
        </p>
        <h1
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: "clamp(28px,4vw,40px)",
            lineHeight: 1.1,
            marginBottom: 12,
          }}
        >
          What didn&rsquo;t work?
        </h1>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.65,
            color: "var(--muted)",
            marginBottom: 32,
          }}
        >
          Stuck, or think we got something wrong? Say so here. It reaches the
          people who write the lessons — not a support queue.
        </p>

        <LessonFeedbackForm
          lessonId={lessonId}
          lessonTitle={displayTitle}
          lastScreen={progress?.last_screen ?? undefined}
        />

        <p style={{ marginTop: 32 }}>
          <Link
            href={`/course/${lessonId}`}
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            ← Back to the lesson
          </Link>
        </p>
      </div>
    </main>
  );
}
