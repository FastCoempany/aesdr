-- ═══════════════════════════════════════════════
-- AESDR: Purchases & Checkout Sessions
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- ── Purchases table ──
CREATE TABLE IF NOT EXISTS purchases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_session_id text UNIQUE NOT NULL,
  user_email text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  plan text NOT NULL CHECK (plan IN ('individual', 'team')),
  amount_cents integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'refunded', 'cancelled')),
  purchased_at timestamptz NOT NULL DEFAULT now(),

  -- Drip email flags
  day3_sent boolean NOT NULL DEFAULT false,
  day7_sent boolean NOT NULL DEFAULT false,

  -- Drop-off prevention flags
  dropoff_5d_sent boolean NOT NULL DEFAULT false,
  dropoff_10d_sent boolean NOT NULL DEFAULT false,
  dropoff_21d_sent boolean NOT NULL DEFAULT false,

  -- Review request flags
  review_requested boolean NOT NULL DEFAULT false,
  review_requested_at timestamptz,
  review_nudge_sent boolean NOT NULL DEFAULT false,

  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for cron queries
CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases (user_email);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases (status);
CREATE INDEX IF NOT EXISTS idx_purchases_purchased_at ON purchases (purchased_at);

-- RLS: users can read their own purchases
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchases"
  ON purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything (for webhooks/crons)
CREATE POLICY "Service role full access"
  ON purchases FOR ALL
  USING (auth.role() = 'service_role');


-- ── Checkout Sessions table (for abandonment tracking) ──
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text UNIQUE NOT NULL,
  user_email text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('individual', 'team')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed boolean NOT NULL DEFAULT false,

  -- Abandonment email tracking
  abandon_1hr_sent timestamptz,
  abandon_24hr_sent timestamptz
);

CREATE INDEX IF NOT EXISTS idx_checkout_sessions_completed ON checkout_sessions (completed);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_started_at ON checkout_sessions (started_at);

-- RLS
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on checkout_sessions"
  ON checkout_sessions FOR ALL
  USING (auth.role() = 'service_role');
