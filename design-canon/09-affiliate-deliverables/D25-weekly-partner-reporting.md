# D25 — Weekly Partner Reporting Template

**Deliverable:** Standardized weekly report sent from AESDR ops to the partner during a live pilot. One template, one cadence, one register. The report exists so the partner sees the pilot the way AESDR sees it — not a curated highlight reel and not a scary internal dashboard, but the same numbers AESDR uses internally, in the same plain language.
**Audience:** Partner principal (the person signing D22). Sent by AESDR ops; reviewed by founder before send.
**Voice ratio:** 90 Rowan / 10 Michael per canon §3.3 (internal docs row, partner-adjacent variant). Plain operator-to-operator register — no marketing voice in either direction.
**Format:** Markdown source. Renders to PDF for email attachment **or** to a shared Google Doc / Notion page that the partner can re-read at any time. Per canon §6.5 + §8.5.
**Cadence:** Sent end-of-day Friday during the Pilot Window per the D22 §7 contract. Final post-pilot report sent within 7 days of `[PILOT_END_DATE]`.
**Canon refs:** `AFFILIATE_BRAND_CANON.md` §1.6 (honesty discipline), §3.3 (voice ratios), §6.5 (PDF render rules), §8.5 (PDF anatomy), §8.7 (UTM canon — supplies the metric fields), §13 (honesty in numbers).

> **Placeholder convention:** `[PARTNER_NAME]`, `[PARTNER_SLUG]`, `[PILOT_ID]`, `[PILOT_WEEK_NUMBER]`, `[REPORT_DATE]`, `[PROMOTION_START_DATE]`, `[WORKSHOP_DATE]`, `[REPLAY_END_DATE]`, `[ATTRIBUTION_END_DATE]`, `[PILOT_END_DATE]` are filled per send. `[FOUNDER_FIRST_NAME]` signs the qualitative-observations section. `[OPS_FIRST_NAME]` signs as report-of-record sender.

---

## Three reports across a 30-day pilot

The same template renders three different reports across one pilot, in sequence:

| Report | Sent | Audience focus |
|---|---|---|
| **Report 1 — Promotion week** | End-of-day Friday of the promotion window | Pre-workshop traffic, registrations, qualitative signals on partner promotion sends |
| **Report 2 — Workshop week** | End-of-day Friday after the workshop | Live attendance, replay watches, offer-page engagement, early conversion |
| **Report 3 — Final pilot report** | Within 7 days of `[PILOT_END_DATE]` | Final attribution-window numbers, kill-or-keep summary, what we learned |

If a pilot runs longer than 30 days, additional Friday reports use the same template; the Final pilot report is always the last one.

---

## Template

> *(Mono eyebrow, top of PDF render)*
> `AESDR · WEEKLY PARTNER REPORT · [PILOT_ID] · WEEK [PILOT_WEEK_NUMBER]`

> *(Display italic, ~36pt, document title)*
> *Pilot report for [PARTNER_NAME]*

> *(Body context line, --serif 14pt italic)*
> *Pilot window [PROMOTION_START_DATE] → [PILOT_END_DATE] · Reported [REPORT_DATE]*

---

### 1. Headline (one paragraph, 60–90 words)

> *(--serif 16pt italic, --ink, single paragraph.)*
>
> *[Plain-English summary of where the pilot stands this week. No spin. No hyperbole. If the numbers are good, say "the numbers are good and here's why." If the numbers are mixed, say so. If the numbers are bad, say so. The partner is an operator; they read numbers. A misleading headline costs trust faster than a mediocre number does.]*

**Examples (for ops to calibrate the register):**

- *"This week was promotion week. Your two sends generated 142 page views and 38 registrations, with strong replies on the second send. We're comfortably ahead of the pre-pilot estimate of 30 registrations through promotion. The next data we'll see is live attendance on [WORKSHOP_DATE]."*
- *"Workshop week wrapped. Live attendance came in at 47 against an estimate of 60 — below pace, but the chat engagement was unusually high (28 questions, 4 deep operating questions). Conversion early-window is 2 enrollments. We'd expect 1–3 more from the replay over the next 48 hours."*
- *"Final pilot report. Net revenue [$X], commission accrued [$Y]. The pilot's biggest win was [signal]. The biggest miss was [issue]. AESDR's kill-or-keep decision is EXTEND/REVISE/KILL — explained in §6 below."*

---

### 2. Promotion-side metrics (Partner-supplied)

Filled from Partner-shared metrics per D22 §3.5. AESDR reconciles against UTM-attributed traffic in §3.

| Send | Channel | Sent date | List size | Open rate | Click rate | Notable replies |
|---|---|---|---|---|---|---|
| Send 1 (launch) | [newsletter / Slack / podcast / etc.] | [YYYY-MM-DD] | [n] | [n%] | [n%] | [count + 1 sentence on register] |
| Send 2 (reminder) | [channel] | [YYYY-MM-DD] | [n] | [n%] | [n%] | [count + 1 sentence] |
| (Other sends, if any) | | | | | | |

