# Worked Commission Example

The math, end-to-end, on a real-shaped pilot. Plus how attribution
actually works on AESDR's side — what tracks, when it tracks, what the
dashboards show you.

## Headline terms

- **Commission rate:** 30% of net revenue.
- **Attribution window:** 30 days from first qualifying click on your
  partner-attributed registration URL.
- **Refund window:** 14 days from purchase. Net revenue is calculated
  *after* the refund window closes.
- **Payment cadence:** Net-45 from the close of the 30-day attribution
  window.

## What "net" means here

Gross revenue minus:

- Refunds within the 14-day refund window
- Stripe / payment processor fees (~2.9% + $0.30 per transaction)
- Sales tax collected and remitted

Net revenue is what AESDR keeps. Your 30% commission is calculated off
that net number.

## Worked example — a 1,000-person audience send

**Inputs:**
- Audience size promoted to: 1,000
- Workshop registration rate: 8% → 80 registrants
- Workshop live attendance rate: 45% → 36 live attendees
- Replay attendance rate: 18% of registrants (no-shows + repeats) → 14 viewers
- Conversion rate to enrollment (live + replay combined): 12% of registrants → 9.6 → call it 10 enrollments

**Plan mix (typical — adjust based on your audience):**
- 7 SDR plans @ $249 = $1,743
- 3 AE plans @ $299 = $897
- **Gross revenue: $2,640**

**Less:**
- 1 refund within 14-day window (10% refund rate is realistic) → -$249
- Payment processing on remaining 9 transactions @ ~3.2% effective = -$76
- **Net revenue after refund + fees: $2,315**
- *(Sales tax pass-through, varies by buyer state — assume zero net effect for this calc.)*

**Commission:** 30% × $2,315 = **$694.50**

## What that means in operator terms

Per registrant, your commission works out to roughly **$8.70 per
registrant**. Per live attendee, roughly **$19**. These numbers are the
right ones to plan on; chase them, not the gross.

A 10,000-person send at the same rates produces ~$6,945 in commission.
A 100-person send at the same rates produces ~$70. The unit economics
are linear in audience size and conversion quality — there's no break
point that shifts the math.

## Why AESDR pays on net, not gross

Two reasons:

**1.** Refunds happen. The 14-day window is real. Paying commission on
gross would mean clawing back commission when refunds hit, which creates
exactly the partner-AESDR friction the program is designed to avoid.

**2.** Payment processor fees are a real cost we don't get to keep. Net
math means commission tracks the actual revenue AESDR books, not the
sticker number on the invoice.

## Attribution mechanics

Your registration URL contains a partner-specific reference code. Three
things happen when someone clicks it:

1. **Cookie set on their browser** with your partner code, scoped to a
   30-day window.
2. **First-touch attribution recorded** in AESDR's dashboard with their
   email if they register, anonymous click if they don't.
3. **UTM parameters logged** for post-pilot reporting (which channel
   converted best, which post drove the best registrants).

If a buyer:

- **Clicks your link → registers → enrolls within 30 days** → fully
  attributed to you.
- **Clicks your link → drifts away → returns via Google → enrolls within
  30 days** → still attributed to you. First-touch wins within the
  window.
- **Clicks your link → enrolls 31+ days later** → not attributed.
  Outside the window.
- **Clicks two partners' links** → most-recent-touch wins within the
  30-day window. (We try not to put two partners' audiences in
  overlapping send windows for exactly this reason.)

## What the Friday report shows you

Every Friday during the pilot you receive a one-page report covering:

- Clicks on your link, by day
- Registrations, by day
- Live + replay attendance counts
- Enrollments to date (gross)
- Refund status (any refunds within the 14-day window)
- Projected commission, with the math shown

You're seeing the same numbers we're seeing. No surprises at the close.

## The follow-on artifact line

After enrollment, every student picks one of two end-of-course artifacts
free at `/reveal`. The unchosen artifact stays sealed and unlocks for
$40 from their dashboard at any time.

Within your 30-day attribution window, that $40 unlock is also
partner-attributable. We track it on the same Friday report; if a
student you sent unlocks the second artifact within window, it shows up
in your commission line.

## Payment

Once the 30-day attribution window closes:
- Final net revenue is calculated (refunds settled, fees deducted)
- Commission is computed at 30% of net
- Payment is wired net-45 from that close date
- Payment method is whatever you specified in the partnership agreement
  (typically ACH, Wise, or PayPal — Stripe Connect partner payouts coming
  later)

If anything in this math doesn't square once your pilot runs, that's
exactly what the [escalation contacts](/partners/kit-private/escalation-contacts)
page is for. We'd rather you ask than wonder.
