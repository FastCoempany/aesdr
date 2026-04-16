# AESDR Launch Testing Plan
**Goal: Get to ~98% confidence before a single paying user touches the product.**

This plan is structured for execution inside Claude Code. Every phase explicitly separates **HUMAN WORK** (decisions, accounts, credentials, approvals, real-world validation) from **CLAUDE WORK** (code, configuration, test authoring, automation).

Stack assumption: Python primary, Node.js where required (Playwright runtimes, web tooling). AESDR microservices target: API Gateway, Auth, Course Catalog, Content Delivery, Progress, Assessment, Certificate, Notification, Analytics.

**Realistic timeline: 6–8 weeks of focused work to go from current state to launch-ready.** Compressible to 4 weeks if you skip Phase 5 (synthetic fleets) and Phase 6 (chaos), but those are the phases that separate "didn't break on launch day" from "didn't break in month one."

---

## Phase 0 — Pre-Flight (Before Claude Touches Anything)

**Why this phase exists:** Claude Code is most powerful when it has perfect context. The single biggest predictor of a clean multi-week project is whether you front-loaded the setup work or made Claude discover everything in flight.

### 0.1 Repo & documentation audit (HUMAN, ~2 hours)

- [ ] Confirm AESDR is in a single monorepo or document the multi-repo layout
- [ ] Create `/docs/architecture.md` if it doesn't exist — Claude needs a single source of truth on the microservices topology, data flow, and which service owns what
- [ ] Create `/docs/critical-paths.md` listing the 5–10 user journeys that MUST work on launch (signup → email verify → first lesson, payment → course access, quiz → grading → certificate, etc.)
- [ ] Create `/docs/sla-targets.md` with explicit numbers: target p50/p95/p99 latency, target uptime %, target concurrent users
- [ ] Generate a fresh dependency tree (`pip freeze`, `npm ls --depth=0`) and check it in

### 0.2 Third-party account inventory (HUMAN, ~3 hours)

For each of these, confirm: account exists, you have admin access, you know the rate limits, and credentials are in a vault (1Password, Doppler, AWS Secrets Manager — not in `.env` files committed anywhere).

- [ ] Auth provider (Auth0 / Clerk / Supabase / Cognito) — note free-tier rate limits
- [ ] Email service (SendGrid / Postmark / Resend) — note daily send limits and burst limits
- [ ] Payments (Stripe) — confirm test mode keys, webhook signing secrets
- [ ] CDN (Cloudflare / Fastly / CloudFront) — confirm purge API access
- [ ] Database host (Supabase / Neon / RDS / PlanetScale) — confirm read replica capability
- [ ] Object storage for course content (S3 / R2)
- [ ] Error tracking (Sentry) — create org if it doesn't exist
- [ ] Session replay (PostHog or LogRocket) — create org if it doesn't exist
- [ ] APM (Datadog / Better Stack / Grafana Cloud) — create org if it doesn't exist
- [ ] Cross-browser testing (BrowserStack or Sauce Labs) — paid plan, $39–$199/month
- [ ] Visual regression (Percy or Chromatic) — free tier sufficient to start

### 0.3 Decisions Claude cannot make for you (HUMAN, ~1 hour)

Write your answers to `/docs/decisions.md` so Claude can reference them:

- [ ] **Test environment hosting** — same provider as prod, or separate? (Same provider strongly recommended)
- [ ] **Anonymized prod data, or synthetic only?** (Anonymized is better; synthetic is faster to set up)
- [ ] **Acceptable test cost ceiling per month** — load testing and synthetic fleets can rack up cloud bills fast
- [ ] **Launch dial schedule** — fixed dates or signal-driven (e.g., "open next batch when error rate < 0.1% for 72hrs")
- [ ] **Who's on the war-room rotation** for launch week — even if it's just you, define the on-call hours

### 0.4 Claude Code project setup (HUMAN, 30 min)

- [ ] Create a dedicated branch: `git checkout -b launch-readiness`
- [ ] Create `/CLAUDE.md` at the repo root with: stack overview, commands you commonly run, code style preferences, "always run pytest before committing" type rules
- [ ] Create `/tests/CLAUDE.md` with testing-specific guidance (see Phase 2)
- [ ] Verify Claude Code has access to all relevant directories (no over-aggressive `.gitignore` or permission walls)

