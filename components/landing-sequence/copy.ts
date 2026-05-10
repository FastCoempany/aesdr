/**
 * Landing-sequence copy — locked. See SESSION_STATE.md.
 *
 * Shared opener plays for everyone (scenes 1 & 2). After the fork, BRANCHED_SCENES
 * and BRANCHED_TERM_LINES key off the chosen role. Members with `initialRole`
 * skip the fork entirely and run the branched track directly.
 */

import type { Role } from "@/lib/role";

export type Seg = { text: string; style?: "iris" };

export const SHARED_SCENES: Seg[][] = [
  [{ text: "So here's the scenario." }],
  [
    { text: "You're an " },
    { text: "AE", style: "iris" },
    { text: ". Or an " },
    { text: "SDR", style: "iris" },
    { text: "." },
  ],
];

export const BRANCHED_SCENES: Record<Role, string[]> = {
  sdr: [
    "You've been doing this for 9 months. They said “AE in 12.” Nobody's mentioned it since.",
    "You set your alarm for 6am on Sunday to “lock in” this week. By Tuesday you'd stopped pretending.",
    "You have a degree. From a university. With a campus. And your job is to get hung up on 97 times a day.",
  ],
  ae: [
    "Your pipeline says $740K. You'd bet your rent on maybe $180K of it.",
    "Sunday night. You're doing “pipeline review.” That means staring at a spreadsheet and hoping something moves.",
    "Last quarter you missed by 31%. This quarter your number went up 30%. Nobody explained the math.",
  ],
};

export const BRANCHED_TERM_LINES: Record<Role, string[]> = {
  sdr: [
    "> scanning your daily activity...",
    "> found: 47 dials. 3 connects. 1 “send me an email.” 0 meetings booked.",
    "> LinkedIn requests sent: 94. Accepted: 11. Replies: “thanks for reaching out!”",
    "> CRM notes: “VM” “VM” “VM” “gatekeeper” “VM” “wrong number” “VM”",
    "> diagnosis: I am a human spam filter with a quota and a dream.",
  ],
  ae: [
    "> scanning your pipeline...",
    "> found: 22 open opportunities. 17 in “discovery” for 45+ days.",
    "> forecast accuracy last quarter: 34%. what you told your VP: 85%.",
    "> deals marked “closing this month”: 8. deals that will actually close: probably 2.",
    "> diagnosis: professional optimist with a commission plan.",
  ],
};

export const TERMINAL_FINAL =
  "This course will change your life a few times throughout. Afterward, you’ll never make the same money again.";

export const TERMINAL_WHISPER = "Keep scrolling. It has to get worse before it gets better.";

export const HERO_DESCRIPTOR: Record<"default" | Role, string> = {
  default: "The 12-lesson sales survival course they never gave you.",
  sdr: "The 12-lesson playbook for SDRs who want out alive.",
  ae: "The 12-lesson playbook for AEs who want their forecast to mean something.",
};

export const FORK_PICK_HEADER = "which one are you";

export const FORK_HALVES = {
  sdr: {
    monoLabel: "role · pre-quota · pre-promotion",
    label: "SDR",
    ghostNum: "01",
    body: {
      strong: "You book the meetings.",
      rest: " You take the no’s. You’re the front line of every pipeline you’ll never get credit for.",
    },
    cta: "Choose this path →",
  },
  ae: {
    monoLabel: "role · quota-carrying · pipeline-owning",
    label: "AE",
    ghostNum: "02",
    body: {
      strong: "You close the deals.",
      rest: " You ride the forecast. You carry the number that nobody else wants their name attached to.",
    },
    cta: "Choose this path →",
  },
} as const;
