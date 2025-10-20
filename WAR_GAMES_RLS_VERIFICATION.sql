-- WAR_GAMES_RLS_VERIFICATION.sql
-- Script pour vérifier que la migration RLS a bien fonctionné

-- 1. Vérifier que la fonction existe
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_name = 'get_current_user_id'
AND routine_schema = 'public';

-- 2. Vérifier les politiques RLS
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
WHERE tablename = 'war_game_teams' 
AND schemaname = 'public'
ORDER BY policyname;

-- 3. Vérifier que RLS est activé sur la table
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'war_game_teams' 
AND schemaname = 'public';

-- 4. Tester la fonction (si connecté)
-- SELECT get_current_user_id() as current_user_id;

-- 5. Vérifier les permissions sur la fonction
SELECT 
    routine_name,
    grantee,
    privilege_type
FROM information_schema.routine_privileges 
WHERE routine_name = 'get_current_user_id'
AND routine_schema = 'public';