**Phase 0 success criteria:** Claude can be given any task in Phases 1–10 with a single prompt and have everything it needs to start coding without asking clarifying questions about the stack, accounts, or constraints.

---

## Phase 1 — Production-Parity Staging (Week 1)

**Why this phase exists:** Every test in every later phase is worthless if staging and production differ. This is the single highest-leverage phase.

### 1.1 Infrastructure-as-code baseline

**HUMAN (before):**
- [ ] Decide IaC tool: **Terraform** (most mature) or **Pulumi** (Python-native, fits your stack better)
- [ ] Grant Claude read access to current production config (cloud console exports, manual notes)

**CLAUDE:**
- [ ] Audit current production infrastructure and write IaC modules that recreate it exactly
- [ ] Parameterize environment differences (instance sizes, replica counts) but keep versions, configs, network topology identical
- [ ] Create `staging.tfvars` / `staging stack` that's a scaled-down but version-identical copy
- [ ] Write a `make staging-up` / `make staging-down` workflow

**HUMAN (after):**
- [ ] Review the IaC plan output before applying — IaC mistakes can be expensive
- [ ] Run `terraform apply` / `pulumi up` yourself the first time
- [ ] Verify staging is reachable, services respond to health checks

### 1.2 Anonymized production data pipeline

**HUMAN (before):**
- [ ] Confirm legal/compliance OK with using anonymized prod data in staging (for AESDR you likely have minimal PII; verify GDPR/CCPA scope if any EU/CA users exist)
- [ ] Identify PII fields per table

**CLAUDE:**
- [ ] Write a Python script (`scripts/anonymize_db.py`) using **Faker** that:
  - Dumps prod DB
  - Replaces PII fields (emails, names, addresses) with deterministic Faker values (same input → same fake output, so referential integrity holds)
  - Strips payment tokens, session cookies, API keys
  - Loads into staging DB
- [ ] Schedule weekly refresh via GitHub Actions or cron

**HUMAN (after):**
- [ ] Manually verify no PII leaked through — spot-check 20 random rows
- [ ] Confirm staging DB is on a network where leakage doesn't matter

### 1.3 Third-party service mocking strategy

**CLAUDE:**
- [ ] For Stripe → use Stripe test mode + Stripe CLI for webhook forwarding to staging
- [ ] For SendGrid/Postmark → use sandbox mode (emails captured, not sent) OR a tool like Mailtrap
- [ ] For Auth provider → use a separate dev tenant
- [ ] Document all switches in `/docs/staging-services.md`

**Phase 1 success criteria:** A new developer (or fresh Claude session) can run one command and have a fully working staging environment indistinguishable from production except for scale.

---

## Phase 2 — Test Infrastructure Foundation (Week 1–2)

### 2.1 Test framework setup

