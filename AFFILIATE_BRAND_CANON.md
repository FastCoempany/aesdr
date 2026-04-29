# AESDR — Affiliate & Partner Brand Canon

**Version:** 1.0
**Effective:** 2026-04-29
**Scope:** All collateral, copy, design, delivery, and conduct produced for or seen by *partner audiences* — i.e., audiences AESDR borrows from operators, coaches, alumni networks, communities, and creators. Does **not** govern the AESDR-direct funnel (`app/page.tsx`, the role-fork, etc.) — that lives under `AGENTS.md` and `SESSION_STATE.md`. When the two overlap (e.g., pricing, palette, type stack), this doc inherits and never contradicts.

**Source-of-truth dependencies:**
- `AGENTS.md` — palette + type tokens (binding)
- `app/globals.css` — token values (binding)
- `components/LandingSequence.module.css` — production reference for editorial layout
- `variants/variant-a-editorial-split.html` — canonical editorial split layout
- `affiliate-seeding-deep-research-report.md` — operational rationale for the partner ecosystem

If those move, this doc moves with them.

---

## 1. Foundational doctrines

These are non-negotiable. Every deliverable in the affiliate ecosystem must defend them or it doesn't ship.

### 1.1 Workshop-first, not link-first
We do not hand a partner a tracked link and a coupon and call it an affiliate program. Every pilot leads with a single live workshop into the partner's audience, run by AESDR. The workshop earns the sale; the link merely attributes it. Rationale and pass criteria: see `affiliate-seeding-deep-research-report.md` §Workshop-first pilot.

### 1.2 Founder backstage, host-fronted
The founder is invisible to the audience by default, occasionally visible by choice. The founder is fully visible to partners, operators, vendors, and legal. A contracted **host** delivers workshops on AESDR's behalf. The brand is character-led, not founder-led — Rowan and Michael are the canon faces, not any one human.

### 1.3 Less affiliate empire, more founding vineyard
Small rows. Careful pruning. Honest yield. We recruit a handful of tightly aligned partners, not a marketplace. Volume is not a virtue here; conversion quality is.

### 1.4 Borrowed trust is a merciless mirror
Whatever weakness exists in our message, page, deck, or follow-up, a partner's audience will surface in 60 minutes. Therefore: do not borrow trust we have not earned the right to spend. Launch gates in the report are the floor, not the goal.

### 1.5 Operator over guru
We are the operating manual, not the motivation engine. We do not perform expertise; we install it. If a piece of copy could be lifted onto a LinkedIn carousel without anyone noticing, it is wrong.

### 1.6 Honesty is the differentiator
We say out loud what competitors won't: who should not buy, where the math breaks, what happens when the script runs out. Honesty is not a tone. It is a competitive position.

---

## 2. Brand position (affiliate variant)

A borrowed audience has 60 minutes and zero trust. Position must land in 10 seconds.

| Field | Canon |
|---|---|
| What AESDR is | The operating manual for early-career SaaS sales, not the motivation engine. |
| Who it's for | First-1-to-2-year SDRs and AEs in startup SaaS who're serious about controlling chaos, managing toxic leadership, protecting their commission, and their future. (Also: SDR managers buying for ramp.) |
| Who it's explicitly not for | People looking for motivational content, automated shortcuts, LinkedIn polish, badge-hustle, certification clout, or anything that smells like a guru course. |
| Structural promise | 12 lessons. 5 takeaway tools. Lifetime access. Discord ("Untamed"). 14-day refund. |
| Delivery format | Self-paced, interactive, field-tested. Not video lectures. Not motivation. |
| Pricing (current canon) | $249 SDR · $299 AE · $1,499 Team (up to 10 seats). One-time, lifetime access. |
| Authority frame | Built by people who carried bags and managed AEs/SDRs for 10+ years. Authority lives in the brand and the host, never in a named founder. |
| Tonal stance | Confessional + verdict. We name the mess (Michael) and rule on it (Rowan). |

**The structural promise is non-negotiable in copy.** If a partner-facing asset says "8 lessons" or "12-month access" or "$199," it's wrong. Update the canon first, then the copy. Never the other way around.

---

## 3. The two voices

AESDR is character-driven. Two voices, always present, never blended into mush. Both must show up across the affiliate ecosystem — the mockup `public/mockups/09-the-two-voices.html` and the production zoom cards in `variants/variant-a-editorial-split.html` are the canonical references.

### 3.1 Rowan — the voice that closes
- **Spirit:** Eli Pope. Surgical, declarative, high-status. Treats environment, behavior, math, and identity as infrastructure.
- **Type:** `var(--cond)` (Barlow Condensed, 800–900wt, uppercase) for display. `var(--display)` italic for headline use.
- **Color:** `var(--ink)` on `var(--cream)`, or white on `var(--crimson)`.
- **Sentence shape:** Short. Verdict-shaped. Often three beats: observation → diagnosis → instruction.
- **Recurring move:** "We do not teach you X. We teach you to be the person who X."
- **Recurring move:** "X is not Y. It is Z." (Reframe via demotion or promotion.)
- **Canonical lines (do not improvise around these without reason):**
  > *"Every month, they reset your number to zero."*
  > *"You are not building a career. You are surviving one."*
  > *"Your onboarding was a crime scene."*
  > *"The people advising you haven't carried a bag in a decade."*

