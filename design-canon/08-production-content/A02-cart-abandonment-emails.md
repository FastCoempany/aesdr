# Cart Abandonment Email Sequence

> Two emails. Sent after a user starts checkout but doesn't complete it.
> Multiple subject line variants per email for A/B testing.

---

## EMAIL 1: "Still thinking?" — Sent 1 hour after abandonment

### Subject Line Variants

1. "You left something behind"
2. "Still thinking it over?"
3. "Your cart is waiting — no pressure"

### Body

Hey [First Name],

You got pretty close to starting the AESDR curriculum — then stepped away. No judgment. Spending $199 on yourself when you're living on commission income is a real decision.

Here's what I'd want to know if I were you:

**What you're actually getting:**
- 12 courses with interactive exercises (not video lectures you'll never finish)
- 5 downloadable tools you'll use in your actual workflow — commission tracker, alignment contracts, strike plans
- Frameworks built by someone who carried a quota for 9 years, not someone who read about it

**What you're not getting:**
- Motivational content
- Generic scripts
- Anything that sounds like it came from a LinkedIn post

If you're on the fence because of the money: the 14-day refund policy is real. No questions asked. Try it. If it doesn't help, get your money back.

**[Complete Your Purchase →]**

— AESDR

*P.S. — The first course covers surviving your first 90 days, including the manager types that make or break new reps. If that's not relevant to you right now, save your money. But if it is — you already know.*

---

## EMAIL 2: "One more thing" — Sent 24 hours after abandonment

### Subject Line Variants

1. "The real cost of not knowing this stuff"
2. "Quick question before I stop following up"
3. "Most reps figure this out too late"

### Body

Hey [First Name],

Last email about this — I promise.

I talk to a lot of SDRs and AEs. The three reasons people don't invest in themselves are always the same:

**"I can't afford it right now."**
Fair. Commission months are unpredictable. But here's the math: if one framework from this course helps you close one extra deal this quarter, the ROI isn't 2x — it's probably 10x. The course costs less than one decent dinner in most cities.

**"I don't have time."**
Each lesson is designed to be completed alongside a full-time quota. No 4-hour video modules. Interactive screens you can do on your commute or during a slow Friday.

**"I've seen courses like this before."**
You haven't. This one doesn't teach you to "smile and dial." It teaches you to audit your commission structure, manage a bad manager, build a professional network that actually helps you, and create a 72-hour action plan when everything goes sideways.

**[Complete Your Purchase →]**

14 days to try it. Full refund if it's not for you.

— AESDR

---

## Notes for Implementation

- **Trigger:** checkout_started event in Supabase with no matching checkout_completed within 1 hour
- **Dedup:** Don't send Email 2 if user completed purchase after Email 1
- **Unsubscribe:** Both emails must include unsubscribe link (CAN-SPAM)
- **From address:** support@aesdr.com or hello@aesdr.com
- **Reply-to:** support@aesdr.com (so replies go to a real inbox)
