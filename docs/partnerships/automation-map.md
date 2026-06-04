# Partnerships OS — Automation Map

**What this is:** every task in the 90-day partnerships plan
(`content/internal/partnerships-os.html`), tagged for who runs it, with the
owning agent. Built to answer one question: *how much of this can agents run
end-to-end, while hard-gating everything a person should do by hand?*

**Source of truth for tasks:** the 90-day OS. **Source of truth for agents:**
`.claude/agents/*.md`. Where the two disagree, this doc proposes the change and
says so.

---

## How to read it

Every task carries one tag:

| Tag | Meaning |
|---|---|
| **`[A]` agent: autonomous** | An agent does it start to finish. No human in the loop. Safe because it's reversible, internal, or transactional. |
| **`[D]` agent-drafts → you-approve** | An agent prepares the whole thing; a human gives one yes before it goes out or commits. The approval is the gate — the *labor* is automated. |
| **`[H]` human-only** | A person must do this. Not because an agent *can't* type it, but because the value IS the human: money, signatures, relationship gravity, or the first word to a stranger. |

The design principle, stated plainly: **automate the preparation of everything;
gate the irreversible and the relational.** This is already how your agents
think — `scribe` drafts but never sends, `ledger` shows SQL before any write,
`almanac` never fabricates. The new agents inherit the same posture.

---

## The Gate — what stays `[H]` human-only, and why

Three categories. If a task is in one of these, no agent closes it, ever.

1. **Irreversible money & legal.** Real payout batches. Signing channel terms.
   A bad autonomous transfer or an auto-signed contract is not a bug you roll
   back — it's a partner you lose and possibly a lawyer you call. The *math*
   that leads up to it is `[A]`; the *act* is `[H]`.

2. **Relationship gravity.** The founder onboarding call. The 3-way channel
   close. The honest "no" to a partner who didn't fit. These work *because* a
   real person showed up. An agent doing them doesn't save time — it removes
   the one thing being sold.

