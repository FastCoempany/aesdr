# D10 — Workshop Confirmation Email (T+0)

**Deliverable:** Single transactional email sent within 60 seconds of a successful workshop registration. Confirms the registration, attaches the calendar invite, sets expectations for the live session and replay window.
**Audience:** Just-registered workshop attendee. Excitement at peak; expectations being formed.
**Voice ratio:** 70 Rowan / 30 Michael per canon §3.3 — calm Rowan body, Michael in the PS line.
**Send timing:** Within 60s of registration completion (canon §7.4).
**Sender:** `AESDR Workshop` (per canon §7.5 — not a personal name on transactional email).
**Format:** Markdown source. Renders to HTML for ESP. Branded shell per canon §8.4. Includes ICS calendar attachment per canon §7.7.
**Canon refs:** `AFFILIATE_BRAND_CANON.md` §3.3, §7.4, §7.5, §7.7, §8.4, §10.4.

---

## Subject line

> *You're in. [Date and time of workshop, in attendee's TZ if known, else ET].*

**Discipline check (canon §4.4):**
- Short, clear, contract with the body.
- "You're in" is the most plain-spoken confirmation possible — no exclamation, no hype.
- The date in the subject means the attendee never has to open the email twice to remember when to show up.

### Pre-header

> *Calendar invite attached. Replay link comes after. One offer at the close, then Q&A.*

---

## Body copy

### Header

`AESDR` wordmark, `--display` italic 900wt, `--ink`, on `--cream`.

When co-branded: `AESDR × [partner]` lockup top-center per canon §6.6.

### Salutation

> *[First name] —*

(Or *Hi —* if no first name on file.)

### Body

> *You're registered for the [workshop title] workshop.*
>
> ***[Day, Date · Time · TZ].* 60 minutes live. 10–15 minutes Q&A. One offer at the close.**
>
> *The calendar invite is attached — add it now while you're here. The join link is in the invite and in the reminder email you'll get 24 hours out.*
>
> *Two things to know before then.*
>
> *One: the workshop is built for first-1-to-2-year SDRs and AEs in startup SaaS. If that's not where you actually are, the live session might still be useful, but the offer at the close probably isn't. Worth the heads-up before you block the hour.*
>
> *Two: if you can't make it live, the replay opens for 48–72 hours after the session ends. Same content, same offer window. After 72 hours, the replay closes — we don't run this as evergreen content.*
>
> *That's it. See you on [day of week].*

### Primary CTA

> **Iris button:** `Add to calendar →`
>
> Below the button, mono 9pt, muted:
> `Or use the .ics attached. Direct join link arrives 24 hours before live.`

### PS — Michael's line

> *PS — If you registered, then forgot, then re-read this email three weeks from now wondering what AESDR is, it's the 12-lesson sales survival course you signed up to see one workshop from. You're not behind. We do this every couple of weeks.*

— `AESDR Workshop`

### Footer (per canon §8.4 + §10.4)

```
─────────────────────────────────────────────────────
AESDR · [postal address]
This message is from AESDR. You're receiving it because you registered
for the [workshop title] workshop on [date].
Workshop hosted by AESDR in partnership with [partner]. [Partner] receives
a commission on enrollments through this workshop.

Unsubscribe · Privacy · Refunds
© AESDR 2026
─────────────────────────────────────────────────────
```

---

## Visual treatment notes

**Layout pattern:** Branded email shell per canon §8.4 — single column, max 600px, `--cream` background.

**Palette:**
- Background: `--cream`.
- Type: `--ink` body, `--muted` for the footer disclosure and the timestamp line under the button.
- Wordmark: `--ink`.
- PS line (Michael register): `--crimson` on `--cream`, hand register.
- Iris button: per canon §6.4 — single iris CTA only.
- Borders: `--light` for footer rule.

**Type tokens:**
- Wordmark: `--display` italic 900wt, ~28pt.
- Salutation + body: `--serif` 16pt, line-height 1.6.
- Bold day/date/time line: `--cond` 18pt 700wt, `.03em` tracking, `--ink`.
- CTA button: `--cond` 14pt 700wt, .15em, uppercase, white type on iris background.
- Mono URL/note below button: `--mono` 9pt, `--muted`.
- PS Caveat line: `--hand` 22pt, `--crimson`, slight rotation `-1deg`.
- Footer: `--serif` 13pt for disclosure; `--mono` 10pt for nav links.

**Iconography:** None new. The bold date-time line stands in for what a typical email would use a calendar icon for — type carries the meaning per canon §6.8.6 step 1.

**Iris usage:** One — the `Add to calendar →` button.

**Deliberate departures from canon:** None.

**Five-question check (canon §6.9.1):**
1. **Thumbnail at 200×200:** Cream + display italic wordmark + iris button + Caveat PS = identifiably AESDR.
2. **Token check:** Pass.
3. **Iris reservation:** Pass — one CTA only.
4. **Icon discipline:** Pass — no icons; type carries the load.
5. **Voice thumbnail:** "You're in. [Date]." → "You're registered for the [workshop title] workshop." — passes; declarative, plain, identifiably Rowan.

---

## Calendar invite cover (per canon §7.7)

The ICS attachment includes a `LINK` field to a calendar invite cover image at `aesdr.com/calendar-cover/[partner-slug]/[workshop-slug].png`.

**Cover spec (1280×720):**
- Background `--cream`.
- AESDR wordmark `--display` italic 900wt, top-left, ~64pt.
- Partner co-mark top-right (when co-branded).
- Workshop title in `--display` italic 900wt, centered, ~120pt.
- Date/time mono band at bottom: `--mono` 18pt, `.25em`, uppercase.
- Ambient iris line at bottom edge, 1px, opacity .15.
- Ghost numeral `01` in bottom-right at opacity .05.
- No iconography; type carries the visual.

---

## Notes

- The "you're in" subject is intentionally plain. It's the contract: registration confirmed, no further action required to be confirmed.
- The body's "two things to know" structure does honest work — it tells attendees who they are (the ICP filter from D7's who-is-this-for) and sets the replay-window expectation early so the no-show email (D14) doesn't surprise them.
- The PS is the highest-trust placement of Michael's voice in the whole confirmation surface — it's the line that proves we don't take ourselves too seriously even when we're being precise about everything else.

## Open

- Localized time-zone in the subject — depends on whether the registration form captures TZ. Currently it captures email + role only (canon §7.4). Until we capture TZ, default subject TZ is ET; body uses the TZ string explicitly in case the email is read after a flight.
- Whether this email also includes a 1-line preview of the workshop content (e.g., "we'll cover X, Y, Z"). Default until tested: no — the registration page already covered the outcomes; the confirmation should focus on logistics.
- Calendar tooling — pending §17 open question on Cal.com / SavvyCal / native ICS.