### 3.2 Michael — the voice at 2am
- **Spirit:** Michael Scott. Confessional, deadpan, embarrassingly specific. Names the laundry pile. Quotes the bad number. Closes with a one-word punchline.
- **Type:** `var(--hand)` (Caveat) — and only Caveat. Per `AGENTS.md`: *"Michael's voice / margin annotations only."* No other use of Caveat exists.
- **Color:** `var(--crimson)` on cream surfaces. (Do not use amber. The two-voices mockup used amber; production canon uses crimson.)
- **Sentence shape:** Specific number → context → punchline. Often "I [did embarrassing thing]. [Beat]. [One-word verdict]."
- **Recurring move:** Real numbers. Real props. Named items. ("$8,200." "Gerald the laundry pile." "Salsa rankings.")
- **Canonical lines:**
  > *"My manager asked for a pipeline update. I sent a screenshot of an empty spreadsheet and wrote 'minimalist aesthetic.' He did not laugh. HR laughed. But like, in a concerned way."*
  > *"LinkedIn told me to 'lead with value on every call.' So I told a prospect about a really good taco place near their office. Very detailed review. Salsa rankings. They did not buy. But the tacos are genuinely excellent. I stand by the recommendation."*
  > *"I have a degree. From a university. With a campus."*

### 3.3 Voice ratios in the affiliate ecosystem

| Surface | Rowan : Michael | Notes |
|---|---|---|
| Outreach DM/email to partner | 80 : 20 | Operator-to-operator. Michael earns 1 line, max. |
| Workshop registration page | 70 : 30 | Rowan does the headline + outcomes; Michael handles the "who is this not for" block. |
| Workshop deck — locked sections | 75 : 25 | Frameworks in Rowan; opener and "real talk" interlude in Michael. |
| Workshop deck — host ad-lib zones | 50 : 50 | Host's natural mix, within the rails. |
| Confirmation / reminder emails | 70 : 30 | Calm Rowan body, Michael in the PS line. |
| Replay email + page | 60 : 40 | Michael earns more space because trust is decaying. |
| Objection email ("free vs structured") | 80 : 20 | Verdict mode. Michael as the punchline. |
| Deadline email | 80 : 20 | "Who should not buy" honesty in Rowan's voice. |
| Disclosure copy | 100 : 0 | Compliance is plain. No voice. |
| Legal / partner agreement | 100 : 0 | Plain English; Rowan-adjacent only in preamble. |
| Internal docs (canon, scorecards, briefs) | 90 : 10 | This very document is canon-format. |

### 3.4 Banned voice moves
- Blending the voices into a single neutral marketing tone. They must remain distinguishable on the page.
- Putting Michael in display type bigger than Rowan. He's the margin, never the masthead.
- Letting Rowan crack jokes. Rowan is funny by being severe; he does not perform.
- Using Caveat for anything other than Michael's voice or hand-drawn margin annotations.
- Quoting "iconic" Rowan/Eli or Michael Scott lines from the source material verbatim. They're inspirations, not assets.

---

## 4. Voice & tone rules

### 4.1 Banned vocabulary (zero tolerance)
These words and phrases never appear in any AESDR-or-AESDR-adjacent surface, including partner-promo copy, host scripts, social posts the partner makes about us, or anything we approve.

- "Crush it" / "crushing it" / "crush your quota"
- "Game-changer" / "game-changing"
- "Unlock your potential"
- "Mindset"
- "Rise and grind" / "grindset" / "hustle culture"
- "Thought leader" / "thought leadership"
- "Lead with value" / "trusted advisor" *(both are explicitly mocked in canon — see zoom card 4 and 5)*
- "Synergy" / "leverage" (as a verb)
- "Amazing" / "incredible" / "game-changer" / any unearned superlative
- "Empower" / "empowerment"
- "Sales superstar" / "rockstar" / "ninja"
- "Crush your number this quarter"
- Generic hype emojis (🚀💪🔥) anywhere that bears the AESDR mark

If a partner uses these in their own promotion, we ask for an edit. If they refuse, we end the pilot. This is not pickiness; it is positioning.

### 4.2 Required signature moves
Each major surface should carry at least one of these structural fingerprints, otherwise it doesn't read as AESDR.

- **The verdict construction.** "X is not [thing it pretends to be]. It is [what it actually is]." Example: *"Your commission check is not income. It is a verdict on how you lived the last 30 days."*
- **The named number.** Specific dollar amounts, specific call counts, specific timelines. Never "many" or "a lot." Michael's voice especially.
- **The honest disqualification.** Every offer-bearing surface names who should not buy.
- **The "we do not teach you X, we teach you to be the person who X" reframe.** Identity over technique.
- **The cream-and-crimson visual fingerprint.** If you can't tell at thumbnail size that an asset is AESDR, it's wrong.

### 4.3 Sentence rhythm
- Default cadence is short. Three to twelve words. Beat. Then a longer one. Then a beat.
- Em-dashes are fine. Semicolons sparingly. Bullet lists earn their keep or get demoted to sentences.
- No filler intros ("In today's fast-paced sales environment..."). No throat-clearing.
- Subject lines: 4–8 words. No "Re:" tricks. No emoji.

### 4.4 Subject-line discipline
- Lowercase and title case both allowed; never ALL CAPS.
- No clickbait curiosity gaps (`"You won't believe..."`).
- The subject is a contract with the body. If the body doesn't deliver on it inside the first sentence, the subject is wrong.
- A good test: if you read 12 of our subject lines side by side with 12 LinkedIn-influencer subject lines, ours should look colder, plainer, and more specific.

---

## 5. Anti-LinkedIn / anti-cliché doctrine

This is not a tonal preference. It is the brand's spine.

### 5.1 What we believe about LinkedIn
LinkedIn is where SaaS sales advice goes to be performed by people who haven't carried a quota in a decade. It rewards confidence over competence and formatting over thinking. The audience we want is the audience LinkedIn has already failed.

### 5.2 LinkedIn as a channel
- **Not a primary channel.** We do not run the affiliate ecosystem on LinkedIn. We do not optimize copy for LinkedIn. We do not coach partners to "post a carousel."
- **Permitted use:** manual, semi-manual, high-intent follow-up to specific named individuals. One human writing to one human. No automation. No spray.
- **Forbidden use:** boosted posts, sponsored campaigns, partner-driven LinkedIn-as-primary push, "thought leadership" content from any AESDR-affiliated mouth. If a partner's primary distribution is LinkedIn, that's a fit signal we should re-examine before piloting.

