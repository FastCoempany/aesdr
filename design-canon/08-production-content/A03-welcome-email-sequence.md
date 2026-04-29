# Welcome Email Sequence

> 3 emails sent after successful purchase. Automated drip.

---

## EMAIL 1: Welcome — Sent immediately after purchase

### Subject Line Variants

1. "You're in. Start here."
2. "Welcome to AESDR — your first lesson is ready"
3. "Let's get to work."

### Body

Welcome to AESDR.

No long onboarding. No orientation video. Here's what matters:

**Start here:** [Link to Lesson 1 — "The SDR Reality Check"]

Course 1 covers what nobody tells you in your first 90 days — the manager archetypes, the metrics that actually matter, and how to protect your time before meetings eat it alive.

**A few things to know:**

- There are 12 courses. Each has 3 lessons with interactive exercises.
- Your progress saves automatically. Pick up where you left off anytime.
- Five courses come with downloadable tools (commission tracker, alignment contracts, etc.) — they unlock when you complete the lesson.

**If you need help:** Reply to this email or reach out at support@aesdr.com. Real person, real inbox, 48-hour response time.

Go.

— AESDR

---

## EMAIL 2: Check-in — Sent Day 3

### Subject Line Variants

1. "How's Course 1 going?"
2. "Quick check-in — Day 3"
3. "One tip from Course 2"

### Body

Hey [First Name],

Day 3. If you've started Course 1 — nice. If you haven't, no guilt. Open it when you're ready.

**One thing from Course 2 to keep in your back pocket:**

The "blame chain" is a pattern where SDRs blame their manager, their manager blames marketing, and marketing blames the product. Everyone's pointing fingers. Nobody's fixing anything.

Course 2 gives you a framework to break the chain — not by being a hero, but by asking the right questions in the right meetings.

**[Continue where you left off →]**

— AESDR

---

## EMAIL 3: Nudge — Sent Day 7

### Subject Line Variants

1. "Most students finish Course 3 this week"
2. "Week 1 check — here's what's coming"
3. "The tool in Course 3 is worth the entire price"

### Body

Hey [First Name],

Week 1. Here's where most AESDR students are right now: finishing Course 3.

Course 3 is where you build the **AE/SDR Alignment Contract** — a one-page document that gets you and your AE on the same page about handoffs, expectations, and accountability. It's the single most downloaded tool in the program.

If you're ahead of that: great. Courses 4-6 get into manager dynamics, career pathing, and network building.

If you're behind: that's fine too. This isn't a race. It's a system. Come back to it when you have 20 minutes.

**[Jump to Course 3 →]**

— AESDR

*P.S. — If something about the course isn't working for you, reply and tell me. I'd rather fix it than have you quietly disengage.*

---

## Notes for Implementation

- **Trigger Email 1:** Stripe webhook → checkout.session.completed
- **Trigger Email 2:** Cron job or scheduled send, 3 days after purchase
- **Trigger Email 3:** Cron job, 7 days after purchase
- **Skip logic:** If user has completed Course 3+ by Day 7, skip Email 3 or send a different "you're crushing it" variant
- **Unsubscribe:** Required on all emails
- **From:** AESDR <support@aesdr.com>
