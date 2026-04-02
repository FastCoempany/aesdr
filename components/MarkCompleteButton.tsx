"use client";

import { useState, useTransition } from "react";

import { markLessonComplete } from "@/app/actions/progress";

interface MarkCompleteButtonProps {
  lessonId: string;
  initialIsCompleted: boolean;
}

export default function MarkCompleteButton({
  lessonId,
  initialIsCompleted,
}: MarkCompleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);

  const handleComplete = () => {
    if (isCompleted) return;
    setIsCompleted(true);
    startTransition(() => {
      void markLessonComplete(lessonId).catch((error) => {
        setIsCompleted(false);
        console.error("Failed to mark lesson complete", error);
      });
    });
  };

  if (isCompleted) {
    return (
      <button
        disabled
        className="w-full max-w-sm cursor-not-allowed"
        style={{
          fontFamily: "var(--cond)",
          fontSize: "13px",
          fontWeight: 800,
          letterSpacing: ".15em",
          textTransform: "uppercase" as const,
          padding: "14px 28px",
          border: "2px solid var(--theme)",
          background: "var(--theme)",
          color: "var(--bg-main)",
          boxShadow: "0 0 24px rgba(16,185,129,0.3)",
        }}
      >
        Lesson Completed
      </button>
    );
  }

  return (
    <button
      onClick={handleComplete}
      disabled={isPending}
      className="w-full max-w-sm cursor-pointer transition disabled:cursor-wait disabled:opacity-70"
      style={{
        fontFamily: "var(--cond)",
        fontSize: "13px",
        fontWeight: 800,
        letterSpacing: ".15em",
        textTransform: "uppercase" as const,
        padding: "14px 28px",
        border: "2px solid var(--text-main)",
        background: "transparent",
        color: "var(--text-main)",
      }}
    >
      {isPending ? "Saving..." : "Mark Lesson Complete"}
    </button>
  );
}
