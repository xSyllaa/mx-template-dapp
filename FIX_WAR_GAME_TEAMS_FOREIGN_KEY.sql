-- ============================================================
-- FIX: war_game_teams Foreign Key Incorrecte
-- ============================================================
-- Problème: La table war_game_teams référence auth.users(id)
-- au lieu de public.users(id). Cela cause des erreurs 409
-- lors de l'insertion car vous n'utilisez pas auth.users.
--
-- Solution: Supprimer la contrainte incorrecte et la recréer
-- pour pointer vers public.users.
-- ============================================================

-- 1. Afficher la contrainte actuelle (pour vérification)
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.war_game_teams'::regclass
  AND conname LIKE '%fkey%';

-- 2. Supprimer l'ancienne contrainte foreign key
ALTER TABLE public.war_game_teams
DROP CONSTRAINT IF EXISTS war_game_teams_user_id_fkey;

-- 3. Recréer la contrainte pour pointer vers public.users
ALTER TABLE public.war_game_teams
ADD CONSTRAINT war_game_teams_user_id_fkey
FOREIGN KEY (user_id) 
REFERENCES public.users(id)  -- ✅ Corrigé : public.users au lieu de auth.users
ON DELETE CASCADE;

-- ============================================================
-- VERIFICATION
-- ============================================================

-- Test 1: Vérifier la nouvelle contrainte
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.war_game_teams'::regclass
  AND conname LIKE '%fkey%';

-- Test 2: Tester un INSERT (simulation - ne sera pas exécuté)
-- Devrait maintenant fonctionner si l'user existe dans public.users

-- ============================================================
-- NOTES IMPORTANTES
-- ============================================================
/*
1. CETTE CORRECTION EST CRITIQUE
   - war_game_teams ne peut pas fonctionner avec auth.users
   - Votre système utilise uniquement public.users
   - Sans cette correction, tous les INSERTs échoueront avec 409

2. ORDRE D'EXÉCUTION
   - Exécutez D'ABORD RESET_RLS_FROM_SCRATCH.sql (nettoie policies)
   - Exécutez ENSUITE FIX_WAR_GAME_TEAMS_FOREIGN_KEY.sql (corrige FK)

3. DONNÉES EXISTANTES
   - Si vous avez des données dans war_game_teams, elles seront conservées
   - La contrainte ne s'applique que pour les futurs INSERTs

4. CASCADE DELETE
   - ON DELETE CASCADE signifie que si un user est supprimé de public.users,
     toutes ses teams dans war_game_teams seront aussi supprimées
*/

-- ============================================================
-- RÉSULTAT ATTENDU
-- ============================================================
/*
constraint_name              | constraint_definition
-----------------------------+-------------------------------------------------------
war_game_teams_user_id_fkey  | FOREIGN KEY (user_id) REFERENCES public.users(id)
                             | ON DELETE CASCADE
*/

