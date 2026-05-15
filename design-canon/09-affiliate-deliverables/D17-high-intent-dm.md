# D17 — High-Intent DM (Post-Workshop)

**Deliverable:** Short, manual, one-to-one direct messages sent within 24–48 hours of a live workshop to attendees who exhibited specific high-intent behaviors. Sent via LinkedIn DM **or** email under the Admissions alias — never automated, never templated past these variants.
**Audience:** Workshop attendees (or replay-watchers) who matched at least one trigger in the trigger matrix below. Hand-screened by the founder against the live-workshop log (canon §12.2 lurk-and-listen) before any DM goes out.
**Voice ratio:** 80 Rowan / 20 Michael per canon §3.3. Operator-to-prospect; verdict mode with a single warmth beat. The Michael beat is one line, max.
**Sender:** Admissions alias (canon §12.1, §12.3) — `[ALIAS_FIRST_NAME], AESDR Admissions`. Founder is the human behind the alias; the alias is the role presented to the prospect.
**Channels:** LinkedIn DM (canon §5.2 — *permitted use: manual, semi-manual, high-intent follow-up to specific named individuals*). Or email if no LinkedIn handle and the prospect opted into post-workshop follow-up at registration. Never both — one channel per prospect.
**Length:** 50–80 words. Single screen on mobile. No images, no signature graphic.
**Cadence:** One DM. No follow-up. If no reply within 7 days, the contact closes — they go onto the standard nurture (D14 replay → D15 objection → D18 deadline). The DM is a *door*, not a *sequence*.
**Canon refs:** `AFFILIATE_BRAND_CANON.md` §1.6 (honesty), §3.1 (Rowan), §3.2 (Michael), §3.3 (voice ratios), §4.1 (banned vocab), §5.2 (LinkedIn permitted use), §10.1 (FTC disclosure), §12 (founder-backstage doctrine), §13 (honesty discipline).

> **Placeholder convention:** This file uses `[FIRST_NAME]` for the prospect, `[ALIAS_FIRST_NAME]` for the Admissions alias (founder presented as Admissions per canon §12.3), `[HOST_FIRST_NAME]` and `[HOST_LAST_NAME]` for the workshop host, and `[PARTNER_NAME]` for the partner who hosted them. Swap globally before send. The Admissions alias is pending canon outstanding-question §3 — until that resolves, default is `Admissions` as the displayed sender role with no fictional first name (single-word sender).

---

## Trigger matrix

A prospect qualifies for a D17 DM **only** when at least one trigger fires. No trigger → no DM. The triggers are the discipline; without them, this becomes spam.

| # | Trigger | Source signal |
|---|---|---|
| T1 | Asked a substantive question in live chat | Founder log of live chat (canon §12.2). The question is specific, names a real situation, and reads as a current operator — not a hypothetical. |
| T2 | Stayed for the entire Q&A and posted ≥ 1 comment | Live attendance log + chat log. Indicates the room held them. |
| T3 | Started checkout, did not complete | Stripe webhook event `begin_checkout` without subsequent `purchase` event, attributed to this pilot's UTM/code. |
| T4 | Watched the full replay within the first 24 hours and clicked the offer page | Replay-page analytics (canon §8.7 UTM canon) + offer-page page-view event. Both within 24h of replay opening. |
| T5 | Replied to D13 / D14 / D15 with a question | ESP reply log. The reply contains a question mark and is not "unsubscribe me." |
| T6 | Specifically named the partner audience or shared a post-workshop reaction back to the partner that the partner forwarded | Partner-side relay. Required: partner explicitly OK'd forwarding (canon §16). |

If no trigger fires, the prospect runs the standard nurture. They are not punished by under-attention; they are simply not in the high-intent door.

---

## Variants

Six variants — one per trigger. Use the variant whose trigger fired. If multiple triggered, pick the **earlier** trigger in time (T1 generally precedes T3, T3 precedes T4). Do not combine variants.