### 5.3 SaaS-norm clichés we counter-position against
We are not neutral on these — we mock them in canon. If our copy starts to sound like them, we've lost.

| Cliché we reject | Why we reject it | What we say instead |
|---|---|---|
| "Just add value" | Empty instruction. Doesn't tell anyone what to do. | Specific frameworks, named tools, real activity. |
| "Be a trusted advisor" | A title nobody can confer on themselves. | Earn judgment through reps; we install the judgment. |
| "Crush it" | Performance theater. | Survive the month. Carry the math. |
| "Sales is a mindset" | It's a craft. Mindset is the consolation prize for people who haven't learned the craft. | Sales is operating judgment under pressure. |
| "Always be closing" | A line from a movie about people we wouldn't hire. | Always be qualifying. Sometimes be closing. |
| Motivational quote graphics | Aesthetic surrender. | Frameworks, redacted dossiers, terminal output, tools. |
| "Hustle harder" | A shame engine, not advice. | The math is the math. Activity is the floor, not the ceiling. |

### 5.4 The LinkedIn taco-place test
Canon includes the line: *"LinkedIn told me to 'lead with value on every call.' So I told a prospect about a really good taco place near their office..."* That joke is a load-bearing brand artifact. Any copy or training that would have advised that rep to "lead with value" without telling them what to actually say is the thing AESDR exists to replace.

### 5.5 The "no guru energy" pledge
On every public-facing surface where it fits, we explicitly say what we are not:
- *"No motivational BS. No 'crush your quota' energy. Just practical frameworks."* (canon, from `variants/variant-a-editorial-split.html`)
- This is not optional brand garnish. It is the recurring proof that we know what genre we are *against*.

---

## 6. Visual system (affiliate scope)

Inherits from `AGENTS.md`. Where this section says something `AGENTS.md` does not, this section is additive (specific to affiliate ecosystem) but never contradicts it.

### 6.1 Palette (binding)

| Token | Hex | Use in affiliate ecosystem |
|---|---|---|
| `--cream` | `#FAF7F2` | Default background — every page, every PDF, every deck slide unless an exception is named. |
| `--ink` | `#1A1A1A` | Default body text. Default Rowan display color. |
| `--crimson` | `#8B1A1A` | Primary accent. CTA panels (e.g., closing slide, registration hero-left), Michael's voice color, terminal cursors. |
| `--muted` | `#6B6B6B` | Secondary text, mono labels, rules-and-fine-print. |
| `--light` | `#E8E4DF` | Borders, dividers, low-emphasis cards, terminal box border on cream. |
| `--iris` | gradient | **Reserved.** See 6.4. |

**Retired and forbidden:** the dark palette (`#020617`, `#0F172A`, `#1E293B`, `#10B981 --theme`, `#EF4444 --coral`, `#38BDF8 --cobalt`, `#F59E0B --amber`, `#8B5CF6 --violet` as primary surfaces). Per `AGENTS.md`. Do not revive these for partner collateral, partner-promo pages, decks, or social.

**If a request seems to call for a dark surface** (terminal block, "classified" panel): render it as `--ink` text on `--cream` with `--mono`, or as a small inset block bordered with `--light`. See `variants/variant-a-editorial-split.html` `.terminal` and `.term-box` for the canonical pattern.

### 6.2 Typography (binding)

| Token | Stack | Use |
|---|---|---|
| `--display` | Playfair Display, Georgia, serif | Headlines (italic 900wt is the signature), big brand wordmarks, masthead-level type. |
| `--serif` | Source Serif 4, Georgia, serif | All body copy. |
| `--cond` | Barlow Condensed, sans-serif | Rowan's voice in display, UI labels, button text, eyebrow labels (uppercase, letter-spacing .03–.15em). |
| `--mono` | Space Mono, monospace | Terminal blocks, classified labels, taxonomic labels, "REDACTED — hover to peek" stamps, mono-label eyebrows (10px, letter-spacing .25em, uppercase). |
| `--hand` | Caveat, cursive | Michael's voice. **And only Michael's voice.** Margin annotations and zoom-card asides. |

