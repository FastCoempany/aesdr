# D11 — 24-Hour Reminder Email

**Deliverable:** Single transactional email sent 24 hours before the live workshop. Reasserts the time, the join link, and one specific reason to actually show up.
**Audience:** Registered attendees who have not yet attended (i.e., everyone, 24h pre-live).
**Voice ratio:** 70 Rowan / 30 Michael per canon §3.3 — calm Rowan body, Michael in the PS.
**Send timing:** Exactly 24 hours before workshop start time.
**Sender:** `AESDR Workshop`.
**Format:** Markdown source. Renders to HTML for ESP. Branded shell per canon §8.4.
**Canon refs:** `AFFILIATE_BRAND_CANON.md` §3.3, §7.4, §7.5, §8.4, §10.4.

---

## Subject line

> *Tomorrow. [Time] [TZ]. The workshop you registered for.*

**Discipline check:**
- Three short clauses; no curiosity gap.
- "Tomorrow" lands as a verdict; "the workshop you registered for" closes the contract — the reader doesn't have to remember what AESDR is.
- 8 words.

### Pre-header

> *Join link below. One framework, one self-assessment, one offer at the close. 60 minutes.*

---

## Body copy

### Header

`AESDR` wordmark, `--display` italic 900wt, `--ink`, on `--cream`. Co-mark when co-branded.

### Salutation

> *[First name] —*

### Body

> *Tomorrow. [Day, Date · Time · TZ]. The [workshop title] workshop you registered for.*
>
> *60 minutes live, 10–15 minutes Q&A, one offer at the close. The reason to actually show up live instead of catching the replay: the Q&A. The questions reps in your situation tend to ask out loud are the same questions you've been Googling alone, and they tend to show up in chat the moment one person says them first. Replay is fine; live is sharper.*
>
> *One thing we'll cover that most early-career reps don't have a frame for: the difference between activity and judgment. Your manager grades you on activity because activity is countable. Your career compounds on judgment because judgment is what makes the activity earn anything. The workshop is built around that gap.*
>
> *That's it. Join link below. See you tomorrow.*

### Primary CTA

> **Iris button:** `Join the workshop →`
>
> Below the button, mono 9pt, muted:
> `[direct join URL] · live at [Time TZ]`

### PS — Michael's line

> *PS — If tomorrow turns into the kind of tomorrow where you forget you signed up for a thing, the calendar invite (still attached to the original confirmation) will fire 15 minutes early. If even that fails, the replay will be in your inbox 30 minutes after we wrap. We've planned around your week.*

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

**Layout pattern:** Branded email shell per canon §8.4 — single column, max 600px, `--cream`.

**Palette:**
- Background: `--cream`.
- Body: `--ink`, `--muted` secondary.
- Wordmark: `--ink`.
- The bolded "Tomorrow. [Day…]" first line: `--cond` 22pt 700wt for emphasis (treated as a structural anchor, not as decoration).
- PS line: `--crimson` in `--hand`.
- Iris button: per canon §6.4.

**Type tokens:**
- Wordmark: `--display` italic 900, ~28pt.
- First-line anchor: `--cond` 22pt 700wt, `.03em` tracking, `--ink`.
- Body paragraphs: `--serif` 16pt, line-height 1.6.
- CTA button: `--cond` 14pt 700wt, `.15em`, uppercase, iris.
- Mono URL/time below button: `--mono` 9pt, `--muted`.
- PS Caveat line: `--hand` 22pt, `--crimson`, rotation `-1deg`.
- Footer: `--serif` 13pt + `--mono` 10pt for nav.

**Iconography:** None. Type carries the load.

**Iris usage:** One — the `Join the workshop →` button.

**Deliberate departures from canon:** None.

**Five-question check (canon §6.9.1):**
1. **Thumbnail at 200×200:** Cream + wordmark + iris CTA + Caveat PS = AESDR.
2. **Token check:** Pass.
3. **Iris reservation:** Pass.
4. **Icon discipline:** Pass — no icons.
5. **Voice thumbnail:** "Tomorrow. [Time] [TZ]. The workshop you registered for." — passes. Verdict-shaped Rowan opener.

---

## Notes

- The "activity vs judgment" preview is a real piece of the workshop content — not a hook for the email. Per canon §13 (honesty discipline), the email's promise is the workshop's actual delivery. Cutting this line because it's "too specific" is the wrong instinct; specificity is the work.
- The PS deliberately undercuts any anxiety about forgetting. We've planned around the reader's week, and saying so out loud makes the workshop feel less like an obligation and more like infrastructure.
- "We've planned around your week" is a candidate canonical phrase. If it survives one pilot, lift into D12 (SMS) and D14 (no-show replay) revisions.

## Open

- Whether the body should preview a *different* framework per pilot (cycling through the curriculum), or stick with "activity vs judgment" as the canonical preview. Default until tested: cycle, but document which preview ran in each pilot's postmortem.
- Whether the email includes a "what to bring" line (notepad, full hour, no parallel meetings). Default: no — feels overly didactic; let the reader own their setup.
- Whether to add a single in-body preview thumbnail of the deck title slide. Default: no — type and the wordmark already carry the brand; a thumbnail risks looking marketing-y.
