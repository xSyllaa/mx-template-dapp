-- Create leaderboard function for getting leaderboard data
-- This function aggregates points from points_transactions table

CREATE OR REPLACE FUNCTION get_leaderboard(
    p_type TEXT DEFAULT 'all_time',
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
    start_date TIMESTAMP WITH TIME ZONE;
    end_date TIMESTAMP WITH TIME ZONE;
    current_year INTEGER := COALESCE(p_year, EXTRACT(YEAR FROM NOW()));
    current_week INTEGER;
    current_month INTEGER;
BEGIN
    -- Calculate date range based on type
    CASE p_type
        WHEN 'weekly' THEN
            -- Calculate start of week (Monday)
            current_week := COALESCE(p_week, EXTRACT(WEEK FROM NOW()));
            start_date := date_trunc('week', make_date(current_year, 1, 1) + (current_week - 1) * INTERVAL '7 days');
            end_date := start_date + INTERVAL '6 days 23:59:59';

        WHEN 'monthly' THEN
            -- Calculate start and end of month
            current_month := COALESCE(p_month, EXTRACT(MONTH FROM NOW()));
            start_date := date_trunc('month', make_date(current_year, current_month, 1));
            end_date := (date_trunc('month', start_date) + INTERVAL '1 month') - INTERVAL '1 second';

        ELSE -- 'all_time' or default
            start_date := make_timestamp(2024, 1, 1, 0, 0, 0);
            end_date := NOW();
    END CASE;

    RETURN QUERY
    WITH ranked_users AS (
        SELECT
            pt.user_id,
            u.username,
            u.avatar_url,
            SUM(pt.amount) as total_points,
            ROW_NUMBER() OVER (ORDER BY SUM(pt.amount) DESC) as user_rank
        FROM points_transactions pt
        JOIN users u ON pt.user_id = u.id
        WHERE pt.created_at >= start_date
          AND pt.created_at <= end_date
          AND (p_source_types IS NULL OR pt.source_type = ANY(p_source_types))
          AND pt.amount > 0
        GROUP BY pt.user_id, u.username, u.avatar_url
        HAVING SUM(pt.amount) > 0
        ORDER BY total_points DESC
        LIMIT p_limit
    )
    SELECT
        ru.user_id,
        ru.username,
        ru.avatar_url,
        ru.total_points::BIGINT,
        ru.user_rank::BIGINT
    FROM ranked_users ru
    ORDER BY ru.user_rank;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create get_user_rank function
CREATE OR REPLACE FUNCTION get_user_rank(
    p_user_id UUID,
    p_type TEXT DEFAULT 'all_time',
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
    start_date TIMESTAMP WITH TIME ZONE;
    end_date TIMESTAMP WITH TIME ZONE;
    current_year INTEGER := COALESCE(p_year, EXTRACT(YEAR FROM NOW()));
    current_week INTEGER;
    current_month INTEGER;
    user_points BIGINT;
    user_position BIGINT;
    total_count BIGINT;
BEGIN
    -- Calculate date range based on type (same as get_leaderboard)
    CASE p_type
        WHEN 'weekly' THEN
            current_week := COALESCE(p_week, EXTRACT(WEEK FROM NOW()));
            start_date := date_trunc('week', make_date(current_year, 1, 1) + (current_week - 1) * INTERVAL '7 days');
            end_date := start_date + INTERVAL '6 days 23:59:59';

        WHEN 'monthly' THEN
            current_month := COALESCE(p_month, EXTRACT(MONTH FROM NOW()));
            start_date := date_trunc('month', make_date(current_year, current_month, 1));
            end_date := (date_trunc('month', start_date) + INTERVAL '1 month') - INTERVAL '1 second';

        ELSE -- 'all_time' or default
            start_date := make_timestamp(2024, 1, 1, 0, 0, 0);
            end_date := NOW();
    END CASE;

    -- Get user's total points for the period
    SELECT COALESCE(SUM(pt.amount), 0)
    INTO user_points
    FROM points_transactions pt
    WHERE pt.user_id = p_user_id
      AND pt.created_at >= start_date
      AND pt.created_at <= end_date
      AND (p_source_types IS NULL OR pt.source_type = ANY(p_source_types));

    -- Get user's rank (position in leaderboard)
    SELECT COUNT(*) + 1
    INTO user_position
    FROM (
        SELECT pt2.user_id
        FROM points_transactions pt2
        WHERE pt2.created_at >= start_date
          AND pt2.created_at <= end_date
          AND (p_source_types IS NULL OR pt2.source_type = ANY(p_source_types))
          AND pt2.amount > 0
        GROUP BY pt2.user_id
        HAVING SUM(pt2.amount) > user_points
    ) ranked_users;

    -- Get total number of users in leaderboard
    SELECT COUNT(DISTINCT pt3.user_id)
    INTO total_count
    FROM points_transactions pt3
    WHERE pt3.created_at >= start_date
      AND pt3.created_at <= end_date
      AND (p_source_types IS NULL OR pt3.source_type = ANY(p_source_types))
      AND pt3.amount > 0;

    -- Get user's info
    RETURN QUERY
    SELECT
        u.id,
        u.username,
        u.avatar_url,
        user_points,
        user_position,
        total_count
    FROM users u
    WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
