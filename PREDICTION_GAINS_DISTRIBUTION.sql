-- ============================================================
-- PREDICTION GAINS DISTRIBUTION & REFUND SYSTEM
-- GalacticX dApp - Automatic Gains Distribution & Refunds
-- ============================================================

-- ============================================================
-- 1. UPDATE points_transactions source_types
-- ============================================================

-- Drop existing constraint
ALTER TABLE points_transactions 
DROP CONSTRAINT IF EXISTS points_transactions_source_type_check;

-- Add new constraint with prediction_refund
ALTER TABLE points_transactions 
ADD CONSTRAINT points_transactions_source_type_check 
CHECK (source_type IN (
  'prediction_win', 
  'prediction_bet',
  'prediction_refund',  -- NOUVEAU pour remboursements
  'streak_claim', 
  'war_game_win', 
  'totw_bonus', 
  'admin_adjustment'
));

-- ============================================================
-- 2. CREATE distribute_prediction_gains FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION distribute_prediction_gains(
  p_prediction_id UUID,
  p_winning_option_id TEXT
) RETURNS JSONB AS $$
DECLARE
  v_prediction RECORD;
  v_winner RECORD;
  v_total_winners INTEGER := 0;
  v_total_gains INTEGER := 0;
  v_calculated_winnings INTEGER;
  v_winning_option RECORD;
  v_total_pool INTEGER;
  v_winning_option_total INTEGER;
  v_ratio DECIMAL;
BEGIN
  -- Get prediction details
  SELECT * INTO v_prediction 
  FROM predictions WHERE id = p_prediction_id;
  
  IF v_prediction IS NULL THEN
    RAISE EXCEPTION 'Prediction not found';
  END IF;

  -- Find winning option details
  SELECT * INTO v_winning_option
  FROM jsonb_array_elements(v_prediction.options) AS option
  WHERE option->>'id' = p_winning_option_id;

  IF v_winning_option IS NULL THEN
    RAISE EXCEPTION 'Winning option not found in prediction options';
  END IF;

  -- Calculate total pool
  SELECT COALESCE(SUM(points_wagered), 0) INTO v_total_pool
  FROM user_predictions 
  WHERE prediction_id = p_prediction_id;

  -- Calculate winning option total
  SELECT COALESCE(SUM(points_wagered), 0) INTO v_winning_option_total
  FROM user_predictions 
  WHERE prediction_id = p_prediction_id 
  AND selected_option_id = p_winning_option_id;

  -- Calculate and distribute gains for each winner
  FOR v_winner IN 
    SELECT * FROM user_predictions 
    WHERE prediction_id = p_prediction_id 
    AND selected_option_id = p_winning_option_id
  LOOP
    -- Calculate winnings based on calculation type
    IF v_prediction.bet_calculation_type = 'fixed_odds' THEN
      -- Fixed odds: winnings = bet * odds
      v_calculated_winnings := FLOOR(v_winner.points_wagered * (v_winning_option->>'odds')::DECIMAL);
    ELSE
      -- Pool ratio (Twitch-style): winnings = bet * (total_pool / winning_option_total)
      IF v_winning_option_total > 0 THEN
        v_ratio := v_total_pool::DECIMAL / v_winning_option_total::DECIMAL;
        v_calculated_winnings := FLOOR(v_winner.points_wagered * v_ratio);
      ELSE
        v_calculated_winnings := 0;
      END IF;
    END IF;
    
    -- Insert into points_transactions
    INSERT INTO points_transactions (
      user_id, amount, source_type, source_id, metadata
    ) VALUES (
      v_winner.user_id,
      v_calculated_winnings,
      'prediction_win',
      p_prediction_id,
      jsonb_build_object(
        'selected_option_id', v_winner.selected_option_id,
        'points_wagered', v_winner.points_wagered,
        'winning_option_id', p_winning_option_id,
        'calculation_type', v_prediction.bet_calculation_type,
        'odds_used', v_winning_option->>'odds',
        'total_pool', v_total_pool,
        'winning_option_total', v_winning_option_total
      )
    );
    
    v_total_winners := v_total_winners + 1;
    v_total_gains := v_total_gains + v_calculated_winnings;
  END LOOP;
  
  -- Return summary
  RETURN jsonb_build_object(
    'winners_count', v_total_winners,
    'total_distributed', v_total_gains,
    'total_pool', v_total_pool,
    'winning_option_total', v_winning_option_total,
    'calculation_type', v_prediction.bet_calculation_type
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 3. CREATE refund_prediction_bets FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION refund_prediction_bets(
  p_prediction_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_user_pred RECORD;
  v_total_refunded INTEGER := 0;
  v_users_count INTEGER := 0;
BEGIN
  -- Refund all bets for this prediction
  FOR v_user_pred IN 
    SELECT * FROM user_predictions 
    WHERE prediction_id = p_prediction_id
  LOOP
    -- Create refund transaction
    INSERT INTO points_transactions (
      user_id, amount, source_type, source_id, metadata
    ) VALUES (
      v_user_pred.user_id,
      v_user_pred.points_wagered,
      'prediction_refund',
      p_prediction_id,
      jsonb_build_object(
        'selected_option_id', v_user_pred.selected_option_id,
        'original_bet', v_user_pred.points_wagered,
        'reason', 'prediction_deleted',
        'prediction_teams', (
          SELECT jsonb_build_object(
            'home_team', home_team,
            'away_team', away_team,
            'competition', competition
          )
          FROM predictions WHERE id = p_prediction_id
        )
      )
    );
    
    v_total_refunded := v_total_refunded + v_user_pred.points_wagered;
    v_users_count := v_users_count + 1;
  END LOOP;
  
  RETURN jsonb_build_object(
    'users_refunded', v_users_count,
    'total_refunded', v_total_refunded
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 4. COMMENTS AND DOCUMENTATION
-- ============================================================

COMMENT ON FUNCTION distribute_prediction_gains IS 'Distributes winnings to all users who bet on the winning option of a prediction';
COMMENT ON FUNCTION refund_prediction_bets IS 'Refunds all bets for a prediction when it gets deleted';

-- ============================================================
-- INSTRUCTIONS:
-- 1. Open Supabase Dashboard > SQL Editor
-- 2. Copy and paste this entire SQL script
-- 3. Click "Run" to execute
-- 4. Test the functions with existing predictions
-- ============================================================
