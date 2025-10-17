-- ============================================================
-- LEADERBOARD SYSTEM MIGRATION
-- GalacticX dApp - Points Transaction Tracking & Leaderboards
-- ============================================================

-- ============================================================
-- 1. CREATE points_transactions TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN (
    'prediction_win', 
    'prediction_bet',
    'streak_claim', 
    'war_game_win', 
    'totw_bonus', 
    'admin_adjustment'
  )),
  source_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_pts_trans_user_id ON points_transactions(user_id);
CREATE INDEX idx_pts_trans_created_at ON points_transactions(created_at DESC);
CREATE INDEX idx_pts_trans_source_type ON points_transactions(source_type);
CREATE INDEX idx_pts_trans_user_date ON points_transactions(user_id, created_at DESC);

-- Comments
COMMENT ON TABLE points_transactions IS 'Historical record of all point gains and losses';
COMMENT ON COLUMN points_transactions.amount IS 'Positive for gains, negative for losses (bets)';
COMMENT ON COLUMN points_transactions.source_type IS 'Type of activity that generated the points';
COMMENT ON COLUMN points_transactions.source_id IS 'UUID of the source entity (prediction, streak, etc.)';
COMMENT ON COLUMN points_transactions.metadata IS 'Additional context (bet amount, winning option, etc.)';

-- ============================================================
-- 2. MODIFY leaderboards TABLE
-- ============================================================

-- Add month column
ALTER TABLE leaderboards 
  ADD COLUMN IF NOT EXISTS month INTEGER;

-- Drop old constraint
ALTER TABLE leaderboards 
  DROP CONSTRAINT IF EXISTS leaderboards_leaderboard_type_check;

-- Add new constraint with monthly type
ALTER TABLE leaderboards 
  ADD CONSTRAINT leaderboards_leaderboard_type_check 
  CHECK (leaderboard_type IN ('all_time', 'weekly', 'monthly'));

-- Update unique constraint
ALTER TABLE leaderboards 
  DROP CONSTRAINT IF EXISTS unique_user_leaderboard;

ALTER TABLE leaderboards 
  ADD CONSTRAINT unique_user_leaderboard 
  UNIQUE (user_id, leaderboard_type, week_number, month, year);

-- Add check constraint for monthly leaderboards
ALTER TABLE leaderboards 
  DROP CONSTRAINT IF EXISTS month_required_for_monthly;

ALTER TABLE leaderboards 
  ADD CONSTRAINT month_required_for_monthly CHECK (
    (leaderboard_type = 'monthly' AND month IS NOT NULL AND year IS NOT NULL) OR
    (leaderboard_type = 'weekly' AND week_number IS NOT NULL AND year IS NOT NULL AND month IS NULL) OR
    (leaderboard_type = 'all_time' AND week_number IS NULL AND year IS NULL AND month IS NULL)
  );

-- ============================================================
-- 3. CREATE FUNCTION: record_points_transaction
-- ============================================================