Each variant is a single DM. **Do not** attach a calendar link in the first message — the message is a door, not a meeting. Calendar link goes in the *reply*, only after they respond.

---

### Variant V1 — Asked a substantive question (T1)

> *[FIRST_NAME] — your question about [paraphrase of their actual question, 6–10 words] was the most useful one in the chat. The honest answer is longer than [HOST_FIRST_NAME] could give live. If it'd be useful, I can send a 3-sentence version of where AESDR Lesson [N] takes that exact problem.*
>
> *I'm [ALIAS_FIRST_NAME] — I run Admissions for AESDR. No pitch, no calendar invite. Just answering the question.*
>
> *— [ALIAS_FIRST_NAME], AESDR Admissions*

**Notes:**
- Lesson reference must be real. Use the lesson map in `D31-curriculum-map.md` (proposed) or, in the interim, the slide-14 framework grouping in D09. Do not promise a lesson that doesn't exist.
- If their question was on a topic AESDR genuinely doesn't cover (rare — most workshop questions land in the curriculum), the honest move is: *"AESDR doesn't cover [topic] directly — the closest lesson is [N]. If [topic] is the bigger blocker, AESDR may not be the right fit; happy to point you somewhere else."* That's canon §13 honesty discipline.
- The "no pitch, no calendar invite" line is load-bearing. It earns the reply by being the opposite of every other DM in their inbox.

---

### Variant V2 — Stayed for full Q&A, posted in chat (T2)

> *[FIRST_NAME] — saw you in the chat through the full Q&A, including [reference to a specific moment they reacted to — "the pipeline-integrity slide" or "the activity-vs-judgment self-assessment"]. That's the cohort I built AESDR for.*
>
> *No pitch in this message. Just: if you want a 60-second read on whether the program fits where you're at — what you're working on this quarter, what your manager is on you about — I'll write it. Reply with one sentence and I'll write the second sentence.*
>
> *— [ALIAS_FIRST_NAME], AESDR Admissions*

**Notes:**
- The "I built AESDR for" phrasing is a deliberate breach of the founder-backstage doctrine (canon §12.1) — but it's permitted under §12.3 because the alias does not lie about being principal. The phrasing flags principal-level investment without naming the founder.
- The "reply with one sentence and I'll write the second sentence" is the canonical move. It earns reply rate by reducing the cost of replying to one sentence.

---

### Variant V3 — Started checkout, did not complete (T3)

> *[FIRST_NAME] — I run Admissions at AESDR; I get an alert when someone opens the checkout page and doesn't finish. No automated email is going to follow. I figured a real message was the more honest move.*
>
> *Three things that usually cause the back-button: pricing, refund clarity, or "I want to talk to my manager about reimbursement first." If it's the third one, I have a one-page brief built for that conversation. The other two have plain answers and I can send them in two sentences.*
>
> *Which one was it?*
>
> *— [ALIAS_FIRST_NAME], AESDR Admissions*

**Notes:**
- The "I get an alert" line is honest — Stripe webhooks do fire on `begin_checkout` (canon §10 instrumentation). Not a manipulation; a stated fact.
- The L&D-reimbursement brief is the forward dep flagged in D16 — when D16's PS pointed to "L&D-approver brief PDF," this is the same artifact. Closes the dep loop.
- The "no automated email is going to follow" line is honest *and* differentiating. Most checkout-abandon flows lie about being human. We're not lying.

---

### Variant V4 — Watched replay + clicked offer page within 24h (T4)

> *[FIRST_NAME] — saw you watched the replay end-to-end yesterday and clicked through to the offer page. That's the path most enrollers take in the first week of a pilot, but it's also the path most thinkers-about-it take and then they drift.*
>
> *Honest question: are you a "this looks right but I want to sleep on it" or a "this looks right but I have one specific question"? Both are normal. The second one I can answer in this DM.*
>
> *— [ALIAS_FIRST_NAME], AESDR Admissions*

