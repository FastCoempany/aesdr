# D24 — Replay Page

**Deliverable:** The gated replay page registrants land on after the live workshop ends. Single canonical layout, partner-co-brandable. The same page every replay-watcher sees, with a hard 72-hour expiry on the link itself (the page exists; the access token doesn't).
**Audience:** Workshop registrants who clicked the replay link sent in D14 (no-show replay email). Attendance segment splits into two registers: those who didn't attend live (most) and those who attended and want to rewatch (few). The page serves both — it doesn't try to remarket the live event to people who were there.
**Voice ratio:** 60 Rowan / 40 Michael per canon §3.3 (replay email + page row). Michael earns more space here than on most surfaces — trust is decaying, the audience has either missed the live or is in their second pass on the content, and warmth has to do work that urgency cannot.
**Format:** HTML page rendered server-side at `aesdr.com/[PARTNER_SLUG]/replay/[TOKEN]`. Token is a single-use, 72-hour-expiring identifier issued in D14. The page is not crawlable — `noindex, nofollow` per canon §1.1 (workshop-first, not evergreen-content).
**Canon refs:** `AFFILIATE_BRAND_CANON.md` §1.1 (workshop-first), §3.3 (voice ratios), §6.4 (iris reservation), §7.1 (replay window: 48–72h, hard cutoff), §8.2 (page anatomy — replay page), §8.4 (email anatomy — for the email shell that launched here), §13 (honesty discipline — "replay closes; does not silently 404").

> **Placeholder convention:** `[PARTNER_SLUG]`, `[PARTNER_NAME]`, `[TOKEN]`, `[REPLAY_VIDEO_URL]`, `[WORKSHOP_TITLE]`, `[WORKSHOP_DATE]`, `[REPLAY_END_DATE_TIME_TZ]`, `[PILOT_CODE]`, `[PILOT_PRICE_SDR]`, `[PILOT_PRICE_AE]`, `[CODE_EXPIRY_DATE_TIME_TZ]`, `[HOST_FIRST_NAME]`, `[HOST_LAST_NAME]` — filled per pilot. The page is generated; it is not an HTML file partners or AESDR ops hand-edit per send.

---

## The page in one paragraph

A cream page with the AESDR × Partner lockup at top, a single workshop-summary line, a `--light`-bordered video frame with the replay embed, an expiry timestamp in mono, a "what you saw" recap below the player, the canonical offer block, the honest-disqualification card, the FAQ-lite (4 questions from D23), and a footer with disclosure. One iris CTA, repeated above and below the player. No navigation header, no related-content rail, no footer mega-menu. The page is one workshop, one offer, one window — and then it expires.

---

## Anatomy (top to bottom)

### 1. Header band

- **Layout:** Centered, 80px tall, `--cream` background.
- **Content:** AESDR × `[PARTNER_NAME]` co-brand lockup per canon §6.6 (`10a-lockup-horizontal.svg` from D40 kit). 32px height. No nav links; this is not a section of `aesdr.com` — it's a single page.

### 2. Above-the-fold pre-player block

- **Layout:** Centered column, max-width 720px, padded 48px top.
- **Content:**
  - Mono eyebrow (`--mono` 11pt 700, .15em, uppercase, `--muted`):
    > `AESDR · WORKSHOP REPLAY · [PARTNER_SLUG]`
  - Workshop title (`--display` italic 700, 44pt, `--ink`):
    > *[WORKSHOP_TITLE]*
  - One-line summary (`--serif` italic 18pt, `--ink`):
    > *Hosted live by [HOST_FIRST_NAME] [HOST_LAST_NAME] on [WORKSHOP_DATE]. The full session is below for [REPLAY_DURATION_HOURS] more hours.*
  - Expiry timestamp callout (`--mono` 14pt, `--crimson`, on `--cream`):
    > `EXPIRES · [REPLAY_END_DATE_TIME_TZ]`
  - Primary CTA (one iris button, ~360px wide, centered):
    > `Enroll → [PILOT_CODE] · saves you $[DISCOUNT]`
  - Below the CTA, mono 9pt `--muted`:
    > `aesdr.com/[PARTNER_SLUG]/enroll · code [PILOT_CODE] · closes [CODE_EXPIRY_DATE_TIME_TZ]`

The above-the-fold block is the deal. A registrant who already decided during the live can enroll without scrolling. Per canon §1.1 + §13 — workshop earns the sale, the page just attributes it.

### 3. Replay player

- **Layout:** Centered, max-width 960px (16:9 aspect ratio), framed in `--light` 1px border with 8px padding around the video. No autoplay. Controls native to the player.
- **Content:** Embedded video at `[REPLAY_VIDEO_URL]`. Token-gated; if the token has expired or is invalid, the embed is replaced by an expiry block (see §10).
- **Below the player, in `--mono` 11pt `--muted`, single line:**
  > `runtime: ~62 min · captions: en · single-use link · expires [REPLAY_END_DATE_TIME_TZ]`

### 4. "What you saw" recap

- **Layout:** Centered column, max-width 720px, padded 48px top, on `--cream`. White-panel-on-cream pattern with `--light` 1px border, 32px internal padding.
- **Header:** `--cond` 12pt 700, .15em, uppercase, `--muted`:
  > `WHAT YOU JUST SAW`
- **Three bullets, `--serif` 17pt, `--ink`:**

> *— **Activity vs Judgment.** The two-axis frame for reading your own work. The reps who don't survive ramp are usually in the top-left — high activity, low judgment. AESDR Lessons 1–4 are the X-axis curriculum.*
>
> *— **Pipeline Integrity.** The discipline of making the pipeline in CRM match the pipeline that closes. Lesson 4 is the operating manual; Lesson 8 is the forecast-honesty conversation.*
>
> *— **The 12-Lesson Operating Manual.** Foundations (Lessons 1–4), Range (5–8), Identity (9–12). Twelve lessons, five tools, lifetime access. Worksheet per lesson. Discord per cohort.*

The recap is the bridge from "I watched it" to "I know what it's actually for." Per canon §3.3, this block runs slightly more Rowan (verdict-shaped) than the surrounding page.

### 5. Repeated CTA

- **Same iris button as §2**, repeated centered. The button text and the URL line are identical to the above-the-fold version. No "different angle" copy variant — repetition reads as confidence; variation reads as desperation.

### 6. Honest disqualification card (canon §13)

- **Layout:** White panel on `--cream`, `--light` 1px border. Centered, max-width 640px. 32px internal padding. Sits below the repeated CTA.
- **Header:** `--cond` 12pt 700, .15em, uppercase, `--muted`:
  > `WHO SHOULDN'T ENROLL`
- **Body, `--serif` italic 16pt, `--ink`:**

> *— If you're 8+ years in sales and aren't open to a re-look at fundamentals, the first five lessons will bore you.*
> *— If you've enrolled in three programs in the last year and finished none of them, the issue isn't free vs paid; it's whether you'll do the work this time.*
> *— If you want motivation, this isn't that. We're not the room.*
> *— If you're not in a sales role yet, this isn't the course. We assume you have the seat.*
>
> *None of these are insults. They're filters. The 14-day refund makes the cost of trying low.*

Lifted from D23 Q07 verbatim. Pattern-stability discipline.

### 7. FAQ-lite

- **Layout:** Centered column, max-width 720px. White panel on cream, `--light` 1px border.
- **Header:** `--display` italic 700, 28pt, `--ink`:
  > *Four questions, plain answers.*
- **Four Q&A blocks**, lifted from D23 Q01, Q02, Q04, Q07-summary. Each Q is `--display` italic 22pt; each A is `--serif` 16pt.
  - Q01 — refund (verbatim from D23)
  - Q02 — time commitment (verbatim from D23)
  - Q04 — what happens with the replay (verbatim from D23)
  - Q07-summary — who shouldn't enroll (one-paragraph compression of the §6 card above; reads as the "TL;DR" version)

### 8. Final CTA + Michael layer

- **Layout:** Centered, padded 64px top, `--cream`.
- **Content:**
  - The iris button, third instance — *but final*. Same text as §2, §5. After this CTA, no more enrollment links on the page.
  - Below the button, in `--hand` 22pt, `--crimson`, rotation `-1deg` (Michael register, single instance):
    > *PS — When the link expires, it expires. There's no "I missed it, can you reopen?" form. Most people who say they'll decide tomorrow don't. We part as adults if that's where this lands.*

### 9. Footer

- **Layout:** Full-width, `--cream` background, `--light` 1px top rule. Padded 48px top, 64px bottom.
- **Content (per canon §8.4 footer pattern + §10.1 FTC + §10.4 CAN-SPAM):**

```
─────────────────────────────────────────────────────
AESDR · [postal address]
This page hosts the workshop replay for [WORKSHOP_TITLE] on [WORKSHOP_DATE].
Workshop hosted by AESDR in partnership with [PARTNER_NAME]. [PARTNER_NAME]
receives a commission on enrollments through this page. The replay link
expires at [REPLAY_END_DATE_TIME_TZ] and is single-use.

Privacy · Refunds · Terms
© AESDR 2026
─────────────────────────────────────────────────────
```

Type: `--mono` 10pt for nav links and timestamp; `--serif` 13pt, `--muted` for the disclosure paragraph.

### 10. Expired-token render

If a registrant arrives at the page with an expired or invalid `[TOKEN]`, the page renders this block in place of the player and the recap, **not a 404**. Per canon §13: *"the replay page expires; it does not silently 404."*

- **Layout:** Centered column, max-width 720px, padded 96px top, `--cream`.
- **Header (`--display` italic 700, 36pt, `--ink`):**
  > *The replay window has closed.*
- **Body (`--serif` 18pt, `--ink`):**
  > *The replay was open for 72 hours after the live workshop on [WORKSHOP_DATE]. It closed at [REPLAY_END_DATE_TIME_TZ]. We don't run "evergreen" replays — we'd rather host the next live than re-host last week's recording.*
  >
  > *AESDR's program is still available at list pricing. The pilot code [PILOT_CODE] expired on [CODE_EXPIRY_DATE_TIME_TZ], but the program runs continuously. If the workshop made the case, the program is one click away.*
- **Single iris CTA:**
  > `Enroll at list pricing →`
- **Below CTA, `--mono` 9pt, `--muted`:**
  > `aesdr.com/enroll`

The expired render is its own thing — not a graveyard, not a "we missed you, here's a code." Honest absence per canon §13.

---

## Visual treatment notes

**Layout pattern:** Canon §8.2 page anatomy — cream background, ink type, replay frame in `--light` border, single iris CTA above and below the player, "what you saw" recap, "who should not buy" honesty card. Extends the registration-page editorial register from D07 / `variants/variant-a-editorial-split.html`, but more vertical and less editorial-split — the replay player is the page's visual anchor, not an editorial split hero.

**Palette:**
- Background: `--cream` throughout. No dark surfaces, no full-bleed crimson zones.
- Type: `--ink` body, `--muted` for footer + mono labels + secondary lines.
- Workshop title (§2): `--display` italic 700, 44pt, `--ink`.
- Expiry timestamp (§2 + §3): `--mono` 14pt and 11pt respectively, `--crimson`. The crimson on the timestamp earns its place as the only color on the page besides ink and muted — the gravity of the deadline carries it.
- Iris button (3 instances): per canon §6.4 — single primary-CTA permission, repeated. The thrice-repeat is canon-compliant because each instance is the same single CTA, not three different CTAs.
- Caveat layer (§8): `--hand` 22pt, `--crimson`, rotation `-1deg`. Single instance.
- Hairline rules: `--light` 1px between sections.

**Type tokens:**
- Wordmark in lockup: `--display` italic 900, 28pt.
- Workshop title: `--display` italic 700, 44pt.
- Section headers (canon §6.3 white-panel-on-cream pattern headers): `--cond` 12pt 700, .15em, uppercase, `--muted`.
- Body: `--serif` 16–18pt depending on section (FAQ-lite at 16, replay summary at 18).
- Bold anchors within FAQ answers: `--display` italic 700, 18pt, `--ink`.
- CTA button: `--cond` 14pt 700, .15em, uppercase, white type on iris.
- Mono labels (URLs, timestamps, runtime, eyebrow): `--mono` 9–14pt, varying `--muted` and `--crimson`.
- Caveat layer: `--hand` 22pt, `--crimson`.

**Iconography:** None new. Per canon §6.5 + §6.8, no icons in the body. The lockup carries the only graphical mark; the video frame is type and `--light` border. No "play" icon overlay (the embedded player handles its own play state).

**Iris usage:** Three CTA instances of the *same* button, plus zero ambient iris on the page. Per canon §6.4, iris is reserved for the primary CTA — and a single primary CTA repeated for scroll convenience is one CTA, not three. Acceptable.

**Deliberate departures from canon:** None. The thrice-repeated CTA is within §6.4's primary-CTA reservation; the three positions (above player, below recap, below disqualification card) reflect the page's reading rhythm, not three separate offers.

**Five-question check (canon §6.9.1):**
1. **Thumbnail at 200×200:** Cream + lockup + display italic title + crimson mono timestamp + `--light`-bordered video frame + iris CTA = identifiably AESDR. Pass.
2. **Token check:** Pass — all colors and fonts via tokens.
3. **Iris reservation:** Pass — single CTA repeated, no ambient.
4. **Icon discipline:** Pass — type-only, no imported icons.
5. **Voice thumbnail:** *"Hosted live by [HOST_FIRST_NAME] [HOST_LAST_NAME] on [WORKSHOP_DATE]. The full session is below for [REPLAY_DURATION_HOURS] more hours."* — passes; plain operator-to-operator register, identifiably AESDR. The expired-render headline *"The replay window has closed."* is also identifiably AESDR — verdict-shaped Rowan, no apology, no remarketing.

---

## Compliance check (canon §10)

- **FTC material-connection disclosure (§10.1):** Footer carries the canonical disclosure paragraph naming the partner and the commission relationship. **Pass.**
- **CAN-SPAM (§10.4):** N/A on the page itself — the page is reached by clicking a link in D14 (which carries the email-side CAN-SPAM compliance). **Pass by inheritance.**
- **TCPA / SMS (§10.5):** N/A — replay page does not solicit phone numbers.
- **Approved claims (§10.2):** No outcome promises, no income claims. **Pass.**

---

## Forward dependencies

This page depends on:
- **D14 no-show replay email** — sends the link to this page. **Met.**
- **D23 partner-facing FAQ** — Q01, Q02, Q04, Q07 lift verbatim into §7. **Met.**
- **D31 curriculum map** — §4 "what you saw" recap lifts the cluster taxonomy. **Met.**
- **D28 pricing & promo sheet** — §2 + §10 reference `[PILOT_CODE]` and pricing. **Met.**
- **Replay video file** + **token-gating infrastructure** — operationally pending per pilot.
- **Co-brand lockup assets** (D40 §1 file `10a–10c`) — operationally pending per partner.

This page is a forward dependency for:
- **D33 postmortem** — replay-watch metrics + replay-page → offer-page conversion are inputs.

---

## Open

- **Replay player choice.** Default: Vimeo private with token-gated embed. Alternative: native HLS stream from AESDR's own infra. Vimeo is faster to ship; native infra is cleaner long-term. Recommend Vimeo for v1.
- **Whether to offer a transcript download on the page.** Default: **no** for v1 — transcripts encourage skim-vs-watch, which contradicts the workshop-first doctrine (canon §1.1). Reconsider if accessibility-feedback warrants it. Captions on the player itself are non-negotiable.
- **Whether to embed a "next steps" calendar block** (e.g., "Got 15 min? Talk to Admissions"). Default: **no** for v1 — the page is one offer, one CTA, by design. The Admissions path is in D17, not on this page.
- **Two-pass viewer experience** (registrants who attended live and clicked back to rewatch). Default: same page. The §2 summary line ("for [REPLAY_DURATION_HOURS] more hours") and the §6 honest disqualification block both serve the second-pass viewer; no separate render needed.
- **Whether to track partial replay watches as a D17 V4 trigger.** Default: **yes** — `replay_watch_progress >= 75%` plus an offer-page click within 24h fires T4 per D17. Page-side instrumentation must emit this event.
