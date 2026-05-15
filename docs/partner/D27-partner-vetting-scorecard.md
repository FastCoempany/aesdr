# D27 — Partner Vetting Scorecard

**Deliverable:** Internal-only scorecard the founder fills out during or immediately after the qualification call with a prospective partner. Forces a written PASS / HOLD / FAIL decision before any pilot terms are sent. No two partners get into a pilot through different gates.
**Audience:** Founder, ops. **Never shared with the partner.** The scorecard is the gate; the pilot conversation comes after the score, not the other way around.
**Voice ratio:** 90 Rowan / 10 Michael per canon §3.3 (internal docs row). Verdict mode. No marketing voice.
**Format:** Markdown source; renders to PDF one-pager per canon §6.5 + canon §8.5 PDF anatomy. Fillable in Notion / Sheets / `.md` per pilot. One file per scored partner, archived in `docs/partner/pilots/[PARTNER_SLUG]/scorecard--v1.md`.
**Use timing:** Filled out within 24 hours of the partner qualification call (Day 1 of the 30-day pilot timeline per `affiliate-seeding-deep-research-report.md` §Timeline). Decision blocks subsequent steps — no pilot terms (D22, proposed), no co-branded assets (D26, proposed), and no D17-style audience contact happens without a PASS on file.
**Canon refs:** `AFFILIATE_BRAND_CANON.md` §1.3 (a handful of partners, not a marketplace), §1.4 (borrowed trust), §1.5 (operator over guru), §1.6 (honesty), §4.1 (banned vocab — applies to partner posts about us), §5.1–5.2 (anti-LinkedIn doctrine), §6.6 (co-branding zone), §11 (approved & banned channels), §13 (honesty discipline), §16 (approval gates).

> **Placeholder convention:** This is an internal template — placeholder values are filled by the founder per partner. `[PARTNER_NAME]`, `[PARTNER_SLUG]`, `[FOUNDER_FIRST_NAME]` for sign-off. No host placeholders appear in this document — the host is not a vetting variable; the partner is.

---

## Use

The scorecard exists because the partner-side decision is the easiest one to make on charisma and the hardest one to undo. A partner who fails the rubric in writing is a partner who, after one workshop, becomes a brand-mismatch problem we have to clean up with a kill-or-keep memo (D32). The scorecard is a one-hour discipline that prevents a one-quarter cleanup.

The rubric forces the founder to write down what they saw on the qualification call before the relationship politics begin. Most failed partnerships in pre-revenue founder-sales motion fail on a signal that was visible on the first call — the canon §1.4 "merciless mirror" doctrine applies to partners as much as to deliverables. We just have to write the signal down.

Three decisions:
- **PASS** — proceed to pilot terms (D22).
- **HOLD** — score is borderline; one specific revisit is required before pilot terms.
- **FAIL** — do not proceed. Document the reason; close the door cleanly.

Per canon §16, no scorecard means no pilot — the score is itself an approval-gated artifact, signed by the founder.

---

## Scorecard

> *(Mono eyebrow, top of PDF render)*
> `AESDR · PARTNER VETTING SCORECARD · [PARTNER_SLUG] · v1`

> *(Display italic, ~36pt)*
> *Partner: [PARTNER_NAME]*
> *Archetype: [community / coach / creator / alumni / hybrid]*
> *Decision: [PASS / HOLD / FAIL]*

---

### 1. Partner identification

| Field | Value |
|---|---|
| Partner name (real) | [text] |
| Partner public handle (LinkedIn / X / Substack) | [text] |
| Audience platform | [Slack community / Discord / newsletter / podcast / coaching cohort / hybrid] |
| Audience size (claimed) | [n] |
| Audience size (verifiable, see §3) | [n or "n/a"] |
| Niche | [SDR community / AE community / bootcamp / career-switcher / mixed] |
| Prior commercial activity (paid sponsorships, affiliate deals, courses) | [Y/N — list 2–3 examples] |
| Date of qualification call | [YYYY-MM-DD] |
| Call duration | [minutes] |
| Conducted by | [Founder] |

