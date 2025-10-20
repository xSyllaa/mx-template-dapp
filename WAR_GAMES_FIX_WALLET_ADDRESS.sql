-- Fix get_open_war_games function to use wallet_address instead of address
-- This fixes the "column users_1.address does not exist" error

DROP FUNCTION IF EXISTS get_open_war_games();

CREATE OR REPLACE FUNCTION get_open_war_games()
RETURNS TABLE (
  id UUID,
  creator_id UUID,
  creator_username TEXT,
  creator_address TEXT,
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
    u.wallet_address, -- Changed from u.address to u.wallet_address
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_open_war_games() TO authenticated;
GRANT EXECUTE ON FUNCTION get_open_war_games() TO anon;

