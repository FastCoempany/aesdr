# D15 — Objection-Handling Email ("Free Content vs Structured")

**Deliverable:** Single email sent the day after the workshop to attendees who clicked the offer page but didn't start checkout. Names the most common objection — *"I can get this for free on YouTube / LinkedIn / podcasts"* — and dismantles it without contempt.
**Audience:** Attendance status `attended_live OR watched_replay = true, clicked_offer = true, started_checkout = false`. Sent at workshop end + 24 hours.
**Voice ratio:** 80 Rowan / 20 Michael per canon §3.3 — verdict mode. Michael as the punchline at the close.
**Send timing:** Workshop end + 24 hours.
**Sender:** `AESDR Workshop` (transactional voice, not host — this email earns its place by being argument, not warmth).
**Format:** Markdown source. Renders to HTML for ESP. Branded shell per canon §8.4.
**Canon refs:** `AFFILIATE_BRAND_CANON.md` §3.3, §5 (anti-LinkedIn doctrine), §9 (psychology), §13 (honesty).

---

## Subject line

> *"I can get this for free." Read this before you decide.*

**Discipline check:**
- Quoted clause is the objection itself, in the recipient's voice — pattern-matches what they're actually thinking.
- 9 words.
- The "Read this before you decide" closer is the contract; the body has to deliver an actual case, not a sales pitch.

### Pre-header

> *On YouTube. On LinkedIn. On podcasts. Three things free content can't do.*

---

## Body copy

### Header

`AESDR` wordmark, `--display` italic 900wt, `--ink`, on `--cream`. Co-mark when co-branded.

### Salutation

> *[First name] —*

### Body

> *You clicked the AESDR offer page. You didn't enroll. The most common reason — based on every reply we've received from someone in your exact position — is some version of:*
>
> ***"I can get this for free."***
>
> *On YouTube. On LinkedIn. On a podcast someone keeps recommending. On Reddit threads. On the random PDF a coach posted. You're right — there is a near-infinite supply of free content about SaaS sales.*
>
> *And yet, you've been in the role for [your tenure] and the gap is still there. The workshop named what the gap is. The free content has been available the entire time. So either the free content isn't the answer, or it is and you haven't found the right thread yet.*
>
> *We think it's the first one, and here's why.*
>
> ***Three things free content cannot do:***
>
> ***One — sequence.*** *Free content is published in the order the publisher feels like publishing. You're left to assemble it into a curriculum yourself, with no way to know whether you're reading Lesson 1 or Lesson 8 or a hot take that contradicts both. AESDR is sequenced. You move from foundational to advanced in a deliberate order, and the order is the work.*
>
> ***Two — frame.*** *Free content optimizes for engagement, which means it rewards confidence, controversy, and short hooks. Free content tells you "always be closing" and never tells you what to actually say. AESDR is the operating manual — the part the free content skipped because it doesn't perform well in a 60-second clip.*
>
> ***Three — accountability.*** *Free content is consumed alone, nodded at, and forgotten. AESDR has interactive exercises, a worksheet per lesson, takeaway tools you actually use, and a Discord (Untamed) where reps in your situation are talking about what's working. Doing the work, watched by other people doing the work, is the difference between watching and ramping.*
>
> *None of this is to say you should stop watching free content. Watch it. Learn from it. AESDR isn't a replacement for free content; it's a structure you can hang the free content on once you have one.*
>
> ***If you genuinely think the free content is enough:*** *the honest answer is, maybe it is — for you. Don't enroll. The 14-day refund means the cost of trying is low, but the cost of buying-when-uncertain is your attention, and your attention is the one thing this email is competing for. Save it for something you're sure of.*
>
> ***If you think the free content isn't enough but you haven't admitted that out loud yet:*** *the enrollment link is below. The pilot code closes [date]. Lifetime access. 14-day refund.*

### Primary CTA

> **Iris button:** `Enroll now →`
>
> Below the button, mono 9pt, muted:
> `aesdr.com/[partner-slug]/enroll · code [PILOT-CODE] · closes [date]`

### PS — Michael's line

> *PS — If you enrolled in three free programs in the last year and finished none of them, that's data, not a personal failing. Free content is structured to start. Paid programs are structured to finish. We optimize for the second one.*

