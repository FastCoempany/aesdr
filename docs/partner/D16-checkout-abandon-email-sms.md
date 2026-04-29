# D16 — Checkout-Abandon Email + Optional SMS

**Deliverable:** Two surfaces — a single email and an optional ≤160-char SMS — sent to attendees who started the Stripe checkout but didn't complete it. Friction-removal copy: name the friction, address it, single CTA back to the same checkout session.
**Audience:** Attendance status `started_checkout = true, purchased = false`. Detected via Stripe webhook `checkout.session.expired` or 24h after `checkout.session.async_payment_failed`.
**Voice ratio:** 60 Rowan / 40 Michael per canon §3.3 — Michael earns presence here because the recipient is mid-decision and over-Rowan'ing reads as pressure. Plain Rowan body, Michael in two beats.
**Send timing:** Email at checkout-start + 24 hours (if no purchase). SMS at checkout-start + 4 hours, **only if the registrant had SMS consent on file**.
**Sender:** `AESDR Workshop` (email); `AESDR:` prefix (SMS, per canon §10.5).
**Format:** Markdown source for both. Email renders to HTML; SMS plain.
**Canon refs:** `AFFILIATE_BRAND_CANON.md` §3.3, §7.5, §7.6, §8.4, §10.4, §10.5, §13.

---

## A. Email — checkout-abandon

### Subject line

> *Your checkout didn't go through. Here's what usually fixed it.*

**Discipline check:**
- 10 words. Names exactly what happened. No guilt, no urgency.
- The contract is the second clause: the body has to deliver an actual fix, not a sales pitch.

### Pre-header

> *Same checkout, same price, same code. Three things people usually need.*

### Body

**Header:** AESDR wordmark, co-mark when co-branded.

**Salutation:** *[First name] —*

**Body:**

> *You started the checkout for AESDR. It didn't finish. That happens for one of three reasons, and none of them are dramatic.*
>
> ***One — the card didn't run.*** *Stripe declined it, the bank held it, or the autofill grabbed the wrong card. Solution: try the same checkout link below; if the same card declines a second time, switch cards or use Apple/Google Pay.*
>
> ***Two — the page closed before you finished.*** *Tab crashed, browser restarted, you got pulled into a meeting. The link below resumes the same session — your code, your tier, your email.*
>
> ***Three — you got most of the way through and changed your mind.*** *That's a real reason and we're not going to dance around it. If you walked away because the price hit differently than you expected, or because you hit "I'll think about it" and the tab idle-closed, that's data we want to know about. Reply to this email with what stopped you. Real reply, real answer.*
>
> ***The link.*** *Same checkout, same code, same price.*

**Primary CTA:**

> **Iris button:** `Resume checkout →`
>
> Below the button, mono 9pt, muted:
> `aesdr.com/[partner-slug]/enroll · code [PILOT-CODE] · closes [date]`

**PS — Michael's line:**

> *PS — If the answer is "I want to enroll but my company is supposed to reimburse me and L&D ghosted my Slack message," reply with the email address of the human who actually approves the budget. We'll send them a one-page brief that pre-empties the eight questions L&D usually asks. It usually unsticks within a week.*

— `AESDR Workshop`

**Footer** (per canon §8.4 + §10.4):

```
─────────────────────────────────────────────────────
AESDR · [postal address]
This message is from AESDR. You're receiving it because you started a
checkout for AESDR on [date].
Workshop hosted by AESDR in partnership with [partner]. [Partner] receives
a commission on enrollments.

Unsubscribe · Privacy · Refunds
© AESDR 2026
─────────────────────────────────────────────────────
```

---

## B. SMS — checkout-abandon (optional, consent-gated)

Sent at checkout-start + 4 hours. **Only if the registrant gave SMS consent at registration.** If no consent, this surface does not exist for that registrant and the email above is the only touch.

### Version A — Plain (Rowan-led, default)

> `AESDR: Your checkout didn't finish. Same link works: aesdr.io/c/[token]. Reply STOP to opt out.`

**Character count (template):** ~95.

**Voice notes:** Pure Rowan. Plain verdict, link, opt-out. Default for first pilot.

### Version B — Friction-acknowledging (60/40)

