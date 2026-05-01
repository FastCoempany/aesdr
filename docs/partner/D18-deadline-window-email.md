# D18 — Deadline-Window Email

**Deliverable:** Single transactional email sent at a real deadline — the moment the pilot pricing window or the replay window is genuinely about to close. One email, one window, one truth. No "12 hours left" follow-up. No "extending one day only." The deadline is real or the deliverable is fraud.
**Audience:** Workshop registrants (attended or not) who clicked the offer page during the pilot window but didn't complete checkout. Audience filter: `attended_live OR watched_replay = true, clicked_offer = true, started_checkout IN (false, true), purchased = false`. The audience is the people who got the workshop, looked at the offer, and didn't decide yet.
**Voice ratio:** 80 Rowan / 20 Michael per canon §3.3 (deadline email row). Verdict mode. The "who should not buy" honesty line carries Rowan; the PS carries Michael.
**Send timing:** 24 hours before pilot pricing closes **or** before replay window closes — whichever comes first per pilot. One email per audience member, ever.
**Sender:** `AESDR Workshop` per canon §7.5 (transactional sender, not host's name).
**Format:** Markdown source. Renders to HTML for ESP. Branded shell per canon §8.4.
**Canon refs:** `AFFILIATE_BRAND_CANON.md` §3.3, §4.4 (subject discipline), §7.5 (email shell), §8.4 (email anatomy), §9.2 (anti-fake-urgency), §10.4 (CAN-SPAM), §13 (honesty discipline), §14 (taglines).

> **Placeholder convention:** `[FIRST_NAME]` for recipient. `[CODE_EXPIRY_DATE_TIME_TZ]` for the actual deadline timestamp (e.g., `2026-05-17 23:59 ET`). `[HOST_FIRST_NAME]` for the host (referenced in PS only). `[PILOT_CODE]` for the pilot promo code. `[PARTNER_SLUG]` for the partner attribution slug. Swap globally before send.

---

## Subject line

> *The window closes [CODE_EXPIRY_DATE_TIME_TZ].*

**Discipline check (canon §4.4):**
- 6 words (within 4–8 ceiling).
- The subject is the contract. The body confirms the deadline and explains exactly what closes.
- No emoji. No "RE:" trick. No `⏰` urgency icon. No exclamation point.
- Sentence case. The timestamp is the discipline — a real time, in a real timezone, with no ambiguity.
- Anti-fake-urgency check (canon §9.2): the deadline must be real. If we extend, we don't run this email again next week with a new date — the canonical phrase *"we said the deadline; we held the deadline"* is the brand move.

### Pre-header (preview text)

> *One email. One window. Plain answer to the three questions you'd ask if we were on the phone.*

---

## Body copy

### Header

`AESDR` wordmark, `--display` italic 900wt, `--ink`, on `--cream`. Co-branded `AESDR × [PARTNER]` lockup top-center per canon §6.6 when applicable.

### Salutation

> *[FIRST_NAME] —*

If no first name on file:

> *Hi —*

### Body

> *You attended the workshop. You opened the offer page. You didn't enroll yet. Three days later, that's normal.*
>
> *This is the only email of its kind you're going to get.*
>
> *Here's what closes at **[CODE_EXPIRY_DATE_TIME_TZ]**:*
>
> ***— The pilot pricing.*** *Code [PILOT_CODE] is specific to this pilot. After the deadline, the offer reverts to list. Lifetime access either way; the pilot price is the difference between deciding now and deciding later at full cost.*
>
> ***— The replay link.*** *The replay window we promised was 72 hours. After the timestamp above, the link expires. We don't run "evergreen" replays. We don't sell the recording.*
>
> ***— Nothing else.*** *No bonuses are expiring. No "fast-action" stack. No artificial scarcity. The price closes; the rest of the program doesn't change.*
>
> *Three honest questions, with plain answers:*
>
> ***Will it run again?*** *Yes — at list price. The pilot pricing is specific to [PARTNER_SLUG] and to this pilot window. We're running other pilots with other partners; pricing for those is theirs, not ours to extend here.*
>
> ***Will the deadline get pushed?*** *No. We do not ship the same "limited time" three pilots in a row (canon §13). When we say the deadline, we hold it.*
>
> ***Should you wait?*** *Maybe. If you're not sure, the right move is to not enroll. The 14-day refund makes the cost of trying low, but the cost of buying-when-uncertain is your attention, and your attention is finite. Save it.*
>
> *If you have a specific blocker — pricing, refund language, manager-reimbursement, time commitment — reply to this email. A real human reads the replies. We can usually answer in two sentences. If we can't, that's also useful information.*

### Primary CTA

> **Iris button:** `Enroll before [CODE_EXPIRY_DATE_TIME_TZ] →`
>
> Below the button, mono 9pt, muted:
> `aesdr.com/[PARTNER_SLUG]/enroll · code [PILOT_CODE] · closes [CODE_EXPIRY_DATE_TIME_TZ]`

### Honest disqualification block (canon §13)

Below the CTA, in `--serif` italic 17pt, ink, single column:

> *Who should not enroll, in plain terms:*
>
> *— If you're 8+ years in sales and aren't open to a re-look at fundamentals, the first five lessons will bore you.*
> *— If you've enrolled in three programs in the last year and finished none of them, the issue isn't free vs paid; it's whether you'll do the work this time.*
> *— If you want motivation, this isn't that. We're not the room.*
>
> *None of those are insults. They're filters. We'd rather you didn't enroll than enroll-and-refund.*

### PS — Michael's line

> *PS — If you read this email, mentally said "I'll decide tomorrow," and closed the tab — that's the most common version of the next 24 hours, and it's how most people end up not deciding. There's no shame in it. There's also no second email. The window is the window.*

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

Type: `--mono` 10pt for nav links and the timestamp; `--serif` 13pt, `--muted` for the disclosure paragraph.

---

## Visual treatment notes

**Layout pattern:** Branded email shell per canon §8.4 — single column, 600px max, `--cream` background. The body uses `--display` italic 700 for the bold structural anchors (the three what-closes bullets, the three honest questions) — same hierarchy device as D15.

**Palette:**
- Background: `--cream`.
- Type: `--ink` body, `--muted` secondary (footer, mono URL).
- Bold-anchor headings (`The pilot pricing`, `The replay link`, `Nothing else`, `Will it run again?`, etc.): `--display` italic 700, 22pt, `--ink`.
- Subject-confirmation timestamp inline in body (`**[CODE_EXPIRY_DATE_TIME_TZ]**`): `--mono` 18pt, `--crimson`.
- Disqualification block: `--serif` italic 17pt, `--ink`, with a top hairline `--light` 1px rule above to separate.
- PS Caveat layer: `--hand` 22pt, `--crimson` on `--cream`, rotation `-1deg`.
- Iris button: per canon §6.4 — single iris CTA, the only iris in the email.

**Type tokens:**
- Wordmark: `--display` italic 900, ~28pt.
- Salutation + body: `--serif` 16pt, line-height 1.6.
- Bold anchors: `--display` italic 700, 22pt.
- Inline timestamp: `--mono` 18pt, `--crimson`.
- CTA button: `--cond` 14pt 700, .15em letter-spacing, uppercase, white type on iris.
- Mono URL/expiry below button: `--mono` 9pt, `--muted`.
- Disqualification block: `--serif` italic 17pt, `--ink`.
- PS Caveat: `--hand` 22pt, `--crimson`, rotation `-1deg`.
- Footer: `--serif` 13pt + `--mono` 10pt.

**Iconography:** None. The crimson `--mono` timestamp and the bold `--display` italic anchors carry the visual hierarchy. No icons in any compliance role; no emoji.

**Iris usage:** One — the `Enroll before [CODE_EXPIRY_DATE_TIME_TZ] →` button. Per canon §6.4.

**Deliberate departures from canon:** None.

**Five-question check (canon §6.9.1):**
1. **Thumbnail at 200×200:** Cream + display italic anchors + crimson timestamp + iris CTA + Caveat PS = identifiably AESDR. Pass.
2. **Token check:** Pass.
3. **Iris reservation:** Pass — single CTA only.
4. **Icon discipline:** Pass — type-only.
5. **Voice thumbnail:** *"You attended the workshop. You opened the offer page. You didn't enroll yet. Three days later, that's normal. This is the only email of its kind you're going to get."* — passes. Verdict-shaped Rowan; the third sentence is the contract.

---

## Honesty discipline (canon §13) — what this email refuses to do

Most deadline emails in SaaS-training do one of these. We do none of them:

- **Manufacture a second deadline.** ("Final final 12 hours!") Forbidden by canon §9.2.
- **Bundle a fake bonus that "expires now."** ("Plus, today only, the bonus stack worth $497!") Forbidden by canon §13.
- **Hide the real reason for the deadline.** Our reason is honest: pilot pricing is partner-specific and time-boxed; replays expire to keep the workshop live, not evergreen. We say so.
- **Use countdown timers in the email body.** Forbidden — they read as engagement-bait, and per canon §6.9.1 the icon-discipline test rejects engagement iconography.
- **Re-send the email with a new date.** Forbidden. We send this email once per audience member, period.
- **Put the disqualification block at the bottom in 9pt gray.** Ours is at the same hierarchy as the CTA. The honest filter is a feature, not a footnote.

---

## Notes on the voice mix

The 80/20 ratio shows up structurally:

- The **body** (10 paragraphs) runs Rowan-heavy: verdict-shaped, three-question scaffold, crimson timestamp doing the work an exclamation point would do in a SaaS-norm version of this email.
- The **disqualification block** is Rowan in cadence but Michael in spirit — the "we'd rather you didn't enroll than enroll-and-refund" line is the canonical AESDR honesty move (canon §1.6).
- The **PS** is the only clean Michael beat. "Mentally said 'I'll decide tomorrow,' and closed the tab" is the named-specific Michael register — no abstraction, just the actual behavior pattern.

The "we part as adults" canonical phrase (canon §14) is **not** used here — D14 already used it. Per the §14 phrase-rotation discipline, this email uses *"the window is the window"* as the closer, which is a candidate canonical phrase if it lands in pilots.

---

## Forward dependencies

This email depends on:
- **D09 workshop deck** — the email references "the workshop." Audience must have actually attended one. **Met.**
- **D14 no-show replay email + D15 free-vs-structured email** — D18 sits at the end of the funnel D14 and D15 ran. **Met.**
- **A real, single deadline** — the pilot pricing window must actually close at the timestamp. Operationally: per canon §9.2, this must be enforced in Stripe (code expires) and on the partner-promo page (offer surface reverts to list). **Operationally pending per pilot setup.**

This email is a forward dependency for:
- **D33 postmortem** — open rate, click-through, conversion-on-deadline-day are all key signals for the kill-or-keep decision.
- **D34 partner-facing close-out** — references the pilot's deadline-day conversion as part of the recap.

---

## Notes

- **The "Will it run again?" answer is load-bearing.** Most prospects assume the answer is no. We say yes — at list price. That single answer eliminates the most common reason people buy under fake urgency, which means the people who buy this email are the people who actually decided, not the people who were rushed. That's better cohort quality, even at the cost of some volume.
- **The "save your attention" reframe** (lifted from D15) is the honest move that distinguishes the email. The lift is intentional and canonical.
- **The PS frames inaction as the real outcome**, not as failure. Per canon §13, naming what's true (most readers will close the tab) earns more trust than pretending most readers will enroll.
- **Anti-fake-urgency operational discipline:** if a pilot pricing window has to be extended for a legitimate reason (e.g., partner missed promotion deliverables and audience didn't get fair notice), the extension is communicated as *a separate communication* — never by re-sending D18 with a new date. The canon §13 phrase: *"the original deadline missed people through no fault of theirs; we're extending [N] days to make it fair."* Documented + signed (canon §16 approval gate).

## Open

- Whether to ship a parallel SMS variant (≤160 chars) for SMS-consented registrants. Default: **no, in batch 5**. SMS at deadline reads as pressure even when honest; the canon §9.2 anti-fake-urgency stance applies more heavily to a channel where messages can't carry the disqualification block.
- Whether the body should embed a screenshot of the offer page rather than describing it. Default: **no** — embedded images degrade in inboxes, and the email's plain-prose register is part of the brand. The CTA carries the visual load.
- Whether the disqualification block should A/B test against the email *without* it. Default: **never test that** — removing the disqualification block would test whether dishonesty performs better than honesty, which is a question we are not interested in the answer to. Per canon §13, this is a non-negotiable.
- "Will it run again?" — current answer is yes-at-list. If we ever introduce a second, separately-priced pilot tier (e.g., higher-priced cohort with founder-direct office hours), this answer needs an update. Flag for the canon-revision queue (canon §17).
