-- ============================================================
-- RLS POLICIES STRICTES - GalacticX
-- ⚠️  À exécuter UNIQUEMENT après avoir vérifié que l'authentification fonctionne
-- ============================================================

-- ============================================================
-- TABLE: users
-- ============================================================

-- Supprimer les policies temporaires
DROP POLICY IF EXISTS "Everyone can view" ON users;
DROP POLICY IF EXISTS "Users can insert profiles" ON users;
DROP POLICY IF EXISTS "Users can update profiles" ON users;

-- Policies strictes
CREATE POLICY "Authenticated users can view profiles"
ON users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert own profile"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
ON users FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

COMMENT ON POLICY "Authenticated users can view profiles" ON users IS 
'Tous les utilisateurs authentifiés peuvent voir tous les profils';

COMMENT ON POLICY "Admins can update any profile" ON users IS 
'Les admins peuvent modifier n''importe quel profil';


-- ============================================================
-- TABLE: predictions
-- ============================================================

DROP POLICY IF EXISTS "Everyone can view" ON predictions;
DROP POLICY IF EXISTS "Anyone can create predictions" ON predictions;
DROP POLICY IF EXISTS "Anyone can update predictions" ON predictions;
DROP POLICY IF EXISTS "Anyone can delete predictions" ON predictions;

CREATE POLICY "Authenticated can view predictions"
ON predictions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can create predictions"
ON predictions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Only admins can update predictions"
ON predictions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Only admins can delete predictions"
ON predictions FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);


-- ============================================================
-- TABLE: user_predictions
-- ============================================================

DROP POLICY IF EXISTS "Everyone can view predictions" ON user_predictions;
DROP POLICY IF EXISTS "Everyone can insert predictions" ON user_predictions;

CREATE POLICY "Users can view own predictions"
ON user_predictions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all predictions"
ON user_predictions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Users can insert own predictions"
ON user_predictions FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM predictions
    WHERE predictions.id = prediction_id
    AND predictions.status = 'open'
    AND predictions.close_date > NOW()
  )
);

CREATE POLICY "Admins can update predictions"
ON user_predictions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);


-- ============================================================
-- TABLE: war_games
-- ============================================================

DROP POLICY IF EXISTS "Everyone can view" ON war_games;
DROP POLICY IF EXISTS "Anyone can create war games" ON war_games;

CREATE POLICY "Players can view own games"
ON war_games FOR SELECT
TO authenticated
USING (player_a_id = auth.uid() OR player_b_id = auth.uid());

CREATE POLICY "Anyone can view completed games"
ON war_games FOR SELECT
TO authenticated
USING (status = 'completed');

CREATE POLICY "Admins can view all games"
ON war_games FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Users can create war games"
ON war_games FOR INSERT
TO authenticated
WITH CHECK (
  player_a_id = auth.uid() AND
  player_a_id != player_b_id
);

CREATE POLICY "Players can update own games"
ON war_games FOR UPDATE
TO authenticated
USING (
  (player_a_id = auth.uid() OR player_b_id = auth.uid()) AND
  status IN ('pending', 'active')
);

CREATE POLICY "Admins can update any game"
ON war_games FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Players can cancel own pending games"
ON war_games FOR DELETE
TO authenticated
USING (
  player_a_id = auth.uid() AND
  status = 'pending'
);


-- ============================================================
-- TABLE: weekly_streaks
-- ============================================================

DROP POLICY IF EXISTS "Everyone can view" ON weekly_streaks;
DROP POLICY IF EXISTS "Everyone can manage" ON weekly_streaks;

CREATE POLICY "Users can view own streaks"
ON weekly_streaks FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all streaks"
ON weekly_streaks FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Users can insert own streaks"
ON weekly_streaks FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own streaks"
ON weekly_streaks FOR UPDATE
TO authenticated
USING (user_id = auth.uid());


-- ============================================================
-- TABLE: leaderboards
-- ============================================================

DROP POLICY IF EXISTS "Everyone can view" ON leaderboards;
DROP POLICY IF EXISTS "Everyone can manage" ON leaderboards;

CREATE POLICY "Everyone can view leaderboards"
ON leaderboards FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "System can insert leaderboard entries"
ON leaderboards FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "System can update leaderboard entries"
ON leaderboards FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);


-- ============================================================
-- TABLE: team_of_week
-- ============================================================

DROP POLICY IF EXISTS "Everyone can view" ON team_of_week;
DROP POLICY IF EXISTS "Anyone can manage" ON team_of_week;

CREATE POLICY "Everyone can view team of week"
ON team_of_week FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can create team of week"
ON team_of_week FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Only admins can update team of week"
ON team_of_week FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);


-- ============================================================
-- TABLE: nft_metadata
-- ============================================================

DROP POLICY IF EXISTS "Everyone can view" ON nft_metadata;
DROP POLICY IF EXISTS "Anyone can manage" ON nft_metadata;

CREATE POLICY "Everyone can view NFT metadata"
ON nft_metadata FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "System can upsert NFT metadata"
ON nft_metadata FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "System can update NFT metadata"
ON nft_metadata FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);


-- ============================================================
-- VÉRIFICATION
-- ============================================================

-- Afficher toutes les policies actives
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================
-- RÉSULTAT ATTENDU
-- ============================================================
-- ✅ Toutes les tables doivent avoir des policies avec TO authenticated
-- ✅ Les policies doivent utiliser auth.uid()
-- ✅ Les policies admin doivent vérifier users.role = 'admin'
-- ✅ Plus aucune policy avec USING (true) sans TO authenticated


