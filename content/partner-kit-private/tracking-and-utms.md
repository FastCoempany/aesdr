# Tracking URL & UTM Cheat-Sheet

Your partner-attributed registration URL and the UTM scheme. Lift the
URL exactly as shown. Add UTMs to the end for whatever channel you're
promoting on so the Friday report can show you which channel converted
best.

## Your tracking URL

Within 24 hours of agreement signing, you'll receive a URL of this shape:

```
https://aesdr.com/p/[YOUR_SLUG]
```

`[YOUR_SLUG]` is a short partner-specific identifier — usually your
brand's short name (lowercase, hyphens for spaces, no special
characters). Example: `https://aesdr.com/p/bdr-club`.

This URL is yours alone. Anyone who clicks it gets cookied with your
partner code for 30 days. First-touch wins within the window — if they
later arrive via Google or direct, you're still the attributed partner.

## The UTM scheme

The base URL already carries attribution. UTMs are for *your* reporting
— so you can see in the Friday report whether the launch email
out-converted the reminder, or whether your LinkedIn post outdrew your
newsletter.

Always append in this order:

```
?utm_source=[YOUR_SLUG]
&utm_medium=[CHANNEL]
&utm_campaign=[CAMPAIGN_NAME]
&utm_content=[SPECIFIC_PLACEMENT]
```

| Parameter | What goes here | Examples |
|---|---|---|
| `utm_source` | Your partner slug (always) | `bdr-club` |
| `utm_medium` | Channel type | `email`, `social`, `podcast`, `paid` |
| `utm_campaign` | Specific campaign | `launch`, `reminder`, `last-call`, `replay-window` |
| `utm_content` | Specific placement | `subject-a`, `subject-b`, `linkedin-post`, `twitter-thread`, `discord-pin` |

## Worked examples

**Launch email:**
```
https://aesdr.com/p/bdr-club?utm_source=bdr-club&utm_medium=email&utm_campaign=launch
```

**Reminder email, A/B subject test:**
```
https://aesdr.com/p/bdr-club?utm_source=bdr-club&utm_medium=email&utm_campaign=reminder&utm_content=subject-a
https://aesdr.com/p/bdr-club?utm_source=bdr-club&utm_medium=email&utm_campaign=reminder&utm_content=subject-b
```

**LinkedIn post:**
```
https://aesdr.com/p/bdr-club?utm_source=bdr-club&utm_medium=social&utm_campaign=launch&utm_content=linkedin-carousel
```

**Podcast show notes:**
```
https://aesdr.com/p/bdr-club?utm_source=bdr-club&utm_medium=podcast&utm_campaign=launch&utm_content=ep-142-notes
```

## What we recommend you NEVER do

- **Don't strip the URL down to a vanity link via your own URL shortener** — the
  redirect chain occasionally fails or loses UTMs depending on the shortener.
  If your audience norms require a short link, ask us for an `aesdr.com/p/[your-slug]/x` short variant we generate.
- **Don't add custom parameters outside the four UTMs above.** They won't break
  attribution but they won't show up in the Friday report either.
- **Don't reuse the same `utm_content` value across two distinct placements.**
  You lose the ability to tell which placement converted.

## What the Friday report shows you

The report groups clicks, registrations, attendance, and enrollments by:

- `utm_medium` rolled up (email vs. social vs. podcast)
- `utm_campaign` (launch vs. reminder vs. last-call)
- `utm_content` (specific placement)
- Total commission projection by source

If you A/B test subject lines via `utm_content=subject-a` vs `subject-b`,
the report will tell you which converted better — both at registration
and at enrollment, which are different metrics.

## Self-test before you send

Before you fire off your first send:

1. Click your own link in an incognito window.
2. Verify the registration page loads with your partner slug visible
   somewhere on it.
3. Register with a test email (`[YOUR_NAME]+test@yourdomain.com`).
4. Within 5 minutes, log into your partner dashboard and verify the
   registration shows under your slug.

If anything is off, email the founder — easier to fix before the send
than after.