**Notes:**
- Names the two patterns specifically. Most prospects in this state self-identify in the reply.
- "Honest question" is canonical AESDR phrasing — earns the right to ask by being one.
- Per canon §3.3, this variant runs slightly higher Michael (the "drift" beat carries the 20% Michael register).

---

### Variant V5 — Replied to D13/D14/D15 with a question (T5)

> *[FIRST_NAME] — your reply to the [name the email — "same-day follow-up" or "the free-vs-structured email"] was the kind of question that usually gets answered with a calendar link. I'm going to answer it instead.*
>
> *[2–4 sentence answer to their actual question, in plain English, with a specific reference to the AESDR lesson or framework that addresses it.]*
>
> *If that lands, the offer page is below — same code, same deadline. If it doesn't land or it raises a follow-up, reply here.*
>
> *— [ALIAS_FIRST_NAME], AESDR Admissions*
>
> *aesdr.com/[PARTNER_SLUG]/enroll · code [PILOT_CODE] · closes [CODE_EXPIRY]*

**Notes:**
- This variant requires the most editorial work — the answer paragraph is hand-written per prospect. **No template.** The trigger fired because they asked a real question; the response has to be a real answer.
- Per canon §13, if the honest answer is "AESDR doesn't address this," say so. Refer them out.

---

### Variant V6 — Partner-relayed reaction (T6)

> *[FIRST_NAME] — [PARTNER_NAME] forwarded your reaction to the workshop. They specifically flagged your comment about [paraphrase of their reaction, 6–10 words], which is exactly the operating gap AESDR Lesson [N] is built for.*
>
> *I'm not going to make this DM into a pitch. Your question, if you have one, is the more useful thing. If you'd rather just enroll and skip the conversation, the offer page is below.*
>
> *— [ALIAS_FIRST_NAME], AESDR Admissions*
>
> *aesdr.com/[PARTNER_SLUG]/enroll · code [PILOT_CODE] · closes [CODE_EXPIRY]*

**Notes:**
- Requires explicit partner permission to relay (canon §16 approval gate). Document the permission in the pilot folder before sending.
- Names the partner because the trust is partner-conferred — naming it is honest, not name-dropping.

---

## What does *not* belong in any D17 variant

Per canon §4.1 banned vocab and §5.3 anti-cliché doctrine:

- "Just wanted to circle back."
- "Hope this finds you well."
- "Quick question."
- "Synergy" / "leverage" / "amazing" / "rockstar" / any banned word.
- Multi-paragraph pitches. The DM is short by design — see length target.
- Calendar link in the first message.
- "Limited time bonus" framing. Pilot pricing is honest; no manufactured urgency (canon §9.2).
- An emoji. Anywhere.
- A signature graphic / banner image. Plain text only.
- Any reference to revenue, sales numbers, or testimonial counts. Per canon §10.3 forbidden claims.

---

## Compliance check (canon §10)

- **FTC disclosure (canon §10.1):** Variants V5 and V6 carry the offer-page URL with `[PILOT_CODE]`. The offer page itself carries the disclosure. The DM does not need to repeat the disclosure provided the link target carries it. **Pass.**
- **CAN-SPAM (canon §10.4):** Email-channel sends include the standard email footer and a working reply (Admissions alias inbox). LinkedIn DMs are not subject to CAN-SPAM (1:1 personal correspondence). **Pass.**
- **TCPA / SMS (canon §10.5):** D17 is not an SMS deliverable. **N/A.**
- **No consent issue on email channel:** D17 only sends to a workshop registrant who, by registering, opted in to post-workshop transactional follow-up (canon §7.4 + §10.4). **Pass.**

---

## Visual treatment notes

D17 is a plain-text deliverable — no visual surface beyond message body type. Per canon §6.9.2, this block applies to visual-bearing surfaces; D17's only "visual" is the host's actual LinkedIn profile photo (handled by Admissions alias setup, canon §12.3). The body of the DM is plain text by intent — visual signals would undercut the operator-to-operator register.

