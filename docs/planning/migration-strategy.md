# Database Migration Strategy

> How the AESDR Supabase schema evolves over time without breaking production.

---

## Current Schema (v1 — Pre-Launch)

### Tables

**`course_progress`**
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, auto-generated |
| user_id | uuid | FK to auth.users |
| lesson_id | text | e.g. "01", "02" … "12" |
| is_completed | boolean | default false |
| last_screen | integer | 0-indexed screen position |
| state_data | jsonb | arbitrary progress state (unit, checklist ticks, etc.) |
| completed_at | timestamptz | null until completed |
| created_at | timestamptz | auto |
| updated_at | timestamptz | auto |

**Unique constraint:** `(user_id, lesson_id)` — one progress row per user per lesson.

### Auth

Supabase Auth with email/password. No OAuth providers yet.

---

## Migration Principles

1. **Additive only.** Never drop columns or rename them in production. Add new columns with defaults.
2. **Backwards-compatible.** New columns must have `DEFAULT` values so existing rows don't break.
3. **Test in staging first.** Use Supabase branching or a separate project for staging.
4. **Version your migrations.** Name files with timestamps: `20260406_add_purchase_status.sql`.
5. **No raw SQL in app code.** All schema changes happen via migration files, never via the app.

---

## Planned Migrations

### M1: Purchase / Payment (when Stripe is integrated)

```sql
-- 20260XXX_add_purchases.sql
CREATE TABLE purchases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id text,
  stripe_session_id text UNIQUE,
  plan text NOT NULL CHECK (plan IN ('individual', 'team')),
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'refunded')),
  purchased_at timestamptz DEFAULT now(),
  refunded_at timestamptz
);

-- Index for lookups by user
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
```

### M2: Team Licenses (if team pricing launches)

```sql
-- 20260XXX_add_teams.sql
CREATE TABLE teams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  max_seats integer NOT NULL DEFAULT 6,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE team_members (
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);
```

### M3: Feedback / Ratings (post-launch)

```sql
-- 20260XXX_add_feedback.sql
ALTER TABLE course_progress
  ADD COLUMN rating integer CHECK (rating BETWEEN 1 AND 5),
  ADD COLUMN feedback_text text;
```

---

## How to Run a Migration

1. Write the SQL file in `docs/migrations/` (create this directory when needed)
2. Test on a Supabase branch or staging project
3. Run in production via Supabase SQL Editor or CLI:
   ```bash
   supabase db push --db-url $SUPABASE_DB_URL
   ```
4. Verify with a quick query: `SELECT * FROM <new_table> LIMIT 1;`
5. Commit the migration file to git

---

## RLS Policies (to add before launch)

```sql
-- Users can only read/write their own progress
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own progress"
  ON course_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own progress"
  ON course_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own progress"
  ON course_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Purchases: users can read their own, only service role can write
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own purchases"
  ON purchases FOR SELECT
  USING (auth.uid() = user_id);
```

> **Action required:** Run the RLS policies on `course_progress` in your Supabase SQL Editor before launch. The app code already scopes queries by user_id, but RLS is the database-level safety net.

---

## Notes

- `state_data` (jsonb) is intentionally schemaless — it stores whatever the lesson iframe sends (current unit, checkbox states, etc.). No migration needed when lesson content changes.
- Supabase auto-manages `auth.users` — never modify that table directly.
- If you add a column to `course_progress`, also update `utils/progress/types.ts` to match.
