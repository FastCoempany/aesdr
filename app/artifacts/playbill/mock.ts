import type { PlaybillData } from "@/lib/artifacts/types";

export const MOCK_PLAYBILL: PlaybillData = {
  studentName: "Jordan Rivera",
  role: "sdr",
  generatedAt: "2026-04-19T18:00:00.000Z",
  programme: {
    tempoMark: "allegro con ansia",
    tagline:
      "A twelve-lesson self-portrait performed under stadium lighting with one eye on the scoreboard and the other on the exit.",
    acts: [
      {
        act: 1,
        category: "identity",
        categoryName: "Identity",
        role: "THE PROTAGONIST",
        dynamic: "fortissimo",
        pct: 85,
        programmeNote:
          "Opens with conviction. The strongest voice in the company — knows who they are, says it clearly, believes it. The audience leans forward.",
      },
      {
        act: 2,
        category: "pipeline",
        categoryName: "Pipeline",
        role: "THE CLOSER",
        dynamic: "moderato",
        pct: 78,
        programmeNote:
          "Competent but careful. Claims to qualify every lead; the box office data says two of four criteria are actually checked. 'Pretty good' is doing a great deal of work.",
      },
      {
        act: 3,
        category: "career",
        categoryName: "Career",
        role: "THE UNDERSTUDY",
        dynamic: "andante",
        pct: 71,
        programmeNote:
          "Direction is clear but execution lags behind intention. The blocking is rehearsed; the performance is not yet muscle memory.",
      },
      {
        act: 4,
        category: "discipline",
        categoryName: "Discipline",
        role: "THE GHOST",
        dynamic: "pianissimo",
        pct: 62,
        programmeNote:
          "The meeting excuse doesn't survive the time audit. 33% of the day spent selling. The Slack window is the real stage.",
      },
      {
        act: 5,
        category: "coaching",
        categoryName: "Coaching",
        role: "THE MIRROR",
        dynamic: "adagio",
        pct: 58,
        programmeNote:
          "Honest in reflection, passive in practice. Feedback is described as something that happens to them, never something they go get.",
      },
      {
        act: 6,
        category: "networking",
        categoryName: "Networking",
        role: "THE ABSENCE",
        dynamic: "tacet",
        pct: 45,
        programmeNote:
          "Lowest-grossing act. 'No time to network' contradicts 12.5 hours per week on Slack. The time is present. The priority is absent.",
      },
    ],
  },
  reviews: [
    {
      category: "pipeline",
      categoryName: "Pipeline",
      critic: "The Pipeline Herald",
      critique:
        "'Pretty good' is doing a great deal of work in this performance. The subject claims to qualify every lead. Two of four criteria are actually checked. The rest is hope in a nice outfit.",
      boxOffice: "Two criteria checked. The missing two cost the ticket.",
      verdict: "Mixed — filed from the BANT exercise",
      pct: 78,
    },
    {
      category: "discipline",
      categoryName: "Discipline",
      critic: "Morning Times",
      critique:
        "The program claims 'good time management, pulled into meetings.' The time audit, which does not lie, shows 33% of the day spent selling. The meetings are an alibi. The Slack window is the real stage.",
      boxOffice:
        "Selling ratio: 33%. Meetings: 19%. Slack: 24%. You are not pulled.",
      verdict: "Unfavorable — sourced from the time calculator",
      pct: 62,
    },
    {
      category: "coaching",
      categoryName: "Coaching",
      critic: "The Coaching Review",
      critique:
        "The subject tells the audience they are 'open to feedback.' In three separate scenes, feedback is described as a thing that happens to them. Open and seeking are different words. This play knows only one of them.",
      boxOffice:
        "Openness without initiative is a closed door you can see through.",
      verdict: "Unfavorable — after three reflections",
      pct: 58,
    },
    {
      category: "networking",
      categoryName: "Networking",
      critic: "Industry Weekly",
      critique:
        "'No time to network' is the line the protagonist delivers with conviction. The same protagonist spends 12.5 hours per week on Slack. The time is present. The priority is absent. The play cannot both be true.",
      boxOffice:
        "Lowest-grossing act. The excuse did not survive the audit.",
      verdict: "Panned — opening-night reviewer, from the lobby",
      pct: 45,
    },
  ],
  directorNotes: [
    {
      category: "networking",
      categoryName: "Networking",
      blocking: "New blocking: one real conversation per week.",
      rehearsalFocus:
        "Not a connection request. A conversation — an exchange, a question asked, a comment left that is not about yourself. Build the network before you need it, or the last act plays to an empty house.",
    },
    {
      category: "coaching",
      categoryName: "Coaching",
      blocking: "Friday scene: ask for the feedback, specifically.",
      rehearsalFocus:
        "Every Friday, ask the AE for one piece of feedback. Cite the exact call, the exact email, the exact moment. 'Open' reads as passive on stage. We need seeking. We need the initiative.",
    },
    {
      category: "discipline",
      categoryName: "Discipline",
      blocking: "Opening scene rewritten: 8:00–9:30 is prospecting.",
      rehearsalFocus:
        "Phone on DND. Slack closed. Email closed. Calendar blocked, defended, protected. Every day. The meeting comes second — always. The day starts on offense or it does not start at all.",
    },
    {
      category: "pipeline",
      categoryName: "Pipeline",
      blocking:
        "All four BANT criteria. Every lead. Non-negotiable.",
      rehearsalFocus:
        "Before the lead gets passed — budget, authority, need, timeline. If you don't know one, ask the hard question. Hope is not a line in this script anymore.",
    },
  ],
};
