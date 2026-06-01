# AESDR — Discovery doctrine

**Version:** 1.0
**Effective:** 2026-05-31
**Scope:** How Scout sources affiliate candidates. Binding for every sweep.
**Owners:** partnerships lead.
**Companion docs:** `AFFILIATE_BRAND_CANON.md` (the voice canon), `content/internal/partnerships-os.html` § Prospect Intel (the named-candidate reference list).

This doctrine sets the rules Scout uses on every affiliate sweep. Its purpose is to let the partnerships lead reject a wrong-fit creator with 100k followers on day 12 without re-litigating which surfaces, what voice register, or what audience size are acceptable. Without a written doctrine, every borderline case turns into a debate; with one, Scout drops the bad fits at the sweep step and only candidates worth the time reach human review.

---

## 1. Sourcing rule

Practitioner networks only. Never marketplaces. Never LinkedIn.

**Approved surfaces:**
- Skool, Mighty Networks, Circle paid communities — sales / SDR / AE / revenue topics, 50–2,000 members. The community owner is the candidate, not a member.
- Independent sales newsletters on Substack or Beehiiv with operator voices. Reply-to address is the contact path.
- Sales podcasts with operator hosts (not influencer hosts). Guest-pitch form is the contact path.
- Named practitioner networks: 30MPC-adjacent, Outbound Squad, RepVue contributors, Modern Sales Pros, Apex BDR Club, Pavilion. People with their own audience, not just members.

**Forbidden surfaces:**
- Mass affiliate marketplaces — Rakuten, CJ (Commission Junction), ShareASale, Impact-as-a-marketplace. Spray-and-pray surfaces optimized for volume; we are not.
- LinkedIn. Per founder direction: not as a primary channel, not as a contact path, not for partner promotion. Manual one-human-to-one-human DM is the only carve-out, and even that is downstream of an earned warm intro elsewhere.

---

## 2. Voice-fit bar

Every candidate gets a 1–5 voice-fit score before any further work. Score honestly. Lower than 3, the candidate does not enter the pipeline.

| Score | What it sounds like |
|---|---|
| **5** | Operator who teaches the real work. Plain nouns. Specific numbers. Confessional credibility. Reads in our register without translation. Example: Neil Bhuiyan (HappySelling) — podcast built for brand-new SDRs, every episode is a live discovery call with an early-career rep. Exact audience match. |
| **4** | Strong operator voice with one weakness — adjacent topic, smaller audience, or a partial guru cadence. Worth pursuing. Example: Florin Tatulea (Prospecting from the Trenches) — Head of Sales Dev at Common Room, writes tactical SDR/AE prospecting for real SaaS companies. Operator tone, zero guru, ~13k subs. |
| **3** | Operator-leaning but not a clean fit. Audience slightly off, voice partial, or a soft conflict signal. Enrich and read once more before deciding. |
| **2** | Hype-adjacent. Mixes "value" with "energy." Reads like a LinkedIn carousel half the time. Drop. |
| **1** | Guru aesthetic. Performs expertise instead of installing it. Drop. |

**Cut anyone scoring ≤2.** A bad-fit partner introduces brand risk that a good-fit partner cannot cancel out — and that risk compounds across their audience. Aim for 30 strong candidates over 100 marginal ones.

---

## 3. Archetype targets

Four shapes. Tag every candidate as one before enrichment. The tag drives which kit and which onboarding path they get.

| Archetype | What it looks like | Where to find them |
|---|---|---|
| **Creator** | Publishes consistently — newsletter, podcast, video. Owns the audience-to-distribution loop. Voice carries weight regardless of platform. | Substack, Beehiiv, podcast directories, Twitter/X. |
| **Coach** | One-to-one or small-group work with early-career reps. Reputation lives in their network, not their feed. Lower volume, higher per-recommendation conversion. | Bootcamp programs, sales-training boutiques, fractional sales-coach networks. |
| **Alumni** | Already bought AESDR. Talks about it without prompting. Strongest trust signal in the program; lowest acquisition cost per partner. | Internal — the `affiliates` table, tier `developing` or `proven`. |
| **Community** | Owns a paid community (Skool, Mighty Networks, Circle, Discord). The owner is the candidate, not the members. | Skool directory, Mighty Networks discovery, Circle's public communities tab. |

Archetypes are not mutually exclusive — Neil Bhuiyan is creator + community, Florin Tatulea is creator + practitioner-network figure — pick the dominant one and note the secondary in `partner_pipeline.notes`.

---

## 4. Disqualifiers

These are genuine cuts — the candidate does not enter the pipeline at all:

- **Guru aesthetic (voice-fit 1).** Banned vocabulary in their feed, headset photos, motivation graphics, performance theater. Score 1 and drop.
- **Employed by a direct competitor.** Someone on staff at a rival sales-training company cannot recommend AESDR to their employer's audience — the conflict is contractual, not commercial. Example: Morgan J Ingram (Director at JBarrows Sales Training). This is different from an independent who *affiliates* for a competitor — that is a recruitment opportunity, not a cut (see §4.5).
- **Audience under ~1k engaged.** Not raw followers — engaged readers, listeners, or community members. A 5k newsletter with 800 opens beats a 30k follower count with no replies.
- **Sponsored by a sales-tool vendor whose lessons we would contradict.** A creator paid by a cold-email-automation vendor cannot credibly recommend a course that teaches restraint.
- **Refuses disclosure.** If a candidate cannot or will not disclose the affiliate relationship per FTC rules, we do not work with them. This is a fit signal, not a paperwork dispute.

