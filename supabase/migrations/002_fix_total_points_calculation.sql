-- Fix total_points calculation to only include positive gains
-- This ensures leaderboard shows only positive points, not losses

-- Update the record_points_transaction function to only add positive amounts
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
  -- Insert the transaction (including negative amounts for betting history)
  INSERT INTO points_transactions (user_id, amount, source_type, source_id, metadata)
  VALUES (p_user_id, p_amount, p_source_type, p_source_id, p_metadata)
  RETURNING id INTO v_transaction_id;

  -- Update user's total_points cache (only add positive amounts)
  UPDATE users
  SET total_points = total_points + GREATEST(p_amount, 0)
  WHERE id = p_user_id;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recalculate all total_points to fix existing negative values
UPDATE users
SET total_points = COALESCE((
  SELECT SUM(GREATEST(amount, 0))
  FROM points_transactions pt
  WHERE pt.user_id = users.id
), 0);

-- Add a comment explaining the fix
COMMENT ON FUNCTION record_points_transaction IS 'Records points transaction and updates user total_points (only positive gains)';