---

### 2. ICP alignment (weight: 25 points)

> *Score each row 0 / 1 / 2. Sum out of 10, then × 2.5 to get the weighted score.*

| Row | Question | Score (0/1/2) |
|---|---|---|
| 2.1 | Is the partner's audience primarily early-career SaaS SDRs / AEs / career-switchers (per `affiliate-seeding-deep-research-report.md` §ICP)? | [n] |
| 2.2 | Is the audience in their first 0–3 years of the role (i.e., the ramp window we serve)? | [n] |
| 2.3 | Does the audience replied or comment on operating-detail content (the X-axis from the workshop framework), not just motivation? | [n] |
| 2.4 | Is the audience meaningfully concentrated geographically or by company stage (startup SaaS), not generic "all sales"? | [n] |
| 2.5 | If we offered the AESDR workshop title cold, would the audience self-recognize? (Rather than "who's that for?") | [n] |
| **ICP raw** | / 10 | [n] |
| **ICP weighted** | × 2.5 | **[n] / 25** |

**Interpretation:** ICP is the highest-weight section because canon §1.5 puts operator-over-guru as the spine. A mediocre ICP score with an excellent partner-quality score is still a marginal pilot — the audience is what matters, and the audience is what the partner brings.

---

### 3. Trust signal verification (weight: 20 points)

Per the report's "trust signals to verify" column (§ICP and partner matrices). Each item is binary — verified or not.

