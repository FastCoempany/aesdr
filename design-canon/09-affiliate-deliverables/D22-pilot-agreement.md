# D22 — Partner Pilot Agreement

**Deliverable:** Plain-English commercial agreement between AESDR and a single partner for one workshop-first pilot. Time-boxed, non-exclusive, simple. The contract that turns a PASS scorecard (D27) into a live partnership.
**Audience:** Two parties — AESDR (founder signs) and the partner (named individual or named entity signs). Reviewed by AESDR's legal counsel before first use; a second time after the first three pilots if the rubric of objections has settled.
**Voice ratio:** 100 Rowan / 0 Michael per canon §3.3 (legal / partner agreement row). Plain-English contract register. No marketing voice. Rowan-adjacent only in the preamble paragraph.
**Format:** Markdown source. Renders to PDF for execution. Companion DOCX for redline rounds. Per canon §6.5 + §8.5.
**Use timing:** Sent within 48 hours of a PASS decision on the partner vetting scorecard (D27). Signed before any co-branded asset is built (canon §16 approval gate). Pilot does not start until both parties have signed.
**Canon refs:** `AFFILIATE_BRAND_CANON.md` §1.3 (a handful of partners, not a marketplace), §1.4 (borrowed trust), §1.6 (honesty), §6.6 (co-branding zone), §8.7 (UTM canon), §8.8 (attribution windows), §10.1 (FTC), §10.4 (CAN-SPAM), §10.5 (TCPA / SMS), §16 (approval gates).

> **Placeholder convention:** This is a contract template — placeholders are filled per execution. `[PARTNER_LEGAL_NAME]`, `[PARTNER_SLUG]`, `[PARTNER_ADDRESS]`, `[PARTNER_CONTACT_EMAIL]`, `[FOUNDER_LEGAL_NAME]`, `[FOUNDER_FIRST_NAME]`, `[AESDR_LEGAL_ENTITY]`, `[AESDR_ADDRESS]`, `[PILOT_ID]`, `[WORKSHOP_DATE]`, `[REPLAY_END_DATE]`, `[PILOT_START_DATE]`, `[PILOT_END_DATE]`, `[ATTRIBUTION_END_DATE]`, `[GOVERNING_LAW_STATE]`. Swap globally before send. **Counsel review required before first execution.**

> **This is a template, not legal advice.** AESDR's counsel reviews and signs off before the first execution. Partner's counsel may request edits; redline workflow is in §16 of this document.

---

## Preamble

> *AESDR runs partner pilots the way the report describes: small, time-boxed, non-exclusive, intentionally non-romantic. This agreement reflects that. It is short by design. Where it is silent, the canon (`AFFILIATE_BRAND_CANON.md` v1.1) governs. Where the canon is silent, common sense and good faith govern.*

---

## 1. Parties

This Partner Pilot Agreement (the "**Agreement**") is entered into as of `[PILOT_START_DATE]` (the "**Effective Date**") between:

- **AESDR** — `[AESDR_LEGAL_ENTITY]`, with a place of business at `[AESDR_ADDRESS]` (referred to as "**AESDR**").
- **Partner** — `[PARTNER_LEGAL_NAME]`, with a place of business at `[PARTNER_ADDRESS]` (referred to as "**Partner**").

Each a "**Party**"; together, the "**Parties**".

---

## 2. Term

- **Pilot window:** The pilot runs from `[PILOT_START_DATE]` through `[PILOT_END_DATE]` (the "**Pilot Window**"). Default duration is 30 days end-to-end. Pilots do not auto-renew.
- **Promotion window:** Partner promotion runs from `[PILOT_START_DATE]` through `[WORKSHOP_DATE]` (typically 14 days).
- **Replay window:** The replay link is open from workshop end through `[REPLAY_END_DATE]` (72 hours). After that, the replay link expires.
- **Attribution window:** Commission attribution runs from first qualifying click (any partner-attributed UTM) through `[ATTRIBUTION_END_DATE]` (default 30 days from first click). See §6.

