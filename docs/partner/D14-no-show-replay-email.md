# D14 — No-Show Replay Email

**Deliverable:** Single transactional email sent to registrants who did not attend the live workshop. Delivers the gated replay with a hard 48–72h expiry. One email — no chase sequence.
**Audience:** Workshop registrants whose attendance status is `registered = true, attended_live = false` at workshop end.
**Voice ratio:** 60 Rowan / 40 Michael per canon §3.3 — Michael earns more space here because trust is decaying and the email needs warmth without grovel.
**Send timing:** Within 30 minutes of the live workshop ending. Replay link expires at `live_end + 72h` (canon §7.1).
**Sender:** `AESDR Workshop` (per canon §7.5 — not a personal name on transactional email).
**Format:** Markdown source. Renders to HTML (MJML or equivalent) for ESP. Branded shell per canon §8.4.
**Canon refs:** `AFFILIATE_BRAND_CANON.md` §3.3, §7.1, §7.5, §8.4, §10.4.

---

## Subject line

> *You didn't make it. The replay is open for 72 hours.*

**Discipline check (canon §4.4):**
- 9 words — close to the 4–8 ceiling, justifiable because the second clause is the contract.
- Not clickbait. The body opens on this exact statement.
- Lowercase / sentence case. No emoji. No "Re:" trick.
- "You didn't make it" — Rowan opening, plain verdict, no shame.

### Pre-header (preview text)

> *48–72 hours, then it closes. Same workshop, same offer.*

---

## Body copy

### Header block

`AESDR` wordmark, `--display` italic 900, `--ink`, on `--cream`. Aligned left.

When co-branded: `AESDR × [partner]` lockup top-center per canon §6.6.

### Salutation

> *[First name] —*

Or if no first name on file:
> *Hi —*

### Body

> *You registered. You didn't make it. No judgment — most weeks I miss things I meant to attend too, and the people I respect treat that as data, not a moral failing.*
>
> *The replay is open for the next 72 hours. Same workshop, same offer at the close, same 14-day refund on the program if you decide it's a fit. After that, the replay closes — we don't run this as evergreen content, and we don't sell the recording.*
>
> *One reason to actually watch it instead of letting the link expire: the workshop is built around the operating standard nobody handed you on day one. If you're in your first one to two years in startup SaaS, the gap it names is the one most early-career reps spend a year trying to identify on their own. Sixty minutes versus a year is a reasonable trade.*

### Primary CTA

> **Iris button:** `Watch the replay →`
>
> Below the button, mono 9pt, muted:
> `aesdr.com/[partner-slug]/replay/[token] · expires [YYYY-MM-DD HH:MM ET]`

### PS — Michael's line

> *PS — If you're going to skip it again, that's fine. We part as adults. But the link won't be here next week, and there's no "did you mean to register?" follow-up coming. One email, one window, your call.*

— `AESDR Workshop`

### Footer (per canon §8.4 + §10.4)

```
─────────────────────────────────────────────────────
AESDR · [postal address]
This message is from AESDR. You're receiving it because you registered
for the [workshop title] workshop on [date].
Workshop hosted by AESDR in partnership with [partner]. [Partner] receives
a commission on enrollments through the replay page.

Unsubscribe · Privacy · Refunds
© AESDR 2026
─────────────────────────────────────────────────────
```

Type: `--mono` 10pt for nav links and timestamp; `--serif` 13pt, `--muted` for the disclosure paragraph.

---

## Visual treatment notes

**Layout pattern:** Branded email shell per canon §8.4 — single column, max 600px, `--cream` background.

**Palette:**
- Background: `--cream`.
- Type: `--ink` for body, `--muted` for the footer disclosure and timestamp line.
- Header wordmark: `--ink`.
- PS line (Caveat layer): `--crimson` on `--cream`.
- Iris button: per canon §6.4 — single iris CTA, the only iris instance in the email.
- Borders: `--light` for footer rule, no other borders.

**Type tokens:**
- Wordmark: `--display` italic 900wt, ~28pt.
- Salutation + body: `--serif` 16pt, line-height 1.6.
- CTA button: `--cond` 14pt 700wt, .15em letter-spacing, uppercase, white type on iris background.
- Mono URL/expiry below button: `--mono` 9pt, `--muted`.
- PS Caveat line: `--hand` 22pt, `--crimson`, slight rotation `-1deg`.
- Footer disclosure: `--serif` 13pt, `--muted`.
- Footer nav links: `--mono` 10pt, `--muted`, uppercase, `.1em` letter-spacing.

**Iconography:** None new. The footer rule line at the top of the footer block is a 1px `--light` rule (existing pattern). No icons in the body — the wordmark and the iris button carry the visual load.

**Iris usage:** One — the `Watch the replay →` button. Per canon §6.4.

**Deliberate departures from canon:** None.

**Five-question check (canon §6.9.1):**
1. **Thumbnail at 200×200:** Cream background + display italic wordmark + iris button + Caveat PS reads as AESDR.
2. **Token check:** Pass. All colors and fonts via tokens.
3. **Iris reservation:** Pass — one CTA only.
4. **Icon discipline:** Pass — no icons used. Wordmark is type, not an icon.
5. **Voice thumbnail:** "You didn't make it. The replay is open for 72 hours." → "You registered. You didn't make it. No judgment — most weeks I miss things I meant to attend too…" — passes. Identifiably AESDR. The "no judgment" + "moral failing" beat is the Michael register; the verdict-shaped subject and the "sixty minutes versus a year" line are Rowan.

---

## Notes on the voice mix

This email is the highest-Michael surface in the kit so far (40% by canon §3.3). That's deliberate — a no-show is a small failure, and AESDR's brand earns trust by treating failures as data, not as moral content. The "no judgment" line and the PS are doing the bulk of that work.

The PS specifically uses `we part as adults` — fourth canonical use. Per the audit conversation, that's the intended last instance for at least the next three deliverables. The next email-shell deliverables (D10 confirmation, D11 24h reminder, D13 same-day attended-no-purchase) will use other canon phrases.

---

## Open

- Replay-page URL pattern — `aesdr.com/[partner-slug]/replay/[token]` is a placeholder. Final pattern may differ depending on whether replay tokens are partner-namespaced or globally unique. Default until decided: partner-namespaced for clean attribution.
- Whether to send the same email at H+0 (right after live ends) and at H+24 with shifted copy ("12 hours left"). Default: **no** — one email, one window, per the canon's anti-fake-urgency stance (§9.2). Forces attendees to choose, doesn't manufacture pressure.
- Whether the PS line should be cut for the partner-co-branded pilot version (some partners may find it too pointed). Default: keep. If a partner objects, that's a fit signal, not a reason to soften.
- Time zone of the expiry timestamp — recommend ET as default; localize per registrant if/when the registration form captures TZ. Currently the form captures only email + role (canon §7.4), so ET it is.
