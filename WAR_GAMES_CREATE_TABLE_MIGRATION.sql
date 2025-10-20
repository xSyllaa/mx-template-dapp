-- ============================================================
-- WAR GAMES TABLE MIGRATION
-- ============================================================
-- Description: Create war_games table for 1v1 NFT team battles
-- Author: GalacticX Team
-- Date: 2025-10-20
-- ============================================================

-- ============================================================
-- 1. CREATE TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS war_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Creator (Player A)
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  creator_team_id UUID NOT NULL REFERENCES public.war_game_teams(id) ON DELETE CASCADE,
  
  -- Opponent (Player B) - NULL until someone joins
  opponent_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  opponent_team_id UUID REFERENCES public.war_game_teams(id) ON DELETE CASCADE,
  
  -- War Game Configuration
  points_stake INTEGER NOT NULL CHECK (points_stake > 0), -- Points mis en jeu
  entry_deadline TIMESTAMP WITH TIME ZONE NOT NULL, -- Date limite pour rejoindre
  
  -- War Game Status
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  -- open: Waiting for opponent to join
  -- in_progress: Both teams confirmed, waiting for result
  -- completed: Winner determined, points distributed
  -- cancelled: War Game cancelled (creator can cancel if no opponent)
  
  -- Results (NULL until completed)
  winner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  creator_score INTEGER,
  opponent_score INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE, -- When opponent joined
  completed_at TIMESTAMP WITH TIME ZONE, -- When result was validated
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT different_players CHECK (creator_id != opponent_id),
  CONSTRAINT valid_entry_deadline CHECK (entry_deadline > created_at),
  CONSTRAINT winner_must_be_player CHECK (
    winner_id IS NULL OR 
    winner_id = creator_id OR 
    winner_id = opponent_id
  )
);

-- ============================================================
-- 2. CREATE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_war_games_creator_id ON war_games(creator_id);
CREATE INDEX IF NOT EXISTS idx_war_games_opponent_id ON war_games(opponent_id);
CREATE INDEX IF NOT EXISTS idx_war_games_status ON war_games(status);
CREATE INDEX IF NOT EXISTS idx_war_games_created_at ON war_games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_war_games_entry_deadline ON war_games(entry_deadline);
CREATE INDEX IF NOT EXISTS idx_war_games_status_deadline ON war_games(status, entry_deadline);

-- ============================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE war_games ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. CREATE RLS POLICIES
-- ============================================================

-- Policy 1: Everyone can view open war games (to join them)
CREATE POLICY "Anyone can view open war games" ON war_games
  FOR SELECT
  USING (status = 'open' AND entry_deadline > NOW());

-- Policy 2: Players can view their own war games (any status)
CREATE POLICY "Users can view their own war games" ON war_games
  FOR SELECT
  USING (
    get_current_user_id() = creator_id OR 
    get_current_user_id() = opponent_id
  );

-- Policy 3: Authenticated users can create war games
CREATE POLICY "Users can create war games" ON war_games
  FOR INSERT
  WITH CHECK (get_current_user_id() = creator_id);

-- Policy 4: Users can join open war games as opponent
CREATE POLICY "Users can join open war games" ON war_games
  FOR UPDATE
  USING (
    status = 'open' AND 
    entry_deadline > NOW() AND
    get_current_user_id() != creator_id AND
    opponent_id IS NULL
  )
  WITH CHECK (
    get_current_user_id() = opponent_id AND
    status = 'in_progress'
  );

-- Policy 5: Creator can cancel open war games with no opponent
CREATE POLICY "Creator can cancel open war games" ON war_games
  FOR UPDATE
  USING (
    get_current_user_id() = creator_id AND
    status = 'open' AND
    opponent_id IS NULL
  )
  WITH CHECK (status = 'cancelled');

-- Policy 6: Only admins can update completed war games (for result validation)
CREATE POLICY "Admins can update war game results" ON war_games
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'king'
    )
  );

-- ============================================================
-- 5. CREATE TRIGGER FOR UPDATED_AT
-- ============================================================

CREATE OR REPLACE FUNCTION update_war_games_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_war_games_updated_at
  BEFORE UPDATE ON war_games
  FOR EACH ROW
  EXECUTE FUNCTION update_war_games_updated_at();

-- ============================================================
-- 6. COMMENTS
-- ============================================================

COMMENT ON TABLE war_games IS '1v1 NFT team battles between players';
COMMENT ON COLUMN war_games.creator_id IS 'User who created the war game (Player A)';
COMMENT ON COLUMN war_games.creator_team_id IS 'Team composition for creator';
COMMENT ON COLUMN war_games.opponent_id IS 'User who joined (Player B), NULL if waiting';
COMMENT ON COLUMN war_games.opponent_team_id IS 'Team composition for opponent, NULL if not joined';
COMMENT ON COLUMN war_games.points_stake IS 'Points at stake (winner takes all or split)';
COMMENT ON COLUMN war_games.entry_deadline IS 'Deadline for opponents to join';
COMMENT ON COLUMN war_games.status IS 'open (waiting) -> in_progress (both joined) -> completed/cancelled';
COMMENT ON COLUMN war_games.winner_id IS 'Winner user ID (NULL if tie or not completed)';
COMMENT ON COLUMN war_games.creator_score IS 'Total team score for creator (calculated from NFTs)';
COMMENT ON COLUMN war_games.opponent_score IS 'Total team score for opponent (calculated from NFTs)';
COMMENT ON COLUMN war_games.started_at IS 'Timestamp when opponent joined';
COMMENT ON COLUMN war_games.completed_at IS 'Timestamp when result was validated';

-- ============================================================
-- 7. HELPER FUNCTION TO GET OPEN WAR GAMES
-- ============================================================

CREATE OR REPLACE FUNCTION get_open_war_games()
RETURNS TABLE (
  id UUID,
  creator_id UUID,
  creator_username TEXT,
  points_stake INTEGER,
  entry_deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wg.id,
    wg.creator_id,
    u.username,
    wg.points_stake,
    wg.entry_deadline,
    wg.created_at
  FROM public.war_games wg
  INNER JOIN public.users u ON u.id = wg.creator_id
  WHERE wg.status = 'open'
    AND wg.opponent_id IS NULL
    AND wg.entry_deadline > NOW()
  ORDER BY wg.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 8. GRANT PERMISSIONS
-- ============================================================

-- Grant execute on helper functions to authenticated users
GRANT EXECUTE ON FUNCTION get_open_war_games() TO authenticated;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- Run this migration in your Supabase SQL editor
-- Then verify with: SELECT * FROM war_games;
-- ============================================================