**CLAUDE:**
- [ ] Set up Python test infrastructure:
  - **pytest** as the runner (you're Python-primary)
  - **pytest-playwright** for E2E
  - **pytest-asyncio** for async tests
  - **pytest-xdist** for parallel execution
  - **pytest-html** for human-readable reports
- [ ] Set up `tests/` directory structure:
  ```
  tests/
    unit/           # existing, augment as needed
    integration/    # API + DB tests
    e2e/            # Playwright user journeys
    load/           # Locust scenarios
    chaos/          # failure injection
    security/       # OWASP, fuzzing
    fixtures/       # shared test data factories
    helpers/        # shared utilities
  ```
- [ ] Write `/tests/CLAUDE.md` documenting:
  - How to run each test suite
  - Naming conventions
  - When to use mocks vs real services
  - How to add a new test

### 2.2 Test data factories

**CLAUDE:**
- [ ] Build factory classes (using `factory_boy` + `Faker`) for every domain object: User, Course, Lesson, Quiz, Enrollment, Progress, Certificate
- [ ] Build scenario factories: `create_user_mid_course()`, `create_user_with_completed_certificate()`, `create_failing_payment_user()`
- [ ] Build a `tests/fixtures/personas.py` with 20+ realistic user personas (will be used heavily in Phase 5)

### 2.3 CI/CD test wiring

**HUMAN (before):**
- [ ] Confirm CI provider (GitHub Actions assumed) and grant Claude access to workflow files

**CLAUDE:**
- [ ] Write `.github/workflows/test.yml` with stages:
  - Lint (ruff/black)
  - Unit tests (must pass, blocking)
  - Integration tests (must pass, blocking)
  - E2E smoke tests (must pass, blocking)
  - Visual regression (warning, non-blocking initially)
  - Load test (manual trigger only)
- [ ] Add per-PR test summary comments
- [ ] Add a nightly workflow that runs the full E2E + visual regression suite

**HUMAN (after):**
- [ ] Test the workflow by opening a deliberately broken PR — confirm it gets blocked

**Phase 2 success criteria:** `pytest tests/` runs cleanly. New tests can be added without Claude needing to re-discover the framework conventions each session.

---

## Phase 3 — Core E2E + Cross-Browser Coverage (Week 2)

### 3.1 Critical-path E2E tests

**HUMAN (before):**
- [ ] Confirm the critical paths from `/docs/critical-paths.md` are still accurate
- [ ] Provide test credentials for any third-party flows (test Stripe cards, test email accounts)

**CLAUDE:**
- [ ] For each critical path, write a Playwright test that:
  - Uses a fresh user (factory-created)
  - Asserts not just navigation but actual data persistence
  - Captures screenshots at every meaningful step
  - Has graceful retries for known-flaky third-party hops (email verification)
- [ ] Cover at minimum:
  - Signup → email verify → onboarding → first lesson load
  - Course catalog browse → enroll → first lesson
  - Lesson progression → quiz → pass → next lesson unlock
  - Quiz fail → retry → pass
  - Course completion → certificate generation → certificate download
  - Payment flow (subscribe / one-time) → access provisioning
  - Password reset full flow
  - Profile update + avatar upload
  - Logout + session expiration handling

### 3.2 Cross-browser matrix execution

**HUMAN (before):**
- [ ] Provision BrowserStack or Sauce Labs account, add credentials to GitHub secrets

**CLAUDE:**
- [ ] Configure Playwright to run against the BrowserStack/Sauce grid
- [ ] Define the matrix in `tests/e2e/matrix.yml`:
  - iOS Safari 17, 18 on iPhone 14, 15
  - Chrome Android (latest, n-1) on Pixel 8, Galaxy S24
  - **Samsung Internet** on Galaxy S24 (your iridescent gradient and typography stack are at highest risk here)
  - Desktop: Chrome, Safari, Firefox, Edge (latest + n-1) on macOS and Windows 11
- [ ] Tag tests so the smoke subset runs on every PR, full matrix runs nightly

**HUMAN (after):**
- [ ] Manually inspect a screenshot from each browser of the critical "first lesson" view to confirm Abril Fatface, Cormorant Garamond, Barlow Condensed, and DM Mono are loading and rendering as intended (this is exactly the kind of thing that breaks silently)

### 3.3 Visual regression baseline

**HUMAN (before):**
- [ ] Provision Percy or Chromatic, add credentials to CI

**CLAUDE:**
- [ ] Add Percy/Chromatic snapshots to every E2E test
- [ ] Capture baseline snapshots from current "known-good" build
- [ ] Configure responsive snapshots: 375px (iPhone), 768px (iPad), 1280px (laptop), 1920px (desktop)
- [ ] Specifically baseline:
  - Iridescent iris gradient renders identically
  - Typography stack loads with no FOUT/FOIT
  - Lesson interactive elements at all breakpoints
  - Quiz UI at all breakpoints
  - Certificate render

**HUMAN (after):**
- [ ] Walk through baseline snapshots once, approve them as ground truth

**Phase 3 success criteria:** Every critical user journey passes on every target browser. Visual regression catches single-pixel changes automatically.

---

## Phase 4 — Load, Concurrency & Race Conditions (Week 3)

### 4.1 Locust setup (Python-native, fits your stack)

**HUMAN (before):**
- [ ] Decide where load tests run from — your laptop is fine for <500 users; for 1,000+ you need distributed runners (cheapest: 3–5 EC2 spot instances or a managed service like LoadForge/Grafana k6 Cloud)
- [ ] Confirm staging can be temporarily scaled to match production capacity (or scale prod-test environment)

**CLAUDE:**
- [ ] Set up `tests/load/` with Locust scenarios:
  - `signup_storm.py` — 999 users signing up in <60 seconds
  - `lesson_concurrent_load.py` — sustained 200 users watching lessons
  - `quiz_submission_burst.py` — 500 quiz submissions in 10 seconds
  - `payment_flow_load.py` — 100 concurrent payment attempts
  - `mixed_realistic.py` — weighted blend of all behaviors

### 4.2 The four core load tests

**CLAUDE writes; HUMAN approves before each run (load tests cost money and can break staging):**

- [ ] **Spike test** — 0 → 1,000 users in 10 seconds, hold 5 minutes, ramp down
  - Pass criteria: 0% error rate at peak, p95 < 2s
- [ ] **Soak test** — 200 users sustained for 24 hours, then 72 hours
  - Pass criteria: no memory growth, no connection pool exhaustion, no slow query accumulation, error rate stable
- [ ] **Breakpoint test** — ramp users by 100 every 30 seconds until something breaks
  - Output: documented ceiling (e.g., "system handles 3,400 concurrent users before payment service degrades")
- [ ] **Race-condition test** — 1,000 signup attempts with the same email in <200ms window
  - Pass criteria: exactly 1 user created, 999 receive a clean "email already exists" error, no DB corruption

### 4.3 Per-microservice load isolation

**CLAUDE:**
- [ ] For each of your 9 microservices, write an isolated load test that bypasses the API gateway and hits the service directly
- [ ] Document the per-service ceiling so you know which service is your bottleneck
- [ ] Specifically stress-test:
  - Auth service under credential-stuffing patterns
  - Notification service under signup storm (email send rate limits)
  - Certificate service under graduation surge (PDF generation is CPU-heavy)
  - Progress service under simultaneous lesson completions

### 4.4 Third-party limit testing

**CLAUDE:**
- [ ] Document every third-party rate limit in `/docs/third-party-limits.md`
- [ ] Write tests that deliberately approach (not exceed) each limit and verify your retry/backoff logic
- [ ] Verify Stripe webhook handler can absorb 100 events/sec (Stripe's burst rate)

**HUMAN (after):**
- [ ] Review the breakpoint test results — if your ceiling is under 3x your launch-day expected peak, that's a launch blocker

**Phase 4 success criteria:** You have a documented, evidence-backed answer to "what happens if 999 people sign up at once" and "what's our breaking point."

---

## Phase 5 — Synthetic User Fleet (Week 4)

This is the phase that gets you from 80% → 95%. Most launches skip it. Don't.

### 5.1 Persona library

**HUMAN (before):**
- [ ] Brainstorm 15–20 user personas based on your AE/SDR target market — be specific (e.g., "Junior SDR at a 50-person SaaS, Chrome on Mac, fast typer, distracted, opens 4 tabs")

**CLAUDE:**
- [ ] Build `tests/synthetic/personas.py` codifying each persona with:
  - Device profile (browser, viewport, user agent)
  - Behavior profile (think time distribution, typo rate, abandonment rate, return frequency)
  - Demographic data (locale, timezone, name patterns)

### 5.2 Bot behavior engine

**CLAUDE:**
- [ ] Build `tests/synthetic/bot_engine.py` — a Python class that drives Playwright with humanlike behavior:
  - Random think-time between actions (lognormal distribution, mean 3s)
  - 15% probability of abandoning any given step
  - Typos with backspace correction at realistic rates
  - Occasional double-clicks, accidental scroll, tab switching
  - Realistic mouse movement (not teleport-to-target)
- [ ] Build scenario library:
  - `evaluator_persona.py` — browses, watches one lesson, leaves
  - `committed_learner.py` — signs up, completes 3 lessons, takes quiz
  - `power_user.py` — goes through full course in one sitting
  - `confused_user.py` — clicks wrong things, uses back button heavily, abandons checkout twice before succeeding
  - `mobile_commuter.py` — short sessions, network interruptions, app backgrounding

### 5.3 Continuous fleet runs

**CLAUDE:**
- [ ] Create a runner that maintains 200–500 concurrent bot users against staging for 7 consecutive days
- [ ] Pipe all errors, slow responses, and unexpected DOM states to Sentry
- [ ] Generate a daily report: bots completed, bots failed, unique error patterns, performance distribution

**HUMAN (during):**
- [ ] Daily 15-min review of bot reports — every novel failure pattern is a bug to fix
- [ ] Triage: is this a real bug, a flaky test, or a third-party hiccup?

**Phase 5 success criteria:** 7 consecutive days of fleet runs with <0.5% unexplained failure rate.

---

## Phase 6 — Chaos Engineering (Week 5)

### 6.1 Failure injection toolkit

**HUMAN (before):**
- [ ] Decide chaos tooling — for Python/Docker: **toxiproxy** (network) + **Chaos Toolkit** (Python-native, perfect for your stack). For Kubernetes: **Chaos Mesh**.
- [ ] Confirm staging can be deliberately broken without anyone caring (i.e., no shared usage)

**CLAUDE:**
- [ ] Set up Chaos Toolkit experiments in `tests/chaos/`:
  - `kill_database.json` — terminate primary DB connection mid-request
  - `slow_third_party.json` — inject 5s latency on Stripe/SendGrid calls
  - `packet_loss.json` — 30% packet loss on auth service
  - `cpu_starvation.json` — pin a service to 100% CPU
  - `memory_pressure.json` — fill a service to 95% memory
  - `clock_skew.json` — shift one service's clock by 30 minutes
  - `dns_failure.json` — make one third-party unreachable

### 6.2 Resilience requirements

**CLAUDE:**
- [ ] For each chaos experiment, define expected behavior in the experiment file:
  - DB death → users see graceful error, no data loss, recovery within 30s
  - Stripe slow → checkout shows loading state, no double-charges, eventual success or clean failure
  - SendGrid down → signup completes, email queued for retry, user told "check your email in a minute"
- [ ] Write automated resilience assertions
- [ ] Run each experiment + verify the bot fleet (Phase 5) sees expected degradation, not catastrophic failure

### 6.3 Game day rehearsal

**HUMAN:**
- [ ] Block a Friday afternoon
- [ ] Have Claude orchestrate a sequence of escalating failures while you practice the response runbook
- [ ] Document every "I didn't know what to do" moment and have Claude write the missing runbook

**Phase 6 success criteria:** Every chaos experiment results in graceful degradation, not user-visible breakage. You have rehearsed responses to each failure mode.

---

## Phase 7 — Security & Abuse Testing (Week 5)

### 7.1 Automated security scanning

**HUMAN (before):**
- [ ] Confirm legal authorization to pen-test your own staging (yes for self-owned, but document it)

**CLAUDE:**
- [ ] Set up **OWASP ZAP** in Docker, run automated scan against staging
- [ ] Configure ZAP to authenticate so it can scan post-login pages
- [ ] Set up **Bandit** (Python static analysis) in CI
- [ ] Set up **Semgrep** with security rulesets
- [ ] Set up **pip-audit** / **Snyk** for dependency CVE monitoring
- [ ] Generate a baseline report; everything above "medium" must be triaged before launch

### 7.2 Rate limiting & abuse vectors

**CLAUDE:**
- [ ] Write tests in `tests/security/abuse/`:
  - Single IP firing 10,000 signups — must be rate limited
  - Single IP firing 1,000 password resets — must be rate limited
  - Credential stuffing simulation — must lock account or trigger CAPTCHA
  - SQL injection attempts in every form field — must be sanitized
  - XSS attempts in every text field — must be escaped
  - SSRF attempts via avatar upload URL — must be blocked
  - Mass enumeration of `/users/{id}` endpoints — must be authorized

### 7.3 Auth edge cases

**CLAUDE:**
- [ ] Expired JWT handling — graceful re-auth, no data loss
- [ ] Simultaneous sessions across devices — explicit policy enforced
- [ ] Password reset race conditions — old token invalidated when new one issued
- [ ] OAuth callback tampering
- [ ] Session fixation
- [ ] CSRF on every state-changing endpoint

### 7.4 Fuzz testing

**CLAUDE:**
- [ ] Use **Hypothesis** (property-based testing for Python) on every API endpoint
- [ ] Use **Atheris** (Python fuzzer) on input parsing functions
- [ ] Specifically fuzz: quiz answer submission, progress updates, profile updates, course content URLs

**Phase 7 success criteria:** Zero high-severity findings open. Rate limiting demonstrably works. Fuzzers run for 24 hours without crashing the system.

---

## Phase 8 — Observability (Week 5–6, can parallelize)

This must be live BEFORE launch, not after. You cannot fix what you cannot see.

### 8.1 Error tracking

**HUMAN (before):**
- [ ] Sentry account live, project created for AESDR

**CLAUDE:**
- [ ] Install Sentry SDK in every microservice
- [ ] Configure source maps so JS errors are readable
- [ ] Set up release tracking tied to git commits
- [ ] Configure alerting rules: any new error type → Slack/email immediately, error rate spike → page

### 8.2 Session replay

**HUMAN (before):**
- [ ] PostHog or LogRocket account live
- [ ] Decide privacy posture: mask all user inputs by default? (Recommended)

**CLAUDE:**
- [ ] Install session replay SDK
- [ ] Configure PII masking on form fields
- [ ] Build a "rage click" alert — fires when a user clicks the same element 5+ times in 3 seconds

### 8.3 APM & infrastructure metrics

**HUMAN (before):**
- [ ] Datadog / Better Stack / Grafana Cloud account live

**CLAUDE:**
- [ ] Instrument every microservice with OpenTelemetry
- [ ] Build dashboards for each service: request rate, error rate, p50/p95/p99 latency, saturation (CPU/mem/connections)
- [ ] Build a single "war room" dashboard combining all critical metrics on one screen

### 8.4 Structured logging with correlation IDs

**CLAUDE:**
- [ ] Refactor logging to use structured JSON (loguru with json sink, or stdlib logging with json formatter)
- [ ] Inject a request ID at the API gateway, propagate through every service call, include in every log line
- [ ] Verify a single user's full journey can be traced across all 9 services with one query

### 8.5 Synthetic uptime monitoring

**CLAUDE:**
- [ ] Set up Better Uptime / Pingdom checks against:
  - Marketing page
  - Login flow
  - Lesson load (logged-in)
  - Quiz submission
  - Stripe webhook receipt
- [ ] Configure escalation: 1 missed check → Slack, 3 missed → SMS, 5 missed → phone call

**Phase 8 success criteria:** A user reports "the app is broken." You can identify the user, replay their session, see their errors, see their request trace across all services, and identify the failing component in <2 minutes.

---

## Phase 9 — Staged Rollout & Feature Flags (Week 6)

### 9.1 Feature flag infrastructure

**HUMAN (before):**
- [ ] Choose feature flag tool — **PostHog** (you may already have it for replay), **LaunchDarkly**, or self-hosted with **Unleash**

**CLAUDE:**
- [ ] Wrap every non-trivial feature in a flag
- [ ] Wrap every third-party integration in a flag (so you can disable Stripe/SendGrid/etc. on the fly if they break)
- [ ] Build an admin panel for instant flag toggle (or use vendor's UI)
- [ ] Test that flag changes propagate within 30 seconds

### 9.2 Waitlist + cohort gate

**CLAUDE:**
- [ ] Build a waitlist gate: invitation-code or email-allowlist required to sign up
- [ ] Build a "current cohort size" admin view
- [ ] Build batch invite tooling: invite the next N people from waitlist with one command

### 9.3 Rollout schedule

**HUMAN:**

Define and write to `/docs/rollout-plan.md`:

- [ ] **Week 1 (private alpha):** 10 hand-picked users you can text directly. Daily standup with yourself reviewing Sentry, replay, dashboards.
- [ ] **Week 2 (closed beta):** 100 invited users. Soak test running in parallel. Chaos game day mid-week. Gate: 0 P0 bugs, <3 P1 bugs.
- [ ] **Week 3 (waitlist drip):** Open in batches of 100/day from waitlist. Confirm real usage matches synthetic load test predictions. Gate: error rate <0.1% sustained 72hrs.
- [ ] **Week 4 (open):** Public launch. War-room active for 48hrs.

### 9.4 Rollback plan

**CLAUDE:**
- [ ] Document one-command rollback for each microservice
- [ ] Verify rollback works by deploying a deliberately bad version to staging and rolling back
- [ ] Write `/docs/incident-playbooks.md` covering top 10 likely failure modes with step-by-step response

**Phase 9 success criteria:** You can disable any single feature in <30 seconds. You can roll back any service in <2 minutes. You have rehearsed the response to your top 10 failure modes.

---

## Phase 10 — Post-Launch Continuous Hardening (Week 7+)

### 10.1 Shadow traffic

**Once you have real users:**

**CLAUDE:**
- [ ] Set up **GoReplay** or equivalent to mirror production HTTP traffic to staging in real time
- [ ] Discard staging responses but compare to prod responses for divergence
- [ ] Alert on response divergence — this catches regressions against real user behavior with zero user impact

### 10.2 Continuous fleet

**CLAUDE:**
- [ ] Keep the synthetic bot fleet (Phase 5) running 24/7 against staging
- [ ] Run it against production at low volume (10–20 bots) as a continuous integration test

### 10.3 Postmortem culture

**HUMAN:**
- [ ] Every incident, even minor, gets a written postmortem
- [ ] Have Claude generate the postmortem template and pre-fill it with timeline data from your observability stack
- [ ] Every postmortem produces at least one new test or one new alert

### 10.4 Quarterly chaos days

**HUMAN:**
- [ ] Schedule recurring chaos game days every 90 days
- [ ] Rotate through your chaos experiment library
- [ ] New failure modes discovered get added to the library

---

## Tips for Working with Claude Code on This Plan

These are specific to maximizing what you get out of Claude Code across a multi-week project:

1. **One phase = one branch.** Don't let Claude work across phases simultaneously. Commit and merge between phases.

2. **Long-running context loss is real.** Update `/CLAUDE.md` at the end of every session with the current state ("Phase 4 complete, breakpoint test ceiling = 3,400 users, blocked on Stripe webhook capacity, pick up Phase 5 next").

3. **Tag your tests aggressively.** `@pytest.mark.smoke`, `@pytest.mark.load`, `@pytest.mark.flaky` — Claude will use these consistently if you set the convention early.

4. **Approve before applying for anything stateful.** IaC plans, DB migrations, load tests against shared environments. Claude is fast; mistakes are also fast.

5. **Capture decisions, not just code.** Every time you tell Claude "we decided X because Y," ask it to also write that to `/docs/decisions.md`. Future Claude sessions need this.

6. **Run tests yourself sometimes.** Don't let Claude be the only one running the suite. You'll spot UI-level weirdness Claude can't see in stdout.

7. **The 5% you can't simulate.** No amount of Phase 1–10 work catches the user who pastes 50KB into a name field, the user who signs up with a deceased relative's email, the user who opens 14 checkout tabs. Plan for the staged rollout to catch these. Don't expect simulation to be 100%.

---

## Cost Reality Check

Rough monthly costs for the full stack at AESDR's likely scale:

- BrowserStack/Sauce Labs: $99–$199
- Sentry: $0–$26
- Session replay (PostHog): $0–$50
- APM (Datadog/Better Stack): $20–$200
- Percy/Chromatic: $0–$149
- Uptime monitoring: $0–$20
- Load test runners (EC2 spot, only when running): $20–$50
- Feature flags (PostHog or self-hosted Unleash): $0
- Staging infrastructure: 30–50% of production cost

**Total: ~$200–700/month** to run the full mature testing stack. Substantially less if you self-host where possible and use free tiers aggressively in early stage.

---

## Final Confidence Math

If you complete:

- Phases 0–3 only: ~70% confidence (better than most launches)
- Phases 0–4: ~80% confidence (you know your breaking point)
- Phases 0–6: ~90% confidence (you've rehearsed failure)
- Phases 0–8: ~95% confidence (you can see and fix in flight)
- All 10 phases + staged rollout: ~98% confidence

The remaining 2% is the cost of dealing with reality. That's what the war room is for.
