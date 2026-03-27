"use client";

import { useState, useTransition } from "react";

import { markLessonComplete } from "@/app/actions/progress";
import { saveProgressLocally } from "@/utils/progress/local-storage";

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

    // Save to localStorage immediately as backup
    saveProgressLocally(lessonId, { is_completed: true });

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
        className="w-full max-w-sm rounded border-2 border-emerald-500 bg-emerald-500 px-6 py-4 font-bold uppercase tracking-[0.24em] text-slate-950 shadow-[0_0_18px_rgba(16,185,129,0.38)] transition-all cursor-not-allowed"
      >
        Lesson Completed
      </button>
    );
  }

  return (
    <button
      onClick={handleComplete}
      disabled={isPending}
      className="w-full max-w-sm rounded border-2 border-white/90 bg-transparent px-6 py-4 font-bold uppercase tracking-[0.24em] text-white transition hover:bg-white hover:text-slate-950 disabled:cursor-wait disabled:opacity-70"
    >
      {isPending ? "Saving..." : "Mark Lesson Complete"}
    </button>
  );
}
