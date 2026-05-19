<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:consumer-brand-voice-canon -->
# Consumer brand-voice canon — read before writing any buyer-facing copy

Every change touching strings on a buyer-facing surface (`app/`, `components/`,
`lib/email.ts`, `content/lessons/`, `content/partner-kit*`) is checked against
the rules in:

- `docs/canon-revisions/2026-05-19-consumer-brand-voice-canon.md` — base canon
  (blocklist, substitution table, seven moves, surface notes)
- `docs/canon-revisions/2026-05-19-language-patch-supplement.md` — eight R-G
  rules (R-G1 gummy abstractions, R-G2 trailing pronouns, R-G3 telegraphic
  cadence, R-G4 manufactured-concept blocklist, R-G5 read-aloud test, R-G6
  bar test, R-G7 AI-tell hygiene, R-G8 plain noun over literary verb)
- `docs/canon-revisions/2026-05-19-curriculum-copy-rubric.md` — six-axis
  scoring for lesson content (target ≥9/10 per unit, no axis below 1)
- `docs/canon-revisions/2026-05-19-plan-to-canon-process.md` — how patterns
  become canon and how canon stays enforced
- `docs/canon-revisions/2026-05-19-language-patch-master-plan.md` — itemised
  sweep checklist (every route, component, email, internal doc, lesson unit)
- `AFFILIATE_BRAND_CANON.md` — overlapping rules for partner-side surfaces
- `AESDR_ENTERPRISE_CANON.md` — B2B subsidiary brand register

Mechanical enforcement:
- ESLint `no-restricted-syntax` rule in `eslint.config.mjs` flags hard-banned
  R-G4 terms in JSX strings + template literals across `app/**` + `components/**`.
- `scripts/canon-check.mjs` greps .md / .html / .txt for the same patterns
  ESLint can't reach. Run `node scripts/canon-check.mjs --soft` for a report;
  drop `--soft` for CI-style exit-1-on-hit.

Taste enforcement:
- PR template (`.github/pull_request_template.md`) has the R-G1 → R-G8 checks
  as a checklist the reviewer ticks before merge.

Naming separation:
- `/partners/*` is the consumer-side affiliate hub. Write "Partners" (capital P,
  program name) or "affiliates."
- `/enterprise/*` is the B2B subsidiary. The channel-partnerships page is at
  `/enterprise/channel` — write "channel partners" with the "channel" prefix
  on first use. Never bare "partner."
<!-- END:consumer-brand-voice-canon -->

<!-- BEGIN:brand-palette -->
# Brand palette — RETIRED vs ACTIVE

**The dark palette is retired. Do not use it for anything new — not pages, not mockups, not prototypes, not internal scratch.** That includes any background near `#020617 / #0B0B0F / #0F172A / #1E293B`, any text on `#F8FAFC` over a dark surface, and the legacy accent set (`#10B981 --theme`, `#EF4444 --coral`, `#38BDF8 --cobalt`, `#F59E0B --amber`, `#8B5CF6 --violet`) used as primary surface colors.

The legacy CSS variables `--bg-main`, `--bg-panel`, `--bg-card`, `--bg-hover`, `--text-main`, `--text-muted`, `--theme`, `--theme-glow`, `--coral`, `--cobalt`, `--amber`, `--violet` still exist in `app/globals.css` for backwards compatibility with old course HTML, but are not to be referenced in any new component, page, or asset.

## Active palette — editorial (use this for everything)

Defined in `app/globals.css`:

| Token | Value | Use |
|---|---|---|
| `--cream` | `#FAF7F2` | Default page background |
| `--ink` | `#1A1A1A` | Default body text |
| `--crimson` | `#8B1A1A` | Primary brand accent (CTAs, emphasis, hero left panel) |
| `--muted` | `#6B6B6B` | Secondary text |
| `--light` | `#E8E4DF` | Subtle dividers, low-emphasis surfaces |
| `--iris` | linear-gradient | Reserved shimmer accent — role tokens (AE/SDR), key CTA, brand wordmark only |

## Active fonts (use these tokens, not raw font names)

| Token | Stack | Use |
|---|---|---|
| `--display` | `'Playfair Display', Georgia, serif` | Headlines, role labels |
| `--serif` | `'Source Serif 4', Georgia, serif` | Body text |
| `--cond` | `'Barlow Condensed', sans-serif` | UI labels, buttons, eyebrows |
| `--mono` | `'Space Mono', monospace` | Terminal, classified blocks, taxonomic labels |
| `--hand` | `'Caveat', cursive` | Michael's voice / margin annotations only |

Do **not** introduce JetBrains Mono, Inter (outside of `MVI-STANDARDS.md`'s course-gate scope), or any other font without an explicit instruction in this section.

## Ground-truth references

When in doubt, read these *before* generating any visual:
- `app/globals.css` — tokens
- `components/LandingSequence.module.css` — editorial palette in production
- `variants/variant-a-editorial-split.html` — canonical editorial layout

## Reasoning, not rule-following

If a request seems to call for a dark surface (e.g. a terminal block), the answer is to render it on `--ink` text on `--cream` with `--mono`, or to use a small inset block — not to revive the retired dark palette. Confirm with the user before deviating.
<!-- END:brand-palette -->
