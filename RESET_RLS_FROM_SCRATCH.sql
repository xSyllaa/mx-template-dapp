-- ============================================================
-- RESET COMPLET DES RLS POLICIES - REPARTIR DE ZÉRO
-- ============================================================
-- Ce script supprime TOUTES les policies RLS et les recrée
-- avec une architecture simple et fonctionnelle.
--
-- POURQUOI CE RESET ?
-- - Multiples corrections successives ont créé des conflits
-- - Architecture trop complexe avec récursions
-- - Besoin d'une base propre et maintenable
-- ============================================================

-- ============================================================
-- ÉTAPE 1 : DÉSACTIVER TEMPORAIREMENT RLS (pour nettoyage)
-- ============================================================
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_predictions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_streaks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.war_games DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.war_game_teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_metadata DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_of_week DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- ÉTAPE 2 : SUPPRIMER TOUTES LES POLICIES EXISTANTES
-- ============================================================

-- Users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.users;

-- Predictions
DROP POLICY IF EXISTS "Anyone can view active predictions" ON public.predictions;
DROP POLICY IF EXISTS "Only admins can create predictions" ON public.predictions;
DROP POLICY IF EXISTS "Only admins can update predictions" ON public.predictions;
DROP POLICY IF EXISTS "Only admins can delete predictions" ON public.predictions;

-- User Predictions
DROP POLICY IF EXISTS "Users can view own predictions" ON public.user_predictions;
DROP POLICY IF EXISTS "Admins can view all predictions" ON public.user_predictions;
DROP POLICY IF EXISTS "Users can create own predictions" ON public.user_predictions;
DROP POLICY IF EXISTS "Users can update own predictions" ON public.user_predictions;
DROP POLICY IF EXISTS "Admins can update any predictions" ON public.user_predictions;

-- Weekly Streaks
DROP POLICY IF EXISTS "Users can view own streaks" ON public.weekly_streaks;
DROP POLICY IF EXISTS "Admins can view all streaks" ON public.weekly_streaks;
DROP POLICY IF EXISTS "Users can insert own streaks" ON public.weekly_streaks;
DROP POLICY IF EXISTS "Users can update own streaks" ON public.weekly_streaks;

-- War Games
DROP POLICY IF EXISTS "Players can view their games" ON public.war_games;
DROP POLICY IF EXISTS "Admins can view all games" ON public.war_games;
DROP POLICY IF EXISTS "Users can create games" ON public.war_games;
DROP POLICY IF EXISTS "Players can update their games" ON public.war_games;

-- War Game Teams
DROP POLICY IF EXISTS "Users can view own teams" ON public.war_game_teams;
DROP POLICY IF EXISTS "Admins can view all war game teams" ON public.war_game_teams;
DROP POLICY IF EXISTS "Users can create own teams" ON public.war_game_teams;
DROP POLICY IF EXISTS "Users can update own teams" ON public.war_game_teams;
DROP POLICY IF EXISTS "Users can delete own teams" ON public.war_game_teams;

-- Leaderboards
DROP POLICY IF EXISTS "Everyone can view leaderboards" ON public.leaderboards;
DROP POLICY IF EXISTS "System can insert leaderboard entries" ON public.leaderboards;
DROP POLICY IF EXISTS "System can update leaderboard entries" ON public.leaderboards;

-- Points Transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.points_transactions;
DROP POLICY IF EXISTS "Admins can view all points transactions" ON public.points_transactions;
DROP POLICY IF EXISTS "System can insert transactions" ON public.points_transactions;
DROP POLICY IF EXISTS "Admins can insert points transactions" ON public.points_transactions;

-- NFT Metadata
DROP POLICY IF EXISTS "Everyone can view NFT metadata" ON public.nft_metadata;
DROP POLICY IF EXISTS "System can insert NFT metadata" ON public.nft_metadata;
DROP POLICY IF EXISTS "System can update NFT metadata" ON public.nft_metadata;

-- Team of Week
DROP POLICY IF EXISTS "Everyone can view TOTW" ON public.team_of_week;
DROP POLICY IF EXISTS "Only admins can insert TOTW" ON public.team_of_week;
DROP POLICY IF EXISTS "Only admins can update TOTW" ON public.team_of_week;
DROP POLICY IF EXISTS "Only admins can delete TOTW" ON public.team_of_week;

-- ============================================================
-- ÉTAPE 3 : CRÉER/RECRÉER LES FONCTIONS HELPER
-- ============================================================

