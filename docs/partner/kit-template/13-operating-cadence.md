# 13 — Operating Cadence

> **What this is:** The week-by-week operating cadence for a 30-day AESDR pilot. Expands D40 §5's summary table into the full schedule of who does what, when. Use this as the working document while running the pilot — it sits alongside D22 (the contract), D25 (weekly reports), and your tracking-links file (`11`).
>
> **Cadence type:** Default 30-day pilot. If your pilot window is longer or shorter, AESDR ops adjusts this document for you; do not modify the cadence on your own.
>
> **Reading the table:** Each row is a calendar day or a date-range. The "Partner" column lists what you do; the "AESDR" column lists what AESDR does. "Joint" rows are when both parties act together.

---

## Pilot calendar at a glance

| Phase | Days | Window |
|---|---|---|
| Pre-launch / kit handoff | T-21 → T-15 | Pre-promotion |
| Promotion week 1 | T-14 → T-8 | Launch send + first awareness |
| Promotion week 2 | T-7 → T-1 | Reminder send + tech rehearsal |
| Workshop day | T-0 | Live workshop + immediate replay open |
| Replay window | T+1 → T+3 | 72-hour replay open + same-day attendee follow-up |
| Pricing window close | T+4 → T+7 | Deadline-window emails + final conversions |
| Pilot close | T+8 → T+30 | Attribution close, kill-or-keep, postmortem |

Where `T` = workshop date.

---

## Pre-launch (T-21 → T-15)

| Day | Partner | AESDR |
|---|---|---|
| T-21 | Sign D22. Receive kit folder. Read `00-canon-excerpt.md` first. | Build out tracking infrastructure (UTMs in `11-tracking-links.md`, Stripe webhook setup, registration-page generation for `aesdr.com/[PARTNER_SLUG]/workshop`). |
| T-20 | Confirm kick-off call time. Read kit folder, especially D40 README. | Build co-brand lockup variants (10a/b/c) per canon §6.6. Issue them to the kit. |
| T-19 | Kick-off call (30 min). Confirm send schedule, audience descriptor, partner intro reason. Surface any kit-content questions. | Founder runs kick-off call. Capture partner intro reason for `09c` script. |
| T-18 | Schedule promotion sends in your channel calendar. | QA registration page (D26) end-to-end with test traffic. Verify token-issuance for replay link. |
| T-17 | Confirm `[YOUR_FIRST_NAME]`, `[YOUR_AUDIENCE_DESCRIPTOR]`, and any optional partner-quote per D26 §6. | Issue kit-PDF render of your partner-quote slot for D26. Surface any approval edits. |
| T-16 | Final review of `09a` newsletter launch with placeholders filled. Submit if any deviation from template per D40 §3. | Pre-launch review of all `09*` files for your pilot. Approval response within 24 business hours. |
| T-15 | All-systems-go check-in. | All-systems-go check-in. Final sign-off on launch readiness. |

**By end of T-15:** Kit confirmed. Send `09a` ready to publish. Tracking working. Co-brand assets approved. Partner intro script (`09c` Script 1) practiced once.

---

## Promotion week 1 (T-14 → T-8) — Launch

| Day | Partner | AESDR |
|---|---|---|
| T-14 | Send `09a` newsletter launch. Post Social Post 1 (`09d` post 1). | Monitor traffic + first-day registration funnel. Send first-touch confirmation to incoming registrants (D10). |
| T-13 | Reply to high-signal replies on `09a`. Forward kit-relevant questions to `[OPS_EMAIL]`. | Continue monitoring. Send 24h reminders (D11) to registrants. |
| T-12 | Post Social Post 2 (`09d` post 2). | Monitor week-1 funnel signals. |
| T-11 | (Optional) Post on a secondary channel — Bluesky or X if not done already. | Continue funnel monitoring; flag any anomalies in registration UTMs. |
| T-10 | (Quiet day — let the audience absorb.) | (Quiet day.) |
| T-9 | Forward any high-intent member DMs / questions to `[OPS_EMAIL]` for D17 review. | Begin generating D17 high-intent DM list from funnel signals (T1, T2 triggers most relevant pre-workshop). |
| T-8 | **Friday — D25 Report 1 received.** Read it; surface anything unclear by Monday. | **Send D25 Report 1** end-of-day Friday (per D22 §7). Promotion-side metrics from your sends; AESDR-side funnel metrics. |

