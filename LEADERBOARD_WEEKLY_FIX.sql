-- ============================================================
-- FIX FOR WEEKLY LEADERBOARD FILTERING
-- ============================================================
-- This migration fixes the weekly leaderboard filtering to use
-- precise date ranges instead of EXTRACT(WEEK) which can cause
-- inconsistencies between client and server calculations.

-- ============================================================
-- 1. UPDATE get_leaderboard FUNCTION
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
DECLARE
  v_start_date TIMESTAMPTZ;
  v_end_date TIMESTAMPTZ;
BEGIN
  -- Calculate precise date ranges based on type
  CASE 
    WHEN p_type = 'weekly' THEN
      -- Calculate week start (Monday 00:00:00 UTC) and end (Sunday 23:59:59.999 UTC)
      v_start_date := (
        SELECT date_trunc('week', make_date(p_year, 1, 1) + (p_week - 1) * interval '7 days')::timestamptz
      );
      v_end_date := v_start_date + interval '6 days 23 hours 59 minutes 59.999 seconds';
      
    WHEN p_type = 'monthly' THEN
      -- Calculate month start and end
      v_start_date := make_date(p_year, p_month, 1)::timestamptz;
      v_end_date := (make_date(p_year, p_month, 1) + interval '1 month' - interval '1 day' + interval '23:59:59.999')::timestamptz;
      
    WHEN p_type = 'all_time' THEN
      -- All time: from beginning to now
      v_start_date := '2024-01-01 00:00:00 UTC'::timestamptz;
      v_end_date := NOW();
      
    ELSE
      -- Invalid type
      RETURN;
  END CASE;

  RETURN QUERY
  WITH filtered_transactions AS (
    SELECT 
      pt.user_id,
      SUM(pt.amount) as total_points
    FROM points_transactions pt
    WHERE 
      -- Filter by precise date range
      pt.created_at >= v_start_date 
      AND pt.created_at <= v_end_date
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

COMMENT ON FUNCTION get_leaderboard IS 'Calculates leaderboard rankings with precise date filtering (fixed weekly calculation)';

-- ============================================================
-- 2. UPDATE get_user_rank FUNCTION
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
DECLARE
  v_start_date TIMESTAMPTZ;
  v_end_date TIMESTAMPTZ;
BEGIN
  -- Calculate precise date ranges based on type
  CASE 
    WHEN p_type = 'weekly' THEN
      -- Calculate week start (Monday 00:00:00 UTC) and end (Sunday 23:59:59.999 UTC)
      v_start_date := (
        SELECT date_trunc('week', make_date(p_year, 1, 1) + (p_week - 1) * interval '7 days')::timestamptz
      );
      v_end_date := v_start_date + interval '6 days 23 hours 59 minutes 59.999 seconds';
      
    WHEN p_type = 'monthly' THEN
      -- Calculate month start and end
      v_start_date := make_date(p_year, p_month, 1)::timestamptz;
      v_end_date := (make_date(p_year, p_month, 1) + interval '1 month' - interval '1 day' + interval '23:59:59.999')::timestamptz;
      
    WHEN p_type = 'all_time' THEN
      -- All time: from beginning to now
      v_start_date := '2024-01-01 00:00:00 UTC'::timestamptz;
      v_end_date := NOW();
      
    ELSE
      -- Invalid type
      RETURN;
  END CASE;

  RETURN QUERY
  WITH filtered_transactions AS (
    SELECT 
      pt.user_id,
      SUM(pt.amount) as total_points
    FROM points_transactions pt
    WHERE 
      -- Filter by precise date range
      pt.created_at >= v_start_date 
      AND pt.created_at <= v_end_date
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

COMMENT ON FUNCTION get_user_rank IS 'Gets user rank with precise date filtering (fixed weekly calculation)';

-- ============================================================
-- 3. CREATE HELPER FUNCTION FOR WEEK CALCULATION
-- ============================================================

CREATE OR REPLACE FUNCTION get_week_date_range(
  p_week INTEGER,
  p_year INTEGER
)
RETURNS TABLE (
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
) AS $$
BEGIN
  -- Calculate the first Monday of the year
  DECLARE
    v_jan1 DATE := make_date(p_year, 1, 1);
    v_jan1_dow INTEGER := EXTRACT(DOW FROM v_jan1);
    v_first_monday DATE;
  BEGIN
    -- Calculate first Monday of the year
    IF v_jan1_dow = 0 THEN -- Sunday
      v_first_monday := v_jan1 + interval '1 day';
    ELSE
      v_first_monday := v_jan1 + interval '1 day' * (8 - v_jan1_dow);
    END IF;
    
    -- Calculate week start and end
    start_date := (v_first_monday + interval '1 day' * (p_week - 1) * 7)::timestamptz;
    end_date := start_date + interval '6 days 23 hours 59 minutes 59.999 seconds';
    
    RETURN NEXT;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_week_date_range IS 'Helper function to calculate precise week date ranges (Monday to Sunday UTC)';

-- ============================================================
-- 4. TEST THE FIX
-- ============================================================

-- Test current week calculation
-- SELECT * FROM get_week_date_range(42, 2025);

-- Test leaderboard with current week
-- SELECT * FROM get_leaderboard('weekly', 42, NULL, 2025, 10);

-- Test user rank with current week  
-- SELECT * FROM get_user_rank('your-user-id-here', 'weekly', 42, NULL, 2025);