-- Fonction pour récupérer user_id du JWT (déjà existe normalement)
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'sub')::uuid,
    NULL
  );
END;
$$;

-- Fonction pour récupérer wallet_address du JWT
CREATE OR REPLACE FUNCTION public.get_jwt_wallet_address()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'wallet_address',
    NULL
  );
END;
$$;

-- Fonction pour vérifier si user est admin (SANS RÉCURSION)
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.users
  WHERE id = get_current_user_id()
  LIMIT 1;
  
  RETURN COALESCE(user_role = 'admin', false);
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- ============================================================
-- ÉTAPE 4 : RECRÉER LES POLICIES - ARCHITECTURE SIMPLE
-- ============================================================

-- ============================================
-- TABLE: USERS
-- ============================================

CREATE POLICY "users_select_own_or_admin"
ON public.users FOR SELECT
USING (
  id = get_current_user_id()
  OR wallet_address = get_jwt_wallet_address()
  OR is_current_user_admin()
);

CREATE POLICY "users_insert_own"
ON public.users FOR INSERT
WITH CHECK (
  wallet_address = get_jwt_wallet_address()
  AND role = 'user'
);

CREATE POLICY "users_update_own_or_admin"
ON public.users FOR UPDATE
USING (
  id = get_current_user_id()
  OR is_current_user_admin()
);

CREATE POLICY "users_delete_admin_only"
ON public.users FOR DELETE
USING (is_current_user_admin());

-- ============================================
-- TABLE: PREDICTIONS
-- ============================================

CREATE POLICY "predictions_select_all"
ON public.predictions FOR SELECT
USING (true);  -- Tout le monde peut voir les predictions

CREATE POLICY "predictions_insert_admin_only"
ON public.predictions FOR INSERT
WITH CHECK (is_current_user_admin());

CREATE POLICY "predictions_update_admin_only"
ON public.predictions FOR UPDATE
USING (is_current_user_admin());

CREATE POLICY "predictions_delete_admin_only"
ON public.predictions FOR DELETE
USING (is_current_user_admin());

-- ============================================
-- TABLE: USER_PREDICTIONS
-- ============================================

CREATE POLICY "user_predictions_select_own_or_admin"
ON public.user_predictions FOR SELECT
USING (
  user_id = get_current_user_id()
  OR is_current_user_admin()
);

CREATE POLICY "user_predictions_insert_own"
ON public.user_predictions FOR INSERT
WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "user_predictions_update_admin_only"
ON public.user_predictions FOR UPDATE
USING (is_current_user_admin());

-- ============================================
-- TABLE: WEEKLY_STREAKS
-- ============================================

CREATE POLICY "weekly_streaks_select_own_or_admin"
ON public.weekly_streaks FOR SELECT
USING (
  user_id = get_current_user_id()
  OR is_current_user_admin()
);

CREATE POLICY "weekly_streaks_insert_own"
ON public.weekly_streaks FOR INSERT
WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "weekly_streaks_update_own"
ON public.weekly_streaks FOR UPDATE
USING (user_id = get_current_user_id());

-- ============================================
-- TABLE: WAR_GAMES
-- ============================================

CREATE POLICY "war_games_select_involved_or_admin"
ON public.war_games FOR SELECT
USING (
  player_a_id = get_current_user_id()
  OR player_b_id = get_current_user_id()
  OR is_current_user_admin()
);

CREATE POLICY "war_games_insert_as_player_a"
ON public.war_games FOR INSERT
WITH CHECK (player_a_id = get_current_user_id());

CREATE POLICY "war_games_update_involved_or_admin"
ON public.war_games FOR UPDATE
USING (
  player_a_id = get_current_user_id()
  OR player_b_id = get_current_user_id()
  OR is_current_user_admin()
);

-- ============================================
-- TABLE: WAR_GAME_TEAMS
-- ============================================

CREATE POLICY "war_game_teams_select_own_or_admin"
ON public.war_game_teams FOR SELECT
USING (
  user_id = get_current_user_id()
  OR is_current_user_admin()
);

CREATE POLICY "war_game_teams_insert_own"
ON public.war_game_teams FOR INSERT
WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "war_game_teams_update_own"
ON public.war_game_teams FOR UPDATE
USING (user_id = get_current_user_id());

CREATE POLICY "war_game_teams_delete_own"
ON public.war_game_teams FOR DELETE
USING (user_id = get_current_user_id());

-- ============================================
-- TABLE: LEADERBOARDS (READ-ONLY pour users)
-- ============================================