CREATE OR REPLACE FUNCTION record_points_transaction(
  p_user_id UUID,
  p_amount INTEGER,
  p_source_type TEXT,
  p_source_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
BEGIN
  -- Insert the transaction
  INSERT INTO points_transactions (user_id, amount, source_type, source_id, metadata)
  VALUES (p_user_id, p_amount, p_source_type, p_source_id, p_metadata)
  RETURNING id INTO v_transaction_id;
  
  -- Update user's total_points cache
  UPDATE users
  SET total_points = total_points + p_amount
  WHERE id = p_user_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION record_points_transaction IS 'Records a points transaction and updates user total_points';

-- ============================================================
-- 4. CREATE FUNCTION: get_leaderboard
-- ============================================================

CREATE OR REPLACE FUNCTION get_leaderboard(
  p_type TEXT,
  p_week INTEGER DEFAULT NULL,
  p_month INTEGER DEFAULT NULL,
  p_year INTEGER DEFAULT NULL,
  p_limit INTEGER DEFAULT 100,
  p_source_types TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  points BIGINT,
  rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH filtered_transactions AS (
    SELECT 
      pt.user_id,
      SUM(pt.amount) as total_points
    FROM points_transactions pt
    WHERE 
      -- Filter by period
      CASE 
        WHEN p_type = 'all_time' THEN TRUE
        WHEN p_type = 'weekly' THEN 
          EXTRACT(WEEK FROM pt.created_at) = p_week 
          AND EXTRACT(YEAR FROM pt.created_at) = p_year
        WHEN p_type = 'monthly' THEN 
          EXTRACT(MONTH FROM pt.created_at) = p_month 
          AND EXTRACT(YEAR FROM pt.created_at) = p_year
        ELSE FALSE
      END
      -- Filter by source type (optional)
      AND (p_source_types IS NULL OR pt.source_type = ANY(p_source_types))
      -- Only count positive gains
      AND pt.amount > 0
    GROUP BY pt.user_id
  )
  SELECT 
    u.id,
    u.username,
    u.avatar_url,
    COALESCE(ft.total_points, 0) as points,
    ROW_NUMBER() OVER (ORDER BY COALESCE(ft.total_points, 0) DESC) as rank
  FROM users u
  LEFT JOIN filtered_transactions ft ON u.id = ft.user_id
  WHERE ft.total_points > 0
  ORDER BY points DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_leaderboard IS 'Calculates leaderboard rankings for a given period and optional filters';

-- ============================================================
-- 5. CREATE FUNCTION: get_user_rank
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_rank(
  p_user_id UUID,
  p_type TEXT,
  p_week INTEGER DEFAULT NULL,
  p_month INTEGER DEFAULT NULL,
  p_year INTEGER DEFAULT NULL,
  p_source_types TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  points BIGINT,
  rank BIGINT,
  total_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH filtered_transactions AS (
    SELECT 
      pt.user_id,
      SUM(pt.amount) as total_points
    FROM points_transactions pt
    WHERE 
      -- Filter by period
      CASE 
        WHEN p_type = 'all_time' THEN TRUE
        WHEN p_type = 'weekly' THEN 
          EXTRACT(WEEK FROM pt.created_at) = p_week 
          AND EXTRACT(YEAR FROM pt.created_at) = p_year
        WHEN p_type = 'monthly' THEN 
          EXTRACT(MONTH FROM pt.created_at) = p_month 
          AND EXTRACT(YEAR FROM pt.created_at) = p_year
        ELSE FALSE
      END
      AND (p_source_types IS NULL OR pt.source_type = ANY(p_source_types))
      AND pt.amount > 0
    GROUP BY pt.user_id
  ),
  ranked_users AS (
    SELECT 
      u.id,
      u.username,
      u.avatar_url,
      COALESCE(ft.total_points, 0) as points,
      ROW_NUMBER() OVER (ORDER BY COALESCE(ft.total_points, 0) DESC) as rank
    FROM users u
    LEFT JOIN filtered_transactions ft ON u.id = ft.user_id
    WHERE ft.total_points > 0
  )
  SELECT 
    ru.id,
    ru.username,
    ru.avatar_url,
    ru.points,
    ru.rank,
    (SELECT COUNT(*) FROM ranked_users) as total_users
  FROM ranked_users ru
  WHERE ru.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_rank IS 'Gets a specific user rank and stats for a given period';

-- ============================================================
-- 6. RLS POLICIES FOR points_transactions
-- ============================================================

ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view transactions (transparency)
CREATE POLICY "Transactions are viewable by everyone"
ON points_transactions FOR SELECT
TO authenticated
USING (true);

-- Only system can insert transactions (via record_points_transaction function)
-- No INSERT/UPDATE/DELETE policies = only service_role can modify directly

-- ============================================================
-- 7. DROP OLD TRIGGER (if exists)
-- ============================================================

DROP TRIGGER IF EXISTS update_leaderboard_on_points_change ON users;
DROP FUNCTION IF EXISTS refresh_leaderboards();

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================

-- Next steps:
-- 1. Run the data migration script (LEADERBOARD_DATA_MIGRATION.sql)
-- 2. Update application code to use record_points_transaction
-- 3. Test leaderboard calculations