**End of week 1 signal:** Visit-to-register conversion in line with canon §8.1 baseline (20–35%). Below 20% triggers a calibration conversation, not panic.

---

## Promotion week 2 (T-7 → T-1) — Reminder + rehearsal

| Day | Partner | AESDR |
|---|---|---|
| T-7 | Send `09b` newsletter reminder (with `[DAYS_UNTIL_WORKSHOP]` = `1 week`). Post Social Post 3 (`09d` post 3). | Continue D11 reminders to registrants. |
| T-6 | Reply to replies. (Optional) Forward kit-relevant questions to AESDR. | Begin D17 high-intent DM outreach to T1/T2 triggered prospects (those who replied substantively to your launch). |
| T-5 | (Optional) Second `09b` send if your audience opens reminders separately well. | Monitor offer-page traffic ramping. |
| T-4 | (Quiet day.) | Final QA of workshop deck (D09) on the day's render system. Verify replay-recording infrastructure. |
| T-3 | **Tech rehearsal joint call** — partner intro practiced (2 min), workshop deck slides 01–03 walked, AV checked end-to-end. 45 min. | Run tech rehearsal. Capture any final edits to partner intro script. |
| T-2 | Send Social Post 4 *prep* — prepare the post, schedule for T-0 (workshop day). | Send D11 24h reminder to all registrants. Send D12 SMS opt-in confirmations. |
| T-1 | (Quiet day. Workshop is tomorrow.) | Final pre-workshop check: all systems, registrant list, replay record-trigger ready. |

**End of week 2 signal:** All registrants have received the 24h reminder. Tech rehearsal clean. Partner intro practiced.

---

## Workshop day (T-0)

| Time | Partner | AESDR |
|---|---|---|
| Pre-event | Final review of partner intro. Show up 10 min early. | All systems live. Founder lurks under alias per canon §12.2. |
| Workshop start | Deliver 2-min intro per `09c` Script 1. Hand off cleanly to `[HOST_FIRST_NAME]`. | Host delivers D09 deck. Founder logs chat in real-time. |
| Workshop body | Stay present in chat as a moderator. Do not reply on AESDR's behalf. | Host delivers framework + self-assessment + reality interludes per D09. |
| Workshop close | Hand off ends — workshop close belongs to host. | Host delivers offer slide + close (locked verbatim). |
| Within 30 min | Post Social Post 4 (workshop day variant). | Send D13 same-day attendee email. Open replay link gate (D14 sends to no-show registrants). |
| Within 60 min | Post replay link to your member channel. Use the URL from `11-tracking-links.md` `replay-direct` variant. | Begin D17 high-intent DM batch (T1, T2 triggers from chat-log review). |
| End of day | Done. | D14 sent to no-show registrants. D13 already sent to attendees. |

**Workshop-day signal:** Live attendance ≥ 35% of registrations (canon §7.1 baseline). Chat engagement count + per-question depth tracked for D33 postmortem.

---

## Replay window (T+1 → T+3)

| Day | Partner | AESDR |
|---|---|---|
| T+1 | Reply to substantive replies to your audience's reactions (in your member channel, in DMs). Forward high-intent threads to `[OPS_EMAIL]`. | D15 objection email sent to attendees who clicked offer page but didn't checkout. D16 checkout-abandon email sent to began-checkout registrants. |
| T+2 | Post Social Post 5 (replay-window variant). | Continue D17 outreach (T3 trigger — checkout-abandons; T4 trigger — full-replay-watchers + offer-page-clickers). |
| T+3 | Replay closes at workshop_end + 72h. Stop posting replay links after this point. | Replay link expires. D24 page renders the expired-token block to anyone who arrives late. |

**End of replay window signal:** Replay-watch + offer-page-click rate, second-pass conversion within the window, total D17 outreach count.

