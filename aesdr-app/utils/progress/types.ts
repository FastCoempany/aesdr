/** Shape of a row in the course_progress table */
export interface CourseProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  is_completed: boolean;
  completed_at: string | null;
  last_screen: number;
  state_data: Record<string, unknown>;
  updated_at: string;
  created_at: string;
}

/** Lightweight subset returned to the client */
export interface LessonProgressSummary {
  lesson_id: string;
  is_completed: boolean;
  last_screen: number;
}

/** Lesson metadata used on the dashboard */
export interface LessonMeta {
  id: string;
  title: string;
  subtitle: string;
  totalScreens: number;
}

/** All 12 lessons with their metadata */
export const LESSONS: LessonMeta[] = [
  { id: "1",  title: "Creating Structure",                subtitle: "Week-one onboarding plan",      totalScreens: 9 },
  { id: "2",  title: "Aligning Departments",              subtitle: "Break silo-driven friction",     totalScreens: 9 },
  { id: "3",  title: "Coaching Foundations",               subtitle: "Build the coaching habit",       totalScreens: 9 },
  { id: "4",  title: "Building Call Confidence",           subtitle: "Cold call mastery framework",    totalScreens: 9 },
  { id: "5",  title: "Email & Outreach",                  subtitle: "Multi-channel sequences",        totalScreens: 9 },
  { id: "6",  title: "Handling Objections",                subtitle: "The IDK framework",              totalScreens: 9 },
  { id: "7",  title: "Pipeline Mechanics",                 subtitle: "Move deals forward",             totalScreens: 9 },
  { id: "8",  title: "Discovery Mastery",                  subtitle: "Ask better questions",           totalScreens: 9 },
  { id: "9",  title: "Time & Territory",                   subtitle: "Reclaim productive hours",       totalScreens: 9 },
  { id: "10", title: "ROI & Commission Defense",           subtitle: "Protect your earnings",          totalScreens: 9 },
  { id: "11", title: "Advanced Prospecting",               subtitle: "Multi-thread into accounts",     totalScreens: 9 },
  { id: "12", title: "Putting It All Together",            subtitle: "72-hour strike plan",            totalScreens: 9 },
];
