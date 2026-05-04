# AESDR Partner Hub — Build Prompt for Claude

> **What this document is.** A draft prompt the founder will edit and then send back to Claude to build the AESDR partner hub at `aesdr.com/partners`. Structured per Anthropic's recommended 10-part prompt template. Internal authoring context only — never crosses the partner boundary.
>
> **Editing instructions for the founder.** Read top to bottom. Edit any section. Strike anything that doesn't belong. Add anything missing. The version you send back is the version Claude works from. Replace bracketed `[FOUNDER_TO_FILL]` items.

---

## [1] TASK CONTEXT

You are Claude, working on AESDR — a 12-lesson sales-survival course for early-career SaaS SDRs and AEs, built on Next.js 16 / React 19 / Supabase / Stripe. The codebase lives in this repo. You have built the entire 40-deliverable partner kit on the `affiliate-seeding` branch. You also wrote the hub specification at `docs/partner/AESDR-PARTNER-HUB-SPEC.md` — that document is your source of truth for what to build.

The task: **build Phase 1 of the AESDR Partner Hub** at `aesdr.com/partners` per the hub spec. The hub is the surface a partner-prospect navigates to when they ask, *"can I see your website?"* It must answer that question without them needing to ask follow-ups.

The hub does not exist today. Phase 1 = six pages + a working application form + a PDF rendering pipeline for the kit downloads + an admissions-inbox routing path. After Phase 1 ships, Phases 2 and 3 are scoped but not yet built.

Founder has ratified six Phase 0 inputs (locked):

1. Routing: `aesdr.com/partners`
2. The $40 end-of-course option is the unlock fee for the second of two end-of-course artifacts (Programme / Manuscript) at `app/reveal/RevealView.tsx` line 212.
3. The 5 takeaway tools live at `tools/standalone-html/` and route via `app/tools/[slug]/page.tsx`.
4. Host casting is interim — keep `[HOST_FIRST_NAME]` and `[HOST_LAST_NAME]` placeholders.
5. **Discount policy: never. Ever. List price applies always.** AESDR does not run promotional codes, pilot discounts, partner-stack discounts, or time-limited price drops.
6. The pilot agreement (D22) is requested by the partner via the application form, not published on the hub.

---

## [2] TONE CONTEXT

You are working inside AESDR's brand, governed by `AFFILIATE_BRAND_CANON.md` v1.1. Read it before writing. Specifically internalize:

- **§1 foundational doctrines** — workshop-first, founder-backstage, founding vineyard, borrowed-trust as merciless mirror, operator over guru, honesty as differentiator.
- **§3 the two voices** — Rowan (declarative, surgical, `--cond` + `--display` italic) and Michael (confessional, deadpan, `--hand` Caveat only). Never blended into mush.
- **§3.3 voice ratios** — the partner hub runs 80/20 to 95/5 Rowan/Michael depending on page. Spec carries the per-page table.
- **§4.1 banned vocabulary** — zero tolerance: "crush it," "game-changer," "unlock," "mindset," "rise and grind," "thought leader," "lead with value," "synergy," "amazing," "empower," "rockstar," "ninja," generic hype emojis. If you write any of these, the build fails the canon §6.9.1 voice-thumbnail test.
- **§6 visual system** — cream + ink + crimson + iris + muted + light. No dark surfaces. No imported icons. No emoji.
- **§6.9.1 five-question check** — every page passes thumbnail test, token test, iris-reservation test, icon-discipline test, voice-thumbnail test before commit.
- **§12 founder-backstage doctrine** — founder is invisible to audience. The hub does not include founder bio, founder photo, founder-named author byline, or "from the founder" framing. Founder visibility on a partner-facing surface requires canon §12.4 ratification (named milestone, rare and deliberate); the hub does not qualify.
- **§13 honesty discipline** — say out loud what competitors won't. The hub includes honest-disqualification surfaces (who shouldn't apply, who shouldn't enroll). The hub names absences (no discounts, no email-list access, no founder-on-demand). Sanitization is forbidden.
- **§14 tagline pack** — usable verbatim: *"Less affiliate empire. More founding vineyard."* / *"Operator over guru."* / *"12 lessons. 5 tools. 1 you."* / etc. Do not paraphrase canonical taglines.

Operate severe, calm, ranked, authored. No marketing voice. No friendliness-first. Operator-to-operator register throughout.

