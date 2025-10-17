-- ============================================================
-- GalacticX Betting System Migration v2.0
-- Run this SQL in Supabase SQL Editor
-- ============================================================

-- IMPORTANT: Si vous avez déjà exécuté une partie de cette migration,
-- les clauses "IF NOT EXISTS" éviteront les erreurs de doublons.

-- 1. Add columns to predictions table
ALTER TABLE predictions 
ADD COLUMN IF NOT EXISTS min_bet_points INTEGER NOT NULL DEFAULT 10;

ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS max_bet_points INTEGER NOT NULL DEFAULT 1000;

ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS bet_calculation_type TEXT NOT NULL DEFAULT 'pool_ratio' CHECK (bet_calculation_type IN ('fixed_odds', 'pool_ratio'));

-- 2. Add column to user_predictions table
ALTER TABLE user_predictions 
ADD COLUMN IF NOT EXISTS points_wagered INTEGER NOT NULL DEFAULT 0;

-- 3. Create index for stats query optimization
CREATE INDEX IF NOT EXISTS idx_user_predictions_option 
ON user_predictions(prediction_id, selected_option_id);

-- 4. Add check constraint for points_wagered
ALTER TABLE user_predictions 
DROP CONSTRAINT IF EXISTS check_points_wagered_positive;

ALTER TABLE user_predictions 
ADD CONSTRAINT check_points_wagered_positive CHECK (points_wagered >= 0);

-- 5. Add comments for documentation
COMMENT ON COLUMN predictions.min_bet_points IS 'Minimum points that can be wagered on this prediction';
COMMENT ON COLUMN predictions.max_bet_points IS 'Maximum points that can be wagered on this prediction';
COMMENT ON COLUMN predictions.bet_calculation_type IS 'Calculation method: fixed_odds (bet * odds) or pool_ratio (bet * total_pool/winning_pool)';
COMMENT ON COLUMN user_predictions.points_wagered IS 'Amount of points the user wagered on their selected option';

-- ============================================================
-- INSTRUCTIONS:
-- 1. Open Supabase Dashboard > SQL Editor
-- 2. Copy and paste this entire SQL script
-- 3. Click "Run" to execute
-- 4. Verify the changes by checking the table structures
--
-- Note: Si vous avez déjà exécuté une partie de cette migration,
-- vous pouvez exécuter uniquement la section manquante (bet_calculation_type)
-- ============================================================

-- ============================================================
-- MIGRATION PARTIELLE (si déjà exécuté la première partie)
-- Copiez uniquement ces lignes si vous avez déjà ajouté min/max_bet_points:
-- ============================================================
-- ALTER TABLE predictions
-- ADD COLUMN IF NOT EXISTS bet_calculation_type TEXT NOT NULL DEFAULT 'pool_ratio' 
-- CHECK (bet_calculation_type IN ('fixed_odds', 'pool_ratio'));
-- 
-- COMMENT ON COLUMN predictions.bet_calculation_type IS 'Calculation method: fixed_odds (bet * odds) or pool_ratio (bet * total_pool/winning_pool)';
-- ============================================================

