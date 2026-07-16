# Warren prod verification pass (look-don't-press)

A browser QA pass of the admin "warren" UI against production, driven by
Playwright with the QA admin login. Written 2026-07-15 for a fresh Claude Code
session whose container has the `QA_*` environment variables loaded.

## Hard rules

- **Look, don't press.** Never click anything that spends money or sends
  email: the three sweep buttons (Communities / Newsletters & podcasts /
  Practitioners), the ceramic SEND canvas button, Bin / Reject buttons,
  payout buttons, or the confirm button of any dialog. Navigation, view
  toggles, rendering checks, and screenshots only.
- Do not modify or push any code in this pass.

## Setup

1. `printenv | grep ^QA_` — the pass needs `QA_ADMIN_EMAIL`,
   `QA_ADMIN_PASSWORD`, `QA_BASE_URL`. If any are missing, stop and report
   exactly which.
2. Read `app/login/page.tsx` for the login form's field names/selectors.
3. Drive with Playwright: run scripts from the repo root (`/home/user/aesdr`)
   so module resolution works; launch chromium with
   `executablePath: "/opt/pw-browsers/chromium"`; viewport 1440×1000.
   Streamed redirects after login need `page.waitForURL(..., { waitUntil: "commit" })`.

## The pass — screenshot every step

a. **The coming-soon gate.** Production 302s anonymous traffic (including
   `/login`) to `/coming-soon`. If the `QA_BYPASS_CODE` env var is set, open
   `${QA_BASE_URL}/login?bypass=${QA_BYPASS_CODE}` first — the proxy sets the
   `aesdr_cs_bypass` cookie and redirects to the clean URL. If the var is
   missing and you land on `/coming-soon`, stop and report that the pass
   needs `QA_BYPASS_CODE` (the value of `COMING_SOON_BYPASS_CODE` in Vercel).
b. **Login** at `${QA_BASE_URL}/login` with the QA credentials. If it fails,
   report the exact on-screen error (rate-limit banner, bad credentials) and
   stop.
b. **The warren** — `${QA_BASE_URL}/admin/tower`. Verify: the postage strip in
   the masthead (mono "postage" text + stamp squares, iris-filled per dollar
   spent), the three thin sweep buttons in one horizontal row with their
   "last swept … · brought N" sub-lines, the band toggle ("the strip" with an
   iris rule under its own letters; "the territory" with a small ringed
   glyph), and the card strip (or the empty-floor message). Collect browser
   console errors.
c. **The territory** — click the words "the territory" (a safe view toggle).
   Verify the dot field renders: dashed rings with sweep labels, dots, and
   the legend line. Screenshot, then flip back to the strip.
d. **A room** — if any card exists, click ONE card. Verify the room renders;
   if the candidate has a ready/approved email draft, verify the ceramic
   send button's `<canvas>` is present and actually painted (nonzero pixels —
   crop-screenshot it or check `toDataURL()` length). **Do not click it.**
e. **The sent record** — `${QA_BASE_URL}/admin/tower/sent`. Verify the table
   or its empty-state copy renders, plus the delivery-column footnote.
f. **The roster** — `${QA_BASE_URL}/admin/tower/pipeline`. Verify it renders.

## Reporting

- Send every screenshot to the user (`SendUserFile`, status `proactive`),
  captioned.
- Close with a plain-sentence report, verdict first: what rendered
  correctly, any console errors, any layout breakage, any page that errored,
  and whether the ceramic canvas painted.
