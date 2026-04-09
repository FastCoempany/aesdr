import type { Metadata } from "next";
import Link from "next/link";

import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@/utils/supabase/server";
import { LESSONS } from "@/utils/progress/types";
import type { LessonProgressSummary } from "@/utils/progress/types";

export const metadata: Metadata = {
  title: "Dashboard — Option B | AESDR",
};

/* ─── Rowan Pope energy. Each line is cryptic, sharp, slightly menacing. ─── */
const TEASERS: Record<string, string> = {
  "1": "You think you're ready. You're not. But we start here anyway.",
  "2": "Your own team is working against you and they don't even know it.",
  "3": "Nobody is coming to save you. Learn to save yourself.",
  "4": "Fear is a choice. A poor one. This is where you stop choosing it.",
  "5": "Your outreach is a confession letter. Let's make it a weapon.",
  "6": "They will say no. The question is what you do in the next four seconds.",
  "7": "Hope is not a pipeline strategy. Math is. Learn the math.",
  "8": "You're talking too much. That's not an opinion — it's a diagnosis.",
  "9": "Eleven hours yesterday. Four of them were selling. Do the arithmetic.",
  "10": "They will change your comp plan. The only question is whether you're ready.",
  "11": "One thread. One champion. One prayer. That's not strategy — that's religion.",
  "12": "This is where you stop reading and start executing. 72 hours. No mercy.",
};

export default async function MockupB() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let progressMap: Record<string, LessonProgressSummary> = {};
  if (user) {
    const { data } = await supabase
      .from("course_progress")
      .select("lesson_id, is_completed, last_screen")
      .eq("user_id", user.id);
    if (data) {
      for (const row of data) progressMap[row.lesson_id] = row;
    }
  }

  // Dev preview: no auth required, shows fresh-user state
  const isPreview = !user;

  const completedCount = LESSONS.filter((l) => progressMap[l.id]?.is_completed).length;
  const currentLesson = LESSONS.find((l) => !progressMap[l.id]?.is_completed) || LESSONS[0];
  const currentIdx = LESSONS.findIndex((l) => l.id === currentLesson.id);

  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--bg-main)" }}
    >
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-[5%] py-5"
        style={{ borderBottom: "1px solid var(--line)", background: "rgba(2,6,23,0.9)", backdropFilter: "blur(10px)" }}
      >
        <span style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase" }}>
          <span style={{ background: "var(--iris)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "iris 3s linear infinite" }}>AESDR</span>
        </span>
        <div className="flex items-center gap-4" style={{ fontFamily: "var(--cond)", fontWeight: 600, fontSize: "13px", letterSpacing: ".1em", textTransform: "uppercase" }}>
          <Link href="/account" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Account</Link>
          {user && <SignOutButton />}
        </div>
      </nav>

      <div className="mx-auto w-full max-w-3xl px-6 py-16" style={{ color: "var(--text-main)" }}>

        {/* Header */}
        <header className="mb-16">
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: "10px",
              letterSpacing: ".3em",
              textTransform: "uppercase",
              color: "var(--theme)",
              marginBottom: "16px",
            }}
          >
            The Journey
          </p>
          <h1
            style={{
              fontFamily: "var(--display)",
              fontSize: "clamp(28px, 4vw, 44px)",
              lineHeight: "1",
              marginBottom: "12px",
            }}
          >
            {completedCount === 0
              ? "It starts now."
              : completedCount === LESSONS.length
                ? "You made it."
                : `${completedCount} down. ${LESSONS.length - completedCount} to go.`}
          </h1>
        </header>

        {/* The Journey — sequential list */}
        <div className="flex flex-col" style={{ gap: "0" }}>
          {LESSONS.map((lesson, idx) => {
            const isCompleted = progressMap[lesson.id]?.is_completed ?? false;
            const isCurrent = lesson.id === currentLesson.id;
            const isFuture = idx > currentIdx;
            const isNextVisible = idx === currentIdx + 1; // one step ahead visible

            // Fog of war: completed + current + one ahead are visible
            const isVisible = isCompleted || isCurrent || isNextVisible;
            const isLocked = isFuture && !isNextVisible;

            return (
              <div
                key={lesson.id}
                style={{
                  position: "relative",
                  paddingLeft: "48px",
                  paddingBottom: idx < LESSONS.length - 1 ? "0" : "0",
                }}
              >
                {/* Vertical timeline line */}
                {idx < LESSONS.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      left: "15px",
                      top: "32px",
                      bottom: "0",
                      width: "1px",
                      background: isCompleted ? "var(--theme)" : "var(--line)",
                      transition: "background 0.5s",
                    }}
                  />
                )}

                {/* Node */}
                <div
                  style={{
                    position: "absolute",
                    left: "8px",
                    top: "8px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    border: isCompleted
                      ? "2px solid var(--theme)"
                      : isCurrent
                        ? "2px solid var(--text-main)"
                        : "1px solid var(--line)",
                    background: isCompleted ? "var(--theme)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "9px",
                    color: isCompleted ? "var(--bg-main)" : "transparent",
                    transition: "all 0.3s",
                    boxShadow: isCurrent ? "0 0 12px rgba(248,250,252,0.15)" : "none",
                  }}
                >
                  {isCompleted && "\u2713"}
                </div>

                {/* Content */}
                <div
                  style={{
                    padding: "0 0 40px 0",
                    opacity: isLocked ? 0.2 : isNextVisible && !isCompleted ? 0.5 : 1,
                    filter: isLocked ? "blur(2px)" : "none",
                    transition: "opacity 0.5s, filter 0.5s",
                  }}
                >
                  {/* Lesson number */}
                  <p
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "9px",
                      letterSpacing: ".2em",
                      textTransform: "uppercase",
                      color: isCompleted ? "var(--theme)" : "var(--text-muted)",
                      marginBottom: "6px",
                    }}
                  >
                    {isCompleted ? "Completed" : isLocked ? `Lesson ${lesson.id}` : `Lesson ${lesson.id}`}
                  </p>

                  {/* Title — linked if accessible */}
                  {isCompleted || isCurrent ? (
                    <Link
                      href={`/course/${lesson.id}`}
                      style={{
                        fontFamily: "var(--cond)",
                        fontSize: "22px",
                        fontWeight: 700,
                        letterSpacing: ".04em",
                        textTransform: "uppercase",
                        color: isCurrent ? "var(--text-main)" : "var(--text-muted)",
                        textDecoration: "none",
                        display: "block",
                        marginBottom: "8px",
                        lineHeight: "1.2",
                      }}
                    >
                      {lesson.title}
                      {isCurrent && (
                        <span style={{ marginLeft: "12px", fontSize: "14px", color: "var(--theme)" }}>&rarr;</span>
                      )}
                    </Link>
                  ) : (
                    <p
                      style={{
                        fontFamily: "var(--cond)",
                        fontSize: "22px",
                        fontWeight: 700,
                        letterSpacing: ".04em",
                        textTransform: "uppercase",
                        color: "var(--text-muted)",
                        marginBottom: "8px",
                        lineHeight: "1.2",
                      }}
                    >
                      {isVisible ? lesson.title : "???"}
                    </p>
                  )}

                  {/* Cryptic teaser — the Rowan Pope line */}
                  <p
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: "16px",
                      fontStyle: "italic",
                      lineHeight: "1.6",
                      color: "var(--text-muted)",
                      maxWidth: "480px",
                    }}
                  >
                    {isVisible
                      ? TEASERS[lesson.id]
                      : isLocked
                        ? "You haven't earned this yet."
                        : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
