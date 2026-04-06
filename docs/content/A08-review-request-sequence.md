# Review Request Email Sequence

> 2 emails sent after course completion. Goal: collect testimonials and feedback.

---

## EMAIL 1: "How was it?" — Sent 1 day after completing all 12 courses

### Subject Line Variants

1. "You finished all 12. How was it?"
2. "Quick question — 30 seconds"
3. "One ask before you go"

### Body

Hey [First Name],

You just finished the entire AESDR curriculum. That's rare — most people don't finish most things.

**Quick ask — takes 30 seconds:**

On a scale of 1-5, how useful was this course for your day-to-day work?

⭐ [1] — Not useful  
⭐⭐ [2] — Slightly useful  
⭐⭐⭐ [3] — Decent  
⭐⭐⭐⭐ [4] — Very useful  
⭐⭐⭐⭐⭐ [5] — Would recommend to a friend  

**[Rate the course →]** *(links to simple form)*

If you'd rate it 4 or 5, I'd love a one-sentence testimonial I can use on the site. Just reply to this email with something like:

*"AESDR helped me [specific thing]. I'd recommend it for [type of rep]."*

Your first name and role are enough — no need to share your company if you don't want to.

If you'd rate it 1-3, I want to hear what didn't work. Reply with what was missing or what felt off. I'd rather improve it than pretend everything's perfect.

— AESDR

---

## EMAIL 2: "Gentle nudge" — Sent 4 days after Email 1 (only if no response)

### Subject Line Variants

1. "30 seconds — that's all I need"
2. "Did you see my last email?"
3. "One sentence. That's it."

### Body

Hey [First Name],

Quick follow-up on my last email. I know you're busy — this takes 30 seconds.

**Option 1:** Rate the course (1-5 stars). **[Rate →]**

**Option 2:** Reply with one sentence about what was most useful. I'll use it as a testimonial (first name + role only).

**Option 3:** Tell me what to fix. "Course X was confusing" or "the tool in Course 9 didn't help" — that kind of thing.

Any of those three would be genuinely helpful.

— AESDR

---

## Rating Response Branching

### If rating = 4 or 5:
**Auto-reply:**
"Thanks for the rating! If you have a second, reply with a one-sentence quote I can use on the site. Format: '[Quote]' — [First Name], [Role]. No company name needed."

### If rating = 1, 2, or 3:
**Auto-reply:**
"Thanks for the honesty. Could you share what didn't work? Was it the content, the format, or something else? I read every response and use them to improve the course."

### If no response after Email 2:
No further emails. Respect the silence.

---

## Notes for Implementation

- **Trigger:** User's course_progress shows is_completed = true for all 12 lesson IDs
- **Delay:** 24 hours after final completion (not immediately — let the moment breathe)
- **Rating form:** Can be a simple Typeform, Google Form, or custom page at /feedback
- **Testimonial collection:** Replies to email go to support@aesdr.com inbox
- **Permission:** Any quote used on the site needs explicit consent. The email asks for it implicitly ("I'll use it as a testimonial"), but a follow-up confirmation is better practice.
- **Unsubscribe:** Required
