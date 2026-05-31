# AESDR — Discovery doctrine

**Version:** 1.0
**Effective:** 2026-05-31
**Scope:** How Scout sources affiliate candidates. Binding for every sweep.
**Owners:** partnerships lead.
**Companion docs:** `AFFILIATE_BRAND_CANON.md` (the voice canon), `content/internal/partnerships-os.html` § Prospect Intel (the named-candidate reference list).

Borrowed trust is a merciless mirror. A partner whose audience smells motivational content tanks our register in 60 minutes. This doctrine is what lets the partnerships lead say no to a wrong-fit creator with 100k followers on day 12, without re-litigating it.

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

The litmus: if the instinct is to plug AESDR into a marketplace and watch the numbers, that is the wrong instinct for this brand.

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

**Cut anyone scoring ≤2.** A bad-fit partner damages the brand faster than a good one helps. Thirty great candidates beats a hundred mediocre ones.

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

Cut on any of these without re-litigating:

- **Guru aesthetic.** Banned vocabulary appears in their feed: "crush it," "level up," "unlock your potential," "rise and grind," "thought leader," "10x." Headset photos. Motivation graphics. Performance theater. Score 1 and drop.
- **Vendor-sponsored conflict with a competing curriculum.** Currently flagged in Prospect Intel as hard conflicts: **Jason Bay** (Outbound Squad — 30MPC trainer, paid Sell Better speaker), **Belal Batrawy** (sells Death to Fluff Bootcamp via learntosell.io), **Morgan J Ingram** (Director at JBarrows Sales Training). Each sells a direct substitute for AESDR. Approaching them is wasted cycles at best and a competitor-signal at worst. They are listed in Prospect Intel under hard conflicts so future sweeps do not re-discover them.
- **Audience under ~1k engaged.** Not raw followers — engaged readers, listeners, or community members. A 5k newsletter with 800 opens beats a 30k follower count with no replies.
- **Sponsored by a sales-tool vendor whose lessons we would contradict.** A creator paid by a cold-email automation vendor will not credibly recommend a course that teaches restraint. Conflict, not a partner.
- **Refuses disclosure.** If a candidate cannot or will not disclose the affiliate relationship per FTC rules, we do not work with them. This is a fit signal, not a paperwork dispute.

Soft conflicts (Sell Better speaker status, agency owners with adjacent courses, etc.) are not auto-disqualifying — annotate the conflict in Dossier and let the partnerships lead decide on the call.

---

## 5. Workflow — how this plugs into the daily motion

1. **Scout** runs sweeps against this rubric. Applies the sourcing rule, scores voice-fit, tags archetype, flags disqualifiers. Returns scored rows; never a raw dump.
2. **Dossier** enriches survivors scoring ≥3. Surfaces verified audience size, content cadence, contact path, conflict check.
3. **Ledger** writes survivors to `partner_pipeline` at status `enriched`. Anyone scoring ≤2 is dropped at the Scout step — no enrichment, no pipeline row.
4. Hard-conflict names stay out of the funnel entirely. Soft conflicts get a `notes` annotation and proceed.
5. **Scribe** drafts outreach only for partner_pipeline rows tagged with a verified archetype. The first-touch references one real thing the candidate made — the archetype tag tells Scribe which kit to pitch.

Doctrine review every 30 days, at the Phase-30 / 60 / 90 close. Update it when the funnel surfaces a pattern Scout is missing — never the other way around.

---

## 6. Versioning

| Version | Date | Author | Notes |
|---|---|---|---|
| 1.0 | 2026-05-31 | partnerships lead | Initial doctrine. Drawn from `AFFILIATE_BRAND_CANON.md` §1.3 (a handful of partners, not a marketplace) and §5 (anti-LinkedIn doctrine), the partnerships-os Run A/B research output (10 named affiliate + 10 named channel candidates), and the three documented hard-conflict names. |

**How to update:** open a PR titled `partnerships: doctrine — <topic>` against `main`. Update the version row above. Update Prospect Intel if the named-candidate examples drift. Do not update the doctrine to fit a partner you want; update the partner-search to fit the doctrine, or argue for a doctrine change first.

---

*Companion to `AFFILIATE_BRAND_CANON.md` (voice + register) and Prospect Intel (named-candidate reference). Skipped by `scripts/canon-check.mjs` because it enumerates the banned vocabulary as part of the disqualifier rubric — same exemption as `AFFILIATE_BRAND_CANON.md`.*
