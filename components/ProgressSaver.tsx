"use client";

import { useCallback, useEffect, useRef } from "react";

import { saveLessonProgress } from "@/app/actions/progress";
import { saveProgressLocally } from "@/utils/progress/local-storage";

interface ProgressSaverProps {
  lessonId: string;
  isAuthenticated: boolean;
}

/**
 * Invisible component that listens for `aesdr:progress` custom events
 * dispatched by the lesson iframe via postMessage, then persists progress
 * to Supabase (if authenticated) and localStorage (always).
 *
 * Lesson HTML files dispatch:
 *   window.parent.postMessage({ type: 'aesdr:progress', screen, stateData }, '*')
 */
export default function ProgressSaver({
  lessonId,
  isAuthenticated,
}: ProgressSaverProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    (screen: number, stateData: Record<string, unknown>) => {
      // Always save to localStorage immediately
      saveProgressLocally(lessonId, {
        last_screen: screen,
        state_data: stateData,
      });

      // Debounce the server save to avoid spamming on rapid navigation
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (isAuthenticated) {
          saveLessonProgress(lessonId, screen, stateData).catch((err) =>
            console.error("Failed to save progress to server:", err)
          );
        }
      }, 1500);
    },
    [lessonId, isAuthenticated]
  );

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type !== "aesdr:progress") return;
      const { screen, stateData } = event.data as {
        screen: number;
        stateData: Record<string, unknown>;
      };
      save(screen, stateData ?? {});
    }

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [save]);

  return null;
}
