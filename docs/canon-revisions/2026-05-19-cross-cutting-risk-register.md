# Cross-cutting risk register

> **Status:** Living document. Reviewed quarterly; promoted from "watching"
> to "owned" when a risk turns into a workstream.
> **Scope:** Risks that cut across product, brand, commercial, and ops —
> the ones that don't sit cleanly inside any single team's remit.
> **Owner:** Antaeus Coe.
> **Last revised:** 2026-05-19.

Each entry follows the same five-line shape:
- **Risk** — the thing that could go wrong
- **Trigger** — what would make it real
- **Blast radius** — what breaks if it does
- **Current state** — what we've already done about it
- **Next move** — the specific action we'd take if the trigger fires

---

## R.01 · Founder-dependency on voice

**Risk.** Every consumer-side surface — landing copy, email register,
dashboard microcopy — is filtered through one person. If that person
is unavailable for an extended stretch, the brand voice drifts.

**Trigger.** Founder out for 4+ weeks (illness, family, anything).

**Blast radius.** New marketing copy gets written by people without
the canon in their bones; first instances ship with motivational
register, "rep" usage, claim-without-evidence stats; brand starts to
read like the things it explicitly differentiated against. Reverses
six months of positioning work in two months.

**Current state.** Consumer brand-voice canon shipped 2026-05-19
(`docs/canon-revisions/2026-05-19-consumer-brand-voice-canon.md`). Five
quick pre-merge tests defined. PR descriptions cite the canon when
edits are driven by it.

**Next move.** If founder is unavailable: route all consumer copy
through one named delegate who has read the canon end-to-end. New
copy goes into a holding queue rather than shipping cold.

---

## R.02 · Curriculum staleness

**Risk.** SaaS sales-floor reality changes faster than course content.
Bridge Group statistics from 2024 will be wrong by 2027; the manager
archetypes work in 2026 but may need a fifth for AI-augmented teams
by 2028; the CRM survival guide gets dated as Salesforce loses share.

**Trigger.** Any of: a cited statistic falsified by a newer report;
testimonials starting to flag a lesson as "outdated"; review responses
clustering on a specific lesson with "this isn't how it works anymore."

**Blast radius.** Refunds. Negative reviews. Erosion of the "operator
who lived it" credibility line — which is the entire differentiator.

**Current state.** Bridge Group 2024 stats hyperlinked everywhere
they're cited so freshness is auditable. Testimonial capture surface
collects "what to fix" replies (ratings 1-3 route to that flow).
Admin/at-risk dashboard surfaces stall patterns by lesson.

**Next move.** Annual curriculum audit (Q4 cadence). Pull rating-1-3
testimonials by lesson, intersect with completion-drop-off by lesson,
re-shoot any lesson with both signals lit. Refresh hyperlinked stats
in the same sweep.

---

## R.03 · Discord drift

**Risk.** Community lives off-platform (Discord). We have zero visibility
into engagement, message volume, moderation health. If it goes feral,
toxic, or dies, we find out from a refund email.

**Trigger.** Refund rate spikes; testimonial sentiment includes
"the community was..." flags; Discord member count silently halves.

**Blast radius.** A pricing feature ("Discord community · Untamed") is
visible on every pricing card. If the community is bad or dead, that's
a false promise — refund grounds.

**Current state.** Discord engagement is opaque to founder. No
moderation rota. No engagement audit cadence.

**Next move.** Monthly Discord scrape (member count, 7-day active,
message-volume trend) into the admin dashboard. Trigger refund-rate
correlation when active <50% of paying customers. If trigger fires:
either invest in moderation or drop the line item from the pricing
card. We don't sell features we can't operationally back.

---

## R.04 · Affiliate brand drift

**Risk.** Partners promoting AESDR write their own copy. Their tagline
("transformative sales mindset reset!") undoes a year of voice work in
one LinkedIn carousel. Worse if the affiliate is bigger than us.

**Trigger.** First six-figure-following partner goes live.

**Blast radius.** Search results pick up affiliate copy faster than
ours. New buyers land on /preview with motivation-engine expectations
and refund. Recoverable but painful.

**Current state.** Partner-kit gate exists (signed URLs, audit log).
Brand canon docs live under `docs/canon-revisions/`. No explicit
brand-conformance clause in partner terms.

**Next move.** Before next partner activation: add one-paragraph
brand-conformance clause to partner agreement. Pre-approve the partner's
first three pieces of copy. Light touch — we'd rather lose a partner
on voice than win on volume.

---

## R.05 · Stripe / Resend / Supabase / Vercel concentration

**Risk.** Single point of failure across the payment, email, database,
and hosting stack. If any one of the four goes hard-down, the customer
journey breaks at a different point — payment failures, undelivered
welcome emails, lesson 404s, full site down.

**Trigger.** Any of the four announces a credential rotation,
contractually difficult re-pricing, or a multi-hour outage.

**Blast radius.** Stripe outage → no purchases for the duration.
Resend outage → welcome / receipt emails queue, course access still
works but trust dents. Supabase outage → lesson progress halts, full
course inaccessible. Vercel outage → site down entirely.

**Current state.** Sentry monitors errors. Vercel + PostHog monitor
performance. No automated alert on individual vendor health-page
status. No documented failover procedure for any of the four.

**Next move.** Vendor status-page polling into a single ops endpoint.
On red status: degrade gracefully — landing page goes static cache,
lesson progress goes to localStorage with sync-on-recovery. Document
the failover for each vendor as a one-page runbook. Build trigger:
first vendor incident causing >15min disruption.

---

## R.06 · Refund-rate signal lag

**Risk.** Refunds are the highest-fidelity quality signal we have, but
they're lagging — by the time refunds spike, the bad cohort is already
on Reddit. Leading indicators (incomplete onboarding, no-open at 5d)
exist but aren't wired to alerts.

