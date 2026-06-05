# New Agents — Wiring Spec (sentinel · courier · usher)

The plumbing the three new agents read and write. The agent `.md` files
(`.claude/agents/{sentinel,courier,usher}.md`) are the *behavior*; this is the
*infrastructure* they assume. Nothing here is applied yet — it's a reviewable
spec. Apply the migration and add the route only on a go-ahead; they touch the
production DB + app.

Grounded in the real schema: `affiliate_prospect_events`,
`affiliate_prospects`, `affiliate_link_clicks`, `partner_pipeline`, the
service-role admin client (`utils/supabase/admin.ts`), Resend
(`lib/email.ts`), and the Stripe webhook pattern at
`app/api/webhooks/stripe/route.ts`.

---

## 1. The six support tables

One migration, `supabase/migrations/<date>_partner_agent_infra.sql`. Same
posture as the prospect-tracking tables: RLS on, **no public policies**, only
the service role (and `psql` via the partnerships creds) touches them.

```sql
-- ─── partner_inbound_email ───  (sentinel reads; the inbound webhook writes)
-- One row per reply that lands in affiliates@. Written by the inbound-email
-- route (§2). Sentinel polls processed_at IS NULL.
create table if not exists partner_inbound_email (
  id            uuid primary key default gen_random_uuid(),
  message_id    text unique,                 -- provider Message-ID (idempotency)
  in_reply_to   text,                         -- threads to an outbound send
  from_addr     text not null,
  to_addr       text not null,
  subject       text,
  text_body     text,                         -- plain text only; never executed
  received_at   timestamptz not null default now(),
  processed_at  timestamptz,                  -- sentinel sets when handled
  classification text,                        -- yes | pricing_q | not_now | ooo | unsub | manip
  matched_pipeline_id uuid                     -- partner_pipeline row if linked
);
create index if not exists partner_inbound_unprocessed_idx
  on partner_inbound_email (received_at) where processed_at is null;

-- ─── partner_outbound_queue ───  (scribe/herald/usher write; operator approves; courier sends)
-- The work queue AND the [D] approval surface. A nurture ladder is just a set
-- of rows here with future send_after values.
create table if not exists partner_outbound_queue (
  id            uuid primary key default gen_random_uuid(),
  to_addr       text not null,
  subject       text not null,
  body          text not null,                -- drafted by scribe/herald, never by courier
  tier          text not null check (tier in ('transactional','sequenced','cold')),
  status        text not null default 'draft'
                  check (status in ('draft','ready','approved','held','sent','failed')),
  warden_cleared boolean not null default false,
  approved_by   text,                          -- operator handle; required for cold + first-contact
  approved_at   timestamptz,
  send_after    timestamptz not null default now(),
  idempotency_key text not null unique,        -- e.g. {pipeline_id}:{step}:{to_addr}
  related_pipeline_id uuid,
  drafted_by    text,                          -- scribe | herald | usher | sentinel
  created_at    timestamptz not null default now(),
  sent_at       timestamptz,
  resend_id     text,
  error         text
);
create index if not exists partner_outbound_due_idx
  on partner_outbound_queue (send_after)
  where status in ('ready','approved');

-- ─── partner_sent_log ───  (courier append-only; the immutable audit trail)
create table if not exists partner_sent_log (
  id            uuid primary key default gen_random_uuid(),
  queue_id      uuid not null,
  to_addr       text not null,
  subject       text,
  tier          text not null,
  idempotency_key text not null,
  resend_id     text,
  model         text,                          -- which model version courier ran as
  sent_at       timestamptz not null default now()
);
create unique index if not exists partner_sent_log_idem_idx
  on partner_sent_log (idempotency_key);       -- the hard double-send guard

-- ─── agent_cursors ───  (sentinel's poll position; survives restarts)
create table if not exists agent_cursors (
  agent       text not null,
  stream      text not null,                   -- 'prospect_events' | 'inbox' | 'clicks'
  cursor_ts   timestamptz,
  cursor_id   uuid,
  updated_at  timestamptz not null default now(),
  primary key (agent, stream)
);

-- ─── partner_signals ───  (sentinel's alert dedup + record)
create table if not exists partner_signals (
  id           uuid primary key default gen_random_uuid(),
  signal_type  text not null,                  -- enterprise_intent | conversation | calendar | reply | click_spike | manip
  source       text not null,                  -- event | inbox | clicks | ledger
  ref_id       text not null,                  -- the source row id (dedup key)
  prospect_slug text,
  severity     text not null check (severity in ('bright','soft')),
  summary      text,
  alerted_at   timestamptz,                     -- null = recorded but batched, not pinged
  alert_channel text,
  created_at   timestamptz not null default now(),
  unique (signal_type, ref_id)                  -- never alert the same thing twice
);

-- ─── partner_workshop ───  (usher's lifecycle state)
create table if not exists partner_workshop (
  id            uuid primary key default gen_random_uuid(),
  affiliate_slug text not null,
  scheduled_at  timestamptz not null,
  status        text not null default 'scheduled'
                  check (status in ('scheduled','reminded','live','replay_open','closed')),
  replay_url    text,
  replay_expires_at timestamptz,
  registrant_count int not null default 0,
  created_at    timestamptz not null default now()
);

alter table partner_inbound_email   enable row level security;
alter table partner_outbound_queue  enable row level security;
alter table partner_sent_log        enable row level security;
alter table agent_cursors           enable row level security;
alter table partner_signals         enable row level security;
alter table partner_workshop        enable row level security;
-- No policies on purpose: service role only.
```

