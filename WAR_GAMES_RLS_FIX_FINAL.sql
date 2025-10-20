-- WAR_GAMES_RLS_FIX_FINAL.sql
-- Script final pour corriger les politiques RLS avec JWT custom

-- 1. Supprimer TOUTES les politiques existantes (peu importe le nom)
DO $$ 
DECLARE
    policy_name text;
BEGIN
    -- Supprimer toutes les politiques sur war_game_teams
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'war_game_teams' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON war_game_teams', policy_name);
    END LOOP;
END $$;

-- 2. Créer la fonction pour extraire user_id du JWT custom
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

-- 3. Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION get_current_user_id() TO authenticated, anon;

-- 4. Créer les nouvelles politiques avec la fonction custom
CREATE POLICY "Users can view their own teams" ON war_game_teams
  FOR SELECT USING (get_current_user_id() = user_id);

CREATE POLICY "Users can insert their own teams" ON war_game_teams
  FOR INSERT WITH CHECK (get_current_user_id() = user_id);

CREATE POLICY "Users can update their own teams" ON war_game_teams
  FOR UPDATE USING (get_current_user_id() = user_id);

CREATE POLICY "Users can delete their own teams" ON war_game_teams
  FOR DELETE USING (get_current_user_id() = user_id);

-- 5. Vérifier que tout fonctionne
SELECT 'Migration completed successfully!' as status;

-- 6. Tester la fonction (optionnel)
-- SELECT get_current_user_id(); -- Doit retourner NULL si pas connecté