3. **First contact with a stranger, and any net-new claim.** Cold first-touch
   to someone who's never heard of AESDR: an agent drafts it and a human reads
   it once before it sends. `warden` can mechanically catch banned words, but a
   human blesses the first impression and anything that asserts a *new* claim
   about the product. (Once a relationship exists, transactional replies to
   *that* person drop to `[A]` — see Courier's tiers below.)

Everything else is fair game for automation.

---

## The roster — 7 existing + 3 new

### Keep, lightly edit

| Agent | Today | Edit for full coverage |
|---|---|---|
| **scout** | Discovery → writes scored rows to `partner_pipeline`. | None needed. Already `[A]`. |
| **dossier** | Enrichment brief (read-only). | None needed. Already `[A]`. |
| **scribe** | Drafts outreach, **never sends**. | Keep "never sends." Add: also drafts **inbound replies** (yes / pricing-question / not-now), not just cold first-touch. Hands approved drafts to **Courier** instead of the human's clipboard. |
| **warden** | Brand-fit review of affiliate copy. | Add: also the final canon gate on **outbound mail Courier is about to send** — nothing in a banned register leaves the building, inbound or outbound. |
| **ledger** | Attribution/payout SQL (read-only default). | Add the **inbound-signal tables** to its purview — `affiliate_prospects`, `affiliate_prospect_events`, the enterprise-intent rows — so it can report on *interest*, not just *attribution*. |
| **herald** | Channel/enterprise research + structuring. | None needed. Drafts; founder closes. Already `[D]`/`[H]` split. |
| **almanac** | Daily standup + Friday review (cron). | Add: surface **Sentinel's overnight alerts** in the morning standup, and know the 3 new agents when it writes the cadence doc. |

### Add (the gaps — this is the missing ~half)

| New agent | Role | Default tier | Tools |
|---|---|---|---|
| **sentinel** | The watcher. Polls the inbound signals — enterprise/teams interest-form fills (`kit_enterprise_intent_submitted`), `request_conversation_clicked`, new replies in `affiliates@`, click spikes on `/r/[slug]` — classifies "is this real interest?", and **alerts you** (email/Slack/whatever) with the context already assembled. Routes the signal to the right next agent. | `[A]` | Bash, Read (DB + inbox poll) |
| **courier** | The send executor — the thing the roster has never had. Transmits mail **only** from an approved draft. **Tiered authority** (below). This is what turns "scribe drafts" into "mail actually goes out" without handing a stranger an un-read first impression. | tiered: `[A]` for transactional, `[D]` for cold/channel | Bash (Resend/SMTP), Read |
| **usher** | Workshop + nurture-sequence runner. Owns the `/[slug]/workshop` logistics, reminders, the replay window, and the multi-step nurture ladder (the 5-touch follow-up the pilot spec describes). Schedules and reminds autonomously; **hosting stays `[H]`**. | `[A]` for logistics, `[H]` for the live hour | Bash, Read, Write |

> **Why not more agents?** The follow-up ladder (`contacted → +4 → +9 → cold`)
> doesn't need its own agent — it's `almanac` detecting "who's due" → `scribe`
> drafting → the gate → `courier` sending. Orchestration is a cron + the agents
> you have, not a new persona. Three new agents covers the gaps; more is sprawl.

---

## Courier's tiers (the load-bearing part of "can it send?")

The 90-day doc deliberately keeps *sending* human ("never CC, never BCC, send
each one individually"). That instinct is right for cold first contact. But not
every email is cold first contact. Courier splits the difference:

| Tier | Examples | Authority |
|---|---|---|
| **Transactional** | Kit link to someone who already said "yes." Booking confirmation. Receipt. Replay link to a registrant. "Here are the numbers you asked for" to an existing partner. | **`[A]`** — autonomous. These go to people who already engaged; the content is templated and factual. |
| **Sequenced** | Follow-up #1 (+4d) and #2 (+9d) in the ladder, to a candidate you already chose to contact. | **`[D]` once, then `[A]`** — you approve the *ladder* for a candidate at first-touch; the follow-ups then fire on schedule unless you pull them. |
| **Cold / Channel / Net-new claim** | First-touch to a stranger. Channel first-touch. Anything asserting something new about the product. | **`[D]`** — always. Drafted by scribe/herald, gated by warden, read by you, *then* Courier sends. |

Net effect: the **volume** of sending becomes autonomous (the transactional and
sequenced mail, which is most of the message count), while the **first word to a
stranger** stays gated. That's "as close to everything" without giving up the
thing that makes the first touch land.

---

## The mechanical-ops layer you asked about

Concretely, the email + alert plumbing, and what's already half-built:

**Inbound interest → alert (the "tell me when someone's actually interested"
ask).** Already partly wired at the app level: `/x/track` fires a Resend email
to you on `kit_enterprise_intent_submitted` and `request_conversation_clicked`,
and `/x/ops` shows the roster. **Sentinel** is the agent layer on top: instead of
a hardcoded email per event, it watches the `affiliate_prospect_events` table +
the `affiliates@` inbox, applies judgment ("this enterprise form-fill names a
real 25-seat deal — ping now" vs "this is a tire-kicker — batch into the daily"),
and routes. The enterprise/teams form on the curriculum page is exactly its
beat.

**Inbound email → triage → reply.** Sentinel detects a new reply in `affiliates@`
→ classifies it (yes / pricing-q / not-now / out-of-office) → hands to **scribe**
to draft the matching reply → **warden** clears the register → **courier** sends
(transactional tier = autonomous for a "here's the kit + booking link" reply;
cold-equivalent stays gated).

**Outbound email → send.** scribe/herald draft → warden gate → courier transmit,
at the tier above. The Resend key + `affiliates@` routing already exist (the
kit's enterprise-intent email proves the pipe works).

**Alerts you'd want, day one:** enterprise/teams form-fill, a "request
conversation" click, a reply landing in the inbox, an affiliate's link clicks
spiking, a refund-rate breach (>15%), an attribution stuck past its window.
Sentinel owns the first four; ledger already flags the last two — Sentinel just
surfaces them to you in real time instead of waiting for the Friday pull.

---

## The task-by-task map

Legend: **`[A]`** autonomous · **`[D]`** drafts→you-approve · **`[H]`**
human-only. Owner = the agent (or person/system) that runs it.

### PHASE 30

**Week 1 · Days 1–5 — stand up the machine**

- `[H]` Founder grants the 5 system creds (Supabase, Cloudflare, GitHub, Stripe, Vercel) — **Founder.** Gates all of week 1; a person clicks invite.
- `[A]` Local toolchain: clone repo, `npm install`, Supabase CLI + Wrangler install, link + pull schema — **a setup agent / Claude Code** (mechanical, reversible).
- `[A]` Read the canon end-to-end; run `canon-check.mjs --soft`; calibrate on real creator copy — **warden.**
- `[A]` Walk live buyer surfaces, read-aloud R-G5 test — **warden** (reports findings).
- `[A]` Scaffold the `.claude/agents` roster, scope tools, test each one-shot, commit — **Claude Code** (this is the one-time bootstrap).
- `[A]` Map the affiliate schema; read the 5 tables; write down economics — **ledger.**
- `[A]` Stand up `partner_pipeline` (migration, push, verify count=0) — **ledger.**
- `[D]` Add the "Partner Pipeline" AdminChip link — **Claude Code drafts the diff → you merge** (touches the app).
- `[A]` Discovery doctrine doc; Scout Sweep 1 (15 candidates); pipe survivors to Dossier; Ledger inserts at `enriched` — **scout → dossier → ledger.**
- `[A]` Open attribution-platform matrix; read the build-cost memo; re-audit attribution + note the cron gap — **ledger.**

**Week 2 · Days 6–10 — fill the funnel + arm the language**

- `[A]` Verify the head-start intel list; Dossier-verify each motion — **dossier.**
- `[A]` Scout Sweeps 1–3 (communities, newsletters/podcasts, practitioner networks); enrich survivors; Ledger bulk-insert to ~50 rows — **scout → dossier → ledger.**
- `[A]` Composite ranking query → top 25; apply cuts; update statuses (`enriched` + next-action, rest → `cold`) — **ledger** (the cut *criteria* are codified; an edge-case cut is `[D]`).
- `[D]` Draft the reusable outreach scaffolding — 5 base + 3 motion templates; lock the disclosure block; canon-check the folder — **scribe drafts → you bless the templates once** (they become the autonomous substrate).

**Week 3 · Days 11–15 — first contact**

- `[A]` Verify `affiliates@` inbox delivers (Cloudflare Email Routing); send + confirm a test mail — **sentinel** (owns inbox health) / **courier** (sends the test).
- `[A]` Set "send-mail-as" / reply-to identity — one-time setup, **Claude Code / you.**
- `[D]` **The first 25 first-touches** — scribe personalizes each → warden clears → **you read each once** → **courier** sends individually (never CC/BCC). This is the canonical cold-send gate: labor automated, first word to a stranger approved.
- `[A]` Log each send to `partner_pipeline` (`contacted`, +4d next-action) — **courier writes its own send-log; ledger owns the table.**
- `[A]` Same-day **detection** of replies; classify each — **sentinel.**
- `[D]` Reply to a "yes" with kit + booking link → **transactional, so courier can auto-send** once scribe drafts; treat the very first reply to a brand-new contact as `[D]` if it asserts anything beyond the template.
- `[D]` Reply to "what's the commission?" with the honest numbers — scribe drafts the factual reply → **courier `[A]`** (it's templated truth) — flag to you only if they negotiate.
- `[A]` Morning: surface who's due on the ladder — **almanac.**

**Week 4 · Days 16–22 — calls + the attribution call**

- `[D]` Assemble + send the Pre-Call Bundle 24–48h pre-call (1-pager, course preview, kit, transparency link) — scribe/ledger assemble → **courier `[A]` for the assembled bundle**; the **founder Loom inside it is `[H]`** (record on Loom — no agent).
- `[H]` **Run the partner intro calls** (8–10), hit the four beats, close on the binary ask — **you.** Relationship gravity.
- `[A]` Pre-call prep: reopen the Dossier brief, open Stripe tab — **dossier** surfaces; you read.
- `[A]` Log each call result (`negotiating` / `passed`) — **ledger** (you say the outcome; it records).
- `[D]` Decide the attribution platform; write the decision memo; **email it to the founder** — **ledger drafts the memo → you make the call** (the JD says it's your call) → courier delivers to founder `[A]`.
- `[D]` Implement the choice; schedule the affiliate cron in `vercel.json` if extending custom — **ledger drafts the migration/config → you merge.**

**Week 4½ · Days 23–30 — activate + close phase 30**

- `[D]` Create the first 3–5 affiliates (`/admin/affiliates/new` or Ledger insert); flip `vetting → active`; confirm commission/window — **ledger drafts the inserts → you confirm** (it onboards real partners).
- `[A]` Send each new affiliate their kit + archetype playbook links — **transactional → courier `[A]`** (they already signed on).
- `[A]` Review first copy in the queue; APPROVE/EDITS/DECLINE — **warden** (EDITS auto-route back to the partner via courier).
- `[A]` Phase-30 metrics pull; check the 4 milestones against artifacts — **ledger.**
- `[A]` Draft the 30-day founder memo (8 lines); **send to founder** — **almanac drafts → courier delivers `[A]`** (internal, low-risk).

### PHASE 60

**Week 5 · Days 31–37 — drive the gate + prove tracking**

- `[A]` Drive the first cohort through the copy gate; review each submission within 24 business-hours — **warden** (per-piece, autonomous verdicts).
- `[A]` Point each affiliate at playbooks → submissions; watch the gate counter; tell them when they clear — **usher** (nudge + status), copy verdicts by **warden.**
- `[A]` Confirm `/r/[slug]` tracking end-to-end; run a live test purchase; verify the attribution row (`pending`, +30d) — **ledger** (Stripe test card is reversible).
- `[H]`/`[A]` Walk an affiliate through their dashboard (screen-share) — **you** if it's a relationship touch; the *prep* is **ledger.**

**Week 6 · Days 38–44 — open the channel motion**

- `[A]` Verify + extend Herald's channel list; walk the enterprise surfaces; source 10 channel candidates; non-cannibalization test each — **herald.**
- `[A]` Ledger inserts channel candidates (`motion=channel`); cut to 3 strongest — **herald → ledger.**
- `[D]` Draft channel first-touch for the 3 strongest; pick a structure per partner — **herald drafts → you approve.**
- `[D]` **Send** channel first-touch one-to-one; flag large deals for founder — **courier sends post-approval** (cold/channel tier = always `[D]`).
- `[A]` Log each to `partner_pipeline` — **ledger.**

**Week 7 · Days 45–51 — reporting live + first payout**

- `[A]` Build `affiliate_weekly_report` view; confirm columns; pipe to `reports/`; Friday 8-line note — **ledger** (view) **→ almanac** (note).
- `[A]` Surface 3 headline numbers on an admin dashboard tile — **ledger** drafts the tile diff → `[D]` to merge.
- `[A]` First payout **dry-run**: list cleared-but-unpaid per affiliate — **ledger** (read-only, autonomous).
- `[H]` Walk the founder through the numbers; **run the real payout batch** with founder approval — **you + founder.** Irreversible money. (After this one blessing, month-end payouts drop to `[D]`.)

**Week 8 · Days 52–60 — work the middle + close phase 60**

- `[D]` Work the `negotiating` middle: onboarding follow-ups; run create-affiliate as they say yes — **scribe drafts the follow-up → courier sends (sequenced tier) → ledger creates the affiliate on your yes.**
- `[H]` Unstick a gate-stalled affiliate with a 15-min co-writing call — **you + warden** (the call is relational; warden assists live).
- `[A]` Refill if thinning: fresh Scout sweep → Scribe → Warden survivors — **scout → scribe → warden** (sourcing is autonomous; the cold *sends* that result are `[D]`).
- `[A]` Phase-60 milestone check; trajectory math; draft the 60-day founder memo; decide the phase-90 bet — **ledger + almanac** draft → **you** make the bet → courier delivers.

### PHASE 90

**Week 9 · Days 61–67 — overinvest + the channel close**

- `[A]` Top-3 ranking query; extract WHY each converted (the repeatable pattern); Scout 10 lookalikes — **ledger → almanac → scout.**
- `[H]`/`[A]` Overinvest: co-create a second piece with each top-3 (relational, **you** + warden); schedule a workshop with each (**usher `[A]`** for logistics); bump a proven performer to proven tier (**ledger** config, `[D]`).
- `[D]` Draft the lead channel-deal terms (structure, attribution, split, term) — **herald drafts → you review.**
- `[H]` **Bring the founder in for the close — the 3-way call.** Flag legal early. **You + founder.** Gravity + irreversible.

**Week 10–11 · Days 68–81 — codify + scale the second wave**

- `[A]` Write `operating-cadence.md`; codify the agent dispatch rhythm as a table; document the follow-up ladder as cron logic — **almanac.**
- `[D]` Second affiliate wave at scale (Scout → Dossier → Scribe → ladder for 25 more from cold + fresh) — **agents do the whole funnel; the cold first-touches remain `[D]` sends via courier.**
- `[A]`/`[H]` Pilot a workshop with the strongest affiliate — **usher** schedules + co-promotes + reminds (`[A]`); **you** host (`[H]`).
- `[A]` Push self-serve onboarding (point partners at `/playbooks`); keep the funnel deep — **usher + scout.**

**Week 12–13 · Days 82–90 — prove it runs**

- `[A]` Monthly run-rate vs $3k; refund-rate health check; update the founder dashboard tile — **ledger.**
- `[D]` Month-end payout (now founder-approved-process from phase 60) — **ledger dry-run `[A]` → you execute `[D]`.**
- `[A]`/`[H]` Refund-rate >15% on any affiliate → **warden** review + a debrief call (`[H]` if it happens).
- `[A]` Build the 90-day proof: full metrics pull + write-up; show the cadence doc as proof the function runs without the founder — **ledger → almanac.**
- `[H]` **Present the 90-day review + next-quarter plan to the founder** — **you.** The whole point was to earn this conversation.

---

## Coverage — does it hit 80%?

Counting the ~95 discrete tasks across the 90 days:

| Tag | Share | What it is |
|---|---|---|
| **`[A]` autonomous** | **~60%** | All discovery, enrichment, reporting, metrics, transactional + sequenced mail, alerting, scheduling, gate-reviews, schema/ops. The daily *volume*. |
| **`[D]` drafts→approve** | **~25%** | Cold/channel sends, affiliate creation, app-diff merges, the founder memos, attribution decision. Agent does 95% of the labor; you give one yes. |
| **`[H]` human-only** | **~15%** | The intro calls, the channel close, real payouts, the founder Loom, the honest-no, the 90-day review. The irreplaceable handful. |

**So: ~60% runs with no human, ~85% runs with at most a one-click approval, and
~15% is the deliberately-human core.** That clears your 80% bar — *if* the three
new agents (sentinel, courier, usher) get built, plus the small edits to scribe,
ledger, warden, almanac. The current 7 alone get you to roughly the `[A]` 35–40%
(prep only) you already have; the send/receive/alert/workshop layer is the
missing ~half, and it's three agents plus the Resend/inbox plumbing that's
already partly wired.

---

## What to build, in order

1. **sentinel** — highest leverage, lowest risk. It only *reads and alerts*. Wire
   it to `affiliate_prospect_events` + the `affiliates@` inbox first; it answers
   the "tell me when someone's actually interested" ask on day one. Nothing it
   does is irreversible.
2. **courier** — the send executor, built tier-by-tier. Ship the **transactional**
   tier first (auto-reply kit links, booking confirmations — all to people who
   already engaged), prove it, then enable **sequenced**, and keep **cold** gated
   indefinitely.
3. **usher** — workshop + nurture orchestration. Lower urgency; comes online when
   the first workshop is scheduled (~Day 61).
4. **The edits** to scribe (inbound replies), ledger (signal tables), warden
   (outbound gate), almanac (surface alerts) — small, do them alongside.

Nothing here asks you to give up a single thing on the Gate list. It asks the
agents to do everything *up to* it.
