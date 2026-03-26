/**
 * localStorage fallback for course progress.
 * Supabase is the source of truth — localStorage is a backup so progress
 * survives brief connectivity gaps or unauthenticated exploration.
 */

import type { LessonProgressSummary } from "./types";

const STORAGE_KEY = "aesdr_progress";

interface StoredProgress {
  [lessonId: string]: {
    is_completed: boolean;
    last_screen: number;
    state_data: Record<string, unknown>;
    saved_at: string;
  };
}

function read(): StoredProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredProgress) : {};
  } catch {
    return {};
  }
}

function write(data: StoredProgress) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or blocked — silent fail
  }
}

export function saveProgressLocally(
  lessonId: string,
  patch: {
    is_completed?: boolean;
    last_screen?: number;
    state_data?: Record<string, unknown>;
  }
) {
  const all = read();
  const existing = all[lessonId] ?? {
    is_completed: false,
    last_screen: 0,
    state_data: {},
  };
  all[lessonId] = {
    ...existing,
    ...patch,
    saved_at: new Date().toISOString(),
  };
  write(all);
}

export function getLocalProgress(lessonId: string) {
  return read()[lessonId] ?? null;
}

export function getAllLocalProgress(): LessonProgressSummary[] {
  const all = read();
  return Object.entries(all).map(([lesson_id, data]) => ({
    lesson_id,
    is_completed: data.is_completed,
    last_screen: data.last_screen,
  }));
}