**What is no longer a disqualifier:** selling your own course or coaching, or affiliating for a competitor. Those were hard cuts in v1.0. They are now motion tags — see §4.5. The reasoning, learned the hard way on 2026-06-01: the practitioner-creators with the right audience almost all monetize that audience already, and most of those relationships are complementary or convertible rather than competitive. Cutting them left almost no pipeline. The fix is not to lower the bar — it is to approach them with the right angle.

Soft signals (Sell Better speaker status, an agency on the side, a paid newsletter tier) are never auto-disqualifying. Annotate them in Dossier and let the partnerships lead decide on the call.

---

## 4.5 Motion tags — how a candidate gets approached

Every pipeline candidate carries a `motion` tag that routes which template and which deal they get. The clean-affiliate case is the minority, not the default.

| Motion | Who they are | The angle | Deal |
|---|---|---|---|
| **affiliate** | Clean. Relevant audience, no competing product, income from elsewhere (a day job, an adjacent tool). Example: Stacy Tan — Head of Sales at a non-competing SaaS; the newsletter is a side project. | "Point your readers at it if it fits." Standard. | 40% / 30-day |
| **coach_complement** | Sells their own coaching or course to SDRs and AEs. Example: Neil Bhuiyan — HappySelling course + MySalesCoach. | AESDR is the self-paced foundation that handles the groundwork before or alongside their high-touch work, so their hours stay on the 1:1 conversations only they can have. Price is accessible to every client they work with. Lead with what AESDR does, never with the price. | 40% on every seat |
| **open_recruit** | Currently affiliates for a competitor. Example: Tajh Walker — affiliates for HigherLevels. | Honest and direct: the better-made product is here when they want it. Status quo is not loyalty — they signed up because someone asked first. | 40% / 30-day |
| **co_marketing** | A large, aligned audience, whether or not they ever take an affiliate link. | Guest swaps, joint content, co-hosted workshops. A relationship, not a referral link. Lean into these — they compound. | Per-deal, not 40%/30-day |

A candidate can carry more than one tag — Neil is `coach_complement` and `co_marketing`. Dossier proposes the tag from the commercial posture it finds; the partnerships lead confirms it on the call.

The one thing that does NOT change across motions: the voice-fit bar (§2) and the canon register. We approach a coach or a competitor-affiliate in exactly our voice — operator-direct, no flattery, no price-led pitch.

---

## 5. Workflow — how this plugs into the daily motion

1. **Scout** runs sweeps against this rubric. Applies the sourcing rule, scores voice-fit, tags archetype, flags the genuine §4 disqualifiers only. Returns scored rows; never a raw dump.
2. **Dossier** enriches survivors scoring ≥3 — verified audience size, content cadence, contact path, AND the commercial posture that sets the §4.5 motion tag. **Dossier before Scribe, always: the sweep is sourcing, never clearance.** (Learned 2026-06-01 — the quick sweep cleared three candidates Dossier then found were `coach_complement` or `open_recruit`, not clean affiliates. One blind send to any of them would have been an affiliate pitch to a competitor.)
3. **Ledger** writes survivors to `partner_pipeline` at status `enriched` with a `motion` tag. Voice-fit ≤2 is dropped at Scout. Genuine §4 disqualifiers (competitor employees, sub-1k audience, contradicting-vendor sponsorship, disclosure refusers) are dropped or marked `passed` for the record.
4. **Scribe** drafts from the motion tag — `affiliate` / `coach_complement` / `open_recruit` / `co_marketing` template — personalized from the Dossier brief. The first-touch references one real thing the candidate made; the motion tag picks the angle and the deal.

Doctrine review every 30 days, at the Phase-30 / 60 / 90 close. Update it when the funnel surfaces a pattern Scout is missing — never the other way around.

---

## 6. Versioning

| Version | Date | Author | Notes |
|---|---|---|---|
| 1.0 | 2026-05-31 | partnerships lead | Initial doctrine. Drawn from `AFFILIATE_BRAND_CANON.md` §1.3 (a handful of partners, not a marketplace) and §5 (anti-LinkedIn doctrine), the partnerships-os Run A/B research output, and the three documented hard-conflict names. |
| 2.0 | 2026-06-01 | partnerships lead | Major revision after Dossier-verifying the wave-1 cluster found 3 of 4 "clean" candidates actually sell competing courses/coaching or affiliate for a competitor. §4 reworked: selling your own course/coaching and affiliating for a competitor are no longer hard cuts — only competitor *employees*, sub-1k audience, contradicting-vendor sponsorship, and disclosure refusal remain disqualifiers. New §4.5 motion tags (affiliate / coach_complement / open_recruit / co_marketing) route each candidate to the right angle + deal. §5 workflow now mandates Dossier-before-Scribe and motion-tagging. Founder direction: coaches are a complement (AESDR is the self-paced foundation under their high-touch work), competitor-affiliates are a recruitment opportunity, and co-marketing is a first-class motion to lean into. |

**How to update:** open a PR titled `partnerships: doctrine — <topic>` against `main`. Update the version row above. Update Prospect Intel if the named-candidate examples drift. Do not update the doctrine to fit a partner you want; update the partner-search to fit the doctrine, or argue for a doctrine change first.

---

*Companion to `AFFILIATE_BRAND_CANON.md` (voice + register) and Prospect Intel (named-candidate reference). Skipped by `scripts/canon-check.mjs` because it enumerates the banned vocabulary as part of the disqualifier rubric — same exemption as `AFFILIATE_BRAND_CANON.md`.*