— `AESDR Workshop`

### Footer (per canon §8.4 + §10.4)

```
─────────────────────────────────────────────────────
AESDR · [postal address]
This message is from AESDR. You're receiving it because you registered
for the [workshop title] workshop on [date] and viewed the enrollment page.
Workshop hosted by AESDR in partnership with [partner]. [Partner] receives
a commission on enrollments through this email.

Unsubscribe · Privacy · Refunds
© AESDR 2026
─────────────────────────────────────────────────────
```

---

## Visual treatment notes

**Layout pattern:** Branded email shell per canon §8.4 — single column, max 600px, `--cream`. Body uses `--display` italic 700 for the bold structural anchors (One/Two/Three) and the "if you think…" close.

**Palette:**
- Background: `--cream`.
- Body: `--ink`, `--muted` secondary.
- Bold quoted objection (`"I can get this for free."`): `--display` italic 700, 26pt, `--crimson` — quotation visually marked because we're voicing the recipient's own thought.
- Numbered anchors (One/Two/Three): `--display` italic 700, 22pt, `--ink`.
- Two-branch close (italic): `--serif` italic 17pt, `--ink`.
- PS Caveat: `--crimson` in `--hand`.
- Iris button: per canon §6.4.

**Type tokens:**
- Wordmark: `--display` italic 900, ~28pt.
- Quoted objection: `--display` italic 700, 26pt, `--crimson`.
- Body: `--serif` 16pt, line-height 1.6.
- Numbered anchors: `--display` italic 700, 22pt.
- Two-branch close paragraphs: `--serif` italic 17pt.
- CTA button: `--cond` 14pt 700, .15em, uppercase.
- PS Caveat: `--hand` 22pt, `--crimson`, rotation `-1deg`.
- Footer: `--serif` 13pt + `--mono` 10pt.

**Iconography:** None. The crimson `--display` italic quotation mark on the objection line acts as the visual anchor for the argument structure.

**Iris usage:** One — the `Enroll now →` button.

**Deliberate departures from canon:** None.

**Five-question check (canon §6.9.1):**
1. **Thumbnail at 200×200:** Cream + display italic + crimson quoted objection + iris CTA + Caveat PS = AESDR.
2. **Token check:** Pass.
3. **Iris reservation:** Pass — single CTA.
4. **Icon discipline:** Pass — type carries the visual load.
5. **Voice thumbnail:** "You clicked the AESDR offer page. You didn't enroll. The most common reason… is some version of: 'I can get this for free.'" — passes; verdict-shaped Rowan, identifiably AESDR.

---

## Notes

- This is the longest email in the funnel by design. Per canon §3.3, objection-handling is verdict mode — and a verdict has to actually argue. A 90-word "but consider this!" email would fail; the audience is sophisticated and will recognize empty rebuttal.
- The "three things free content cannot do" structure is the canonical argument for AESDR vs free content. If it lands well in pilots, lift it into the FAQ (D23, pending) and the offer page (D6) — but **not as a sales line** — as the same plain argument it makes here.
- The "save your attention for something you're sure of" line is the most distinctive move in the email. Most objection-handling content tries to argue the recipient into the sale. This one offers the recipient the dignified out — and that's the move that makes the *other* recipients enroll.
- The PS reframes "I never finished a course I bought" from a personal failing into a design problem. That's an honest move, and it's also a structural argument for AESDR — interactive exercises + Discord + takeaway tools are designed to finish.

## Open

- The "[your tenure]" placeholder requires capturing tenure on the registration form. Currently the form captures email + role only (canon §7.4). If we don't have tenure, the line falls back to: *"You've been in the role for a while now and the gap is still there."*
- Whether to A/B test a shorter version (3 paragraphs, single argument). Default: ship the long version first; data tells us if attention can hold the length. The longer version's case is harder to compress without losing the contract the subject line made.
- The "enrolled in three free programs in the last year" PS is a candidate canonical phrase. If it lands, lift into the same-day attendee follow-up (D13) revisions.
- D23 (FAQ + objection sheet) — referenced as future home for the "three things" argument. Not yet produced; in deliverable queue.
