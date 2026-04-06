# Drop-Off Prevention Email Sequence

> 3 emails for re-engaging inactive students.
> Triggered by days since last lesson activity.

---

## EMAIL 1: "We noticed you paused" — Sent 5 days after last activity

### Subject Line Variants

1. "Still there?"
2. "No rush — but your next lesson is ready"
3. "Life got busy. Your course is waiting."

### Body

Hey [First Name],

It's been a few days since you were in the course. No guilt — life happens, quota happens, Monday meetings happen.

You left off at **[Lesson X: Title]**. Here's a direct link to pick up where you stopped:

**[Continue Lesson X →]**

If you're stuck or something didn't make sense, reply to this email. Real person, real inbox.

— AESDR

---

## EMAIL 2: "Quick win" — Sent 10 days after last activity

### Subject Line Variants

1. "10 minutes. One framework. Worth it."
2. "Here's one thing from your next lesson"
3. "A quick win while you're away"

### Body

Hey [First Name],

Not going to nag. Instead, here's one actionable thing from the course you haven't seen yet:

**The Weekly Alignment Email**

Every Friday, send your manager a 5-line email:
1. What I did this week (metrics + context)
2. One win
3. One blocker (with a proposed solution)
4. One question for them
5. My plan for next week

That's it. Takes 8 minutes. It flips the power dynamic in your 1:1 and creates a paper trail that protects you in reviews.

This is from **Course [X]**. There's more where that came from.

**[Jump back in →]**

— AESDR

---

## EMAIL 3: "Final check-in" — Sent 21 days after last activity

### Subject Line Variants

1. "Last check-in from us"
2. "Quick question before I stop emailing"
3. "Honest question: was this useful?"

### Body

Hey [First Name],

This is the last re-engagement email I'll send. After this, I'll leave you alone.

Before I do — I'd genuinely like to know:

**Was something off?**

- Was the content not relevant to your role?
- Did something feel confusing or poorly designed?
- Did life just get in the way?

Reply with a one-liner if you want. Or don't. Either way, your account is active and your progress is saved. Come back whenever.

If you need anything: **support@aesdr.com**

— AESDR

*P.S. — If you want to pick it back up, you're at [Lesson X]. Here's the link: **[Continue →]***

---

## Notes for Implementation

- **Trigger:** Query course_progress for users whose last updated_at is 5/10/21+ days ago AND is_completed is false on any lesson
- **Skip logic:** If user resumes activity after Email 1, cancel Emails 2 and 3
- **Skip logic:** If user has completed all courses, don't send any of these
- **Frequency cap:** Maximum 3 re-engagement emails per quarter per user
- **Tone escalation:** Email 1 is warm, Email 2 is helpful, Email 3 is honest and final
- **Unsubscribe:** Required on all