**Note on register:** in the "Notable replies" field, include both volume and the *kind* of reply (operating questions vs reaction emoji vs unsubscribe). Per canon §1.4, the merciless-mirror signal is more in the register than in the volume.

---

### 3. Funnel metrics (AESDR-side)

Pulled from AESDR analytics per canon §8.7 UTM canon. All numbers attributed to `[PARTNER_SLUG]`.

| Stage | This week | Pilot-to-date | Notes |
|---|---|---|---|
| Page views — registration page | [n] | [n] | |
| Registrations | [n] | [n] | |
| Visit-to-register conversion | [n%] | [n%] | Industry baseline 20–35% per report. |
| SMS opt-in rate (where applicable) | [n%] | [n%] | |
| Live attendance | [n] | [n] | Reported in the Workshop-week report onward. |
| Register-to-live conversion | [n%] | [n%] | Target ≥ 35%. |
| Replay watches | [n] | [n] | |
| Replay-watch-to-completion | [n%] | [n%] | |
| Offer-page views | [n] | [n] | |
| Checkout starts | [n] | [n] | |
| Checkout-start-to-purchase | [n%] | [n%] | |
| Purchases | [n] | [n] | |
| Refunds | [n] | [n] | Refund window per AESDR refund policy. |
| Net revenue | [$X] | [$X] | After refunds and processing. |
| Commission accrued (Partner) | [$Y] | [$Y] | 30% of net revenue per D22 §5.1. |

**Per-event UTM trail** is available on request — every line above ties to specific UTM-tagged events. Per canon §1.6, all numbers are pre-reconciliation; final attribution closes at `[ATTRIBUTION_END_DATE]`.

---

### 4. Qualitative observations (founder-supplied, 3–6 bullets)

> *(--serif 16pt, --ink. Bullets. No bullets-of-bullets. Each one ≤ 3 sentences.)*

- **What the audience showed about ICP fit:** [text]
- **What the workshop chat told us:** [text]
- **What the post-workshop email replies told us:** [text]
- **What the offer-page behavior told us:** [text]
- **What the partner-side promotion told us about voice / channel fit:** [text]
- **One thing AESDR is changing for the next pilot regardless of this pilot's outcome:** [text]

These bullets are the partner's view into AESDR's lurk-and-listen workflow per canon §12.2. They are operator-to-operator observations. Per canon §13, they include things that did not work, not just things that did.

---

### 5. What's next this week

> *(--cond 14pt section header, --serif 16pt body)*

- **For Partner:** [one or two specific actions, e.g., "Send the reminder by Wednesday end-of-day" or "Confirm the partner-intro script for the live"].
- **For AESDR:** [one or two specific actions, e.g., "Tech rehearsal Thursday 2pm" or "Final replay-page review Friday morning"].

If there are no actions on either side, write "No actions required this week" — do not invent action items to look thorough.

---

### 6. (Final report only — Report 3) Kill-or-keep summary

In Reports 1 and 2, this section is **omitted**. In the Final report, it is present.

> *(--display italic 28pt header)*
> *AESDR's decision: [EXTEND / REVISE / KILL]*

