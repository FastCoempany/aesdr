# D13 — Same-Day Attended-No-Purchase Email

**Deliverable:** Single email sent the same day as the workshop to attendees who showed up live but did not enroll. Closes the gap between "saw the workshop" and "decided." Includes the worksheet referenced in the deck.
**Audience:** Attendance status `attended_live = true, purchased = false` at workshop end + 60 minutes.
**Voice ratio:** 65 Rowan / 35 Michael — slightly higher Michael than reminder emails because trust is at peak (they showed up, they listened) and the email needs warmth without grovel. Calm Rowan body, Michael in two places — one mid-body beat and the PS.
**Send timing:** Workshop end + 90 minutes (after the kill-window for any post-session purchases to land).
**Sender:** `[Host first name], AESDR` per canon §7.5 — this is the one transactional email where personal voice helps; trust is host-conferred at this moment.
**Format:** Markdown source. Renders to HTML for ESP. Branded shell per canon §8.4. Includes a 1-page worksheet PDF attachment.
**Canon refs:** `AFFILIATE_BRAND_CANON.md` §3.3, §7.5, §8.4, §13 (honesty), §10.4.

---

## Subject line

> *You stayed for the workshop. Here's the worksheet, and one honest thing.*

**Discipline check:**
- 11 words — over the 4–8 ceiling, but the contract earns the length: it names what's attached and previews the body's tone shift.
- Plain, no curiosity gap.
- "One honest thing" sets up the disqualification block, not a sales twist.

### Pre-header

> *Worksheet attached. Replay link inside. The offer's still open through [date].*

---

## Body copy

### Header

`AESDR` wordmark, `--display` italic 900wt, `--ink`, on `--cream`. Co-mark when co-branded.

### Salutation

> *[First name] —*

### Body

> *You stayed for the whole workshop. That puts you in the smaller half of registrants — most people drop in the last 15 minutes when the offer slide goes up, and most of them never circle back. You did, and that's worth saying out loud.*
>
> *Three things in this email.*
>
> ***One — the worksheet.*** *Attached. The exercise we ran in the second half of the workshop is on it, in printable form. Even if you never enroll in AESDR, the worksheet on its own is useful — it's the same self-assessment we use as the diagnostic in Course 1.*
>
> ***Two — the replay.*** *Open for the next 48–72 hours at* `aesdr.com/[partner-slug]/replay/[token]`*. After that, it closes — we don't run this as evergreen content, and we don't sell the recording.*
>
> ***Three — the offer, and the honest thing.*** *AESDR is the 12-lesson program: $249 SDR / $299 AE / $1,499 Team, lifetime access, 14-day no-questions-asked refund. Enrollment link:* `aesdr.com/[partner-slug]/enroll · code [PILOT-CODE] · closes [date]`*.*
>
> *The honest thing: if you walked out of the workshop unsure whether the program fits where you actually are, the answer is probably "wait." AESDR isn't going anywhere. Course 1 isn't going to change. The 14-day refund is real, but we'd genuinely rather you don't enroll than enroll uncertain. If you have a specific question — about your role, your timing, your fit — reply to this email. Real reply, real answer.*

### Primary CTA

> **Iris button:** `Enroll now →`
>
> Below the button, mono 9pt, muted:
> `aesdr.com/[partner-slug]/enroll · code [PILOT-CODE] · closes [date]`

### Secondary CTA (outline)

> `Watch the replay →`

### PS — Michael's line

> *PS — If you walked out wondering whether AESDR was the operating manual or the motivation engine, it's the manual. If you wanted the motivation engine, the internet has a surplus and YouTube auto-plays one for free.*

— *[Host first name], AESDR*

### Footer (per canon §8.4 + §10.4)

```
─────────────────────────────────────────────────────
AESDR · [postal address]
This message is from AESDR. You're receiving it because you attended
the [workshop title] workshop on [date].
Workshop hosted by AESDR in partnership with [partner]. [Partner] receives
a commission on enrollments through this email.

Unsubscribe · Privacy · Refunds
© AESDR 2026
─────────────────────────────────────────────────────
```

---

## Worksheet attachment spec

**File:** `aesdr--template--workshop-worksheet--v1.pdf`

