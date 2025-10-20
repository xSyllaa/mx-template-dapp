-- War Games Teams Migration
-- Create table for saved teams

CREATE TABLE IF NOT EXISTS war_game_teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_name VARCHAR(100) NOT NULL,
  formation VARCHAR(10) NOT NULL DEFAULT '4-4-2',
  slots JSONB NOT NULL, -- Array of {slotId, nftIdentifier, position}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_war_game_teams_user_id ON war_game_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_war_game_teams_created_at ON war_game_teams(created_at DESC);

-- Enable RLS
ALTER TABLE war_game_teams ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see and modify their own teams
CREATE POLICY "Users can view their own teams" ON war_game_teams
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own teams" ON war_game_teams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own teams" ON war_game_teams
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own teams" ON war_game_teams
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_war_game_teams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_war_game_teams_updated_at
  BEFORE UPDATE ON war_game_teams
  FOR EACH ROW
  EXECUTE FUNCTION update_war_game_teams_updated_at();