Either Party may extend the pilot only by written agreement, signed by both, dated, and filed alongside this Agreement. Verbal extensions are not extensions.

---

## 3. Partner deliverables

Partner agrees to do the following during the Promotion window:

- **3.1 Promotion sends.** Partner promotes the AESDR workshop to their audience in their primary owned channel (newsletter, member channel, podcast, mailing list, or equivalent named in the scorecard). Minimum two named promotion sends — one launch and one reminder — using AESDR-supplied promotional copy (D-series, partner-customizable per the lockup zone in canon §6.6) or partner-written copy approved by AESDR per §16 of this Agreement.
- **3.2 Partner intro.** Partner delivers a 2-minute (cap) live-workshop intro per D09 slide 02. Partner does not pitch the offer, discuss pricing, or ad-lib about AESDR content beyond the supplied script.
- **3.3 Disclosure.** Every partner-published surface that promotes AESDR carries the FTC disclosure language pack (D19) verbatim. Per canon §10.1, this is non-negotiable.
- **3.4 Tracking discipline.** Partner uses only AESDR-issued tracking links (UTMs per canon §8.7). Partner does not modify, shorten, or re-host the workshop content, the registration page, the replay, or any AESDR asset on their own domain unless explicitly authorized in writing.
- **3.5 Reporting cooperation.** Partner provides AESDR access to relevant audience metrics (open rate, click-through, attendance) for reporting under §7.

---

## 4. AESDR deliverables

AESDR agrees to do the following during the Pilot Window:

- **4.1 Workshop.** One live 60-minute workshop on `[WORKSHOP_DATE]`, hosted by AESDR's host, with content per the AESDR canonical workshop deck (D09).
- **4.2 Co-branded assets.** Registration page (D07), confirmation email (D10), 24-hour reminder (D11), 3-hour SMS reminder (D12, where consented), same-day attendee email (D13), no-show replay email (D14), objection email (D15), checkout-abandon email (D16), deadline-window email (D18). Each surface carries the AESDR × Partner co-brand lockup per canon §6.6.
- **4.3 Tracking.** AESDR issues partner-specific UTMs and a pilot promo code. AESDR ensures Stripe webhooks fire correctly for `begin_checkout` and `purchase` events with partner attribution per canon §8.7.
- **4.4 Reporting.** AESDR sends Partner a weekly pilot report (D25) every 7 days during the Pilot Window, plus a final report within 7 days of the Pilot Window's end.
- **4.5 Partner kit.** AESDR delivers the partner kit (D40 folder) to Partner within 3 business days of this Agreement's signing, and at minimum 7 days before the Promotion window opens.

---

## 5. Compensation

- **5.1 Commission rate.** Partner earns a commission of **30% of net revenue** (gross revenue minus refunds, payment processing fees, and applicable sales tax) on all enrollments attributed to Partner during the Attribution window per §2.
- **5.2 No fixed fee.** This is a commission-only pilot. There is no upfront fee, no "prep" fee, no fixed minimum. Partner's earnings scale with audience-converted revenue, per canon §1.3 (handful-of-partners model).
- **5.3 Attribution.** Attribution rules per canon §8.8: 30-day cookie window from first qualifying click; commission paid on net revenue after refunds; if a partner-specific code (`[PILOT_CODE]`) is applied at checkout, Partner is the attributed source regardless of last-click.
- **5.4 Payment terms.** AESDR pays Partner on a **net-45 schedule** following the close of the Attribution window. Payment via wire, ACH, or PayPal at Partner's election. Partner provides a W-9 (US) or W-8BEN (non-US) before first payment.
- **5.5 Refund treatment.** Refunds processed within the AESDR refund window (14 days from purchase) reduce the commission base proportionally. If a refund is processed after Partner has been paid, the next subsequent payout is reduced by the corresponding commission amount.
- **5.6 No additional incentive structures.** Per canon §13, AESDR does not run "bonus tiers," "milestone rewards," or surprise upside. The 30% commission is the deal. Future pilots may negotiate independently; this pilot's compensation is fixed.

---

## 6. Tracking, attribution, and data

