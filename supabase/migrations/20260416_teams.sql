-- Migration: Create teams and team_members tables for Team plan
-- Teams are created automatically when a team plan is purchased via Stripe

CREATE TABLE IF NOT EXISTS public.teams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT 'My Team',
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  purchase_id uuid REFERENCES purchases(id),
  max_seats integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teams_owner ON public.teams(owner_id);

CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  invite_token text UNIQUE,
  invited_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  CONSTRAINT team_members_team_email_unique UNIQUE (team_id, email)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_token ON public.team_members(invite_token);

-- RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Team owner can read their teams
CREATE POLICY "Team owner can read own teams"
  ON public.teams FOR SELECT
  USING (auth.uid() = owner_id);

-- Team members can read their team
CREATE POLICY "Team members can read team"
  ON public.teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
      AND team_members.accepted_at IS NOT NULL
    )
  );

-- Service role full access
CREATE POLICY "Service role full access on teams"
  ON public.teams FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Team members can read their own membership
CREATE POLICY "Members can read own membership"
  ON public.team_members FOR SELECT
  USING (auth.uid() = user_id);

-- Team owner can read all members of their team
CREATE POLICY "Owner can read team members"
  ON public.team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_members.team_id
      AND teams.owner_id = auth.uid()
    )
  );

-- Service role full access
CREATE POLICY "Service role full access on team_members"
  ON public.team_members FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
