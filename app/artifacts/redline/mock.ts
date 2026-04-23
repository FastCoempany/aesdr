import type { RedlineData } from "@/lib/artifacts/types";

export const MOCK_REDLINE: RedlineData = {
  studentName: "Jordan Rivera",
  role: "sdr",
  generatedAt: "2026-04-19T18:00:00.000Z",
  assessment: {
    readersReport:
      "The upper chapters earn their place. The lower chapters read as rushed and, in two cases, dishonest — the draft contradicts itself against its own notes. Marks below. Redlines in the next folio.",
    overallGrade: "C+",
    overallVerdict:
      "A draft with a strong spine and a broken middle. Two chapters must be rewritten before the manuscript can be accepted. See Folio II for the redlines, Folio III for the corrected final.",
    chapters: [
      {
        chapter: 1,
        category: "identity",
        categoryName: "Identity",
        grade: "A",
        verdict: "Strongest voice in the manuscript. Keep this thread.",
        pct: 85,
      },
      {
        chapter: 2,
        category: "pipeline",
        categoryName: "Pipeline",
        grade: "B",
        verdict: "Competent, but 'pretty good' is doing heavy lifting.",
        pct: 78,
      },
      {
        chapter: 3,
        category: "career",
        categoryName: "Career",
        grade: "B\u2212",
        verdict: "Direction is clear. Execution lags behind intention.",
        pct: 71,
      },
      {
        chapter: 4,
        category: "discipline",
        categoryName: "Discipline",
        grade: "C",
        verdict:
          "The meeting excuse doesn't survive the time audit. Rewrite.",
        pct: 62,
      },
      {
        chapter: 5,
        category: "coaching",
        categoryName: "Coaching",
        grade: "C\u2212",
        verdict: "Honest in reflection, passive in practice. Rewrite.",
        pct: 58,
      },
      {
        chapter: 6,
        category: "networking",
        categoryName: "Networking",
        grade: "D",
        verdict:
          "Lowest chapter. Time excuse contradicts Ch. 4 data. Full rewrite.",
        pct: 45,
      },
    ],
  },
  markups: [
    {
      chapter: 1,
      category: "pipeline",
      categoryName: "Pipeline",
      draftOpening:
        "I need to stop waiting for leads to come to me and start creating my own pipeline. The inbound dependency is making me passive and it shows in my numbers.",
      marginNote: "Good. You see the problem. Now look at what you wrote next \u2193",
      struckClaim:
        "I\u2019m pretty good at qualifying leads \u2014 I usually check budget and authority before passing.",
      insertedTruth:
        "I check two of four BANT criteria and call it qualifying. I scored 62% on the exercise that tested this.",
      scoreAnnotation: "Pipeline Score",
      scoreNote:
        "\u201CUsually\u201D is the word people use when they mean \u201Csometimes.\u201D",
      pct: 78,
    },
    {
      chapter: 2,
      category: "discipline",
      categoryName: "Discipline",
      draftOpening:
        "My mornings are chaos. Some days I\u2019m prospecting by 8, others I\u2019m on Slack until 10 before I make a single call. There\u2019s no system \u2014 it\u2019s just whatever feels urgent.",
      marginNote: "Honest. The diagnostic confirms it. Keep reading.",
      struckClaim:
        "I manage my time well \u2014 I just get pulled into a lot of meetings.",
      insertedTruth:
        "My time audit shows 33% of my day is selling. Internal meetings take 19%. Slack takes 24%. I\u2019m not being pulled \u2014 I\u2019m not pushing back.",
      scoreAnnotation: "Discipline Score",
      scoreNote: "Below cohort average of 70%. The meetings aren\u2019t the problem.",
      pct: 62,
    },
    {
      chapter: 3,
      category: "coaching",
      categoryName: "Coaching",
      draftOpening:
        "I wait for feedback to come to me. I never ask for it directly because part of me is afraid of what I\u2019ll hear. It\u2019s easier to assume I\u2019m doing fine than to find out I\u2019m not.",
      marginNote: "This is the most honest line in the entire manuscript.",
      struckClaim:
        "I\u2019m open to feedback \u2014 I just don\u2019t get much.",
      insertedTruth:
        "In three separate reflections, I described feedback as something that happens to me. I never described going to get it. \u201COpen\u201D and \u201Cseeking\u201D are not the same word.",
      scoreAnnotation: "Coaching Score",
      scoreNote: "The gap isn\u2019t availability. It\u2019s initiative.",
      pct: 58,
    },
    {
      chapter: 4,
      category: "networking",
      categoryName: "Networking",
      draftOpening:
        "I don\u2019t know anyone outside my company in this industry. My LinkedIn is a ghost town. I\u2019ve been so heads-down on quota that I forgot relationships are the long game.",
      marginNote: "True. But then you contradicted yourself \u2193",
      struckClaim:
        "I know I should network more, but I don\u2019t have time.",
      insertedTruth:
        "I spend 2.5 hours per day on Slack and email \u2014 12.5 hours per week of low-value communication. I have the time. I\u2019m choosing to spend it on the wrong things.",
      scoreAnnotation: "Networking Score",
      scoreNote:
        "Lowest category. The time excuse died with the time audit.",
      pct: 45,
    },
  ],
  accepted: [
    {
      category: "pipeline",
      categoryName: "Pipeline",
      commitment:
        "Before passing any lead, confirm all four BANT criteria. If I can\u2019t answer one, ask the question instead of hoping the AE will figure it out.",
    },
    {
      category: "discipline",
      categoryName: "Discipline",
      commitment:
        "8:00\u20139:30 is prospecting. No Slack, no email, no CRM. Calendar blocked, phone on DND. Every day, no exceptions.",
    },
    {
      category: "coaching",
      categoryName: "Coaching",
      commitment:
        "Every Friday, ask my AE for one specific piece of feedback. Cite the exact call or email. Stop waiting to be told.",
    },
    {
      category: "networking",
      categoryName: "Networking",
      commitment:
        "One meaningful LinkedIn conversation per week. Not a connection request \u2014 a real conversation. Build the network before I need it.",
    },
  ],
};
