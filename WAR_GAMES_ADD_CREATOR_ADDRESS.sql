-- ============================================================
-- WAR GAMES - AJOUT DE L'ADRESSE DU CRÉATEUR
-- ============================================================
-- Ce script met à jour la fonction get_open_war_games pour inclure l'adresse du créateur
-- ============================================================

-- ============================================================
-- ÉTAPE 1: METTRE À JOUR LA FONCTION get_open_war_games
-- ============================================================

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
    u.wallet_address,
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

-- ============================================================
-- ÉTAPE 2: GRANT PERMISSIONS
-- ============================================================

GRANT EXECUTE ON FUNCTION get_open_war_games() TO authenticated;

-- ============================================================
-- VÉRIFICATION
-- ============================================================

-- Tester la fonction
SELECT * FROM get_open_war_games() LIMIT 5;

-- ============================================================
-- MIGRATION TERMINÉE ✅
-- ============================================================
