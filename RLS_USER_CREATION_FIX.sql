-- ============================================================
-- FIX: User Profile Creation - Chicken-and-Egg Problem
-- ============================================================
-- Problème: Le JWT contient un user_id qui n'existe pas encore
-- lors de la première connexion. Les policies RLS doivent
-- permettre la création et la lecture par wallet_address.
-- ============================================================

-- 1. Créer une fonction pour extraire wallet_address du JWT
CREATE OR REPLACE FUNCTION public.get_jwt_wallet_address()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Extraire wallet_address du JWT custom
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'wallet_address',
    NULL
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- 2. Supprimer les anciennes policies sur users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.users;

-- 3. Recréer les policies SELECT avec support wallet_address
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT
  USING (
    id = get_current_user_id()                    -- By user_id (si profil existe)
    OR wallet_address = get_jwt_wallet_address()  -- By wallet (première connexion)
  );

CREATE POLICY "Admins can view all profiles" ON public.users
  FOR SELECT
  USING (is_current_user_admin());

-- 4. Recréer la policy INSERT avec validation wallet_address
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT
  WITH CHECK (
    wallet_address IS NOT NULL                      -- Must have wallet
    AND wallet_address = get_jwt_wallet_address()   -- Must match JWT wallet
    AND role = 'user'                               -- New users are 'user' role
  );

-- 5. Recréer les policies UPDATE
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING (
    id = get_current_user_id()
    OR wallet_address = get_jwt_wallet_address()
  )
  WITH CHECK (
    id = get_current_user_id()
    OR wallet_address = get_jwt_wallet_address()
  );

CREATE POLICY "Admins can update all profiles" ON public.users
  FOR UPDATE
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

-- 6. Recréer la policy DELETE (admin only)
CREATE POLICY "Admins can delete profiles" ON public.users
  FOR DELETE
  USING (is_current_user_admin());

-- ============================================================
-- VERIFICATION
-- ============================================================

-- Test 1: Vérifier la nouvelle fonction
SELECT 
  proname AS function_name,
  prosecdef AS is_security_definer
FROM pg_proc
WHERE proname = 'get_jwt_wallet_address';

-- Test 2: Lister toutes les policies sur users
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN qual LIKE '%get_jwt_wallet_address()%' THEN 'Wallet-aware ✅'
    WHEN qual LIKE '%is_current_user_admin()%' THEN 'Admin-aware ✅'
    ELSE 'Standard'
  END AS policy_type,
  qual AS using_clause
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- ============================================================
-- NOTES IMPORTANTES
-- ============================================================
-- 
-- 1. JWT STRUCTURE: Le JWT custom doit contenir 'wallet_address'
--    Exemple: { "sub": "uuid", "wallet_address": "erd1..." }
--
-- 2. PREMIÈRE CONNEXION:
--    - User n'existe pas dans la table
--    - JWT contient wallet_address
--    - SELECT par wallet_address fonctionne (policy autorise)
--    - INSERT vérifie wallet_address = JWT wallet
--
-- 3. CONNEXIONS SUIVANTES:
--    - User existe déjà
--    - SELECT par id fonctionne
--    - UPDATE par id ou wallet_address fonctionne
--
-- 4. SÉCURITÉ:
--    - INSERT autorisé uniquement si wallet_address match JWT
--    - Empêche création de profils pour d'autres wallets
--    - Role forcé à 'user' pour nouveaux profils
--
-- 5. PERFORMANCE:
--    - get_jwt_wallet_address() est très rapide (lecture JWT seulement)
--    - Pas de query supplémentaire sur la base
-- ============================================================

