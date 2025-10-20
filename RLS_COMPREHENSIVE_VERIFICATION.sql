-- ============================================================
-- RLS COMPREHENSIVE VERIFICATION SCRIPT
-- Vérifie que toutes les tables ont des politiques RLS appropriées
-- et que les utilisateurs ne peuvent accéder qu'à leurs propres données
-- ============================================================

-- 1. VÉRIFIER QUE RLS EST ACTIVÉ SUR TOUTES LES TABLES
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS ENABLED'
        ELSE '❌ RLS DISABLED'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. VÉRIFIER LA FONCTION get_current_user_id()
SELECT 
    routine_name,
    routine_type,
    data_type as return_type,
    CASE 
        WHEN routine_name = 'get_current_user_id' THEN '✅ FUNCTION EXISTS'
        ELSE '❌ FUNCTION MISSING'
    END as status
FROM information_schema.routines 
WHERE routine_name = 'get_current_user_id'
AND routine_schema = 'public';

-- 3. VÉRIFIER TOUTES LES POLITIQUES RLS PAR TABLE
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN cmd = 'SELECT' AND qual LIKE '%auth.uid()%' THEN '✅ USER ISOLATION'
        WHEN cmd = 'SELECT' AND qual = 'true' THEN '⚠️ PUBLIC ACCESS'
        WHEN cmd = 'INSERT' AND with_check LIKE '%auth.uid()%' THEN '✅ USER ISOLATION'
        WHEN cmd = 'UPDATE' AND qual LIKE '%auth.uid()%' THEN '✅ USER ISOLATION'
        WHEN cmd = 'DELETE' AND qual LIKE '%auth.uid()%' THEN '✅ USER ISOLATION'
        ELSE '❓ NEEDS REVIEW'
    END as security_level
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- 4. VÉRIFIER LES TABLES SANS POLITIQUES RLS
SELECT 
    t.tablename,
    COUNT(p.policyname) as policy_count,
    CASE 
        WHEN COUNT(p.policyname) = 0 THEN '❌ NO POLICIES'
        WHEN COUNT(p.policyname) < 4 THEN '⚠️ INCOMPLETE POLICIES'
        ELSE '✅ POLICIES COMPLETE'
    END as policy_status
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND p.schemaname = 'public'
WHERE t.schemaname = 'public'
GROUP BY t.tablename
ORDER BY policy_count, t.tablename;

-- 5. VÉRIFIER LES POLITIQUES ADMIN
SELECT 
    tablename,
    policyname,
    qual,
    CASE 
        WHEN qual LIKE '%role%admin%' THEN '✅ ADMIN CHECK'
        ELSE '❌ NO ADMIN CHECK'
    END as admin_security
FROM pg_policies 
WHERE schemaname = 'public'
AND policyname LIKE '%admin%'
ORDER BY tablename, policyname;

-- 6. VÉRIFIER LES PERMISSIONS SUR LA FONCTION get_current_user_id
SELECT 
    routine_name,
    grantee,
    privilege_type,
    CASE 
        WHEN grantee = 'authenticated' AND privilege_type = 'EXECUTE' THEN '✅ AUTHENTICATED CAN EXECUTE'
        WHEN grantee = 'anon' AND privilege_type = 'EXECUTE' THEN '✅ ANON CAN EXECUTE'
        ELSE '❓ NEEDS REVIEW'
    END as permission_status
FROM information_schema.routine_privileges 
WHERE routine_name = 'get_current_user_id'
AND routine_schema = 'public';

-- 7. RÉSUMÉ DE SÉCURITÉ PAR TABLE
WITH table_security AS (
    SELECT 
        t.tablename,
        t.rowsecurity as rls_enabled,
        COUNT(p.policyname) as policy_count,
        COUNT(CASE WHEN p.cmd = 'SELECT' THEN 1 END) as select_policies,
        COUNT(CASE WHEN p.cmd = 'INSERT' THEN 1 END) as insert_policies,
        COUNT(CASE WHEN p.cmd = 'UPDATE' THEN 1 END) as update_policies,
        COUNT(CASE WHEN p.cmd = 'DELETE' THEN 1 END) as delete_policies,
        COUNT(CASE WHEN p.qual LIKE '%auth.uid()%' OR p.with_check LIKE '%auth.uid()%' THEN 1 END) as user_isolated_policies
    FROM pg_tables t
    LEFT JOIN pg_policies p ON t.tablename = p.tablename AND p.schemaname = 'public'
    WHERE t.schemaname = 'public'
    GROUP BY t.tablename, t.rowsecurity
)
SELECT 
    tablename,
    CASE WHEN rls_enabled THEN '✅' ELSE '❌' END as rls_status,
    policy_count,
    CASE 
        WHEN policy_count = 0 THEN '❌ NO POLICIES'
        WHEN policy_count < 4 THEN '⚠️ INCOMPLETE'
        ELSE '✅ COMPLETE'
    END as policy_completeness,
    user_isolated_policies,
    CASE 
        WHEN user_isolated_policies > 0 THEN '✅ USER ISOLATION'
        ELSE '❌ NO USER ISOLATION'
    END as isolation_status
