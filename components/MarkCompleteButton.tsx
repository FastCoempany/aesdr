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

  const baseStyle = {
    fontFamily: "var(--mono)",
    fontSize: "9px",
    letterSpacing: ".12em",
    textTransform: "uppercase" as const,
    padding: "6px 14px",
    cursor: isCompleted ? "default" : "pointer",
  };

  if (isCompleted) {
    return (
      <span
        style={{
          ...baseStyle,
          color: "var(--theme)",
          border: "1px solid var(--theme)",
          background: "rgba(16,185,129,0.1)",
        }}
      >
        Completed
      </span>
    );
  }

  return (
    <button
      onClick={handleComplete}
      disabled={isPending}
      style={{
        ...baseStyle,
        color: "var(--text-muted)",
        border: "1px solid var(--line)",
        background: "transparent",
      }}
    >
      {isPending ? "Saving..." : "Mark Complete"}
    </button>
  );
}
