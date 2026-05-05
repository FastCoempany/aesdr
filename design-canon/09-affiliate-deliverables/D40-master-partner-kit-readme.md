# D40 — Master Partner-Kit Folder README

**Deliverable:** The single-page index that opens the partner-kit folder. The first document a partner reads when they receive the kit. Tells them what's in the folder, what each file is for, what they may edit, what they may not, and where to put their own inputs. This is the deliverable that fixes the "twelve mystery crumbs in Slack" problem named in the affiliate-seeding research report's enablement-kit table.
**Audience:** Partner principal + anyone on Partner's team writing or producing AESDR-promoting copy. Sent within 3 business days of D22 signing per D22 §4.5.
**Voice ratio:** 90 Rowan / 10 Michael per canon §3.3 (internal docs row, partner-adjacent variant). Operator-to-operator. The Michael line is the closer.
**Format:** Markdown source. Renders as `README.md` at the root of the kit folder. Pinned in the Notion / Google Drive / Dropbox / GitHub-share that AESDR uses to deliver the kit.
**Canon refs:** `AFFILIATE_BRAND_CANON.md` §1.4 (borrowed trust), §1.6 (honesty discipline), §6.6 (co-branding zone), §16 (approval gates).

> **Placeholder convention:** `[PARTNER_NAME]`, `[PARTNER_SLUG]`, `[PILOT_ID]`, `[PILOT_START_DATE]`, `[WORKSHOP_DATE]`, `[PILOT_END_DATE]`, `[CODE_EXPIRY_DATE_TIME_TZ]`, `[PILOT_CODE]`, `[FOUNDER_FIRST_NAME]`, `[OPS_FIRST_NAME]`, `[FOUNDER_EMAIL]`, `[OPS_EMAIL]`. Swap globally before delivery.

---

## Welcome

> *Hi [PARTNER_NAME] —*
>
> *This folder is the AESDR pilot kit for the partnership we signed on [PILOT_START_DATE]. It's intentionally small. We work with a handful of partners, not a marketplace, and every file in here earns its place.*
>
> *Read this README first. It tells you what's in the folder, what's pre-cleared for you to use, and what needs an approval round. The 30-day pilot rests on getting those two right.*
>
> *— [FOUNDER_FIRST_NAME], AESDR*

---

## Quick reference

| Pilot ID | `[PILOT_ID]` |
|---|---|
| Pilot window | `[PILOT_START_DATE]` → `[PILOT_END_DATE]` |
| Workshop date | `[WORKSHOP_DATE]` |
| Pilot code | `[PILOT_CODE]` |
| Code expires | `[CODE_EXPIRY_DATE_TIME_TZ]` |
| Founder contact | `[FOUNDER_EMAIL]` ([FOUNDER_FIRST_NAME]) |
| Ops contact | `[OPS_EMAIL]` ([OPS_FIRST_NAME]) |

If you need a fast answer to "where does X live?", the table in §3 below maps every file in this folder to the question it answers.

---

## 1. How this kit is organized

The kit is one folder with everything in it. No nested subfolders, no "see also." If you can't find what you're looking for after reading this README, that's an AESDR problem to fix — email `[OPS_EMAIL]`.

```
[partner-kit-root]/
├── README.md                                    ← this document
├── 00-canon-excerpt.md                          ← the 6 canon sections you need
├── 01-pilot-agreement.pdf                       ← D22, signed
├── 02-pricing-and-promo-sheet.pdf               ← D28
├── 03-disclosure-language-pack.pdf              ← D19
├── 04-claims-sheet.pdf                          ← D20
├── 05-positioning-brief.pdf                     ← D21
├── 06-curriculum-map.pdf                        ← D31
├── 07-host-bio-stubs.pdf                        ← D29 (when shipped)
├── 08-lesson-preview-clip-and-transcript/       ← D30 (when shipped)
├── 09-promotion-copy-pack/                      ← outreach copy ready to lift
│   ├── 09a-newsletter-launch.md                 ← lifts D02-D04 register
│   ├── 09b-newsletter-reminder.md
│   ├── 09c-podcast-intro-script.md
│   └── 09d-social-pre-pre-approved-posts.md
├── 10-co-brand-lockup/                          ← AESDR × [PARTNER] assets
│   ├── 10a-lockup-horizontal.svg
│   ├── 10b-lockup-stacked.svg
│   ├── 10c-lockup-on-cream.png
│   └── 10d-lockup-usage-guide.md
├── 11-tracking-links.md                         ← UTM-tagged URLs by surface
├── 12-objection-replies.pdf                     ← D05 (for Partner team Q&A)
└── 13-operating-cadence.md                      ← what happens in what week
```

