-- ============================================================
-- DATA MIGRATION SCRIPT
-- Migrate existing points data to points_transactions table
-- ============================================================

-- WARNING: Run this AFTER running LEADERBOARD_MIGRATION.sql
-- This script is IDEMPOTENT - safe to run multiple times

-- ============================================================
-- 1. MIGRATE PREDICTION WINS
-- ============================================================

INSERT INTO points_transactions (user_id, amount, source_type, source_id, metadata, created_at)
SELECT 
  up.user_id,
  up.points_earned,
  'prediction_win'::TEXT,
  up.prediction_id,
  jsonb_build_object(
    'selected_option_id', up.selected_option_id,
    'points_wagered', up.points_wagered
  ),
  up.created_at
FROM user_predictions up
WHERE up.is_correct = TRUE 
  AND up.points_earned > 0
  -- Avoid duplicates if script is run multiple times
  AND NOT EXISTS (
    SELECT 1 FROM points_transactions pt
    WHERE pt.user_id = up.user_id
      AND pt.source_type = 'prediction_win'
      AND pt.source_id = up.prediction_id
  );

-- ============================================================
-- 2. MIGRATE PREDICTION BETS (negative amounts)
-- ============================================================

INSERT INTO points_transactions (user_id, amount, source_type, source_id, metadata, created_at)
SELECT 
  up.user_id,
  -up.points_wagered,
  'prediction_bet'::TEXT,
  up.prediction_id,
  jsonb_build_object(
    'selected_option_id', up.selected_option_id,
    'prediction_status', COALESCE(up.is_correct::TEXT, 'pending')
  ),
  up.created_at
FROM user_predictions up
WHERE up.points_wagered > 0
  AND NOT EXISTS (
    SELECT 1 FROM points_transactions pt
    WHERE pt.user_id = up.user_id
      AND pt.source_type = 'prediction_bet'
      AND pt.source_id = up.prediction_id
  );

-- ============================================================
-- 3. MIGRATE WEEKLY STREAKS
-- ============================================================

INSERT INTO points_transactions (user_id, amount, source_type, source_id, metadata, created_at)
SELECT 
  ws.user_id,
  ws.total_points,
  'streak_claim'::TEXT,
  ws.id,
  jsonb_build_object(
    'week_start', ws.week_start,
    'completed', ws.completed,
    'bonus_tokens', ws.bonus_tokens
  ),
  ws.created_at
FROM weekly_streaks ws
WHERE ws.total_points > 0
  AND NOT EXISTS (
    SELECT 1 FROM points_transactions pt
    WHERE pt.user_id = ws.user_id
      AND pt.source_type = 'streak_claim'
      AND pt.source_id = ws.id
  );

-- ============================================================
-- 4. VERIFY MIGRATION
-- ============================================================

-- Check total points match
DO $$
DECLARE
  v_users_total BIGINT;
  v_transactions_total BIGINT;
  v_diff BIGINT;
BEGIN
  -- Sum from users table
  SELECT SUM(total_points) INTO v_users_total FROM users;
  
  -- Sum from transactions
  SELECT SUM(amount) INTO v_transactions_total FROM points_transactions;
  
  v_diff := ABS(COALESCE(v_users_total, 0) - COALESCE(v_transactions_total, 0));
  
  RAISE NOTICE '=== MIGRATION VERIFICATION ===';
  RAISE NOTICE 'Users total_points: %', v_users_total;
  RAISE NOTICE 'Transactions sum: %', v_transactions_total;
  RAISE NOTICE 'Difference: %', v_diff;
  
  IF v_diff > 100 THEN
    RAISE WARNING 'Large difference detected! Manual review recommended.';
  ELSE
    RAISE NOTICE 'Migration successful! ✓';
  END IF;
END $$;

-- Show transaction count by type
SELECT 
  source_type,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount
FROM points_transactions
GROUP BY source_type
ORDER BY transaction_count DESC;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================