> `AESDR: Checkout didn't go through — usually a card or a closed tab. Same link: aesdr.io/c/[token]. Reply STOP to opt out.`

**Character count (template):** ~127.

**Voice notes:** Acknowledges the most common cause. Reads as "we know what usually happens" rather than "you didn't finish."

---

## Visual treatment notes

### A — Email

**Layout pattern:** Branded email shell per canon §8.4 — single column, max 600px, `--cream`. Numbered display anchors per the D13 pattern.

**Palette:**
- Background: `--cream`.
- Body: `--ink`, `--muted` secondary.
- Numbered anchors (One/Two/Three): `--display` italic 700, `--ink`.
- "The link." structural anchor: `--display` italic 700, slightly larger weight to act as the visual handoff to the CTA.
- PS Caveat: `--crimson` in `--hand`.
- Iris button: per canon §6.4.

**Type tokens:**
- Wordmark: `--display` italic 900, ~28pt.
- Numbered anchors: `--display` italic 700, 22pt.
- "The link.": `--display` italic 700, 24pt.
- Body: `--serif` 16pt, line-height 1.6.
- CTA: `--cond` 14pt 700, .15em, uppercase.
- PS Caveat: `--hand` 22pt, `--crimson`, rotation `-1deg`.
- Footer: `--serif` 13pt + `--mono` 10pt.

**Iconography:** None. Numbered display anchors carry the structure.

**Iris usage:** One — the `Resume checkout →` button.

**Deliberate departures from canon:** None.

### B — SMS

**"Visual" attributes:** Same as D12 — `AESDR:` prefix, plain text, no emoji, branded short-URL only, `Reply STOP to opt out` tail.

**Iconography:** None.
**Iris usage:** None.
**Deliberate departures from canon:** None.

**Five-question check — email:**
1. **Thumbnail at 200×200:** Cream + display italic + numbered anchors + iris CTA + Caveat PS = AESDR.
2. **Token check:** Pass.
3. **Iris reservation:** Pass.
4. **Icon discipline:** Pass.
5. **Voice thumbnail:** "Your checkout didn't go through. Here's what usually fixed it." → "You started the checkout for AESDR. It didn't finish. That happens for one of three reasons, and none of them are dramatic." — passes; declarative Rowan with the warmth of "none of them are dramatic" doing Michael's work without breaking register.

---

## Notes

- The "real reply, real answer" beat in option three is the most important line in the email. Anyone who replies with their actual reason becomes a hot lead and gets the founder (under Admissions alias per canon §12.3) responding personally.
- The L&D / reimbursement PS earns its place because it's a real situation many SDRs and AEs hit. It also creates a downstream deliverable: a 1-page "brief for your L&D approver" PDF that we don't have yet — flagged in Open.
- The 4-hour SMS timing is deliberate: the recipient is still in their day, near a device, possibly still in front of the laptop where they bailed. 4 hours is short enough to catch the warm interrupt without feeling like surveillance.
- **Anti-fake-urgency stance held:** no "expires in 2 hours!" theatrics. The pilot code's expiration is real (canon's enforced honest deadline), and the email states it plainly without manufacturing additional pressure.

## Open

- The "L&D approver brief" PDF doesn't exist yet — flagged. Goes in the queue as a future deliverable, candidate for D-number after the 40 are scoped. Roughly: 1 page, summary of AESDR, ROI argument in plain English, line items L&D budgets typically cover, refund policy, contact for questions.
- Stripe webhook integration — `checkout.session.expired` and `checkout.session.async_payment_failed` triggers need to be wired before this email can fire. Engineering dependency; not blocking the spec.
- Whether the SMS is sent **only** to those who consented to SMS at registration, or also requires a separate consent at checkout. Default per canon §10.5: registration-time consent is sufficient; the consent language already covers post-workshop messaging from AESDR.
- Whether to add a 48-hour follow-up email if the recipient still hasn't completed checkout after the first abandon email. Default: **no** — one window per channel, per canon §9.2 (anti-fake-urgency). The recipient is on the deadline-window email (D18, pending) regardless.
- D18 (deadline-window email) referenced as the next touchpoint for un-converted leads — pending production.