Files numbered `00`–`08` are reference. Files `09`–`13` are operational — the ones Partner uses while running the pilot.

---

## 2. What you can do without asking AESDR

### 2.1 Use the approved promotion copy verbatim

Files `09a`–`09d` are pre-cleared. Lift them into your channel and send. Per canon §10.1, the disclosure language is already inline; do not strip it.

### 2.2 Use the AESDR × Partner co-brand lockup as supplied

Files `10a`–`10c` are the lockup in three render targets. Use them on:
- Your registration / promo emails.
- Co-branded landing surfaces AESDR ships (D26 partner-promo page, when produced).
- Podcast / video thumbnails for episodes promoting the AESDR pilot.

Per `10d-lockup-usage-guide.md`, do not modify the lockup proportions, do not change the colors, do not add a third logo to it.

### 2.3 Quote the canon's approved tagline pack

Per canon §14 — the taglines listed in `00-canon-excerpt.md` are pre-cleared for partner use. Use, don't paraphrase.

### 2.4 Use the tracking links from `11-tracking-links.md`

Every URL in that file is UTM-tagged and partner-attributed. Use them exclusively — per D22 §3.4, modified or shortened links break attribution and may be treated as a §11.1 violation.

### 2.5 Send the partner-supplied workshop intro script

Per D09 slide 02, your 2-minute live intro is partner ad-libbed from the AESDR-supplied script. The script is in `09c-podcast-intro-script.md` and the live-intro variant is in `13-operating-cadence.md` for the workshop-week section.

---

## 3. What needs an approval round

Per D22 §8.2 + canon §16:

| If you want to… | …do this first |
|---|---|
| Write your own copy mentioning AESDR (instead of lifting `09a`–`09d`) | Submit to AESDR 48 hours pre-publish; we respond ≤ 24 business hrs with APPROVED / APPROVED WITH EDITS / DECLINED. |
| Mention pricing in any framing not in `02-pricing-and-promo-sheet.pdf` §3 approved phrasings | Same approval round. |
| Make a claim about AESDR's outcomes, your audience's expected results, or a "how it changed me" story | Submit. Per `04-claims-sheet.pdf`, claim approval is non-negotiable. |
| Add a third logo or co-branding element beyond the AESDR × Partner lockup | Pre-approval; default answer is no, per canon §6.6. |
| Re-record any AESDR content (clip the workshop, screenshot the registration page, repurpose a tool) | Pre-approval per D22 §8.4. Default answer is no — replay link only. |
| Run a parallel discount or "stack" alongside the pilot code | Pre-approval; default answer is no per `02-pricing-and-promo-sheet.pdf` §2. |
| Schedule a 1:1 between the founder and a high-intent prospect | Pre-approval per canon §12.1. Founder is invisible to audience by default; high-intent goes through the Admissions alias path (FAQ Q10). |

**Approval workflow:** email `[OPS_EMAIL]` and copy `[FOUNDER_EMAIL]`. Subject line: `[PARTNER_SLUG] · approval request · [topic]`. Include the asset, the channel, and the intended publish time. Per D22 §8.2, response within 24 business hours.

---

## 4. What's not in this kit (and why)

Per canon §1.6, naming the absences:

- **The AESDR email list.** Partner does not receive it. AESDR does not request Partner's list. Per D22 §6.5.
- **Founder's photo / bio for podcast hosts.** Founder is invisible to audience by canon §12.1. Use `07-host-bio-stubs.pdf` (host bio) instead.
- **A "founder will appear on your podcast" slot.** Not part of the pilot. If your audience-fit signal is high enough, AESDR may revisit post-pilot per canon §12.4. Not pre-approved.
- **A "you can offer your audience an extra 10% off" code.** No stacked discounts. Per `02-pricing-and-promo-sheet.pdf` §2.
- **Performance guarantees.** AESDR does not guarantee Partner a specific revenue, conversion rate, or attendance number. Per D22 §14.1. Reciprocally, Partner doesn't guarantee AESDR audience size.
- **A "premium tier" we sell at a higher price for the same content.** Doesn't exist. Per canon §13.

---

## 5. Operating cadence — what happens when