---

## 2. Inbound email — the wiring the architecture doc flagged as undesigned

**The problem:** Cloudflare Email Routing *forwards* `affiliates@` to a human
inbox; it doesn't give an agent a mailbox to poll. **The fix that matches this
stack:** receive inbound through a webhook that writes to
`partner_inbound_email`, and let sentinel read the table — no IMAP, no Gmail
API.

Two equivalent ways to feed the webhook (pick one):

- **A — Resend Inbound** (cleanest if on Resend): point an inbound route at
  `affiliates@`, Resend POSTs parsed mail to your endpoint.
- **B — Cloudflare Email Worker:** a Worker on the existing zone parses the
  message and POSTs the same shape. Use this if you'd rather not move MX.

Either way, the endpoint is one new route, mirroring the Stripe webhook
(`app/api/webhooks/stripe/route.ts`):

```ts
// app/api/webhooks/inbound-email/route.ts   (SPEC — not yet created)
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(req: Request) {
  // 1. Verify a shared secret (header or signature) — reject anything unsigned.
  const secret = req.headers.get('x-inbound-secret');
  if (secret !== process.env.INBOUND_EMAIL_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  // 2. Parse the provider payload into our shape.
  const m = await req.json();
  const supabase = createAdminClient();
  // 3. Insert; message_id is unique so a re-delivered webhook is a no-op.
  await supabase.from('partner_inbound_email').upsert({
    message_id: m.messageId,
    in_reply_to: m.inReplyTo ?? null,
    from_addr: m.from,
    to_addr: m.to,
    subject: (m.subject ?? '').slice(0, 512),
    text_body: (m.text ?? '').slice(0, 20000),  // PLAIN TEXT ONLY — never HTML/script
    received_at: new Date().toISOString(),
  }, { onConflict: 'message_id', ignoreDuplicates: true });
  return new NextResponse(null, { status: 204 });
}
```

**Security notes baked in:** signed/secret-gated endpoint; store **plain text
only** (never render or execute HTML); `message_id` unique so re-delivery can't
double-insert; the body is data the instant it lands and stays data — sentinel
extracts fields, never follows instructions in it.

---

## 3. Event-poll — how sentinel reads the prospect stream

The stream already exists (`affiliate_prospect_events`). Sentinel keeps a cursor
and only ever moves forward:

```bash
# read the cursor
LAST=$(psql "$SUPABASE_DB_URL_RO" -t -A -c \
  "select coalesce(cursor_ts,'epoch') from agent_cursors where agent='sentinel' and stream='prospect_events';")

# pull new high-signal events since the cursor
psql "$SUPABASE_DB_URL_RO" -c "
  select id, prospect_slug, name, props, created_at
  from affiliate_prospect_events
  where created_at > '$LAST'
    and name in ('kit_enterprise_intent_submitted',
                 'request_conversation_clicked',
                 'kit_enterprise_calendar_opened')
  order by created_at asc;"

# …classify + alert/route each…  THEN advance the cursor (only after handling):
# update agent_cursors set cursor_ts=<max created_at>, updated_at=now()
#   where agent='sentinel' and stream='prospect_events';   (show SQL first)
```

