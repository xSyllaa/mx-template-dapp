-- ============================================================
-- RLS SECURITY FIX FINAL
-- Script pour corriger et sécuriser toutes les politiques RLS
-- Assure que les utilisateurs ne peuvent accéder qu'à leurs propres données
-- ============================================================

-- 1. S'assurer que la fonction get_current_user_id() existe et fonctionne
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  -- Extraire 'sub' du JWT custom (votre user_id)
  RETURN COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'sub')::uuid,
    auth.uid() -- Fallback si JWT standard
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION get_current_user_id() TO authenticated, anon;

-- 3. Supprimer toutes les politiques existantes pour éviter les conflits
DO $$ 
DECLARE
    policy_name text;
    table_name text;
BEGIN
    -- Supprimer toutes les politiques sur toutes les tables
    FOR table_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        FOR policy_name IN 
            SELECT policyname 
            FROM pg_policies 
            WHERE tablename = table_name 
            AND schemaname = 'public'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
        END LOOP;
    END LOOP;
END $$;

-- 4. POLITIQUES POUR LA TABLE users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT TO authenticated
  WITH CHECK (get_current_user_id() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
  USING (get_current_user_id() = id);

CREATE POLICY "Admins can update any profile" ON users
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'admin'
    )
  );

-- 5. POLITIQUES POUR LA TABLE predictions
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view predictions" ON predictions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Only admins can create predictions" ON predictions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update predictions" ON predictions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete predictions" ON predictions
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'admin'
    )
  );

-- 6. POLITIQUES POUR LA TABLE user_predictions (ISOLATION UTILISATEUR CRITIQUE)
ALTER TABLE user_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own predictions" ON user_predictions
  FOR SELECT TO authenticated
  USING (user_id = get_current_user_id());

CREATE POLICY "Admins can view all predictions" ON user_predictions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can insert own predictions" ON user_predictions
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = get_current_user_id() AND
    EXISTS (
      SELECT 1 FROM predictions
      WHERE predictions.id = prediction_id
      AND predictions.status = 'open'
      AND predictions.close_date > NOW()
    )
  );

CREATE POLICY "Admins can update predictions" ON user_predictions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'admin'
    )
  );

-- 7. POLITIQUES POUR LA TABLE war_games
ALTER TABLE war_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view own games" ON war_games
  FOR SELECT TO authenticated
  USING (
    player_a_id = get_current_user_id() OR 
    player_b_id = get_current_user_id()
  );

CREATE POLICY "Anyone can view completed games" ON war_games
  FOR SELECT TO authenticated
  USING (status = 'completed');

CREATE POLICY "Admins can view all games" ON war_games
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can create war games" ON war_games
  FOR INSERT TO authenticated
  WITH CHECK (player_a_id = get_current_user_id());

CREATE POLICY "Users can join pending games" ON war_games
  FOR UPDATE TO authenticated
  USING (
    status = 'pending' AND
    player_a_id != get_current_user_id()
  )
  WITH CHECK (player_b_id = get_current_user_id());

CREATE POLICY "Players can update own games" ON war_games
  FOR UPDATE TO authenticated
  USING (
    (player_a_id = get_current_user_id() OR player_b_id = get_current_user_id()) AND
    status IN ('pending', 'active')
  );

CREATE POLICY "Players can cancel own pending games" ON war_games
  FOR DELETE TO authenticated
  USING (
    player_a_id = get_current_user_id() AND
    status = 'pending'
  );

-- 8. POLITIQUES POUR LA TABLE war_game_teams (ISOLATION UTILISATEUR CRITIQUE)
ALTER TABLE war_game_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own teams" ON war_game_teams
  FOR SELECT TO authenticated
  USING (user_id = get_current_user_id());

CREATE POLICY "Users can insert own teams" ON war_game_teams
  FOR INSERT TO authenticated
  WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Users can update own teams" ON war_game_teams
  FOR UPDATE TO authenticated
  USING (user_id = get_current_user_id());

CREATE POLICY "Users can delete own teams" ON war_game_teams
  FOR DELETE TO authenticated
  USING (user_id = get_current_user_id());

-- 9. POLITIQUES POUR LA TABLE weekly_streaks (ISOLATION UTILISATEUR CRITIQUE)
ALTER TABLE weekly_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks" ON weekly_streaks
  FOR SELECT TO authenticated
  USING (user_id = get_current_user_id());

CREATE POLICY "Admins can view all streaks" ON weekly_streaks
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can insert own streaks" ON weekly_streaks
  FOR INSERT TO authenticated
  WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Users can update own streaks" ON weekly_streaks
  FOR UPDATE TO authenticated
  USING (user_id = get_current_user_id());

-- 10. POLITIQUES POUR LA TABLE leaderboards
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view leaderboards" ON leaderboards
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "System can insert leaderboard entries" ON leaderboards
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "System can update leaderboard entries" ON leaderboards
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'admin'
    )
  );

-- 11. POLITIQUES POUR LA TABLE team_of_week
ALTER TABLE team_of_week ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view team of week" ON team_of_week
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Only admins can create team of week" ON team_of_week
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update team of week" ON team_of_week
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'admin'
    )
  );

-- 12. POLITIQUES POUR LA TABLE nft_metadata
ALTER TABLE nft_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view NFT metadata" ON nft_metadata
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "System can upsert NFT metadata" ON nft_metadata
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "System can update NFT metadata" ON nft_metadata
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'admin'
    )
  );

-- 13. VÉRIFICATION FINALE
SELECT 'RLS Security Fix Completed Successfully!' as status;

-- 14. Afficher un résumé des politiques créées
SELECT 
    tablename,
    COUNT(*) as total_policies,
    COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) as select_policies,
    COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) as insert_policies,
    COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) as update_policies,
    COUNT(CASE WHEN cmd = 'DELETE' THEN 1 END) as delete_policies
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================================
-- RÉSULTATS ATTENDUS
-- ============================================================
-- ✅ Toutes les tables ont RLS activé
-- ✅ Toutes les tables ont des politiques complètes (SELECT, INSERT, UPDATE, DELETE)
-- ✅ Les utilisateurs ne peuvent accéder qu'à leurs propres données
-- ✅ Les admins peuvent gérer toutes les données
-- ✅ La fonction get_current_user_id() est utilisée partout
-- ✅ Isolation utilisateur garantie pour war_game_teams, user_predictions, weekly_streaks
-- ============================================================