**Content:**
- Letter / A4, cream background.
- Mono eyebrow: `AESDR · WORKSHOP WORKSHEET · v1`.
- Display italic title: *The self-assessment we use in Course 1.*
- One-line subtitle in serif: *Filled out alone. Then read back. The answers are the diagnostic.*
- Five questions, each in `--cond` 18pt 700wt with 4 lines of `--light`-bordered cream space below for handwritten responses.
- Five questions (canonical):
  1. *What did your last full week of activity look like — in counts, not feelings?*
  2. *What's the difference between what your manager grades you on and what you grade yourself on?*
  3. *Of the deals (or accounts) currently in your name, which one will you be embarrassed about in 90 days, and why?*
  4. *Who in your company has the operating standard you'd want to grow into — and what specifically do they do differently?*
  5. *If you had three uninterrupted hours this week, where would you actually spend them — and what does that say about what you've been avoiding?*
- Footer mono: postal, "© AESDR 2026."
- Ghost numeral `01` bottom-right at opacity .04.
- Ambient iris line at the bottom edge, 1px, opacity .15.

This worksheet is itself a partner-facing brand asset — it has to feel like part of AESDR, not a generic PDF.

---

## Visual treatment notes

**Layout pattern:** Branded email shell per canon §8.4 — single column, max 600px, `--cream`. The body uses bold italic display headings (`One —`, `Two —`, `Three —`) as structural anchors per `--cond` treatment.

**Palette:**
- Background: `--cream`.
- Body: `--ink`, `--muted` secondary.
- Numbered anchors (One/Two/Three): `--display` italic 700, `--ink`.
- "Honest thing" paragraph: `--serif` italic 17pt, `--ink` — slightly larger than body to signal weight.
- PS: `--crimson` in `--hand`.
- Iris button: per canon §6.4, single CTA.
- Outline secondary button: 1.5px `--ink` border per canon `.btnOutline` pattern.

**Type tokens:**
- Wordmark: `--display` italic 900, ~28pt.
- Numbered anchors: `--display` italic 700, 22pt.
- Body: `--serif` 16pt, line-height 1.6.
- "Honest thing" weight-shift: `--serif` italic 17pt.
- Buttons: `--cond` 14pt 700, .15em, uppercase.
- PS Caveat: `--hand` 22pt, `--crimson`, rotation `-1deg`.
- Footer: `--serif` 13pt + `--mono` 10pt for nav.

**Iconography:** None new. The numbered anchors (One/Two/Three) substitute for what a typical email would use icons for.

**Iris usage:** One — the `Enroll now →` button. The secondary `Watch the replay →` is an outline button per canon `.btnOutline`, not iris.

**Deliberate departures from canon:** None.

**Five-question check (canon §6.9.1):**
1. **Thumbnail at 200×200:** Cream + display italic + iris CTA + outline secondary + Caveat PS = AESDR.
2. **Token check:** Pass.
3. **Iris reservation:** Pass — single CTA.
4. **Icon discipline:** Pass — no icons; numbered display anchors carry the structure.
5. **Voice thumbnail:** "You stayed for the whole workshop. That puts you in the smaller half of registrants…" — passes; identifiably Rowan opening with named-numbers honesty.

---

## Notes

- The host (not "AESDR Workshop") signs this email because trust is host-conferred at this moment. Per canon §7.5 — this is the one transactional email where personal voice helps.
- The "honest thing" paragraph is the most important paragraph in this email and possibly in the entire nurture funnel. It is the single move that distinguishes AESDR from every other "claim your seat now!" follow-up the recipient has received this month. Cutting it for length is the wrong instinct.
- The worksheet attachment turns the email from a sales follow-up into a brand artifact — even non-purchasers walk away with something AESDR-feeling. This compounds across the affiliate ecosystem because non-purchasers talk.
- The PS uses the "operating manual / motivation engine" canonical pair plus a Michael flicker about YouTube auto-play. Both are canon, both have fresh use here, neither overdraws their account.

## Open

- Worksheet attachment doesn't exist yet — produce alongside this email's first send. The 5 questions above are the canonical content; design treatment per the spec section above.
- The honest-thing paragraph contains "reply to this email — real reply, real answer." Confirm operationally: who replies? Default per canon §12.5 — the host replies for content questions; the founder replies under Admissions alias (canon §12.3) for fit / pricing / "should I buy" questions.
- Whether the email mentions team licensing as an option for the recipient's manager. Default: no — covered on the offer page; mentioning it in this email risks looking up-sell-y.
- Whether this email is sent only to attendees-no-purchase, or also to attendees-who-purchased (in a different version that congratulates rather than nurtures). Default: this email is no-purchase only. A separate D13b "welcome to AESDR" email handles purchasers (not in current batch).