CREATE POLICY "leaderboards_select_all"
ON public.leaderboards FOR SELECT
USING (true);  -- Tout le monde peut voir

CREATE POLICY "leaderboards_modify_admin_only"
ON public.leaderboards FOR ALL
USING (is_current_user_admin());

-- ============================================
-- TABLE: POINTS_TRANSACTIONS
-- ============================================

CREATE POLICY "points_transactions_select_own_or_admin"
ON public.points_transactions FOR SELECT
USING (
  user_id = get_current_user_id()
  OR is_current_user_admin()
);

CREATE POLICY "points_transactions_insert_system_only"
ON public.points_transactions FOR INSERT
WITH CHECK (is_current_user_admin());  -- Only system/admin can create

-- ============================================
-- TABLE: NFT_METADATA (READ-ONLY)
-- ============================================

CREATE POLICY "nft_metadata_select_all"
ON public.nft_metadata FOR SELECT
USING (true);  -- Tout le monde peut voir les NFTs

CREATE POLICY "nft_metadata_modify_admin_only"
ON public.nft_metadata FOR ALL
USING (is_current_user_admin());

-- ============================================
-- TABLE: TEAM_OF_WEEK (READ-ONLY pour users)
-- ============================================

CREATE POLICY "team_of_week_select_all"
ON public.team_of_week FOR SELECT
USING (true);  -- Tout le monde peut voir

CREATE POLICY "team_of_week_modify_admin_only"
ON public.team_of_week FOR ALL
USING (is_current_user_admin());

-- ============================================================
-- ÉTAPE 5 : RÉACTIVER RLS SUR TOUTES LES TABLES
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.war_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.war_game_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_of_week ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ÉTAPE 6 : VERIFICATION
-- ============================================================

-- Test 1: Compter les policies par table
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Test 2: Vérifier les fonctions helper
SELECT 
  proname as function_name,
  prosecdef as is_security_definer
FROM pg_proc
WHERE proname IN ('get_current_user_id', 'get_jwt_wallet_address', 'is_current_user_admin')
ORDER BY proname;

-- Test 3: Vérifier que RLS est activé
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'predictions', 'user_predictions', 'weekly_streaks',
    'war_games', 'war_game_teams', 'leaderboards', 'points_transactions',
    'nft_metadata', 'team_of_week'
  )
ORDER BY tablename;

-- ============================================================
-- RÉSUMÉ DE L'ARCHITECTURE
-- ============================================================
/*
PRINCIPES DE BASE:

1. LECTURE (SELECT):
   - Users: Propre profil OU par wallet_address OU admin
   - Public data: Tout le monde (predictions, leaderboards, nft_metadata, team_of_week)
   - Owned data: Propriétaire OU admin (user_predictions, weekly_streaks, war_game_teams, etc.)

2. CRÉATION (INSERT):
   - Users: Auto-création via wallet_address
   - Owned data: user_id DOIT égaler current_user_id()
   - Admin data: Admin seulement

3. MODIFICATION (UPDATE):
   - Owned data: Propriétaire seulement
   - Admin data: Admin seulement

4. SUPPRESSION (DELETE):
   - Users: Admin seulement
   - Owned data: Propriétaire OU admin
   - Admin data: Admin seulement

5. SÉCURITÉ:
   - is_current_user_admin() utilise SECURITY DEFINER (pas de récursion)
   - get_jwt_wallet_address() pour permettre SELECT avant création user
   - Toutes les policies sont simples et lisibles
*/

-- ============================================================
-- NOTES IMPORTANTES
-- ============================================================
/*
1. CETTE MIGRATION SUPPRIME TOUT ET REPART DE ZÉRO
   - Pas de rollback facile
   - Testez d'abord sur un environnement de dev si possible

2. LES FONCTIONS HELPER SONT CRITIQUES
   - get_current_user_id(): Extrait user_id du JWT
   - get_jwt_wallet_address(): Extrait wallet_address du JWT
   - is_current_user_admin(): Vérifie role admin SANS récursion

3. ARCHITECTURE SIMPLE = MAINTAINABLE
   - Une policy par opération (SELECT, INSERT, UPDATE, DELETE)
   - Noms explicites (users_select_own_or_admin)
   - Pas de récursion, pas de complexity inutile

4. JWT DOIT CONTENIR:
   {
     "sub": "user-uuid",
     "wallet_address": "erd1...",
     "role": "authenticated",
     "aud": "authenticated"
   }
*/