**Tone failure modes to actively avoid (you've made these mistakes before in this codebase):**

- Inventing curriculum content instead of reading the production syllabus.
- Inventing frameworks (e.g., "Activity vs Judgment 4-quadrant," "Pipeline Integrity funnel") instead of reading what AESDR actually teaches.
- Using sage / corporate / sanitized language ("empower learners," "unlock potential," "drive outcomes").
- Inventing pilot stats ("11-14 weeks completion," "1-in-2.5 L&D ratio").
- Treating markdown as a partner-facing shipping format. Markdown is internal authoring; PDFs and rendered web pages are partner-facing.
- Adding "clusters," "tiers," "tracks" to the curriculum — production has 12 lessons, no groupings.

---

## [3] BACKGROUND DATA, DOCUMENTS, AND IMAGES

**Read these files BEFORE writing any code or copy. In order:**

1. `docs/partner/AESDR-PARTNER-HUB-SPEC.md` — this is your build spec; you wrote it; re-read it before starting.
2. `AFFILIATE_BRAND_CANON.md` v1.1 — the canon. Read every section.
3. `app/syllabus/page.tsx` (commit `20cbc9e`, 2026-04-22) — the production syllabus. The library-catalog metaphor lives here. The 12 lesson titles, questions, annotations, and stamps are the source of truth.
4. `docs/planning/course-content-audit.md` (2026-04-09) — confirms 36 units across 12 lessons + role-conditional fork.
5. `app/reveal/RevealView.tsx` — the Programme/Manuscript artifact-pick mechanic + the $40 follow-on copy.
6. `app/artifacts/playbill/page.tsx` and `app/artifacts/redline/page.tsx` — the two end-of-course artifacts.
7. `tools/standalone-html/` (5 files) — the 5 tools. Each linked from `aesdr.com/tools/[slug]`.
8. `variants/variant-a-editorial-split.html` — canonical visual pattern. The hub composes from this.
9. `tools/rendered/04-d09-workshop-deck.html`, `05-d24-replay-page.html`, `06-d26-partner-promo-page.html`, `08-d38-launch-hero.html` — existing rendered HTML examples in the brand. Match their register and visual discipline.
10. `app/globals.css` — CSS tokens. Use these, never raw hex.
11. `docs/partner/00-INDEX.md` — index of the 40 partner deliverables. The hub's content lifts from these.
12. `docs/partner/D21-positioning-brief.md`, `D31-curriculum-map.md`, `D40-master-partner-kit-readme.md` — primary content sources for hub home, curriculum page, kit page.
13. `docs/partner/kit-template/00-canon-excerpt.md`, `09a-newsletter-launch.md`, `09b-newsletter-reminder.md`, `09c-podcast-intro-script.md`, `09d-social-pre-approved-posts.md`, `10d-lockup-usage-guide.md`, `11-tracking-links.md`, `13-operating-cadence.md` — the kit downloadables.
14. `PRICING_ENGINE_SPEC.md` — pricing source of truth. List prices: $249 SDR / $299 AE / $1,499 Team. Never discount.
15. `SESSION_STATE.md` — context recovery brief. The "Recent activity" log shows what's shipped and what's not.

**Reference URLs (external, for context only):**

- `https://courses.affordanything.com/yfrp-affiliate-partner-resources/` — Afford Anything's affiliate partner resources page; the closest existing precedent for the kind of hub AESDR is building, but in a different brand register. **Do not copy structure; reference for understanding the genre, then ignore. AESDR's hub is its own thing.**
- Profit Pillars Affiliate Partner Resources — same.

---

## [4] DETAILED TASK DESCRIPTION & RULES

**Build Phase 1 of the AESDR Partner Hub per the spec at `docs/partner/AESDR-PARTNER-HUB-SPEC.md`.** Six pages, one application form, one PDF rendering pipeline, one new Supabase table.

### Pages to build (Phase 1)

1. `app/partners/page.tsx` — `/partners` hub home. Per spec §"Page 1.1."
2. `app/partners/program/page.tsx` — `/partners/program`. Per spec §"Page 1.2."
3. `app/partners/curriculum/page.tsx` — `/partners/curriculum`. Per spec §"Page 1.3."
4. `app/partners/kit/page.tsx` — `/partners/kit`. Per spec §"Page 1.4."
5. `app/partners/faq/page.tsx` — `/partners/faq`. Per spec §"Page 1.5."
6. `app/partners/apply/page.tsx` — `/partners/apply`. Per spec §"Page 1.6."

### Components to build

Per spec §"Component library." Reusable React components in `components/partners/`:

- `LockupHeader`, `EditorialSplitHero`, `MonoEyebrow`, `ThreePillarBlock`, `CatalogTeaserGrid`, `ToolStrip`, `DisqualificationPanel`, `CaveatLayer`, `HubCTA`, `KitDownloadTable`, `FAQAccordion`, `ApplicationForm`, `Footer`.

### Backend

- `app/api/partners/apply/route.ts` — POST endpoint. Validates form input; sends email to admissions inbox; persists to `partner_applications` Supabase table.
- Supabase migration: `supabase/migrations/[timestamp]_create_partner_applications.sql` — schema for `partner_applications` table (5 fields + timestamps + UTM fields).

### PDF rendering pipeline

Build a pipeline that converts the kit markdown files (D19, D20, D21, D28, D31, L&D brief, kit-template/00, kit-template/10d, kit-template/13) into branded PDFs at canon §8.5 anatomy. Recommend: Puppeteer + custom HTML/CSS template that uses AESDR tokens. PDFs land at `public/partner-kit/[filename].pdf` and are linked from `/partners/kit`.

### Hard rules

1. **No invented content.** Every line of copy lifts from a named source in the spec. If the source doesn't have what you need, **stop and ask** the founder; do not invent.
2. **No clusters or groupings on the curriculum.** Production has 12 lessons. The hub has 12 lessons. Do not introduce "Foundations / Range / Identity" or any equivalent.
3. **No discount references.** Per Phase 0 #5. Sweep your work for `[PILOT_DISCOUNT]`, `[PILOT_CODE]`, "save you $," "promo code," "pilot pricing" — none of these appear on the hub.
4. **No founder visibility.** Per canon §12.1. No founder bio, photo, byline, or "from the founder" framing.
5. **No invented pilot stats.** No "X% completion rate," no "Y% conversion rate," no specific numbers that aren't in the spec or sourced from production data.
6. **No banned vocab.** Per canon §4.1. Zero tolerance.
7. **No imported icon libraries.** Per canon §6.5 + §6.8. Type-led visual system; seed-inventory glyphs only.
8. **No external dependencies beyond what's in `package.json`.** No new packages without founder approval.
9. **No new top-level routes outside `/partners/*`.** The hub lives entirely under `/partners`. Per-partner pages and replay pages are Phase 2 work.
10. **All tokens via `app/globals.css`.** No raw hex in component CSS. No new tokens introduced.
11. **Five-question check (canon §6.9.1) on every page** before commit. Self-administer; document the result in a comment at the top of each page file.
12. **Discount-doctrine cleanup is a separate batch.** Do not do it as part of this hub build. If you encounter a discount reference in a kit file you're rendering to PDF, render it as-is and note the cleanup need; flag it to the founder. The hub copy itself must be discount-free, but the kit PDFs are pre-existing artifacts that get cleaned up in their own batch.

### Annotation discipline

In every component file, add a top-of-file comment specifying:
- Which spec page or component it implements
- Which canon sections govern its register
- Which source files its copy lifts from (with line numbers where applicable)
- Five-question check status

Example:

```tsx
/**
 * Component: ThreePillarBlock
 * Spec: AESDR-PARTNER-HUB-SPEC.md §"Page 1.1" item 4
 * Canon: §1 (foundational doctrines), §6.3 (white-panel-on-cream pattern)
 * Copy sources:
 *   - Pillar 1: AFFILIATE_BRAND_CANON.md §1.1 (workshop-first)
 *   - Pillar 2: AFFILIATE_BRAND_CANON.md §1.5 (operator over guru)
 *   - Pillar 3: AFFILIATE_BRAND_CANON.md §1.6 (honesty discipline)
 * Five-question check: PASS (run during component author)
 */
```

---

## [5] EXAMPLES

### Canonical visual reference

`variants/variant-a-editorial-split.html` — the canonical editorial-split pattern. Hero, scenes, terminal, zoom cards, CTA. Use as the visual reference for the hub home's editorial-split hero.

### Brand-correct rendered HTML (lift register, not copy)

- `tools/rendered/04-d09-workshop-deck.html` — workshop deck with library-catalog teaser slide. Lift the catalog-teaser pattern.
- `tools/rendered/06-d26-partner-promo-page.html` — partner-promo page with editorial split hero, 4-of-12 catalog, FAQ-lite, application form pattern. **This is the closest existing precedent to the hub's `/partners` page.** Lift the structural pattern; rewrite the copy for the partner audience.
- `tools/rendered/08-d38-launch-hero.html` — homepage hero with three-pillar block. Lift the three-pillar pattern.
- `tools/rendered/05-d24-replay-page.html` — replay page with disqualification panel + Caveat layer + footer. Lift the disqualification panel + Caveat layer.

### Brand-correct copy register (from production)

- `app/syllabus/page.tsx` — the production syllabus's library catalog. Hero copy, hero subtext, and the per-lesson card register set the bar.
- `AFFILIATE_BRAND_CANON.md` §14 — the tagline pack. Use these verbatim where applicable.

### Off-brand examples (do not emulate)

- Any SaaS-affiliate-program landing page with hero copy like *"Earn passive income!"* / *"Top 1% earners get exclusive perks!"* / *"Join 10,000+ partners crushing their commissions!"*
- Any course-creator landing page that buries the disqualification block in 9pt gray footer text.

---

## [6] CONVERSATION HISTORY

The relevant prior context from this codebase (you can verify in `git log` and `SESSION_STATE.md`):

- **Batches 1–8** (April 29 – May 2, 2026): shipped all 40 D-numbered partner deliverables plus 9 sub-deliverables (8 kit-template files + L&D-approver brief).
- **Batch 7.5** cleanup: kit-template subfiles, cross-reference patches, 00-INDEX.
- **Render batch**: 8 visible-canon artifacts at `tools/rendered/`.
- **Batch 7.6**: curriculum-map rewrite to match production reality. Anchored to `app/syllabus/page.tsx`. Killed invented "Foundations / Range / Identity" cluster taxonomy.
- **Build fix** (commit `59a9ea6`): excluded `.figma.ts` and `design-canon/` from tsconfig — Vercel builds were failing on pre-existing branch state.
- **Phase 0 ratification** (this conversation): six hub-build inputs locked.

You wrote the hub spec at `docs/partner/AESDR-PARTNER-HUB-SPEC.md` in this conversation. Re-read it before starting; do not rewrite it.

You have made specific mistakes in this codebase that the founder corrected:
- Invented curriculum content (corrected in Batch 7.6).
- Used "ship as PDF/markdown" framing (corrected this conversation — markdown is never partner-facing).
- Wrote sage L&D-brief titles (corrected this conversation — sharper register required).
- Did not check production-app code before claiming "operationally pending" on items already in production (the 5 tools, the 2 artifacts).

Do not repeat those mistakes.

---

## [7] IMMEDIATE TASK

**Build Phase 1 of the AESDR Partner Hub** per the spec.

Deliverables expected from you:

1. Six Next.js pages at `app/partners/*/page.tsx` per spec §"Phase 1."
2. Reusable React components at `components/partners/` per spec §"Component library."
3. One API route at `app/api/partners/apply/route.ts`.
4. One Supabase migration creating the `partner_applications` table.
5. PDF rendering pipeline producing branded PDFs from kit markdown files into `public/partner-kit/`.
6. Updated `app/sitemap.ts` to include hub routes.
7. A commit per page (or per logical chunk), with descriptive commit messages following the prior batch register.
8. A summary at the end of your work: what shipped, what's pending, what needs founder review.

**Do this in three sub-batches, in order:**

**Sub-batch A — Foundation:**
- Components library (`components/partners/`).
- Supabase migration.
- API route.
- PDF rendering pipeline.
- Sitemap update.

**Sub-batch B — Pages 1.1, 1.2, 1.3 (the three highest-leverage pages):**
- `/partners` (hub home).
- `/partners/program`.
- `/partners/curriculum`.

**Sub-batch C — Pages 1.4, 1.5, 1.6:**
- `/partners/kit`.
- `/partners/faq`.
- `/partners/apply`.

After each sub-batch: commit, push, summarize. Wait for founder confirmation before starting the next sub-batch.

**Branch:** Continue on `affiliate-seeding` (where the kit lives). When Phase 1 is complete and reviewed, the hub-specific paths (`app/partners/*`, `components/partners/*`, `app/api/partners/*`, `supabase/migrations/*partner*`, `public/partner-kit/*`) get cherry-picked to `main` for production deploy. Do NOT bulk-merge `affiliate-seeding` into `main`.

**Do not start writing code until you have:**
1. Read every file in §"Background data" §3.
2. Verified the spec is current (no founder edits since last commit).
3. Run `npm run build` locally to confirm the existing build passes.
4. Surfaced any open questions to the founder in writing.

---

## [8] THINKING DIRECTIVE

Before writing any code, think step by step:

1. **What's the source of truth for each piece of copy?** For every line you'll write on every page, identify the source file. If the source file doesn't have it, surface the gap to the founder before fabricating.

2. **Where does the founder-backstage doctrine break the typical course-creator hub pattern?** Most affiliate hubs lead with founder credibility ("founded by [name], former VP at [company]"). AESDR doesn't. What's the equivalent credibility surface that respects canon §12.1? Answer: the canon itself, the curriculum (real production lessons), the 5 tools (real production HTML), and the application form (real first-call commitment). The brand-of-record carries weight; the founder doesn't appear.

3. **What's the partner's first 60 seconds on `/partners` going to feel like?** They land. They scan. They scroll. They form an opinion in 60 seconds about whether AESDR is operationally serious. What does the page need to communicate in those 60 seconds? Per canon §1.4 (borrowed-trust as merciless mirror), this is the highest-leverage moment in the entire build.

4. **What's the difference between this hub and a Profit Pillars / Afford Anything-style hub?** The genre conventions are: hero, value prop, kit downloads, FAQ, application form. AESDR's hub uses those conventions but inverts several of them — the disqualification panel is at hero-equal hierarchy, the kit downloads come before the application form (most hubs gate the kit), the canon-doctrine pages are first-class navigation items (most hubs hide the operating doctrine). Why? Because canon §1.4 says borrowed trust is a merciless mirror — you cannot hide the operating model from a partner who's evaluating you, so you publish it.

5. **What can break partner relationships if you're careless?**
   - Hub copy that reads as marketing-affiliate-program register (canon §5 violation; partner notices in 30 seconds).
   - Hub claims that aren't substantiable (canon §10.3 forbidden claims; legal exposure).
   - Hub that surfaces founder-name without ratification (canon §12 breach).
   - Hub that publishes pricing variability when policy is no-discounts-ever (Phase 0 #5 breach; downstream confusion).
   - Hub copy that reads as sanitized-corporate (canon §1.5 violation; partner reads as inauthentic).
   - Hub that ships before the discount-doctrine cleanup batch lands and references `[PILOT_CODE]` somewhere (consistency breach).

6. **What's the shipping criteria?**
   - Five-question check passes on every page.
   - PDF rendering pipeline produces real PDFs (not "request access" gates).
   - Application form posts to a real admissions inbox (not a placeholder).
   - All copy traceable to a source file in this repo.
   - Local `npm run build` passes.
   - Founder reviews before merge.

7. **What's the most-impactful single decision you'll make on this build?**
   The disqualification panel placement. Most affiliate hubs hide who shouldn't apply. AESDR's hub puts it at hero-equal hierarchy on `/partners` and as a dedicated `/partners/who-we-don't-work-with` page in Phase 3. This is the brand-doctrine move that distinguishes AESDR's hub from any competing course-creator affiliate hub. Get this right; everything else is easier.

---

## [9] OUTPUT FORMATTING

After the work, produce a final summary in this shape:

**Verdict:** [single line — what shipped, what didn't]

**Sub-batch A summary** [3–5 lines]
**Sub-batch B summary** [3–5 lines]
**Sub-batch C summary** [3–5 lines]

**What shipped to the repo (table):**
| File | Status | Five-question check |
|---|---|---|
| ... | ... | ... |

**What's still operationally pending (table):**
| Item | Owner | Blocker |
|---|---|---|
| ... | ... | ... |

**Open questions raised during build (table):**
| Question | Recommended default | Founder decision needed by |
|---|---|---|
| ... | ... | ... |

**What I did NOT do (table):**
| Out of scope | Why | Where it goes |
|---|---|---|
| ... | ... | ... |

Working notes during the build live as code comments in the files you touch. They do not appear in the chat unless explicitly asked.

---

## [10] PREFILLED RESPONSE

Begin your work with:

> **Acknowledged. Reading source files before writing.** [Then list every file from §3 you've read, in order.]
>
> **Spec status: confirmed current at commit [HASH].**
>
> **Open questions surfaced before sub-batch A begins:**
> [List any open questions from §"Open questions" in the spec or new ones you've identified.]
>
> **Standing by for founder confirmation to start sub-batch A.**

Do not begin sub-batch A until the founder confirms after reviewing your open questions.

---

## END OF PROMPT

Founder edits this document, replaces `[FOUNDER_TO_FILL]` items, strikes anything that doesn't belong, then commits. Claude works from the committed version. Do not work from this draft until the founder has approved it.

---

## [FOUNDER_TO_FILL] — items requiring founder edit before send

| Section | Item | Default suggestion |
|---|---|---|
| §1 Task context | None — already complete | — |
| §2 Tone context | Add any tone failure mode you've spotted that I haven't named | — |
| §3 Background | Add any reference URL or file you want me to read | — |
| §4 Hard rules | Add any rule you want enforced | — |
| §7 Immediate task | Confirm sub-batch order; confirm "wait for founder confirmation between sub-batches" gate | Recommend: keep gate as-is |
| §8 Thinking directive | Add any thinking question you want me to surface | — |
| §10 Prefilled response | Add or remove the open-questions list as you see fit | — |

---

*End of build prompt draft.*