The full cadence is in `13-operating-cadence.md`. Summary:

| Week | What happens | What Partner does | What AESDR does |
|---|---|---|---|
| Pre-launch (signing → `[PILOT_START_DATE]`) | Kit handoff + setup | Confirms send schedule, reviews lockup. | Issues kit, builds tracking, confirms registration page. |
| Promotion week 1 | First send | Sends `09a-newsletter-launch.md`. | Monitors traffic; sends Friday weekly report (D25 Report 1). |
| Promotion week 2 | Reminder send | Sends `09b-newsletter-reminder.md`. | Tech rehearsal Thursday; final asset QA. |
| Workshop week | Live + replay window opens | Delivers 2-min intro per `09c`. Posts replay link in member channel. | Delivers workshop. Sends D10/D11/D12/D13/D14 to registrants. Sends D15/D16 same week. |
| Pricing-window close | Deadline-window | Optional one final reminder using approved copy from `09a`–`09b` register. | Sends D18 deadline email to non-buyers. |
| Pilot close (`[PILOT_END_DATE]`) | Final report + close-out | Confirms metrics shared. | Sends D25 Report 3 + D34 partner-facing close-out + initiates D32 kill-or-keep. |

Reports arrive every Friday. If a Friday is missed, that's a Friday AESDR owes you a written explanation, not a quiet skip.

---

## 6. Common questions

### *"Can I add my own commentary to the lifted copy?"*

Yes — per `00-canon-excerpt.md` you can prefix or append your own framing as long as the AESDR-supplied core (subject + body + CTA + disclosure) is intact and unedited. If you're rewriting structurally, that's a §3 approval round.

### *"What if my audience asks about pricing differently than the approved phrasings cover?"*

Email `[OPS_EMAIL]` with the question. We'll add a phrasing to `02-pricing-and-promo-sheet.pdf` §3 if it's a recurring pattern, or write a one-off approved answer for you. Most pricing questions are already in `12-objection-replies.pdf` from the D05 reply bank.

### *"Can my team member produce a graphic with the AESDR lockup?"*

Yes if they use `10a`–`10c` as supplied and follow `10d-lockup-usage-guide.md`. No if they recreate the lockup or modify it.

### *"What if I miss a send deadline?"*

Email `[OPS_EMAIL]` immediately. Per D22 §3, the contract calls for two named sends. One missed send is a §16 conversation, not an automatic termination. Two missed sends without notice is a §11 issue.

### *"Can I share this kit with another partner I'm thinking of co-pilotinging with?"*

No — per D22 §12 confidentiality. Refer them to `[FOUNDER_EMAIL]`; AESDR may run a parallel pilot with them under their own kit.

### *"What if I find an error in this kit?"*

Reply to the kit-handoff email or DM `[OPS_FIRST_NAME]` directly. Errors are AESDR's to fix; we publish a corrected version with a dated changelog at the top of this README.

---

## 7. Honesty discipline (canon §13) — what this kit refuses to do

This kit doesn't:
- **Bury the contract.** D22 is file `01`. First content slot. Read it.
- **Hide what's locked vs editable.** Sections §2 and §3 are the explicit map.
- **Disguise the founder–partner relationship.** Per canon §1.4 borrowed-trust doctrine, the partner's audience is being lent, not transferred. We say so.
- **Offer "secret bonuses" outside this kit.** If something isn't in this folder and isn't explicitly granted in §2 of this README, it isn't part of the deal.
- **Change without written record.** Every kit revision has a dated changelog at the top of this README. If a clause changed, it's recorded.

---

## 8. If the pilot ends early

Per D22 §11. In short: termination requires written notice. Partner removes AESDR-promoting content from owned channels within 5 business days. Commission accrued before termination remains payable. Both Parties get the close-out conversation D34 covers.

If the pilot succeeds and we extend, that's a written amendment to D22, signed by both. Verbal extensions don't extend.

---

## Visual treatment notes

**Layout pattern:** The README renders as a markdown document inside the kit's host system (Notion / Google Doc / Dropbox / Drive). It is not a designed PDF — partners need to scan it on phone, search it in a browser, copy snippets out of it. Per canon §6.5, the discipline here is *legibility over decoration*.

**Palette:**
- Default markdown render — host system's native render. Where AESDR controls render (Notion theme, custom Google Doc template, the in-browser preview at `[KIT_URL]`), use:
  - Background: `--cream`.
  - Type: `--ink` body, `--muted` for code blocks and table headers.
  - Section headers: `--display` italic 700, 22pt, `--ink`.
  - Mono code blocks: `--mono` 13pt.
