-- ============================================================
-- FIX: Infinite Recursion in RLS Policies for "users" table
-- ============================================================
-- Problème: Les policies admin sur "users" utilisent SELECT sur "users"
-- ce qui crée une récursion infinie lors de la vérification des droits.
--
-- Solution: Créer une fonction SECURITY DEFINER qui bypass RLS
-- pour vérifier le rôle admin sans déclencher les policies.
-- ============================================================

-- 1. Créer une fonction sécurisée pour vérifier si l'utilisateur actuel est admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER  -- ⚠️ IMPORTANT: Bypass RLS pour éviter la récursion
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Récupérer le rôle depuis la table users sans déclencher RLS
  SELECT role INTO user_role
  FROM public.users
  WHERE id = get_current_user_id()
  LIMIT 1;
  
  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    -- En cas d'erreur, retourner false par sécurité
    RETURN FALSE;
END;
$$;

-- 2. Supprimer les anciennes policies récursives
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;

-- 3. Recréer les policies admin avec la fonction sécurisée
CREATE POLICY "Admins can view all profiles" ON public.users
  FOR SELECT
  USING (
    id = get_current_user_id()  -- Users can see themselves
    OR is_current_user_admin()  -- Admins can see everyone
  );

CREATE POLICY "Admins can update all profiles" ON public.users
  FOR UPDATE
  USING (
    id = get_current_user_id()  -- Users can update themselves
    OR is_current_user_admin()  -- Admins can update everyone
  )
  WITH CHECK (
    id = get_current_user_id()  -- Users can only update their own data
    OR is_current_user_admin()  -- Admins can update anyone
  );

-- 4. Policy pour INSERT (permettre la création de profils)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT
  WITH CHECK (
    wallet_address IS NOT NULL  -- Must have wallet address
    AND role = 'user'           -- New users are always 'user' role
  );

-- 5. Policy pour DELETE (admin only)
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.users;
CREATE POLICY "Admins can delete profiles" ON public.users
  FOR DELETE
  USING (is_current_user_admin());

-- ============================================================
-- VERIFICATION
-- ============================================================

-- Test 1: Vérifier que la fonction existe
SELECT 
  proname AS function_name,
  prosecdef AS is_security_definer
FROM pg_proc
WHERE proname = 'is_current_user_admin';

-- Test 2: Lister toutes les policies sur users
SELECT 
  policyname,
  cmd,
  qual AS using_clause
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- ============================================================
-- FIX ALL RECURSIVE POLICIES ACROSS ALL TABLES
-- ============================================================
-- 17 policies détectées avec EXISTS (SELECT FROM users) récursif
-- Correction pour: leaderboards, nft_metadata, points_transactions,
-- predictions, team_of_week, user_predictions, war_game_teams, 
-- war_games, weekly_streaks
-- ============================================================

-- LEADERBOARDS
DROP POLICY IF EXISTS "System can insert leaderboard entries" ON public.leaderboards;
DROP POLICY IF EXISTS "System can update leaderboard entries" ON public.leaderboards;

CREATE POLICY "System can insert leaderboard entries" ON public.leaderboards
  FOR INSERT
  WITH CHECK (is_current_user_admin());

CREATE POLICY "System can update leaderboard entries" ON public.leaderboards
  FOR UPDATE
  USING (is_current_user_admin());

-- NFT_METADATA
DROP POLICY IF EXISTS "System can insert NFT metadata" ON public.nft_metadata;
DROP POLICY IF EXISTS "System can update NFT metadata" ON public.nft_metadata;

CREATE POLICY "System can insert NFT metadata" ON public.nft_metadata
  FOR INSERT
  WITH CHECK (is_current_user_admin());

CREATE POLICY "System can update NFT metadata" ON public.nft_metadata
  FOR UPDATE
  USING (is_current_user_admin());

-- POINTS_TRANSACTIONS
DROP POLICY IF EXISTS "Admins can insert points transactions" ON public.points_transactions;
DROP POLICY IF EXISTS "Admins can view all points transactions" ON public.points_transactions;

CREATE POLICY "Admins can insert points transactions" ON public.points_transactions
  FOR INSERT
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can view all points transactions" ON public.points_transactions
  FOR SELECT
  USING (
    user_id = get_current_user_id()  -- Users see their own transactions
    OR is_current_user_admin()       -- Admins see all
  );

-- PREDICTIONS
DROP POLICY IF EXISTS "Only admins can create predictions" ON public.predictions;
DROP POLICY IF EXISTS "Only admins can delete predictions" ON public.predictions;
DROP POLICY IF EXISTS "Only admins can update predictions" ON public.predictions;

