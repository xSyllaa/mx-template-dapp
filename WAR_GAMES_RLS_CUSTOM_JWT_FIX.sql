-- Fix RLS Policies for Custom JWT Authentication
-- This migration updates the RLS policies to work with custom JWT tokens
-- where the user ID is stored in the 'sub' claim instead of using auth.uid()

-- Drop existing policies (with exact names from your Supabase)
DROP POLICY IF EXISTS "Users can view their own teams" ON war_game_teams;
DROP POLICY IF EXISTS "Users can insert their own teams" ON war_game_teams;
DROP POLICY IF EXISTS "Users can update their own teams" ON war_game_teams;
DROP POLICY IF EXISTS "Users can delete their own teams" ON war_game_teams;

-- Also drop any policies with different naming patterns
DROP POLICY IF EXISTS "Users can view their own teams (custom JWT)" ON war_game_teams;
DROP POLICY IF EXISTS "Users can insert their own teams (custom JWT)" ON war_game_teams;
DROP POLICY IF EXISTS "Users can update their own teams (custom JWT)" ON war_game_teams;
DROP POLICY IF EXISTS "Users can delete their own teams (custom JWT)" ON war_game_teams;

-- Create a function to get the current user ID from custom JWT
-- This function extracts the 'sub' claim from the JWT token
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  -- Try to get user_id from JWT claims (custom JWT has 'sub' as user ID)
  RETURN COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'sub')::uuid,
    auth.uid() -- Fallback to standard Supabase auth if available
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_current_user_id() TO authenticated, anon;

-- Create new RLS policies using the custom function
CREATE POLICY "Users can view their own teams" ON war_game_teams
  FOR SELECT USING (get_current_user_id() = user_id);

CREATE POLICY "Users can insert their own teams" ON war_game_teams
  FOR INSERT WITH CHECK (get_current_user_id() = user_id);

CREATE POLICY "Users can update their own teams" ON war_game_teams
  FOR UPDATE USING (get_current_user_id() = user_id);

CREATE POLICY "Users can delete their own teams" ON war_game_teams
  FOR DELETE USING (get_current_user_id() = user_id);

-- Verify the function works
-- SELECT get_current_user_id(); -- Should return current user's UUID when authenticated

