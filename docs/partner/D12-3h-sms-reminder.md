# D12 — 3-Hour SMS Reminder (3 Versions)

**Deliverable:** Three short SMS variants sent 3 hours before the live workshop. Plain. ≤160 characters. Sent only to registrants who explicitly opted in to SMS at registration (per canon §10.5).
**Audience:** SMS-consented registrants only. The default expectation is that a workshop sends zero SMS unless a partner pilot has SMS in scope.
**Voice ratio:** 60 Rowan / 40 Michael per canon §3.3 — Michael's voice fits SMS naturally because the medium is short and personal.
**Send timing:** 3 hours before workshop start.
**Sender of record:** AESDR (per canon §10.5; FCC one-to-one consent rules require seller-specific consent and seller-of-record identification).
**Format:** Plain text, no HTML, no emoji, no links beyond the join URL.
**Canon refs:** `AFFILIATE_BRAND_CANON.md` §3.3, §7.6, §10.5, §4.1 (banned vocabulary).

---

## Discipline

Per canon §7.6:

- **≤160 characters total**, including the AESDR sender prefix and the STOP-to-opt-out tail.
- **Plain.** No emoji. No exclamation points. No clickbait. No "we miss you."
- **Always include the seller of record:** the message starts with `AESDR:` so the recipient knows who's texting and TCPA/CAN-SPAM are satisfied at the message level.
- **Always include `Reply STOP to opt out`** as the closing tail.
- **Single link, only if the join URL is short enough.** If join URLs run long, use a branded short URL (`aesdr.io/j/[token]`) — never `bit.ly` or third-party shorteners (looks spammy, breaks brand).

The three versions below are A/B/C variants for the same surface. We send one per pilot, retire dead variants, replace in v2 of the doc after each pilot's postmortem.

---

## Version A — Operator-plain (Rowan-led)

> `AESDR: Workshop in 3hrs. [Day] [Time] [TZ]. Join: aesdr.io/j/[token]. Reply STOP to opt out.`

**Character count (template, before substitution):** 91. Final length depends on token.

**Voice notes:**
- Pure Rowan. Plain verdict, time, link, opt-out.
- Best default for first-pilot SMS — risks nothing.

---

## Version B — One-line context (70/30)

> `AESDR: Workshop starts in 3hrs. The "activity vs judgment" framework is in this one. Join: aesdr.io/j/[token]. Reply STOP to opt out.`

**Character count (template):** ~135. Tight to the ceiling.

**Voice notes:**
- Adds one specific anchor — the framework name — so the recipient remembers what they signed up for.
- Mirrors the framework preview from D11 (the 24h reminder). Consistency between channels signals planning, not spam.

---

## Version C — Michael flicker (60/40)

> `AESDR: Workshop in 3hrs. If your day already went sideways, the replay opens after live. But Q&A is sharper. Join: aesdr.io/j/[token]. Reply STOP to opt out.`

**Character count (template):** ~157. At the ceiling — verify post-substitution.

**Voice notes:**
- Acknowledges the recipient's day might already be a mess (Michael's job — confessional realism).
- "Q&A is sharper" mirrors D11's "live is sharper" line; canonical phrase candidate.
- Use only when partner-pilot audience tolerates a slightly-personal tone. Not the right default for the most formal partner contexts.

---

## Header on all sends (compliance-bearing)

The carrier-side sender ID and the in-message `AESDR:` prefix together identify AESDR as the seller of record. The registrant consented at registration with a separate, unchecked-by-default checkbox per canon §10.5:

> ☐ *Text me a reminder 3 hours before the workshop. Standard rates apply. Reply STOP to opt out. Sender: AESDR.*

That consent does **not** authorize AESDR's *partners* to text the same registrant. If a partner wants to text its own list about AESDR, the partner is the seller of record on its own consent (canon §10.5).

---

## Visual treatment notes

SMS has effectively no visual treatment — that's the medium. But the brand-consistency moves are still real:

**"Visual" attributes that count:**
- The `AESDR:` prefix is the wordmark of SMS. Required, always at the head, always uppercase.
- No emoji. Per canon §6.8.5, emoji-as-iconography is banned in the Official register; SMS is Official by default.
- Short URL on AESDR's own branded domain (`aesdr.io/j/[token]` or equivalent) — never a third-party shortener.
- Timestamp format: `[Day] [Time] [TZ]` (e.g., `Wed 2pm ET`). Plain, not "tomorrow at 2:00 PM Eastern."
- No special characters that don't render across carriers (curly quotes, em-dashes — use straight quotes and hyphens).

**Iconography:** None.

**Iris usage:** None.

**Deliberate departures from canon:** None.

**Five-question check adapted for SMS:**
1. **Thumbnail test:** Does `AESDR:` at the head + the closing `Reply STOP to opt out` immediately read as official, not promotional? Yes.
2. **Token check (channel-equivalent):** No raw third-party brand assets (Bitly, etc.). Pass.
3. **Iris reservation:** Pass — no iris in SMS.
4. **Icon discipline:** Pass — no emoji.
5. **Voice thumbnail:** Each version begins with a Rowan verdict; Version C earns its Michael line in a single beat. All three pass.

---

## Notes

- **Default for the first pilot is Version A.** Versions B and C come online once we know whether the partner audience tolerates branded specificity (B) or personal warmth (C) over plain.
- **No "missed it?" SMS sent later.** SMS gets one shot — the 3-hour reminder. The no-show flow is email-only (D14). This is per canon §9.2 — no fake urgency, one window per channel.
- The "Q&A is sharper" line in Version C is a candidate canonical phrase. If it lands in two pilots, lift into D11's body.
- **Opt-in language at registration is canon (D7 form spec).** If the partner pilot does not run with SMS, this entire deliverable is dormant for that pilot. That's fine — most early pilots probably should not run SMS until we have email-side data.

## Open

- Branded short-URL service — `aesdr.io/j/[token]` requires `aesdr.io` registration + a redirect service. Pending. Default until built: skip SMS for the first pilot rather than ship a third-party shortener. (Also: if the join URL fits raw under 160 chars including the rest of the body, no shortener needed. Verify per join-URL implementation.)
- Whether to send a 1-hour SMS in addition to the 3-hour. Default: **no** — one window per channel per canon §9.2. Re-examine only if attendance data shows a structural drop in the final 60 minutes.
- Whether to localize the timestamp by carrier-detected geography. Default: no — registration form doesn't capture TZ; default TZ is ET.
- Carrier compliance: 10DLC registration for the AESDR sending number is required for US carriers. Pending. Without it, deliverability suffers and we may lose the legal protection the consent gives us.
