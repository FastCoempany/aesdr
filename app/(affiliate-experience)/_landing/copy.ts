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
    "You've been doing this for 9 months. They said “you'll get the AE promotion at 12 months.” Nobody's mentioned it since.",
    "You set your alarm for 6am on Sunday to “prep so I'm locked in this week.” By Tuesday, the plan was already dead.",
    "You're ambitious. You're coachable. You chose this on purpose. And your job is to get hung up on 97 times a day.",
  ],
  ae: [
    "Your pipeline says $740K. You'd bet your rent on maybe $180K of it.",
    "Sunday night. You're doing “pipeline review.” That means staring at a spreadsheet and hoping something moves.",
    "Last quarter you missed by 31%. This quarter your number went up 30%, and nobody explained the math.",
  ],
};

export const BRANCHED_TERM_LINES: Record<Role, string[]> = {
  sdr: [
    "> scanning your daily activity...",
    "> found: 47 dials. 3 connects. 1 “send me an email.” 0 meetings booked.",
    "> LinkedIn requests sent: 94. Accepted: 11. Replies: “I'm not the right person for this” at best.",
    "> CRM notes: “VM” “VM” “VM” “gatekeeper” “VM” “wrong number” “VM”",
    "> diagnosis: my job is to be a human spam filter with a quota and a dream I can't articulate.",
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
  "This program will change your life a few times throughout your journey in the 12 courses. Afterward, it’s highly unlikely that you’ll ever make the same money again.";

export const TERMINAL_WHISPER = "Keep scrolling. The picture gets worse before it gets better.";

export const HERO_DESCRIPTOR: Record<"default" | Role, string> = {
  default: "12-course sales survival program — for early-career AEs and SDRs.",
  sdr: "The 12-course program for SDRs done winging it for the first two years. You actually want it all to pay off.",
  ae: "The 12-course survival program for AEs who want their forecast to mean something.",
};

export const FORK_PICK_HEADER = "which one are you";

export const FORK_HALVES = {
  sdr: {
    monoLabel: "role · pre-quota · pre-promotion",
    label: "SDR",
    ghostNum: "01",
    body: {
      strong: "You book the meetings.",
      rest: " You take the no’s. You’re the front line of every pipeline. You’ll never get credit for it.",
    },
    cta: "Pick SDR →",
  },
  ae: {
    monoLabel: "role · quota-carrying · pipeline-owning",
    label: "AE",
    ghostNum: "02",
    body: {
      strong: "You close the deals.",
      rest: " You ride the forecast. You carry the number that nobody else wants their name attached to.",
    },
    cta: "Pick AE →",
  },
} as const;