- Where AESDR does not control render (Partner's GitHub view, etc.), the README still parses cleanly.

**Type tokens:** Per palette above. No Caveat — this is a partner-side ops document, not an audience-facing voice surface.

**Iconography:** None. The folder-tree ASCII diagram (§1) and the markdown tables carry the structure. No section icons, no checkbox emojis.

**Iris usage:** None.

**Deliberate departures from canon:** The README's hostility to a designed PDF render *is* a canon decision — partners need to use this document as a workspace tool, not admire it. Per canon §6.9.1 thumbnail test, the README at thumbnail size is identifiable by section structure and Welcome paragraph register, not by visual fingerprint.

**Five-question check (canon §6.9.1):**
1. **Thumbnail at 200×200:** Even rendered as plain markdown, the *Welcome* paragraph and the verdict-shaped *"intentionally small. We work with a handful of partners, not a marketplace"* line are identifiable. Pass.
2. **Token check:** Pass where AESDR controls render. Acceptable elsewhere — markdown is portable.
3. **Iris reservation:** Pass — zero.
4. **Icon discipline:** Pass — type-only.
5. **Voice thumbnail:** *"This folder is the AESDR pilot kit for the partnership we signed on [PILOT_START_DATE]. It's intentionally small. We work with a handful of partners, not a marketplace, and every file in here earns its place."* — passes. Identifiably AESDR; verdict-shaped Rowan, plain language, no metaphor (per canon §1.3 v1.3).

---

## Forward dependencies

This README depends on:
- **Every D-file referenced in §1's folder-tree.** The kit is the assembly. Most exist (D19, D20, D21, D22, D28, D31). Pending in this batch's downstream: D29 host bio (file `07`), D30 lesson preview (file `08`), and D26 partner-promo page (referenced).
- **Co-brand lockup assets** (`10a`–`10d`). **Operationally pending** — produced once a partner is PASSed; `10d-lockup-usage-guide.md` is canonical (write once, lift per partner with `[PARTNER_NAME]` swap).
- **Tracking links file** (`11-tracking-links.md`). **Operationally pending per pilot** — UTMs and codes are partner-specific.
- **Promotion copy pack** (`09a`–`09d`). **Operationally pending** — generated from D02, D03, D04 register and partner-customized.
- **Canon excerpt** (`00`). **Pending production** — a 6-section excerpt from `AFFILIATE_BRAND_CANON.md` v1.1 covering §1, §3.3, §4.1, §6.6, §10.1, §13. Recommend producing as part of next batch's writing rather than as a separate deliverable.

This README is a forward dependency for:
- **Every pilot AESDR runs.** No kit handoff happens without this README at the root.
- **D33 postmortem** — references "did the partner read the README" as a qualitative-signal input.

---

## Open

- **Host system.** Default: Notion (mirror to Google Drive for partners who prefer it). Alternative: a static-site-generator render at `kit.aesdr.com/[PARTNER_SLUG]` per pilot, with cleaner permission handling. Recommend: **Notion for v1**, sg-rendered later if pilot count crosses 5.
- **Whether to ship a `00-canon-excerpt.md` instead of the full canon.** Default: **excerpt** — partners need the 6 sections relevant to them, not the 17. Full canon stays internal. Risk: excerpt drifts from canon. Mitigation: the excerpt is generated from the canon source, not authored separately.
- **Partner team-member access.** Default: kit is shareable read-only with anyone Partner authorizes; sensitive items (D22 signed PDF, the unredacted disclosure-pack with internal commentary) are restricted. Recommend codifying the team-member access policy as `13-operating-cadence.md` §X rather than here.
- **Changelog cadence.** Default: any change to `01-pilot-agreement.pdf` is a fresh signed PDF (never overwrites v1); any change to `02-pricing-and-promo-sheet.pdf` is a republish with a dated v-number; any change to this README is a dated note at the top under "Changelog." Codify in §1 if recurring.
- **Whether the §6 common-questions list should be lifted to a partner-facing FAQ surface.** Default: **stays in this README.** Partners read the README; prospects read the public FAQ (D23). Different audiences, different surfaces. Don't blur them.

---

## Closing

> *(--hand 22pt, --crimson, rotation -1deg — the kit's only Michael line:)*
>
> *Read the README before you Slack me.*