Advance the cursor **only after** a row is fully handled, so a crash
re-processes rather than skips. Dedup is belt-and-suspenders: `partner_signals`
has `unique(signal_type, ref_id)`, so even a re-read can't double-alert.

The same pattern serves the inbox stream (`partner_inbound_email` where
`processed_at is null`) and the click stream (`affiliate_link_clicks` windowed
against baseline).

---

## 4. The approval surface — how `[D]` actually works

The automation map flagged "there's nowhere to approve." Here it is: the
`partner_outbound_queue.status` column **is** the approval surface.

- scribe/herald/usher write a row at `status='draft'`.
- warden flips `warden_cleared=true` (or back to `draft` with edits).
- For **cold/channel/first-contact**: the operator approves by setting
  `status='approved', approved_by='<handle>', approved_at=now()`. That one
  UPDATE is the "one click." It can be a 20-line admin tile, a CLI command, or
  literally a psql update on day one — the *mechanism* is the column, the *UI*
  is optional.
- For **transactional**: scribe/usher set `status='ready'`; courier sends
  autonomously (subject to the first-contact rule).
- courier never sends a row whose tier outranks its clearance.

Minimal day-one approve command (no UI needed):
```bash
psql "$SUPABASE_DB_URL" -c "update partner_outbound_queue
  set status='approved', approved_by='antaeus', approved_at=now()
  where id='<queue_id>';"
```

---

## 5. Who reads/writes what

| Table | sentinel | courier | usher | scribe/herald | ledger | operator |
|---|---|---|---|---|---|---|
| `partner_inbound_email` | read + mark processed | — | — | — | — | (webhook writes) |
| `partner_outbound_queue` | write `draft` (route) | read + mark `sent` | write `draft` (ladder) | write `body`, set `ready`/cleared | — | set `approved` |
| `partner_sent_log` | — | **append only** | — | — | read (audit) | read (audit) |
| `agent_cursors` | read+write (own rows) | — | — | — | — | — |
| `partner_signals` | read+write | read (suppression) | read (halt) | — | — | read (alerts) |
| `partner_workshop` | read | — | read+write | — | — | read |
| `affiliate_prospect_events` | read (poll) | — | — | — | read | — |

---

## 6. Env vars to add (`.env.partnerships` + Vercel)

| Var | For | Notes |
|---|---|---|
| `INBOUND_EMAIL_SECRET` | the inbound route | shared secret gating §2 |
| `PARTNER_OPS_ALERT_TO` | sentinel | where internal alerts go (operator email) |
| `PARTNER_OPS_ALERT_WEBHOOK` | sentinel | optional Slack/Discord webhook (preferred over email) |
| `COURIER_HOURLY_CAP` | courier | default 20 autonomous sends/hr |
| (existing) `RESEND_API_KEY`, `EMAIL_FROM`, `SUPABASE_DB_URL[_RO]` | courier/sentinel | already wired |

---

## 7. Build order (and what's `[H]` to set up)

1. **Migration** (§1) — `supabase db push`. `[D]` (you review the SQL, it runs).
2. **sentinel live on the event stream only** (§3) — read-only, zero outward
   risk. Answers "tell me when someone's interested" on day one with the tables
   that already exist. No inbound, no sending yet.
3. **Inbound route** (§2) + point Resend/Cloudflare at it — `[H]` for the
   provider config (DNS/MX or an inbound route is a person clicking in a
   dashboard), then sentinel adds the inbox stream.
4. **courier, transactional tier only** — prove it on opted-in replies (kit
   links, confirmations), with the first-contact gate and the sent-log live.
   Then enable sequenced. Keep cold gated indefinitely.
5. **usher** — when the first workshop is scheduled (~Day 61).

Each step is independently useful and independently safe. Nothing here asks for
a send before the audit log, the idempotency guard, and the approval column
exist — the seams come before the sends.