FROM table_security
ORDER BY 
    CASE WHEN rls_enabled THEN 0 ELSE 1 END,
    policy_count DESC;

-- 8. VÉRIFIER LES TABLES CRITIQUES POUR L'ISOLATION UTILISATEUR
SELECT 
    'war_game_teams' as table_name,
    COUNT(*) as policies,
    COUNT(CASE WHEN qual LIKE '%user_id%' OR with_check LIKE '%user_id%' THEN 1 END) as user_id_policies,
    CASE 
        WHEN COUNT(CASE WHEN qual LIKE '%user_id%' OR with_check LIKE '%user_id%' THEN 1 END) > 0 
        THEN '✅ USER ISOLATION'
        ELSE '❌ NO USER ISOLATION'
    END as status
FROM pg_policies 
WHERE tablename = 'war_game_teams' AND schemaname = 'public'

UNION ALL

SELECT 
    'user_predictions' as table_name,
    COUNT(*) as policies,
    COUNT(CASE WHEN qual LIKE '%user_id%' OR with_check LIKE '%user_id%' THEN 1 END) as user_id_policies,
    CASE 
        WHEN COUNT(CASE WHEN qual LIKE '%user_id%' OR with_check LIKE '%user_id%' THEN 1 END) > 0 
        THEN '✅ USER ISOLATION'
        ELSE '❌ NO USER ISOLATION'
    END as status
FROM pg_policies 
WHERE tablename = 'user_predictions' AND schemaname = 'public'

UNION ALL

SELECT 
    'weekly_streaks' as table_name,
    COUNT(*) as policies,
    COUNT(CASE WHEN qual LIKE '%user_id%' OR with_check LIKE '%user_id%' THEN 1 END) as user_id_policies,
    CASE 
        WHEN COUNT(CASE WHEN qual LIKE '%user_id%' OR with_check LIKE '%user_id%' THEN 1 END) > 0 
        THEN '✅ USER ISOLATION'
        ELSE '❌ NO USER ISOLATION'
    END as status
FROM pg_policies 
WHERE tablename = 'weekly_streaks' AND schemaname = 'public';

-- 9. TEST DE LA FONCTION get_current_user_id (si connecté)
-- SELECT get_current_user_id() as current_user_id;

-- 10. VÉRIFIER LES CONTRAINTES DE SÉCURITÉ
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    CASE 
        WHEN tc.constraint_type = 'FOREIGN KEY' THEN '✅ FK CONSTRAINT'
        WHEN tc.constraint_type = 'UNIQUE' THEN '✅ UNIQUE CONSTRAINT'
        WHEN tc.constraint_type = 'CHECK' THEN '✅ CHECK CONSTRAINT'
        ELSE '❓ OTHER CONSTRAINT'
    END as constraint_status
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
AND tc.table_name IN ('war_game_teams', 'user_predictions', 'weekly_streaks', 'users')
ORDER BY tc.table_name, tc.constraint_type;

-- ============================================================
-- RÉSULTATS ATTENDUS
-- ============================================================
-- ✅ Toutes les tables doivent avoir RLS activé
-- ✅ Toutes les tables doivent avoir des politiques pour SELECT, INSERT, UPDATE, DELETE
-- ✅ Les politiques doivent utiliser auth.uid() ou get_current_user_id() pour l'isolation
-- ✅ Les politiques admin doivent vérifier users.role = 'admin'
-- ✅ Les tables critiques (war_game_teams, user_predictions, weekly_streaks) doivent avoir une isolation utilisateur
-- ✅ La fonction get_current_user_id() doit exister et être accessible
-- ============================================================