- **6.1 Tracking links.** AESDR issues Partner one or more tracking URLs containing the canonical UTM fields per canon §8.7. Partner uses these links exclusively when promoting AESDR within the Pilot Window.
- **6.2 Audience data.** Workshop registrants are AESDR's data subjects. AESDR controls the registration list, the email follow-up sequence, and any retention thereafter. Partner does not receive registrant emails, phone numbers, or other contact data.
- **6.3 Aggregated reporting.** AESDR provides Partner with aggregated pilot metrics (registrations, attendance, conversion, refunds, net revenue, commission accrued) per §4.4. Aggregated metrics do not identify individual registrants.
- **6.4 Partner data.** Partner provides AESDR access only to audience-level metrics relevant to pilot reporting (e.g., promotion-send open rate, click-through rate). Partner does not transfer their email list to AESDR. AESDR does not request the list.
- **6.5 No list co-promotion.** Per canon §1.6, neither Party offers the other Party's list as a "co-promotion" surface. List exchange is not part of this pilot.

---

## 7. Pilot reporting

- AESDR sends Partner a weekly pilot report (D25 template) by end-of-day Friday of each pilot week.
- Partner shares promotion-send metrics with AESDR within 24 hours of each promotion send.
- A final post-pilot report is sent within 7 days of `[PILOT_END_DATE]`. This final report includes the AESDR-side kill-or-keep decision summary (Partner-facing version of D32, drafted as D34).

---

## 8. Approval gates and brand

- **8.1 Canon governs.** All co-branded assets and Partner-published assets follow `AFFILIATE_BRAND_CANON.md` v1.1. Partner has read and accepts the canon, including the banned-vocabulary list (canon §4.1).
- **8.2 Pre-publish approval.** Partner submits any AESDR-promoting copy for AESDR pre-approval at minimum 48 hours before the intended publish time. AESDR responds within 24 business hours with one of: APPROVED / APPROVED WITH EDITS / DECLINED. Per canon §16, this is non-negotiable for the first pilot.
- **8.3 Trademark and lockup.** AESDR grants Partner a limited, revocable, non-transferable license to use the AESDR wordmark and the AESDR × Partner co-brand lockup, only as supplied by AESDR, only for promoting this pilot, and only during the Promotion window.
- **8.4 Recording rights.** AESDR retains all rights to the workshop recording, replay, and any derivative content. Partner may share the supplied replay link during the Replay window; Partner does not record, screenshot, or repurpose the workshop content.

---

## 9. Compliance

- **9.1 FTC.** Both Parties acknowledge that Partner is operating under FTC material-connection disclosure rules (16 CFR Part 255). Disclosure language is supplied by AESDR (D19) and used verbatim. If Partner does not use the disclosure language, AESDR may end the pilot per §11.
- **9.2 CAN-SPAM.** Email promotion to Partner's list complies with CAN-SPAM Act requirements. Partner is responsible for honoring its own list's unsubscribe requests.
- **9.3 TCPA / SMS.** If Partner's audience receives any SMS as part of this pilot, that SMS comes only from AESDR's send infrastructure, only to registrants who opted in via the AESDR registration form. Partner does not send SMS on AESDR's behalf.
- **9.4 Endorsement honesty.** Partner's promotion of AESDR reflects Partner's honest assessment. Partner does not make claims about AESDR that are not also approved AESDR claims (D20). Partner does not invent outcome statistics, testimonials, or features that do not exist.

---

## 10. Exclusivity

- **10.1 Non-exclusive.** This Agreement is non-exclusive in both directions.
- **10.2 No category lockout.** Neither Party may demand the other refrain from working with comparable third parties during the Pilot Window or thereafter.
- **10.3 Right to run other pilots.** AESDR may run pilots with other partners, including partners whose audiences overlap with Partner's, before, during, and after the Pilot Window.
- **10.4 Right to take other deals.** Partner may run other paid promotions, sponsorships, or affiliate deals during the Pilot Window, provided they do not promote a directly-competing sales-training course inside this Agreement's Promotion window using audience capacity that was committed to AESDR per §3.

