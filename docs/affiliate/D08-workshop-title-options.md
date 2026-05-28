# D8 — Workshop Title Options (12 Ranked)

**Deliverable:** Twelve pain-led workshop titles, ranked, for the live affiliate workshop. The chosen title threads through the registration page (D7), offer slide (D6), reminders, replay copy, and affiliate-promo copy.
**Audience:** SDRs and AEs in their first two years in startup SaaS. Also written for experienced operators who want the realities of the role named, not retaught.
**Voice ratio:** 75 Rowan / 25 Michael. Pain-led, verdict-shaped, 4–8 words where possible.
**Format:** Markdown source. Title gets locked to canon at v1.x once founder picks.
**Canon refs:** `AFFILIATE_BRAND_CANON.md` §3, §4 (banned vocabulary), §13 (honesty), `affiliate-seeding-deep-research-report.md` §Workshop-first pilot (registration-page pass criterion: pain-led title).

---

## Discipline

Every title must:

- Name a specific pain or specific moment, not a generic outcome.
- Hold both voices on the page (title in Rowan's register; subtitle / supporting line allowed in Michael's).
- Read clearly at 24pt and 64pt.
- Pass the thumbnail test from canon §6.9.1 — would a reasonable AE or SDR know in two seconds whether this is for them?
- Avoid every banned phrase in canon §4.1.

A title is also a contract: the workshop must deliver on the title's promise inside the first 10 minutes or the title is wrong.

---

## A. Top tier (ratified 2026-05-28: #1)

> **Final pick:** *What good actually looks like in startup SaaS.*
> **Subtitle (Michael flicker):** *Sixty minutes on the part of the job your onboarding skipped — for SDRs and AEs in their first two years, and the experienced ones running it back with more context.*
>
> Threaded into D07 (registration page), D09 (deck slide 01), `AFFILIATE_BRAND_CANON.md` §17 (outstanding Q5 resolved), and `00-INDEX.md` forward-deps. Per-pilot templates (D10, D13, D14, D15, D18, D24, D26) inherit via the `[WORKSHOP_TITLE]` slot — no template edits required.

### 1. *What good actually looks like in startup SaaS.* ← **FINAL PICK**
**Why it's #1:** Names the exact pain the report's ICP described in interviews ("I'm working hard, but nobody has explained what good actually looks like here"). Verdict-shaped. Reads at every size. The "actually" earns its place by signaling that other answers are dishonest.
**Subtitle (Michael flicker):** *Sixty minutes on the part of the job your onboarding skipped — for SDRs and AEs in their first two years, and the experienced ones running it back with more context.*

### 2. *The Operating Manual for Your First Year.*
**Why it's #2:** Reuses the canonical brand frame ("operating manual, not motivation engine") as the workshop title itself. Strongest brand integration. Slight risk it reads as too internal-jargon to a cold audience — depends on affiliate's audience.
**Subtitle:** *60 minutes. The five pressures every early-career AE or SDR gets, none of which are explained on day one.*

### 3. *Before Your Manager Has The Conversation.*
**Why it's #3:** Names a specific dreaded moment without naming it. High emotional resonance for first-year AEs and SDRs; works in cold registration. Verdict-shaped. Slightly darker than #1–2.
**Subtitle:** *A live workshop on what to do in the first 90 days, before "we need to talk about your numbers" is on the calendar.*

---

## B. Middle tier (strong but more specific — use if a affiliate's ICP fits)

### 4. *The Pre-Promotion Playbook Nobody Hands Out.*
Best fit for affiliates whose audience leans toward "SDR aiming for AE track."

### 5. *Pre-Quota: The Session They Should've Run Day One.*
Best fit for very-early-career audiences (months 0–6 in role). The "they" earns honesty points.

### 6. *Three Bad Months: How First-Year AEs and SDRs Get Out.*
Best fit for affiliates whose audience is already in distress. Strong pain anchor; harder to put on a registration page that needs to feel optimistic enough to register.

### 7. *Why Your Pipeline Is Lying To You.*
Best fit for AE-leaning affiliate audiences. Direct verdict, very Rowan. Possibly too aggressive for some affiliate contexts.

### 8. *The Math Behind Your Commission: An Audit.*
Best fit for analytics-leaning audiences (newsletters, podcasts where the host is numbers-forward). "Audit" carries the dossier register cleanly.