**Palette:** N/A (plain text in the channel's native render).

**Type tokens:** N/A (channel-native).

**Iconography:** None. No emoji, no graphical signature.

**Iris usage:** None.

**Five-question check (canon §6.9.1):**
1. **Thumbnail at 200×200:** N/A — no rendered visual.
2. **Token check:** N/A — no design surface.
3. **Iris reservation:** Pass (zero use).
4. **Icon discipline:** Pass (zero use).
5. **Voice thumbnail:** *"your question about [X] was the most useful one in the chat. The honest answer is longer than [HOST_FIRST_NAME] could give live."* — passes; identifiably AESDR. The "no pitch, no calendar invite" line and the "I'll write the second sentence" closer would not appear under any other SaaS-training brand.

---

## Reply protocol

When a prospect replies:

1. **Reply within 4 business hours** under the Admissions alias. Per canon §12.2, the founder is the human behind the alias and must own the speed.
2. **Answer the prospect's question first.** Do not lead with the calendar link. The DM was a door; the reply is the room.
3. **If they ask for a call**, send the Cal.com / SavvyCal link to the Admissions alias calendar (canon §12.3). 30-minute slots. No "discovery call" language — the booking is "AESDR conversation."
4. **If they ask "are you the founder?"**, the answer is honest: *"I'm the principal at AESDR — same person, different role for these conversations. Why do you ask?"* Per canon §12.3, anonymity is positioning, not deception.
5. **If they don't reply in 7 days**, the contact closes silently. They roll back into the standard nurture. No "just bumping this!" follow-up. No second DM.

---

## Logging requirement

Every D17 send and every reply gets logged to the pilot folder:

`docs/partner/pilots/[PARTNER_SLUG]/d17-log.md`

Fields per row:
- Date sent
- Channel (LinkedIn DM / email)
- Trigger (T1–T6)
- Variant used (V1–V6)
- Reply received (Y/N, date)
- Outcome (purchased / opted-out / ghosted / referred)
- Notes (1 sentence — what the conversation taught us about the ICP, the offer, or the workshop)

The log feeds into the canon-revision queue (canon §17) and into D33 postmortem.

---

## Forward dependencies

This DM depends on:
- **Admissions alias setup** — canon §12.3 outstanding question. Until the alias is real (real LinkedIn account, real calendar, real inbox), D17 cannot ship at scale. **Blocks production sends.**
- **D09 workshop deck** — variants V1, V2, V4, V5 reference live moments and lesson numbers. Both are stable now. **Met.**
- **Live-workshop chat log + checkout webhook + replay analytics** — all standard instrumentation per canon §8.7 UTM and the report's instrumentation table. **Operationally pending.**
- **L&D-approver brief PDF** — V3 promises this in 2 sentences. Forward dep flagged in D16. **Pending.**

This DM is a forward dependency for:
- **D33 postmortem** — every D17 reply is a data point for the rolling objection log.
- **D23 FAQ** — patterns in D17 replies feed FAQ revisions.

---

## Open

- Admissions alias displayed-sender format. Default: single-word `Admissions` until the alias gets a real first name (canon §12.3 outstanding question). Alternative: a fictional first name (`Sam, AESDR Admissions`). Recommend default; fictional first name reads slightly less honest.
- Whether to ship a V7 variant for *team-buyer* signals (manager attended, asked about cohort licensing). Default: **not in batch 5** — D17 is one-to-one consumer pull. Team-buyer is a different motion that probably warrants its own deliverable.
- Partner permission protocol for V6. Default until codified: written OK in the pilot folder before forwarding. Codify in D27 partner vetting scorecard so it's a contract item, not an ad-hoc.
- LinkedIn-vs-email channel decision. Default: LinkedIn DM if both are available, because the channel itself signals operator-to-operator. Email if no LinkedIn handle.
- Whether the Admissions alias should have a separate AESDR.com email signature with the same plain text (no banner, no graphic). Default: **yes** — and it should match the DM's plain-text register exactly. No signature drift.
