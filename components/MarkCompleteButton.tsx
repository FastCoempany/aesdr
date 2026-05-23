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
      void markLessonComplete(lessonId).catch(() => {
        setIsCompleted(false);
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
          color: "var(--crimson)",
          border: "1px solid var(--crimson)",
          background: "rgba(139,26,26,0.15)",
          display: "inline-flex",
          alignItems: "center",
          lineHeight: "1",
          boxSizing: "border-box" as const,
          minHeight: "28px",
          whiteSpace: "nowrap" as const,
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
        color: "var(--muted)",
        border: "1px solid var(--light)",
        background: "transparent",
        lineHeight: "1",
        boxSizing: "border-box" as const,
        minHeight: "28px",
        whiteSpace: "nowrap" as const,
      }}
    >
      {isPending ? "Saving..." : "Mark Complete"}
    </button>
  );
}