---

## C. Specific-moment tier (Michael-flavored, narrower fit)

### 9. *The Sunday Night Audit.*
Names a specific recurring scene most AEs and SDRs will recognize ("Sunday pipeline review = staring at a spreadsheet, hoping something moves" — canon, from `variants/variant-a-editorial-split.html`). Best as a session within a series, less ideal as a standalone first-pilot title.

### 10. *What Onboarding Should Have Been.*
Past-tense regret as pain frame. Strong line; risk that some attendees will read it as "I'm being told I was failed" and disengage. Use only where the affiliate's audience has explicitly named onboarding as a gripe.

### 11. *Your First Commission Cycle, Read Back to You.*
Specific, audit-coded, intimate. Possibly too esoteric for cold registration; better as a deck section.

### 12. *First-Year Survival, in 60 Minutes.*
Efficiency-led, plainest of the set. Useful as a backup if the affiliate objects to anything more pointed. Not the strongest brand fit; doesn't earn its space.

---

## Ranking rationale

| Tier | Use when |
|---|---|
| A (1–3) | Default. Strong fit for any affiliate whose audience matches the report's ICP. |
| B (4–8) | Use when affiliate audience leans toward a specific role-tenure or industry segment. |
| C (9–12) | Use as session-within-a-series titles, deck slide titles, or fallback options. |

---

## Banned alternatives we considered and rejected

We are documenting these so the canon is self-enforcing.

- ❌ Listicle pattern of the form *"5 Mistakes [F.1-verb]-ing Your Pipeline"* — LinkedIn cadence, banned by canon §4. The banned verb here is the F.1 verb family (see canon for the substitution table).
- ❌ Guru-vocabulary pattern of the form *"How to [guru-verb] Your Quota in Your First Year"* — banned vocabulary, base canon guru framing.
- ❌ *"Unlock Your Sales Potential"* — banned vocabulary, performance promise.
- ❌ *"The Sales [role-word]'s Mindset"* (where the role-word is the founder-banned shorthand) — banned vocabulary, mocked in canon.
- ❌ *"Your Path to AE: The Ultimate Workshop"* — superlative claim (banned, canon §10.3 B4).
- ❌ *"Why Top SDRs Always Hit Quota"* — implied performance claim.
- ❌ *"The 7 Habits of High-Performing SDRs"* — listicle + cliché.
- ❌ *"Career Acceleration for SDRs"* — vague, no pain anchor.
- ❌ *"Sales Excellence in Year One"* — empty positioning, reads like a corporate training brochure.

---

## Visual treatment notes

**Layout pattern:** Headline in editorial split (cream side) per canon §6.3 — `.hero-h1` style.
**Palette:** Background `--cream` (or `--ink` text on `--cream` for very large display); accent characters allowed in `--iris` per the inline `.heroAccent` pattern (one accent word per title, max).
**Type tokens:**
- Title: `--display` italic 900wt, clamp(36px, 5vw, 64px) on registration page; clamp(28px, 4vw, 48px) on social; clamp(16px, 2.5vw, 32px) in subject line / mono eyebrow form.
- Subtitle: `--serif`, italic, 16–18pt, color `--muted`.
- Eyebrow above title: `--mono` 10pt, .25em letter-spacing, uppercase, content `AESDR · WORKSHOP · [affiliate slug]`.
**Iconography:** None at title level — type is the visual. A small ghost numeral (`01` per `.heroLeft::after`) may sit behind the headline at opacity .06 for surface anchoring.
**Iris usage:** At most one accent word in a chosen title gets the `.heroAccent` iris-text-clip treatment (e.g., *What good actually looks like in startup **SaaS**.*). One accent word total — never more.
**Deliberate departures from canon:** None.

## Open

- Founder picks the title. Once picked, it's locked into the canon under §17 v1.x and threaded into D7, D6, all reminder emails, the deck, and the replay copy.
- Whether the title varies per affiliate archetype (e.g., #1 for community operators, #4 for bootcamp coaches, #5 for alumni networks) or stays consistent across all affiliates. Default: pick one for the first three pilots. Re-evaluate after pilot postmortems.
- Whether the title takes a second-line subtitle on the registration page or stands alone. Default in D7: title alone for the hero; subtitle appears as the page's first body paragraph.
