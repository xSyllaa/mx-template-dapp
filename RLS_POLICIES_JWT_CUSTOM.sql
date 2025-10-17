-- RLS Policies mises à jour pour JWT Custom avec claims personnalisés
-- À exécuter dans Supabase SQL Editor

-- 1. Policy pour voir tous les utilisateurs (authentifiés)
DROP POLICY IF EXISTS "Users can view all users" ON users;
CREATE POLICY "Users can view all users"
ON users FOR SELECT
TO authenticated
USING (true);

-- 2. Policy pour insérer son propre profil
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
TO authenticated
WITH CHECK (
  wallet_address = (auth.jwt() ->> 'wallet_address')
);

-- 3. Policy pour mettre à jour son propre profil
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (
  wallet_address = (auth.jwt() ->> 'wallet_address')
)
WITH CHECK (
  wallet_address = (auth.jwt() ->> 'wallet_address')
);

-- 4. Policy pour les admins (peuvent tout faire)
DROP POLICY IF EXISTS "Admins can do everything" ON users;
CREATE POLICY "Admins can do everything"
ON users FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'role') = 'admin'
)
WITH CHECK (
  (auth.jwt() ->> 'role') = 'admin'
);

-- 5. Policies pour les prédictions
DROP POLICY IF EXISTS "Users can view all predictions" ON predictions;
CREATE POLICY "Users can view all predictions"
ON predictions FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage predictions" ON predictions;
CREATE POLICY "Admins can manage predictions"
ON predictions FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'role') = 'admin'
)
WITH CHECK (
  (auth.jwt() ->> 'role') = 'admin'
);

-- 6. Policies pour les prédictions utilisateur
DROP POLICY IF EXISTS "Users can view own predictions" ON user_predictions;
CREATE POLICY "Users can view own predictions"
ON user_predictions FOR SELECT
TO authenticated
USING (
  user_id = (auth.jwt() ->> 'sub')::uuid
);

DROP POLICY IF EXISTS "Users can insert own predictions" ON user_predictions;
CREATE POLICY "Users can insert own predictions"
ON user_predictions FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (auth.jwt() ->> 'sub')::uuid
);

-- 7. Policies pour les war games
DROP POLICY IF EXISTS "Users can view war games" ON war_games;
CREATE POLICY "Users can view war games"
ON war_games FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can create war games" ON war_games;
CREATE POLICY "Users can create war games"
ON war_games FOR INSERT
TO authenticated
WITH CHECK (
  player_a_id = (auth.jwt() ->> 'sub')::uuid OR
  player_b_id = (auth.jwt() ->> 'sub')::uuid
);

-- 8. Policies pour les leaderboards
DROP POLICY IF EXISTS "Users can view leaderboards" ON leaderboards;
CREATE POLICY "Users can view leaderboards"
ON leaderboards FOR SELECT
TO authenticated
USING (true);

-- 9. Policies pour les streaks
DROP POLICY IF EXISTS "Users can view own streaks" ON weekly_streaks;
CREATE POLICY "Users can view own streaks"
ON weekly_streaks FOR SELECT
TO authenticated
USING (
  user_id = (auth.jwt() ->> 'sub')::uuid
);

DROP POLICY IF EXISTS "Users can update own streaks" ON weekly_streaks;
CREATE POLICY "Users can update own streaks"
ON weekly_streaks FOR UPDATE
TO authenticated
USING (
  user_id = (auth.jwt() ->> 'sub')::uuid
)
WITH CHECK (
  user_id = (auth.jwt() ->> 'sub')::uuid
);

-- 10. Policies pour team of week
DROP POLICY IF EXISTS "Users can view team of week" ON team_of_week;
CREATE POLICY "Users can view team of week"
ON team_of_week FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage team of week" ON team_of_week;
CREATE POLICY "Admins can manage team of week"
ON team_of_week FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'role') = 'admin'
)
WITH CHECK (
  (auth.jwt() ->> 'role') = 'admin'
);

-- 11. Policies pour NFT metadata
DROP POLICY IF EXISTS "Users can view NFT metadata" ON nft_metadata;
CREATE POLICY "Users can view NFT metadata"
ON nft_metadata FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "System can manage NFT metadata" ON nft_metadata;
CREATE POLICY "System can manage NFT metadata"
ON nft_metadata FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'role') = 'admin'
)
WITH CHECK (
  (auth.jwt() ->> 'role') = 'admin'
);
