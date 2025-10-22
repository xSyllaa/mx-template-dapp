-- Add extended_bet_type column to predictions table
-- This allows for more specific bet type categorization beyond the legacy bet_type

-- Add the new column
ALTER TABLE predictions 
ADD COLUMN extended_bet_type TEXT;

-- Add comment for documentation
COMMENT ON COLUMN predictions.extended_bet_type IS 'Extended bet type for more specific categorization (e.g., "1x2", "over-under-goals", "first-goalscorer")';

-- Create index for filtering
CREATE INDEX idx_predictions_extended_bet_type ON predictions(extended_bet_type);

-- Update existing records to have extended_bet_type based on bet_type
UPDATE predictions 
SET extended_bet_type = CASE 
  WHEN bet_type = 'result' THEN '1x2'
  WHEN bet_type = 'over_under' THEN 'over-under-goals'
  WHEN bet_type = 'scorer' THEN 'first-goalscorer'
  WHEN bet_type = 'both_teams_score' THEN 'both-teams-score'
  ELSE bet_type
END
WHERE extended_bet_type IS NULL;

-- Make the column NOT NULL after populating existing data
ALTER TABLE predictions 
ALTER COLUMN extended_bet_type SET NOT NULL;