**Trigger.** Refund rate >5% in any 30-day window.

**Blast radius.** Reputational: each refund is a person who could
write the bad public review. Operational: refunds erode margin on a
one-time-purchase model where there's no LTV to recover the lost spend
on Reddit / Google ads.

**Current state.** /admin/at-risk surfaces silent-start + stalled +
near-finish buckets. No threshold alerts; founder reads it manually.

**Next move.** Weekly digest email summarising at-risk counts + refund
rate + completion rate. Trigger: when silent-start count >10% of last
14-day purchases, send the win-back early (don't wait for T+45d).

---

## R.07 · Mobile-first buyer mismatch

**Risk.** AEs and SDRs read LinkedIn on phones, decide to evaluate on
phones, often abandon to "I'll look at this on my laptop" — and never
return. Our mobile lesson rendering has never been audited on a real
device.

**Trigger.** Mobile-organic traffic >40% of unique visitors. Mobile
conversion rate <0.3× desktop.

**Blast radius.** A fraction of the actual addressable market that
silently doesn't convert. Hard to even know we're losing them.

**Current state.** Mobile redirect to /mobile (visuals-only) on
pre-launch. Lesson typography mobile-unaudited. No mobile-specific
analytics break-out.

**Next move.** Founder does one device pass on iPhone + one Android.
Audit: lesson 1.1 readability, dashboard touch-targets, form input
sizing. Build trigger: any single audit-finding stops a real
purchase. Defer broader mobile work until conversion data warrants.

---

## R.08 · Stripe webhook idempotency drift

**Risk.** Stripe webhook deliveries are at-least-once. Our webhook
handler grants course access. A double-deliver on the
`checkout.session.completed` event would either double-credit (mild)
or, if combined with a separate refund handler, leave access state
inconsistent.

**Trigger.** Stripe webhook retry storm during normal operations
(happens during their incidents). Manual webhook replay from dashboard.

**Blast radius.** Customer service issue at worst — duplicate
purchase rows in DB. Hasn't manifested in production but is a known
class of bug for our pattern.

**Current state.** Webhook handler does an idempotency check on the
Stripe event ID before processing. Purchases table has a unique
constraint per session.

**Next move.** Add a regression test that replays the same webhook
event 10x in a tight loop and asserts the purchases row stays
singular + access flag stays consistent. Defer unless a real incident
proves the check leaks.

---

## R.09 · AI-generated competitor at $0

**Risk.** Someone builds an AI-generated "AESDR alternative" — twelve
auto-generated SaaS sales lessons in a static site, free, indexed,
SEO-optimised. Not because it's good, but because it ranks.

**Trigger.** First instance found in the wild. Likely 2026-2027.

**Blast radius.** Top-of-funnel erosion. Buyers who would have found
us instead find a free-but-generic alternative; some convert, some
just leave. Worst case: a partner asks why they should pay $1,499 when
something free exists.

**Current state.** /preview shows the substance gap. /about shows the
operator credibility gap. Voice canon ensures the copy is unmistakably
human-written.

**Next move.** Don't compete on price. Lean harder into operator
credibility (founder voice, named tools, real Bridge Group cites).
Add one element to landing that an AI generator can't fake — a
founder video, a podcast-conversation embed, or an annotated
walkthrough of one lesson recorded live.

---

## R.10 · Compliance creep from EU procurement

**Risk.** A serious EU buyer asks for GDPR-Article-32-grade
documentation, SOC 2, ISO 27001, all of it — and asks before the
contract is signed. We're not there. Trying to back-fill under deal
pressure produces either lying-by-implication or six weeks of unpaid
audit prep.

**Trigger.** First EU Team/Enterprise contact requiring formal
compliance attestations as a precondition.

**Blast radius.** Either we lose the deal, or we mis-represent our
posture and lose it later when audit lands. Both are bad; the second
is worse.

**Current state.** /teams/procurement is honest about SOC 2 not yet
done. DPA available on request. GDPR-portable / GDPR-deletable
already implemented at the data layer.

**Next move.** If trigger fires: be honest immediately. Offer the
buyer the procurement page + a phone call with founder. If their
requirement is hard-locked on SOC 2, that's the deal that justifies
the audit spend. Don't promise what we don't have.

---

## R.11 · Founder voice in dashboard becomes a graveyard

**Risk.** Dashboard, completion-celebration, /alumni copy is written
in founder voice today (Antaeus, signed lines, etc.). If founder
ceases to be the operating face — by choice or otherwise — the copy
reads stale.

**Trigger.** Founder transition; founder rotation to advisory; founder
stepping back.

**Blast radius.** Every signed surface either has to be re-written
(weeks) or stays and reads like a haunting (ongoing).

**Current state.** Founder voice is identifiable + concentrated in
predictable surfaces (emails signed Antaeus, /about, dashboard
completion celebration).

**Next move.** Catalogue all founder-voice surfaces in a single
manifest. If transition is foreseeable: write the version-2 voice
register before the transition, not after. The voice canon already
defines "founder voice vs brand voice" — make it executable.

---

## Review cadence

- **Monthly:** scan triggers; if any have fired, promote that row to
  active workstream and address in the next planning window.
- **Quarterly:** full re-read of this doc; retire risks that have
  resolved; add risks the audit surfaced.
- **Annually:** rewrite — voice and content drift. Don't just patch.

Risks not on this list intentionally:
- Litigation risk (handled separately; outside this doc's scope)
- Personal/HR risk (no employees yet; revisit at scale)
- Tax / corporate-form risk (sits with the accountant)
- Macro market risk (genuinely outside our control; not actionable)