---

## Pricing window close (T+4 → T+7)

| Day | Partner | AESDR |
|---|---|---|
| T+4 | (Quiet — let the funnel breathe.) | Send D18 deadline-window email to non-buyers who clicked offer page during pilot window. |
| T+5 | Post Social Post 6 (deadline) **24 hours before** `[CODE_EXPIRY_DATE_TIME_TZ]`. | Continue D17 outreach (T5 trigger — replies to D14/D15/D16). |
| T+6 | (Quiet — code closing today.) | Pilot pricing closes at `[CODE_EXPIRY_DATE_TIME_TZ]`. Stripe-side: `[PILOT_CODE]` deactivated. |
| T+7 | (Quiet — pilot pricing now closed.) | **Friday — Send D25 Report 2** — workshop-week comprehensive report. |

**End of pricing window signal:** Final attendee-to-purchase conversion in line with canon §7.1 expectation (≥ 5%). Refund volume tracked for net-revenue calculation.

---

## Pilot close (T+8 → T+30)

| Day | Partner | AESDR |
|---|---|---|
| T+8 | (Light week — no new partner action required.) | Continue D17 follow-up replies. Begin internal D32 kill-or-keep memo draft (canon §16). |
| T+10 | (No partner action.) | Founder + ops complete D32 memo. Decision: EXTEND / REVISE / KILL. |
| T+12 | Receive D34 partner-facing close-out note (extend or kill version). 48 hrs after D32 finalized. | Send D34. |
| T+14 | Reply to D34 if relevant. | If EXTEND: amendment to D22 drafted. If KILL: door-close per D27 §10 register. If REVISE: re-score date scheduled. |
| T+30 | **Attribution window closes.** Final commission calculation locked. | **Friday after T+30 — Send D25 Report 3 (final pilot report).** Includes kill-or-keep summary in §6. |
| T+45 | Receive net-45 commission payout per D22 §5.4. | Pay commission to partner. |

**End of pilot signal:** Net revenue, refund-adjusted commission, qualitative-fit signal, kill-or-keep decision. All input to D33 postmortem (internal-only).

---

## What happens if something slips

Per D22 §11.1 (for cause) and §11.2 (for convenience), specific slip scenarios:

- **Partner missed launch send by 24h:** Email `[OPS_EMAIL]`. AESDR shifts the cadence by 24h or — if the workshop date is fixed — runs a compressed promotion with a single reminder. Not a §11 issue; one slip is data, not a violation.
- **Partner missed both launch and reminder sends:** §16 conversation. Two missed sends without notice is a §11.1 issue.
- **Workshop tech failure:** Reschedule within the same 7-day pilot window if possible. If not, AESDR refunds anyone who already enrolled at pilot pricing through this pilot.
- **Partner publishes a non-cleared social post:** AESDR asks for the edit per D40 §3. If partner refuses, §11.1.
- **Partner asks for a deadline extension:** Default no per canon §9.2 anti-fake-urgency. Exception: if AESDR caused a delay (tech failure, missed kit handoff), extension is communicated as a separate honest acknowledgment, not by re-sending D18.
- **Audience drama / outage / external event during the workshop window:** AESDR ops + partner principal call-to-decide whether to delay. Real events earn real adjustments per canon §1.6.

---

## After-pilot deliverables

| Deliverable | When | Source |
|---|---|---|
| D25 Report 3 (final) | Friday after T+30 | AESDR ops |
| D34 (partner close-out) | T+12 | AESDR founder |
| D33 postmortem | T+37 (within 7 days of pilot end) | AESDR internal — not shared with partner |
| Net-45 commission payout | T+45 | AESDR ops |

If the pilot is EXTEND, an amended D22 is drafted between T+10 and T+14 with new dates, signed before any continued promotion.

---

*Source: D22 partner pilot agreement timeline + canon §7.1 workshop format + canon §1.3 founding-vineyard pilot model + research report §Sample 30-day pilot timeline. Per pilot, AESDR ops adjusts dates to the actual workshop schedule.*