---

## 11. Termination

- **11.1 For cause.** Either Party may terminate this Agreement, effective immediately and in writing, for any of:
  - Material breach of the canon (banned vocab in published copy after notice; absent disclosure language; off-brand co-branded asset).
  - Material breach of the FTC disclosure requirement.
  - Misrepresentation of AESDR claims, pricing, or program features.
  - Fraud, illegality, or willful misconduct.
- **11.2 For convenience.** Either Party may terminate this Agreement on 7 days' written notice, with no cause required, prior to the workshop date. After the workshop, the pilot completes through the close of the Attribution window unless terminated for cause.
- **11.3 On termination.** Partner ceases use of AESDR marks, removes AESDR-promoting content from owned channels within 5 business days, and ceases all promotion. Commission accrued on attributable conversions occurring before termination remains payable per §5.4.

---

## 12. Confidentiality

- **12.1** Each Party may receive nonpublic information from the other ("Confidential Information"), including audience metrics, pricing structure, internal canon revisions, and pilot-postmortem content. Each Party maintains the other's Confidential Information in confidence and does not disclose it to third parties without written consent.
- **12.2** Confidential Information does not include information already publicly known, lawfully received from a third party, or independently developed.
- **12.3** Confidentiality survives termination of this Agreement for 24 months.

---

## 13. Intellectual property

- **13.1** AESDR retains all rights, title, and interest in the AESDR brand, the canon, the workshop content, the curriculum, the recordings, the deck, the registration page, and all derivative materials.
- **13.2** Partner retains all rights in Partner's audience, brand, content, and channels.
- **13.3** No transfer of ownership occurs under this Agreement. The license granted in §8.3 is the only IP grant.

---

## 14. Limitation of liability and disclaimers

- **14.1** AESDR makes no guarantee of pilot performance, conversion rate, or revenue outcomes to Partner. Partner makes no guarantee of audience size, attendance, or conversion to AESDR.
- **14.2** Each Party's aggregate liability under this Agreement is capped at the total commission accrued or the equivalent of $1,000 (whichever is greater).
- **14.3** Neither Party is liable for indirect, consequential, or incidental damages.

---

## 15. Indemnification

Each Party indemnifies the other against third-party claims arising from the indemnifying Party's:
- Material breach of this Agreement.
- Violation of applicable law in connection with the pilot.
- Misrepresentation in the indemnifying Party's published claims about the pilot, AESDR, or Partner.

Indemnification claims are subject to the §14 liability cap.

---

## 16. Redline workflow

- Either Party may propose edits to this template before execution.
- Edits are tracked in a redline document (DOCX or markdown diff). Comments are addressed; resolved comments are deleted; unresolved comments are escalated.
- The version executed is the version both Parties sign — verbal agreements outside the executed document are not binding.
- Material changes (edits to §5 compensation, §10 exclusivity, §11 termination, or §13 IP) require AESDR counsel review before AESDR signs. Partner is encouraged to have its own counsel review.

---

## 17. Governing law and dispute resolution

- **17.1** This Agreement is governed by the laws of `[GOVERNING_LAW_STATE]`, without regard to conflict-of-law principles.
- **17.2** The Parties first attempt to resolve any dispute by direct conversation between the founder of AESDR and the principal of Partner.
- **17.3** Unresolved disputes are submitted to binding arbitration in `[GOVERNING_LAW_STATE]` under the AAA Commercial Arbitration Rules, with each Party bearing its own costs unless the arbitrator awards otherwise.

---

## 18. Entire agreement

This Agreement, together with the canon (`AFFILIATE_BRAND_CANON.md` v1.1) referenced herein, constitutes the entire agreement between the Parties regarding the subject matter and supersedes all prior or contemporaneous understandings, written or oral. Amendments require a writing signed by both Parties.

---

## 19. Signatures

**AESDR:**

Signature: \________________________________

Name: `[FOUNDER_LEGAL_NAME]`

Title: Founder

Date: `[YYYY-MM-DD]`

**Partner:**

Signature: \________________________________

