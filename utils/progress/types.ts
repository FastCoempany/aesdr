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
  /** AE-specific overrides — used on dashboard when role === 'ae' */
  titleAe?: string;
  subtitleAe?: string;
  totalScreens: number;
}

/** All 12 lessons with their metadata */
export const LESSONS: LessonMeta[] = [
  { id: "1",  title: "Creating Structure",                subtitle: "Onboarding, camaraderie & coaching", totalScreens: 9 },
  { id: "2",  title: "Breaking Down Silos",               subtitle: "Home office, ego & team dynamics",   totalScreens: 9 },
  { id: "3",  title: "Surviving & Thriving",               subtitle: "SDR pitfalls, survival & managing up", titleAe: "Surviving & Thriving", subtitleAe: "Performance pitfalls, survival & managing up", totalScreens: 9 },
  { id: "4",  title: "Navigating the Workplace",           subtitle: "Manager dynamics, culture & async life", totalScreens: 9 },
  { id: "5",  title: "The SDR Playbook",                   subtitle: "Level up, stand out & become irreplaceable", titleAe: "The AE Playbook", subtitleAe: "Level up, stand out & become irreplaceable", totalScreens: 9 },
  { id: "6",  title: "Beyond the Sales Playbook",          subtitle: "Learning, networking & knowledge strategy", totalScreens: 9 },
  { id: "7",  title: "Prospecting & Pipeline",             subtitle: "Self-sourced meetings & SaaS career fit", totalScreens: 9 },
  { id: "8",  title: "Leadership & Self-Assessment",       subtitle: "The 30% rule, potential & accountability", totalScreens: 9 },
  { id: "9",  title: "Mastering Your Sales Tools",         subtitle: "Salesforce, Slack & the SaaS stack", totalScreens: 9 },
  { id: "10", title: "Compensation Realities",             subtitle: "Commissions, quotas & feast-or-famine", totalScreens: 9 },
  { id: "11", title: "Sober Selling",                      subtitle: "Alcohol, conferences & professional presence", totalScreens: 9 },
  { id: "12", title: "Relationships & Balance",            subtitle: "SaaS relationships, WFH boundaries & focus", totalScreens: 9 },
];