| Row | Trust signal | Verified (Y/N) | Evidence link / note |
|---|---|---|---|
| 3.1 | Live attendance history — past workshop, AMA, or live session with ≥ 30 attendees within last 6 months. | [Y/N] | [link / note] |
| 3.2 | Replies in the partner's audience are operators, not bots / engagement farms. (Sample 10 recent replies to their content.) | [Y/N] | [link / note] |
| 3.3 | Partner has run or co-hosted at least one paid commercial activity (sponsorship, affiliate deal, or course) — *or* explicitly named themselves as commercially open. | [Y/N] | [link / note] |
| 3.4 | The partner's content is operating-detail-heavy, not motivation-heavy. (Sample 5 of their last 10 posts.) | [Y/N] | [link / note] |
| 3.5 | Audience engagement rate (replies + saves / followers, sampled) ≥ 1.5%. (For newsletters: open rate ≥ 35%; for podcasts: per-episode listener floor ≥ 1k.) | [Y/N] | [link / note] |
| 3.6 | Partner can name 2–3 specific reps in their audience, by name and current role, when asked on the call. | [Y/N] | [partner's named examples] |
| 3.7 | Partner has direct member access (DM, member-channel, mailing list) — not a one-to-many broadcast only. | [Y/N] | [note] |
| 3.8 | Reference check — at least one prior commercial partner of this person speaks about them positively. (For new partners with no commercial history, this is N/A and earns 0 points but is not disqualifying.) | [Y/N] | [reference name + paraphrase] |
| **Trust raw** | / 8 | [n] |
| **Trust weighted** | × 2.5 | **[n] / 20** |

**Interpretation:** Per canon §1.4, *borrowed trust is a merciless mirror.* A partner whose audience trust isn't verifiable cannot lend us trust we don't already have. Items 3.2 and 3.4 are load-bearing — fail either, and the score caps at HOLD regardless of other signals.

---

### 4. Anti-LinkedIn / brand-fit check (weight: 20 points)

Per canon §5 (anti-LinkedIn doctrine) and §4.1 (banned vocab). The partner's content has to survive the AESDR brand without alteration. If their primary register would require us to ask them to rewrite their voice, that's a fit problem, not a coaching problem.

| Row | Question | Score (0/1/2) |
|---|---|---|
| 4.1 | If we read the partner's last 20 posts side-by-side with 20 LinkedIn-influencer posts, do they look measurably colder, plainer, more specific? (Per canon §4.4.) | [n] |
| 4.2 | Does the partner avoid the §4.1 banned vocab in their own content? (Sample 10 posts. Look for "crush it," "game-changer," "unlock," "mindset," "thought leader," generic hype emojis.) | [n] |
| 4.3 | Is the partner's primary distribution channel a non-LinkedIn surface? (LinkedIn is permitted as secondary per §5.2 — a partner whose primary channel is LinkedIn is a fit-signal problem.) | [n] |
| 4.4 | Does the partner discuss specific dollars, specific call counts, specific timelines — i.e., the "named number" signature move (canon §4.2) — rather than abstract motivation? | [n] |
| 4.5 | When asked "what would you not say about AESDR," does the partner produce a real answer? (A partner who'd say anything for the deal is a partner who'll mis-position us.) | [n] |
| **Brand-fit raw** | / 10 | [n] |
| **Brand-fit weighted** | × 2.0 | **[n] / 20** |

**Interpretation:** This section catches the partner who has audience but whose voice is incompatible with canon. Per canon §1.5 (operator over guru), a partner who fails 4.1 or 4.2 is not coachable in time for a pilot — their audience is calibrated to the voice they already have.

---

### 5. Operating fit check (weight: 20 points)

Does the partner's expectation of how the pilot runs match how AESDR actually runs pilots?

| Row | Question | Score (0/1/2) |
|---|---|---|
| 5.1 | Did the partner accept workshop-first selling (canon §1.1)? Or did they push for a tracked-link-only deal? | [n] |
| 5.2 | Did the partner accept a non-exclusive, time-boxed pilot? Or did they push for category exclusivity, long terms, or first-right-of-refusal? (Per canon §1.3.) | [n] |
| 5.3 | Did the partner accept the disclosure-language pack (D19) without negotiation? (FTC required; non-negotiable per canon §10.1.) | [n] |
| 5.4 | Did the partner accept the canon as the source-of-truth for voice and copy? (i.e., they don't expect us to approve their non-canon promotional copy.) | [n] |
| 5.5 | Did the partner accept the offer slide and pricing as locked (canon §7.3, §16)? | [n] |
| **Operating-fit raw** | / 10 | [n] |
| **Operating-fit weighted** | × 2.0 | **[n] / 20** |

**Interpretation:** Operating fit is where most "great audience, terrible deal" partnerships die. A partner who pushes for terms that contradict canon on the first call will push harder on the second. Per canon §13, we'd rather lose the partner now than lose them publicly later.

---

### 6. Founder-time fit (weight: 15 points)

Per canon §1.3 (a handful of partners, not a marketplace) and the report's "effective hourly rate" frame in D32. The pilot must be worth the founder's time — not just on revenue, but on what the founder learns from the audience.

| Row | Question | Score (0/1/2) |
|---|---|---|
| 6.1 | Does this pilot teach AESDR something a previous pilot didn't? (New ICP segment, new objection pattern, new geo, new audience composition.) | [n] |
| 6.2 | Will the partner reasonably promote without weekly hand-holding? (i.e., they have an audience-engagement workflow already; we're not the engine.) | [n] |
| 6.3 | Is the expected attendance (per partner's claim in §1, sanity-checked against §3.1) ≥ 30 attendees? Below 30 is rarely worth the pilot setup cost. | [n] |
| 6.4 | Does the partner respond to email / DM in ≤ 24 business hours? (Slow-comm partners burn 3× the founder hours.) | [n] |
| 6.5 | Founder gut-check: at the end of this pilot, will I want to talk to this person again? | [n] |
| **Time-fit raw** | / 10 | [n] |
| **Time-fit weighted** | × 1.5 | **[n] / 15** |

**Interpretation:** Per canon §1.3, the partner program is small by design — a handful of carefully selected partners, not a marketplace. 6.5 is a soft signal but not noise; it tracks closely with whether the partner remains a learning relationship beyond pilot one.

---

### 7. Red-flag list (any single flag → automatic HOLD or FAIL)

Mark each that applies. **Any single flag** triggers a HOLD or FAIL regardless of total score.

- [ ] **Banned-vocab violation** — partner's existing content uses banned vocab (canon §4.1) and they resist rewording. → **FAIL**
- [ ] **Disclosure resistance** — partner declines to use the FTC-required disclosure language (D19, canon §10.1). → **FAIL**
- [ ] **Exclusivity push** — partner demands category exclusivity longer than the pilot window. → **FAIL**
- [ ] **Audience-bot signal** — sample of 10 replies finds 3+ obvious engagement-bot accounts. → **FAIL**
- [ ] **Voice mismatch** — partner's primary register is "rise and grind" energy that contradicts canon §5. → **FAIL**
- [ ] **Past compliance issue** — verified prior FTC / advertising / consumer-protection issue. → **FAIL**
- [ ] **Comp expectation** — partner expects fixed fee plus commission with no performance floor. → **HOLD** (renegotiate or fail).
- [ ] **List-share request** — partner asks for our email list to "co-promote." (Canon-incompatible. We don't share lists.) → **HOLD** (clarify; if they push, FAIL).
- [ ] **Custom contract terms** — partner wants a deal structure significantly outside the standard pilot agreement (D22). → **HOLD** (review with legal).
- [ ] **Founder-availability ask** — partner expects founder appearance on calls / podcast / panel as part of the pilot, contradicting canon §12.1. → **HOLD** (decline cleanly or reframe).

---

### 8. Total score

| Section | Weight | Score |
|---|---|---|
| ICP alignment | 25 | [n] |
| Trust signal verification | 20 | [n] |
| Brand-fit | 20 | [n] |
| Operating fit | 20 | [n] |
| Founder-time fit | 15 | [n] |
| **Total** | **100** | **[n] / 100** |

---

### 9. Decision

> *Threshold defaults; founder may override with written rationale.*

| Score band | Default decision |
|---|---|
| ≥ 80 / 100 with no red flags | **PASS** — proceed to pilot terms (D22) |
| 65–79 / 100 with no red flags | **HOLD** — one named change required, then re-score |
| < 65 / 100 — *or* — any FAIL-tier red flag | **FAIL** — close the door cleanly (see §10) |
| Any single HOLD-tier red flag | **HOLD** regardless of score |

**Founder decision:**

- [ ] PASS — proceed to D22 pilot terms.
- [ ] HOLD — required change before re-score: [text]. Re-score date: [YYYY-MM-DD].
- [ ] FAIL — primary reason: [text]. Door open for revisit? [Y/N — and if Y, conditions].

> **Rationale (3–5 sentences, founder writes):** [text]
>
> *Required: name the single thing on the call that most influenced the decision. The decision should be defensible six months from now without re-reading the rest of the scorecard.*

---

### 10. If FAIL — close the door cleanly

Per canon §13, a clean close is the brand. The "we part as adults" phrase applies at the front door as much as at the back door (canon §14).

**Use the partner-decline message template** (one of two; pick by tone):

**Decline (warm — partner is a fit-mismatch but no antagonism):**
> *[FIRST_NAME] — appreciate the conversation. Working through it on our end, AESDR isn't the right fit for [audience / format / timing], and I'd rather say so directly than string out a pilot that doesn't earn its keep on either side. If something changes on either side, the door's open.*
>
> *— [FOUNDER_FIRST_NAME], AESDR*

**Decline (cold — partner has compliance / canon issues we can't reconcile):**
> *[FIRST_NAME] — thanks for the time. We're going to pass on the pilot. The disclosure / vocabulary / structure issues we walked through aren't ones we negotiate on, and that's a fit problem, not a coaching problem.*
>
> *— [FOUNDER_FIRST_NAME], AESDR*

Whichever is sent, archive the message in the pilot folder alongside the scorecard.

---

### 11. Sign-off

| Role | Name | Date |
|---|---|---|
| Founder | [FOUNDER_FIRST_NAME] | [YYYY-MM-DD] |

Scorecard filed to: `docs/partner/pilots/[PARTNER_SLUG]/scorecard--v1.md`

If subsequent re-scoring (HOLD → re-score), file as `scorecard--v2.md` etc. Never overwrite v1.

---

## Visual treatment notes

**Layout pattern:** PDF one-pager per canon §8.5. When the source markdown is rendered for the partner-pilot folder, it ships as a fillable doc; when rendered for archival/audit, it ships as a clean PDF.

**Palette:**
- Background: `--cream`.
- Type: `--ink` body, `--muted` for table headers and mono labels.
- Section headers (1, 2, 3 etc.): `--display` italic 700, 22pt, `--ink`.
- Mono eyebrow + scorecard footer + "Filed to" line: `--mono` 11pt, `--muted`.
- Table headers: `--cond` 12pt 700, .15em, uppercase, `--ink`.
- Table body: `--serif` 14pt, `--ink`.
- Decision marker (`PASS / HOLD / FAIL`): `--display` italic 36pt, `--crimson`.
- Hairline rules between sections: `--light` 1px.

**Type tokens:** Per palette above. Internal-document register — no marketing typography. No Caveat (canon §3.4 — Michael's voice is for audience-facing surfaces, not internal scorecards).

**Iconography:** None. Internal scorecards are type-only. No checkbox-icon clipart; the markdown checkbox `[ ]` renders as plain text in PDF, which is the correct register.

**Iris usage:** None. Internal docs do not get the iris fingerprint (canon §6.4).

**Deliberate departures from canon:** None.

**Five-question check (canon §6.9.1):**
1. **Thumbnail at 200×200:** Cream + display italic section headers + mono eyebrow + crimson decision marker = identifiably AESDR. Pass.
2. **Token check:** Pass.
3. **Iris reservation:** Pass — zero iris (correct for internal).
4. **Icon discipline:** Pass — type-only.
5. **Voice thumbnail:** *"The scorecard exists because the partner-side decision is the easiest one to make on charisma and the hardest one to undo."* — passes; verdict-shaped Rowan, identifiably AESDR. The "merciless mirror" frame in §3 interpretation is direct canon (§1.4).

---

## Forward dependencies

This scorecard depends on:
- **Canon v1.1** — every weighted dimension lifts from a canon section. **Met.**
- **D19 disclosure-language pack** — §5.3 references it as the non-negotiable. **Met.**
- **D20 claims sheet** — banned/approved claim discipline. **Met.**
- **`affiliate-seeding-deep-research-report.md`** — §ICP and §Partner matrices feed §2 and §3. **Met.**

This scorecard is a forward dependency for:
- **D22 (proposed) partner pilot agreement** — only sent on PASS.
- **D26 (proposed) partner-promo page** — co-branded surface only built for PASS partners.
- **D32 kill-or-keep memo** — references this scorecard as the v0 baseline.
- **D33 postmortem** — references this scorecard for "what we said on day 1 vs what happened."
- **D40 (proposed) master partner-kit folder README** — references this scorecard as the gate.

---

## Open

- Whether HOLD-band partners get a written explanation or just the named-change request. Default: **named change only on the first round.** Avoid letter-writing energy that turns into negotiation theater. If they pass round 2, fine; if they don't, FAIL.
- Whether to add a section 12 — "Future canon-revision flags" — for items the partner conversation surfaced that don't fit the canon as currently written. Default: **yes, but track in D33 postmortem rather than the scorecard itself.** Keeping the scorecard scoped tightens it.
- Reference-check (§3.8) — should we standardize a single reference-check question template? Default: **two questions, max** — *"Did they hold their commitments on promotion deliverables?"* and *"Was the audience reaction roughly what they said it would be?"* Anything more becomes background-check theater.
- Threshold tuning. After 5 partner conversations, revisit the 80 / 65 cut-points. The defaults are first-pass; pilot data will tell us whether they're calibrated.
- Per-archetype weighting — should the rubric weight differently for community-operator vs alumni-ambassador (per the report's partner archetype matrix)? Default: **single rubric for v1.** Fork into per-archetype variants only if pilot data shows the rubric mis-grades a meaningful share of the conversations.