Name: `[PARTNER_LEGAL_NAME]`

Title: `[role]`

Date: `[YYYY-MM-DD]`

---

## Visual treatment notes

**Layout pattern:** PDF execution document per canon §8.5 PDF anatomy — letter or A4, 24mm margins, mono eyebrow `AESDR · PARTNER PILOT AGREEMENT · v1`, `--display` italic 36pt headline (the document title), `--serif` 12pt body, `--cond` 11pt section headers in uppercase at .15em letter-spacing.

**Palette:**
- Background: `--cream`.
- Body type: `--ink`.
- Section headers (1, 2, 3 etc.): `--cond` 11pt 700, .15em, uppercase, `--ink`.
- Mono eyebrow + page numbers + footer: `--mono` 10pt, `--muted`.
- Hairline rules between sections: `--light` 1px.

**Type tokens:** Per palette above. No display italic in body — display italic only on the title page and the §19 signature-block headers.

**Iconography:** None. Legal documents are type-only.

**Iris usage:** None — internal/legal docs do not get iris fingerprint per canon §6.4.

**Deliberate departures from canon:** None. The legal-register tone (100/0 voice ratio) is itself canon §3.3.

**Five-question check (canon §6.9.1):**
1. **Thumbnail at 200×200:** Cream + display italic title + `--cond` mono headers = identifiably AESDR (legal register variant). Pass.
2. **Token check:** Pass.
3. **Iris reservation:** Pass — zero iris.
4. **Icon discipline:** Pass — type-only.
5. **Voice thumbnail:** *"AESDR runs partner pilots the way the report describes: small, time-boxed, non-exclusive, intentionally non-romantic."* — passes; verdict-shaped Rowan-adjacent, identifiably AESDR. The "intentionally non-romantic" phrase is the canon §1.3 register (handful of partners, not a marketplace).

---

## Forward dependencies

This agreement depends on:
- **D27 partner vetting scorecard** — only PASS partners receive D22. **Met.**
- **D19 disclosure-language pack** — referenced in §3.3, §9.1. **Met.**
- **D20 claims sheet** — referenced in §9.4. **Met.**
- **D25 weekly partner reporting** — referenced in §4.4, §7. **In this batch.**
- **D40 master partner-kit folder** — referenced in §4.5. **In this batch.**
- **AESDR legal entity formation** + **counsel review of v1**. **Operationally pending.**
- **Governing-law jurisdiction** — `[GOVERNING_LAW_STATE]` placeholder. Default Delaware unless AESDR is incorporated elsewhere.

This agreement is a forward dependency for:
- Every co-branded asset that ships under AESDR × Partner lockup — none of those publish until this is signed.
- D34 partner-facing pilot close-out notes — references the Pilot Window dates locked here.
- D32 kill-or-keep memo — references "did the partner hold their commitments under §3" as a qualitative-signal input.

---

## Open

- Commission rate. Default 30% of net revenue. Founder may set a different default for specific archetypes (alumni ambassadors at 25% with stipend; high-trust hybrid at 35%) — the §27 scorecard's archetype field hints at the calibration. Recommend: 30% is the published default in the partner kit; archetype-specific rates are set during the conversation, not pre-published.
- Whether to publish a "tier 2 pilot" template for partners running their second pilot with AESDR. Default: **not in v1.** A second pilot is governed by an amendment to this Agreement, not a new template, until enough second-pilot data exists to template-ize it.
- Counsel review cadence. Default: review v1 before first execution; review v2 after first 3 pilots if material objections cluster around any specific clause.
- Indemnification cap (§14.2). $1,000 floor is intentionally low — the pilot's economic exposure is bounded. Counsel may raise this during review; recommend not raising past $5,000 without commensurate reserve.
- §17 arbitration vs court. Default: AAA arbitration in `[GOVERNING_LAW_STATE]`. Some partners may push for state court. Counsel call.
- Whether to add a §20 "Force majeure" clause. Default: **no for v1.** Pilots are 30 days; force majeure would over-engineer. If pilots extend to 60+ days in future cycles, add then.