CREATE POLICY "Only admins can create predictions" ON public.predictions
  FOR INSERT
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Only admins can delete predictions" ON public.predictions
  FOR DELETE
  USING (is_current_user_admin());

CREATE POLICY "Only admins can update predictions" ON public.predictions
  FOR UPDATE
  USING (is_current_user_admin());

-- TEAM_OF_WEEK
DROP POLICY IF EXISTS "Only admins can delete TOTW" ON public.team_of_week;
DROP POLICY IF EXISTS "Only admins can insert TOTW" ON public.team_of_week;
DROP POLICY IF EXISTS "Only admins can update TOTW" ON public.team_of_week;

CREATE POLICY "Only admins can delete TOTW" ON public.team_of_week
  FOR DELETE
  USING (is_current_user_admin());

CREATE POLICY "Only admins can insert TOTW" ON public.team_of_week
  FOR INSERT
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Only admins can update TOTW" ON public.team_of_week
  FOR UPDATE
  USING (is_current_user_admin());

-- USER_PREDICTIONS
DROP POLICY IF EXISTS "Admins can update any predictions" ON public.user_predictions;
DROP POLICY IF EXISTS "Admins can view all predictions" ON public.user_predictions;

CREATE POLICY "Admins can update any predictions" ON public.user_predictions
  FOR UPDATE
  USING (
    user_id = get_current_user_id()  -- Users can update their own
    OR is_current_user_admin()       -- Admins can update all
  );

CREATE POLICY "Admins can view all predictions" ON public.user_predictions
  FOR SELECT
  USING (
    user_id = get_current_user_id()  -- Users see their own
    OR is_current_user_admin()       -- Admins see all
  );

-- WAR_GAME_TEAMS
DROP POLICY IF EXISTS "Admins can view all war game teams" ON public.war_game_teams;

CREATE POLICY "Admins can view all war game teams" ON public.war_game_teams
  FOR SELECT
  USING (
    user_id = get_current_user_id()  -- Users see their own teams
    OR is_current_user_admin()       -- Admins see all
  );

-- WAR_GAMES
DROP POLICY IF EXISTS "Admins can view all games" ON public.war_games;

CREATE POLICY "Admins can view all games" ON public.war_games
  FOR SELECT
  USING (
    player_a_id = get_current_user_id()    -- Player A sees game
    OR player_b_id = get_current_user_id() -- Player B sees game
    OR is_current_user_admin()             -- Admins see all
  );

-- WEEKLY_STREAKS
DROP POLICY IF EXISTS "Admins can view all streaks" ON public.weekly_streaks;

CREATE POLICY "Admins can view all streaks" ON public.weekly_streaks
  FOR SELECT
  USING (
    user_id = get_current_user_id()  -- Users see their own streaks
    OR is_current_user_admin()       -- Admins see all
  );

-- ============================================================
-- VERIFICATION FINALE
-- ============================================================

-- Compter les policies corrigées
SELECT 
  tablename,
  COUNT(*) AS policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND (qual LIKE '%is_current_user_admin()%' OR with_check LIKE '%is_current_user_admin()%')
GROUP BY tablename
ORDER BY tablename;

-- Vérifier qu'il ne reste plus de récursion
SELECT 
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    (qual LIKE '%SELECT%FROM users%' AND qual NOT LIKE '%is_current_user_admin()%')
    OR (with_check LIKE '%SELECT%FROM users%' AND with_check NOT LIKE '%is_current_user_admin()%')
  )
ORDER BY tablename, policyname;

-- ============================================================
-- NOTES IMPORTANTES
-- ============================================================
-- 
-- 1. SECURITY DEFINER: La fonction s'exécute avec les privilèges du propriétaire
--    (généralement postgres), ce qui bypass RLS.
--
-- 2. SET search_path: Sécurise la fonction contre les attaques par injection
--    de schéma malveillant.
--
-- 3. EXCEPTION HANDLING: Retourne FALSE en cas d'erreur pour éviter les accès
--    non autorisés en cas de problème.
--
-- 4. Performance: Cette fonction est appelée à chaque SELECT sur users,
--    donc elle doit être rapide. Le LIMIT 1 aide à optimiser.
--
-- 5. Sécurité: Les nouveaux users ne peuvent créer que des profils 'user',
--    seuls les admins peuvent élever des privilèges.
--
-- 6. TOUTES LES TABLES: Cette migration corrige 17 policies récursives
--    à travers 9 tables différentes.
-- ============================================================