> *(--serif 16pt body, 3–5 sentences, plain English)*
>
> *[Founder's plain summary of the kill-or-keep memo (D32) — the partner-facing version. The internal D32 stays internal; this is the public-to-partner version drafted as D34. It carries the decision, the rationale in 3 sentences, and the next step.]*

**Pointer:** the partner-facing close-out note (D34, EXTEND or KILL version) is delivered as a separate communication within 48 hours of this report, signed by the founder by name. This Final report carries the summary; D34 carries the conversation.

---

### 7. Footer

```
─────────────────────────────────────────────────────
AESDR · [postal address]
Reported by [OPS_FIRST_NAME] · Reviewed by [FOUNDER_FIRST_NAME]
This is the weekly partner report under the Partner Pilot Agreement
dated [PILOT_START_DATE]. Numbers above are pre-reconciliation until
[ATTRIBUTION_END_DATE].

Questions: hello@aesdr.com
─────────────────────────────────────────────────────
```

Type: `--mono` 10pt for the report-attribution line; `--serif` 13pt, `--muted` for the disclosure paragraph; `--mono` 10pt for the contact email.

---

## Visual treatment notes

**Layout pattern:** PDF anatomy per canon §8.5 — cream background, 24mm margins, `--display` italic headline, `--serif` body. Tables follow the canon §8.5 pattern: `--cond` headers, `--serif` body. Numbers right-aligned in numeric columns; labels left-aligned.

**Palette:**
- Background: `--cream`.
- Body type: `--ink`.
- Section headers (1, 2, 3 etc.): `--cond` 12pt 700, .15em, uppercase, `--ink`.
- Document title: `--display` italic 700, 36pt, `--ink`.
- Inline number callouts (e.g., big-number lifts in the Headline paragraph): `--display` italic 700, 22pt, `--ink` (no `--crimson` — partner reports stay editorial, not editorial-with-alarm-color).
- Headline-paragraph italic: `--serif` italic 16pt, `--ink`.
- Mono eyebrow + footer report-attribution: `--mono` 10–11pt, `--muted`.
- Hairline rules between sections: `--light` 1px.
- Final-report decision marker (`EXTEND / REVISE / KILL`): `--display` italic 700, 28pt, `--crimson`. (This is the only crimson in the document — earned by the section's gravity.)

**Type tokens:** Per palette above.

**Iconography:** None. The report is data-led; no infographic icons, no trend arrows, no emoji. Per canon §6.5, the discipline is "icons must read as custom AESDR" — and a partner report does not need iconography to communicate.

**Iris usage:** None. Internal/partner-side reporting docs do not get the iris fingerprint per canon §6.4.

**Deliberate departures from canon:** None. The Final-report crimson decision marker is the highest-emphasis element in the document — within canon §6.4's rule that crimson is the "primary brand accent," not iris. The use is consistent with §13's gravity discipline.

**Five-question check (canon §6.9.1):**
1. **Thumbnail at 200×200:** Cream + display italic title + mono eyebrow + serif italic headline = identifiably AESDR. Pass.
2. **Token check:** Pass.
3. **Iris reservation:** Pass — zero iris (correct for this register).
4. **Icon discipline:** Pass — type-only.
5. **Voice thumbnail:** *"This week was promotion week. Your two sends generated 142 page views and 38 registrations, with strong replies on the second send. We're comfortably ahead of the pre-pilot estimate of 30 registrations through promotion."* — passes; plain operator-to-operator register, identifiably AESDR by the named-numbers signature move (canon §4.2) and the "comfortably ahead of the pre-pilot estimate" phrasing.

---

## Honesty discipline (canon §13) — what this report refuses to do

Most "weekly partner update" templates in SaaS-affiliate world hide the bad numbers under a green-arrow chart. This template doesn't.

- **No green-arrow / red-arrow icons.** Numbers carry their own weight.
- **No "metrics that look like progress but aren't" inflation.** "Page views" alone is not progress; we report it alongside conversion.
- **No "Partner is doing great!" headlines without numbers attached.** The headline can say "the numbers are good," but it must also say *which* numbers and *why*.
- **No quietly omitting a metric that worsened.** If checkout-start-to-purchase fell from week 1 to week 2, the report names that. Per canon §13.
- **No artificially uniform layout across reports.** A report on a slow week is shorter than a report on a heavy-data week. We do not pad to look thorough.
- **No founder-attribution for ops-written copy or vice versa.** §7 footer makes the chain explicit.

---

## Forward dependencies

This template depends on:
- **D22 partner pilot agreement** — §7 of D22 references this template by name. **In this batch.**
- **Canon §8.7 UTM** — provides the field schema for §3 funnel metrics. **Met.**
- **Stripe webhook + analytics infrastructure** — `begin_checkout` / `purchase` / refund events must fire correctly with partner attribution. **Operationally pending per pilot.**
- **D32 kill-or-keep memo** — the Final-report §6 summary lifts from D32. **Met.**
- **D34 partner-facing close-out note** — Final-report §6 references D34 as the follow-on conversation. **Met.**

This template is a forward dependency for:
- **D33 postmortem** — the three Reports 1/2/3 are inputs to the postmortem's pilot-recap section.
- **D37 (proposed) reporting dashboard spec** — the dashboard surfaces the same metric schema as §3 of this report.

---

## Open

- **Send mechanism.** Default: PDF attached to email + a Google Doc / Notion page link in the email body. Some partners prefer one or the other; default to both unless partner asks for one in advance.
- **Same-template-for-all-archetypes vs per-archetype variants.** Default: same template, all archetypes. The §1 headline is where archetype variation lands without a fork. If post-pilot data shows the §3 schema is wrong for a specific archetype (e.g., podcasts measure differently), fork at v2.
- **Whether to surface industry baselines inline (e.g., "industry attendance rate 35%").** Default: yes for the visit-to-register and register-to-live rows; no for the deeper conversion rows. Industry baselines below the funnel get noisy and partner-context-dependent.
- **Partner ability to comment / annotate.** Default: yes via the Google Doc / Notion render. Disabled in PDF render (PDFs are immutable record). Comments do not change the report; they go into the qualitative log for D33.
- **Translation to partner's language.** Default: English only in v1. Reconsider if a non-Anglophone partner enters the pipeline.