**Forbidden fonts in affiliate scope:** JetBrains Mono, Inter, Roboto, Open Sans, Lora, anything not named above. If a partner template requires a different font (e.g., a partner's CMS), we negotiate or we don't ship there.

### 6.3 Layout patterns (canonical)

Affiliate-ecosystem deliverables should reuse these recognized patterns from production. Don't invent new ones casually.

- **Editorial split hero** — `crimson 50%` left / `cream 50%` right, `--display` italic 900 headline on cream side, mono eyebrow label, ghost numeral (`300px display 900`, opacity .06) bottom-right of crimson side. Reference: `.hero` / `.hero-left` / `.hero-right` in `variant-a-editorial-split.html`.
- **Corner brackets** — `20px × 20px`, `1px` borders at `rgba(0,0,0,0.06)`, on cream panels. Subtle, technical, dossier-coded. Reference: `.corner` in same file.
- **Ambient iris line** — `1px` iris gradient at the bottom of cream panels, opacity `.15`, animated 4s shimmer. The brand's heartbeat. Reference: `.ambient-line`.
- **Warning box** — `1px` white border at `.2` opacity on crimson surface, mono eyebrow with circle-icon, body in `--serif`. Used for "Content Warning" framing. Reference: `.warn-box`.
- **Terminal block on cream** — bordered box with three colored dots, mono prompt lines, iris-text payoff line. Reference: `.terminal` / `.term-box` (re-render the dark version as cream-on-ink).
- **Ghost numeral** — huge faded display digit behind a piece of content (opacity .03 to .06). Used in hero, zoom cards, and pricing.
- **Classified card** — blurred body text that unblurs on hover, `[CLASSIFIED — HOVER TO PEEK]` mono stamp, rotated `-2deg` "Classified" stamp at bottom. Reference: `.faq-item` / `.faq-blur` / `.faq-redact` / `.faq-stamp`.
- **Deck-stack peel** — wheel-driven 12-card stack with iris numeral, condensed title, handwritten Caveat description in crimson. Reference: `.deck-card`.

### 6.4 Iris gradient — reservation rules

`--iris` is the brand's heartbeat. It is rare on purpose. Permitted uses only:

- The brand wordmark "AESDR" in display type.
- The single primary CTA per surface (typically `.btn-iris`).
- Role tokens that distinguish AE vs SDR.
- Thin animated lines as ambient signals (`.ambient-line`, `.scroll-progress`, `1px` to `2px` height max).
- Iris-text payoff lines (one per surface — e.g., the terminal output line).

Forbidden iris uses:
- Headlines (use `--ink` italic display; iris text is for accent words inside a headline, not whole headlines).
- Backgrounds (no iris fills as panel or card backgrounds).
- Multiple CTAs on the same surface (one iris CTA per page; secondary CTAs use `.btn-outline`).
- Decorative flourishes (no iris swirls, blobs, halos).

### 6.5 Photography & iconography
- **Default: no photography.** AESDR's visual signature is typographic. If imagery is needed, prefer abstract editorial layout (ghost numerals, terminal blocks, redacted text) over stock.
- **No stock photos of:** people in headsets, handshake closeups, generic "team" shots, fake server rooms, suits at whiteboards, men pointing at floating dashboards.
- **No icon sets.** No Heroicons, Feather, FontAwesome, Lucide. If an "icon" is genuinely needed, use a 1px-stroke geometric primitive sized to the type (the warning circle in `.warn-icon` is the canonical example).
- **The Turtle.** When the existing AESDR turtle artwork is used (mobile gate, etc.), it stays in the same color treatment as production. It does not appear on partner collateral by default. (Open question: whether the turtle gets a partner-context appearance. Resolve before first deck.)

### 6.6 Partner co-branding zone
- **Lockup placement:** "AESDR × [partner]" lockup goes top-center of partner-specific landing pages, top-left of partner-specific decks, footer-only on emails.
- **Lockup syntax:** `AESDR` in `--display` italic 900, `×` in `--mono` 12px, partner mark at matched x-height. No "presented by," no "in association with," no "powered by."
- **Color:** `AESDR` in `--ink`. Partner mark in their canonical color (we are not opinionated about theirs).
- **Spacing:** minimum 24px clearspace around the lockup; never inside a colored panel that fights the partner's brand.
- **Approval:** Every co-branded asset requires partner approval before publish. Captured in writing in the pilot agreement.

### 6.7 File and asset naming
Partner-facing assets follow this convention so they survive a year of folder rot.

```
aesdr--<partner-slug>--<asset-type>--v<n>.<ext>
```

Examples:
- `aesdr--apex-bdr-club--registration-page--v1.html`
- `aesdr--apex-bdr-club--workshop-deck--v3.pdf`
- `aesdr--apex-bdr-club--reminder-email--24h--v1.mjml`

Assets that are partner-agnostic (templates, brand canon, etc.) replace `<partner-slug>` with `template`.

---

## 7. Delivery standards

### 7.1 Workshop format (canon)
- **Total length:** 45–55 minutes of teaching, 10–15 minutes Q&A, 5 minutes offer + close. Cap 75 minutes including Q&A.
- **Live cadence:** real-time, not pre-recorded. A pre-recorded "live" is a lie and we do not run them.
- **Partner intro:** ≤ 2 minutes. Partner sets context, hands to host. Host does not handle the partner intro themselves.
- **Host opener (locked):** brand-introduction beat, who-this-is-for / who-this-is-not-for filter, three outcomes attendees will leave with. Same opener every workshop. ~3 minutes.
- **Body:** 7-segment agenda from the report (§Workshop-first pilot). One framework, one self-assessment, one "startup reality" segment, one offer.
- **Single CTA:** one offer per workshop. No "and also" upsell. No "if you're interested in something else..." Either checkout or application — not both — unless price tier explicitly justifies both.
- **Replay window:** 48–72 hours. Hard cutoff. The replay page expires; it does not silently 404.

### 7.2 Host casting profile

A host is being hired to *carry the brand*, not deliver a script. Casting bar:

- **Voice match:** can hold both Rowan (declarative, surgical) and Michael (specific, deadpan) without one collapsing into the other. Audition test: read the canonical lines in §3.1 and §3.2 cold; we should hear two distinct registers.
- **Authority signal:** real SDR-to-AE-to-Manager pattern in their background. Minimum 5 years in startup SaaS sales, ideally 8+. They've missed quota at least once, and they can talk about it.
- **Camera comfort:** can run a 60-minute live without losing the room. Comfortable with chat moderation, comfortable being interrupted by Q&A, comfortable with a co-host.
- **Anti-guru disposition:** if they have a personal brand built on motivational LinkedIn content, they fail the audition by default. If they have a personal brand built on dry, technical, useful content, they pass.
- **Replaceability:** the host must be willing to be replaced. The brand outlives them. Not a hero hire.

### 7.3 Locked vs ad-lib zones in the deck
Every workshop deck has clearly marked sections. The contract makes this explicit.

| Zone | Status | Example |
|---|---|---|
| Brand opener | **Locked verbatim** | Same intro every time. |
| Outcome-promise slide | **Locked verbatim** | Three outcomes attendees leave with. |
| Framework slide | **Locked diagram + lockable narration** | Host can paraphrase the explanation but cannot change the framework. |
| Self-assessment slide | **Locked questions** | Questions are canon; framing is host. |
| "Startup reality" interlude | **Ad-lib zone** | Host's own war story, within the brand-voice rails. |
| Offer slide | **Locked verbatim** | Pricing, deadline, refund language, CTA. |
| Q&A | **Ad-lib** | Host fields freely; founder shadow-listens. |
| Close | **Locked verbatim** | Same close every time. |

### 7.4 Attendee experience standards
- **Registration:** 2 fields max — email, role (SDR / AE / Manager / Other). No phone unless SMS consent is being captured separately and explicitly. No "company size" "intent" or marketing-funnel questions.
- **Confirmation:** sent within 60 seconds of registration. Calendar attachment included. Branded shell.
- **Reminders:** 24h email + (if SMS-consented) 3h SMS. Both branded. Both link to the join URL.
- **Live chat:** moderated by an AESDR contractor (not the partner unless they request it). Founder may lurk under an alias.
- **Offer at close:** linked at the close, repeated in the same-day follow-up email, repeated on the replay page above the fold.
- **Replay:** gated link, 48–72h, summary above the fold, single CTA.

### 7.5 Email shell standards
- Every email has: AESDR wordmark header (cream background, ink type), single iris CTA, postal address footer, working unsubscribe, plain-text fallback.
- Sender name: `AESDR Workshop` (not a personal name) for transactional and reminder; host's name only on the same-day attendee follow-up where personal voice helps.
- Subject lines per §4.4. No emoji. No tracking-pixel theatrics.

### 7.6 SMS standards
- Used only when the registrant has given explicit consent on the registration form, with a checkbox separate from the email-opt-in.
- Per the report's §Deals/Compliance: seller-specific consent, not a "we and our partners may text you" mush. The seller of record on the consent line is AESDR.
- Length ≤ 160 characters where possible. Plain. No emoji. Always include a `STOP to opt out` line.

### 7.7 Calendar invite cover
- 1280×720 cover image: cream background, AESDR wordmark, partner lockup if co-branded, mono workshop title, iris ambient line at bottom.
- The invite description is plain text, not a marketing email. Host's first name + role, link to add to calendar, link to ask questions.

---

## 8. Structural standards

### 8.1 Page anatomy — registration page (canon)

Top to bottom:
1. Mono eyebrow label: `AESDR · WORKSHOP · [partner slug]`
2. Editorial split hero: crimson left (warning-box framing), cream right (display italic headline + serif body + iris CTA + outline secondary).
3. Three outcomes block: Rowan-voice, three short bullets, mono numbering `01 / 02 / 03`.
4. "Who this is for" / "Who this is not for" two-column block. The not-for column is mandatory.
5. Host stub (instructor bio): name, role, one sentence, no photo unless host approves their likeness for ecosystem use.
6. Registration form: 2 fields, single iris button.
7. FAQ-lite: 4 questions max — refund, time commitment, format, replay.
8. Footer: postal, partner co-brand mark, disclosure language, year.

### 8.2 Page anatomy — replay page
- Cream background, ink type. Replay player frame in `--light` border.
- Above the fold: 1-line workshop summary, single iris CTA, expiry timestamp in mono (e.g., `expires · 2026-05-12 · 23:59 ET`).
- Below the player: 3-bullet "what you saw" recap, single iris CTA repeated, "Who should not buy" honesty card.

### 8.3 Page anatomy — partner-promo page
- Lockup top-center.
- Hero references the partner audience ("for [partner audience descriptor]") in serif body, not in headline. Headline stays AESDR-canonical.
- Partner quote slot: optional pull-quote in `--display` italic 36px, attributed to the partner operator. Quote must pass disclosure requirements.
- Hidden attribution fields in the form: `partner_id`, `partner_type`, `cohort_id`, plus standard UTMs.
- The pricing-tier table from `variants/variant-a-editorial-split.html` lifts here verbatim (or near-verbatim with partner-promo overlay if a code applies).

### 8.4 Email anatomy
| Slot | Content |
|---|---|
| Pre-header | One sentence preview that doesn't repeat the subject. |
| Header | AESDR wordmark on `--cream`, optional `× [partner]` lockup. |
| Body | Single column, max 600px wide, `--serif` 16px, line-height 1.6. |
| CTA | One iris button, centered. |
| PS | Optional. Where Michael's voice lives in transactional emails. |
| Footer | Postal address (CAN-SPAM), unsubscribe link, mono brand-line. |

### 8.5 PDF anatomy (one-pagers, briefs, scorecards)
- Letter or A4 cream background.
- 24mm margins.
- Mono eyebrow at top: `AESDR · [doc type] · v[n]`.
- `--display` italic headline.
- `--serif` body. Tables in `--cond` headers, `--serif` body.
- Footer: page number in mono, postal address, "© AESDR 2026" in mono.

### 8.6 Deck anatomy
- 16:9, cream background, ink type by default.
- Title cards: editorial split (crimson left, cream right) with ghost numeral.
- Framework slides: white panels on cream with `--light` border, mono labels, `--cond` titles.
- Self-assessment slides: question in display italic, response prompts in serif.
- Real-talk interlude (Michael's slide): cream background, Caveat in crimson at clamp(28px, 4vw, 48px), centered, no other elements.
- Offer slide: crimson background, white type, single iris CTA, deadline in mono.
- Close slide: AESDR wordmark in display italic 200px on cream, mono tagline below.

### 8.7 UTM canon
Every link from any partner-affiliated surface uses these fields. No exceptions.

| Field | Value pattern | Example |
|---|---|---|
| `utm_source` | `<partner-slug>` (lowercase, hyphenated) | `apex-bdr-club` |
| `utm_medium` | `partner` | `partner` |
| `utm_campaign` | `<workshop-slug>` | `pilot-2026-05` |
| `utm_content` | `<asset-type>` | `email-24h`, `replay-page`, `dm-1` |
| `utm_term` | `<role>` if known, else omit | `sdr`, `ae`, `manager` |
| `partner_id` | internal stable ID | `p_001` |
| `partner_type` | `community` / `coach` / `creator` / `alumni` / `hybrid` | `coach` |
| `cohort_id` | per-pilot ID | `c_2026-05-apex` |

UTMs are appended in this order, always. Partner_id, partner_type, cohort_id ride as additional query params (not UTMs proper) so analytics tools don't truncate.

### 8.8 Attribution windows
- Default: 30-day cookie window from first qualifying click.
- Refund treatment: commission paid on net revenue after refunds. (Per the agreement template; this canon affirms but legal owns.)
- Coupon-stacking rule: if a partner code is applied, the partner is the attributed source, regardless of last-click.

---

## 9. Behavioral psychology canon

The moves we use, the moves we don't, and why each.

### 9.1 Moves we use deliberately

- **Counter-positioning.** We define ourselves *against* a clearly named genre (LinkedIn-guru SaaS sales content). Counter-positioning is sharper than positioning because the audience already has the contrast in their head. Every surface should be intelligible to someone whose first thought is "ugh, not another sales course."
- **Specificity over scale.** Real numbers move people more than big numbers. `$8,200` lands harder than "six figures." `47 dials, 3 connects` lands harder than "lots of activity." The canon is full of named amounts, named props, named counts. We never round when we can be specific.
- **Confessional credibility (Michael).** Trust is granted faster to a voice that admits the embarrassing thing first. Michael's job in every funnel is to lower the audience's defenses so Rowan can deliver the verdict without sounding preachy.
- **Verdict framing (Rowan).** High-status declarative statements work because they don't argue. They state. The audience either agrees and feels seen, or disagrees and gets curious. Either way, attention.
- **Identity over technique.** "We do not teach you to sell. We teach you to be the person who sells." Identity-shift framing is durable; technique-stack framing decays the moment the technique falls out of fashion.
- **Honest disqualification.** Naming who should *not* buy increases conversion among who should. It signals confidence and filters tire-kickers. Every offer-bearing surface includes it.
- **Loss aversion through the merciless mirror.** We don't sell a future gain ("make more money"); we name a present cost ("you're guessing, loudly"). The audience already feels the loss; we make it legible.
- **The taco-place test.** Specific, embarrassing scene-painting beats abstract pain ("you struggle with discovery calls"). One vivid scene per surface, minimum.
- **Real deadlines, not theatrical ones.** Pilot windows are real: registration closes when the workshop starts. Bonus windows are real: stated, dated, honored. We do not run "ends tonight!" copy that resets weekly.
- **Anchor-and-deflate on price.** We never pretend $249/$299/$1,499 is a discount. We anchor on the cost of *not* taking the course (a missed quarter, a lost commission cycle). The price is plain math; we trust the audience to do it.
- **Behavioral commitment via micro-yes.** Registration is a 2-field form (email + role). Self-assessment slide asks one yes/no question. Tiny commitments compound into the close.

### 9.2 Moves we explicitly do not use

- **Fake scarcity.** No countdown timers that loop. No "only 3 seats left" when there are not. No "limited-time bonus" that never expires.
- **Inflated social proof.** No fake review counts. No "join 10,000+ reps" if the number isn't real. Testimonials are real names and real roles or they don't appear.
- **Parasocial guru worship.** We do not build a personal-brand cult around any one human (host, founder, partner). The brand is the character; humans are interchangeable inside it.
- **Manipulative loss aversion.** We do not weaponize shame ("you're failing, click here"). We name reality and let the audience do the work.
- **Engagement bait.** No "comment below if you agree" hooks. No "tag a rep who needs this." Those are LinkedIn moves; we don't run them.
- **Dark-pattern checkout.** No pre-checked upsells. No "are you sure?" guilt-trip downsells. No friction to refund. The 14-day refund is honored without interrogation.
- **Curiosity-gap subject lines.** "You won't believe what happened next" is the genre we mock, not the genre we run.

### 9.3 The psychological contract with the audience

Stated plainly, on every offer-bearing surface, in some form:

> *"If this doesn't work for you, refund within 14 days. If you want generic sales hype, the internet has a surplus. If you want operating judgment, this is the room."*

That is a contract, not copy. We keep it.

---

## 10. Compliance backbone

This is plain-English canon. Legal owns the binding version (`docs/planning/refund-workflow.md`, partner agreement, etc.). Where they disagree, legal wins.

### 10.1 FTC — material connection disclosures
Every partner who has been compensated, comped, or otherwise materially connected to AESDR must disclose that connection clearly and conspicuously, in close proximity to the recommendation, in language a reasonable reader understands.

| Surface | Required disclosure (canonical phrasing) |
|---|---|
| Newsletter / blog | `Affiliate disclosure: I earn a commission if you enroll through this link.` (placed near the link, not in the footer) |
| Social post / story | `#ad` or `#sponsored` near the top of the caption / first text frame, in plain text. |
| Reel / video | Verbal disclosure within the first 10 seconds AND on-screen text that stays for the duration of the recommendation. |
| Live workshop | Verbal disclosure at the partner intro AND on the registration page. |
| Affiliate link in DM | One-line disclosure in the same message: `Heads up — I get a commission if you enroll.` |

If the partner cannot or will not disclose, we do not work with them. This is a fit signal.

### 10.2 Approved claims
The partner and host may say these:
- The structural promise (12 lessons, 5 takeaway tools, lifetime access, $249/$299/$1,499, 14-day refund). Verbatim.
- "Built by people who carried bags and managed AEs and SDRs for 10+ years."
- "Not video lectures. Interactive."
- "Discord community ('Untamed') included."
- Genuine personal opinions, framed as opinions, with disclosure.

### 10.3 Forbidden claims
Nobody says these — partner, host, founder, or any other mouth. Compliance + brand both.
- Income claims of any kind ("you'll make $X more"). Forbidden, period.
- Job-placement claims ("graduates get hired at Y"). Forbidden, period.
- Performance promises tied to outcomes ("you'll close more deals," "your conversion rate will go up by Z%"). Forbidden unless AESDR has substantiation on file and explicitly authorizes the claim in writing.
- "Best in the industry," "the only course that," "guaranteed results."
- Anything that implies certification, accreditation, university affiliation, or recruiter endorsement we do not have.

### 10.4 Email — CAN-SPAM
Every commercial email AESDR sends, or that a partner sends on AESDR's behalf:
- Honest "From" line and subject line.
- Postal address in the footer.
- Working unsubscribe.
- Honor unsubscribes within 10 business days; ours is automated under 24 hours.
- "Sender" of record: AESDR for AESDR-branded emails; partner for partner-branded emails about AESDR.

### 10.5 SMS — TCPA + FCC one-to-one consent
- Prior express written consent required for marketing texts.
- Consent must be **seller-specific**: the registrant agreed that *AESDR* may text them. A consent that lists "AESDR and our partners" does not bless future partner sends.
- If a partner wants to text its own list about AESDR, the partner is the seller of record on their own consent. We do not piggyback.
- Every SMS includes `STOP to opt out` and honors STOP immediately.

### 10.6 Legal status of the host
A contracted host speaking on AESDR's behalf is, for FTC purposes, an endorser whose claims are *AESDR's* claims. Therefore:
- AESDR must be able to substantiate every claim the host makes about the program.
- The host's disclosures (if they have a separate audience and material connection) are additive, not a substitute, for AESDR's substantiation duty.
- Host contract names exactly which claims the host may make and which require pre-approval.

### 10.7 Legal status of the founder
Founder anonymity to the audience does not reduce founder legal responsibility. AESDR is the brand-of-record; the founder is the principal. Anonymity is a brand choice, not a liability shield. (See §13.)

---

## 11. Approved & banned channels

Channels are evaluated by signal-to-noise for the AESDR ICP. We are not optimizing for total reach; we are optimizing for the share of a partner's audience that is one or two years into a startup-SaaS sales role and serious about it.

### 11.1 Approved

| Channel | Notes |
|---|---|
| Partner-led private communities (Discord, Slack, Circle, Geneva, Skool) | Highest signal. Members are self-selected to be in the room. |
| Bootcamp coach networks | High intent, high credibility, low volume. |
| Alumni circles of named programs | Highest trust per click, smallest reach. |
| Niche newsletters with named editors | Editorial trust + measurable open rates. |
| Niche podcasts with show-aligned hosts | Long-form attention; one workshop per episode max. |
| YouTube — long-form, instructional, host-fronted | Permitted for AESDR-direct content; partner placement evaluated case by case. |
| Reddit (specific subs only) | Approached as participants, not advertisers. Authentic, no shilling. |
| Direct email lists owned by the partner | Top conversion lever; covered by partner's own consent. |

### 11.2 Discouraged

| Channel | Why |
|---|---|
| LinkedIn (any boosted/sponsored) | Anti-LinkedIn doctrine (§5). Manual high-intent only. |
| Twitter / X paid promo | Audience signal is weak for our ICP; conversion is unreliable. |
| Generic affiliate marketplaces (ShareASale, Impact for cold-affiliates) | Spray-and-pray; misaligned incentives; cohort quality unverifiable. |
| Mass-cold-DM tools | Banned. (See below.) |

### 11.3 Banned

- TikTok / Reels dance trends as a primary distribution. (Doesn't fit ICP and burns brand.)
- Mass-cold-email tools (Apollo blasts, Lemlist sequences) sent on AESDR's behalf to lists we don't own.
- Mass-cold-DM tools (Instagram, LinkedIn, Twitter automated DMs).
- Pixel-purchase / lookalike-audience advertising at any scale before AESDR has a working organic baseline. (Premature scaling.)
- Co-promotion with any operator whose primary positioning is one of the banned vocabulary terms in §4.1.

### 11.4 The "would we want to be next to this" test
When in doubt, ask: in a screenshot of this channel, would AESDR look like the only honest thing on the page, or would we look like one more sales-hype voice in a noisy room? If the latter — wrong channel.

---

## 12. Founder-backstage doctrine

The founder is invisible to the audience by default, fully visible to partners and operators, and occasionally visible to the audience by deliberate choice (rare).

### 12.1 Visibility matrix

| Stakeholder | Founder visibility |
|---|---|
| Partner (operator, coach, creator, alumni) | **Full.** First-name, real role. The partner relationship is human-to-human. |
| Vendor / contractor / legal | **Full.** Real name, real role. |
| Workshop attendee live | **None by default.** Founder may lurk in chat under an alias. May guest-appear in rare cases (named in §12.4). |
| High-intent post-workshop lead | **Aliased.** Founder takes the call as `[alias] from AESDR Admissions` — same person, different presented role. |
| Public web (AESDR pages, social, podcasts about AESDR) | **None.** Brand-of-record speaks; no founder name. |

### 12.2 The lurk-and-listen workflow
The founder is responsible for maintaining the founder-sales learning loop the report depends on. Backstage doesn't mean uninformed.

- **During workshops:** founder watches live in chat under a non-identifying handle. Logs questions, objections, and reactions in a running doc.
- **Post-workshop debrief:** within 24 hours, founder + host walk the transcript, tag objections, mark offer-friction points, decide what changes for the next pilot.
- **High-intent calls:** founder takes them under the Admissions alias. Real conversations, real follow-up, just no public face.
- **Objection log:** rolling document feeds into deck revisions, FAQ revisions, and pricing-page copy.

### 12.3 The Admissions alias
The alias is real-person-staffed (it's the founder), publicly addressed as a separate role. Setup:
- Email: `admissions@aesdr.com` (or similar — confirm with the user before standing it up).
- Calendar: Cal.com / SavvyCal link for high-intent leads.
- LinkedIn: separate account, sparse, no founder photo, "AESDR · Admissions" headline.
- Phone (optional): a Google Voice / OpenPhone number, not personal.

The alias does not lie. If a lead asks "are you the founder?", the answer is honest: "I'm the principal at AESDR." Anonymity is a positioning choice, not a deception.

### 12.4 When the founder may appear
Rare and deliberate:
- A specific high-trust partner (alumni ambassador, bootcamp coach with prior relationship) where the founder presence demonstrably improves close rate and trust.
- A specific late-stage close (e.g., enterprise/team buyer asking for a real conversation).
- A named milestone (1,000th student, etc.) where a brand-as-character moment can absorb the appearance.

In all such cases: founder appearance is a deliberate brand decision, recorded in writing, not a drift.

### 12.5 What this means for outreach scripts and emails
- Outreach scripts are signed `— [Founder first name], AESDR` when going to partners (operators, coaches, etc.). Partners get the human.
- Outreach scripts to *audiences* are signed `— AESDR Workshop` or `— [Host first name], AESDR` and never with the founder's name.
- Pilot-closeout notes to partners come from the founder's name. Audience-facing follow-ups come from the host or from `AESDR`.

---

## 13. Honesty discipline

We say out loud what competitors won't.

- **Who should not buy.** Every offer surface includes this block. Examples: "If you're looking for motivation, this isn't that. If you want a LinkedIn-friendly badge, look elsewhere. If you've been in sales 10+ years and aren't open to a re-look at fundamentals, the first 5 lessons will bore you."
- **Real refund language.** `14-day, no-questions-asked refund. Email hello@aesdr.com and we process it within 3 business days. If it doesn't deliver value, we don't want your money.` (canon, from FAQ.)
- **Real pricing.** Listed plainly. Never "starting at." Never with a fake strikethrough.
- **Real numbers in copy.** Specific call counts, specific commission amounts, specific timelines.
- **Real sunsets on bonuses.** If a bonus expires, it expires once. We do not run the same "limited time bonus" four pilots in a row.
- **Real partner exits.** If a pilot doesn't work, we say so to the partner and to ourselves. Canonical language: *"We part as adults."*

---

## 14. Tagline pack (canonical)

Repeatable across collateral, host scripts, social, decks. Use, don't paraphrase, unless the canon is updated first.

- *"The operating manual, not the motivation engine."*
- *"Less affiliate empire. More founding vineyard."*
- *"If you want generic sales hype, the internet has a surplus."*
- *"We do not teach you to sell. We teach you to be the person who sells."*
- *"Borrowed trust is a merciless mirror."*
- *"12 lessons. 5 tools. 1 you."*
- *"Not video lectures. Not motivation. Operating judgment."*
- *"No motivational BS. No 'crush your quota' energy."* (from existing canon)
- *"This isn't corporate-y but it will advance your career."* (from `variant-a-editorial-split.html`)
- *"We part as adults."*

Headline-style canon (use as headlines, not as taglines):
- *"Stop Surviving. Start Owning It."*
- *"Every month, they reset your number to zero."*
- *"Your onboarding was a crime scene."*
- *"You are not building a career. You are surviving one."*

---

## 15. Glossary

| Term | Definition |
|---|---|
| **Workshop-first** | The pilot motion where every partner audience is met with a live workshop, not a tracked link. The workshop earns the sale; the link attributes it. |
| **Founder backstage** | The doctrine that the founder is invisible to audience but visible to operators. |
| **The two voices** | Rowan (the voice that closes) and Michael (the voice at 2am). The brand's character pair. |
| **Iris** | The reserved gradient (`var(--iris)`) used sparingly as the brand's heartbeat. |
| **Founding vineyard** | The mental model for the partner program — small rows, careful pruning, honest yield. |
| **Merciless mirror** | What a partner audience is to weak collateral. The thing that exposes us in 60 minutes. |
| **Borrowed trust** | A partner's audience-trust we are temporarily renting. Returnable, not transferable. |
| **Operating manual** | What AESDR is. Not a coach, not a community, not a course-experience. |
| **Admissions alias** | The non-founder role the founder uses for high-intent calls. Same person, different presented role. |
| **The voice that closes** | Rowan. Verdict mode. Display type. Ink and crimson. |
| **The voice at 2am** | Michael. Confessional mode. Caveat type. Crimson on cream. |
| **Locked vs ad-lib zones** | Sections of the workshop deck the host must deliver verbatim vs sections where the host's voice takes over within rails. |
| **Untamed** | The Discord community. Not a moderated newsletter. Real community, real banter, real accountability. |

---

## 16. Approval gates

Nothing on this list ships without explicit founder approval, in writing, before publication.

- Any partner-facing deck (first version + every material revision).
- Any partner-promo landing page (first version + every change to copy or pricing).
- Any social post promoting AESDR — pre-approval on every post during the pilot. (Per FTC monitoring rule + report §Compliance.)
- Any host ad-lib that becomes a recorded asset (clip, replay, reel).
- Any pricing language, refund language, or claim about outcomes.
- Any new partner co-branding lockup.
- Any departure from canon in this document.

If something is shipped without approval and contradicts canon, it gets pulled, not patched. Speed is not a defense.

---

## 17. Versioning

This document is the source of truth for the affiliate / partner ecosystem until superseded by a numbered revision.

| Version | Date | Author | Notes |
|---|---|---|---|
| 1.0 | 2026-04-29 | Founder | Initial canon. Drawn from `affiliate-seeding-deep-research-report.md`, `AGENTS.md`, `app/globals.css`, `components/LandingSequence.module.css`, `variants/variant-a-editorial-split.html`, and the Two-Voices mockup. |

**How to update:** open a PR titled `canon: <topic>` against `main`. Update the version row. Update any deliverables that contradict the new canon. Do not update canon to fit a deliverable; update the deliverable to fit canon, or argue for a canon change first.

**Outstanding open questions** (not blocking, to resolve before specific deliverables):
1. Founder bio — anonymized stub vs full instructor bio for the host. (Pending host casting.)
2. The Turtle artwork — does it appear on partner collateral, and if so, where?
3. Admissions alias setup — `admissions@aesdr.com` vs another address? Calendar tooling choice?
4. Is the host one named individual long-term, or a rotating cast? Affects locked vs ad-lib ratios.
5. Workshop title — pain-led options pending; placeholder until founder picks.

---

*End of canon, v1.0.*














