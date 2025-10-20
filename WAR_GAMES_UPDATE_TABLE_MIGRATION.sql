-- ============================================================
-- WAR GAMES - MIGRATION DE L'ANCIENNE STRUCTURE VERS NOUVELLE
-- ============================================================
-- Ce script met à jour la table war_games existante
-- Transforme player_a/player_b vers creator/opponent
-- ============================================================

-- ============================================================
-- ÉTAPE 1: DÉSACTIVER RLS TEMPORAIREMENT
-- ============================================================
ALTER TABLE public.war_games DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- ÉTAPE 2: SUPPRIMER LES ANCIENNES POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Players can view their games" ON public.war_games;
DROP POLICY IF EXISTS "Admins can view all games" ON public.war_games;
DROP POLICY IF EXISTS "Users can create games" ON public.war_games;
DROP POLICY IF EXISTS "Players can update their games" ON public.war_games;
DROP POLICY IF EXISTS "war_games_select_involved_or_admin" ON public.war_games;
DROP POLICY IF EXISTS "war_games_insert_as_player_a" ON public.war_games;
DROP POLICY IF EXISTS "war_games_update_involved_or_admin" ON public.war_games;
DROP POLICY IF EXISTS "Anyone can view open war games" ON public.war_games;
DROP POLICY IF EXISTS "Users can view their own war games" ON public.war_games;
DROP POLICY IF EXISTS "Users can create war games" ON public.war_games;
DROP POLICY IF EXISTS "Users can join open war games" ON public.war_games;
DROP POLICY IF EXISTS "Creator can cancel open war games" ON public.war_games;
DROP POLICY IF EXISTS "Admins can update war game results" ON public.war_games;

-- ============================================================
-- ÉTAPE 3: RENOMMER LES COLONNES EXISTANTES
-- ============================================================

-- Renommer player_a_id vers creator_id (si elle existe)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'war_games' AND column_name = 'player_a_id'
  ) THEN
    ALTER TABLE public.war_games RENAME COLUMN player_a_id TO creator_id;
  END IF;
END $$;

-- Renommer player_b_id vers opponent_id (si elle existe)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'war_games' AND column_name = 'player_b_id'
  ) THEN
    ALTER TABLE public.war_games RENAME COLUMN player_b_id TO opponent_id;
  END IF;
END $$;

-- Renommer team_a vers creator_team_id (si c'est JSONB, on va le supprimer plus tard)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'war_games' AND column_name = 'team_a' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.war_games RENAME COLUMN team_a TO creator_team_id;
  END IF;
END $$;

-- Renommer team_b vers opponent_team_id (si c'est JSONB, on va le supprimer plus tard)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'war_games' AND column_name = 'team_b' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.war_games RENAME COLUMN team_b TO opponent_team_id;
  END IF;
END $$;

-- ============================================================
-- ÉTAPE 4: SUPPRIMER LES COLONNES JSONB (si elles existent)
-- ============================================================

-- Supprimer team_a si c'est JSONB
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'war_games' AND column_name = 'team_a' AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE public.war_games DROP COLUMN team_a;
  END IF;
END $$;

-- Supprimer team_b si c'est JSONB
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'war_games' AND column_name = 'team_b' AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE public.war_games DROP COLUMN team_b;
  END IF;
END $$;

-- ============================================================
-- ÉTAPE 5: AJOUTER LES NOUVELLES COLONNES (si elles n'existent pas)
-- ============================================================

-- Ajouter creator_team_id (UUID)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'war_games' AND column_name = 'creator_team_id'
  ) THEN
    ALTER TABLE public.war_games ADD COLUMN creator_team_id UUID REFERENCES public.war_game_teams(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ajouter opponent_team_id (UUID)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'war_games' AND column_name = 'opponent_team_id'
  ) THEN
    ALTER TABLE public.war_games ADD COLUMN opponent_team_id UUID REFERENCES public.war_game_teams(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ajouter points_stake
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'war_games' AND column_name = 'points_stake'
  ) THEN
    ALTER TABLE public.war_games ADD COLUMN points_stake INTEGER NOT NULL DEFAULT 100 CHECK (points_stake > 0);
  END IF;
END $$;

-- Ajouter entry_deadline
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'war_games' AND column_name = 'entry_deadline'
  ) THEN
    ALTER TABLE public.war_games ADD COLUMN entry_deadline TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '1 day');
  END IF;
END $$;

-- Ajouter creator_score
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'war_games' AND column_name = 'creator_score'
  ) THEN
    ALTER TABLE public.war_games ADD COLUMN creator_score INTEGER;
  END IF;
END $$;

-- Ajouter opponent_score
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'war_games' AND column_name = 'opponent_score'
  ) THEN
    ALTER TABLE public.war_games ADD COLUMN opponent_score INTEGER;
  END IF;
END $$;

-- Ajouter started_at
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'war_games' AND column_name = 'started_at'
  ) THEN
    ALTER TABLE public.war_games ADD COLUMN started_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Ajouter completed_at
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'war_games' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE public.war_games ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- ============================================================
-- ÉTAPE 6: METTRE À JOUR LA COLONNE STATUS
-- ============================================================

-- Supprimer l'ancienne contrainte CHECK si elle existe
ALTER TABLE public.war_games DROP CONSTRAINT IF EXISTS war_games_status_check;

-- Mettre à jour les statuts existants AVANT d'ajouter la nouvelle contrainte
UPDATE public.war_games 
SET status = CASE 
  WHEN status = 'pending' THEN 'open'
  WHEN status = 'locked' THEN 'in_progress'
  ELSE status
END;

-- Maintenant créer la nouvelle contrainte
ALTER TABLE public.war_games ADD CONSTRAINT war_games_status_check 
  CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled'));

-- ============================================================
-- ÉTAPE 7: METTRE À JOUR LES FOREIGN KEYS
-- ============================================================

-- S'assurer que les FKs pointent vers public.users et non auth.users
ALTER TABLE public.war_games DROP CONSTRAINT IF EXISTS war_games_creator_id_fkey;
ALTER TABLE public.war_games DROP CONSTRAINT IF EXISTS war_games_opponent_id_fkey;
ALTER TABLE public.war_games DROP CONSTRAINT IF EXISTS war_games_winner_id_fkey;
ALTER TABLE public.war_games DROP CONSTRAINT IF EXISTS war_games_player_a_id_fkey;
ALTER TABLE public.war_games DROP CONSTRAINT IF EXISTS war_games_player_b_id_fkey;

ALTER TABLE public.war_games 
  ADD CONSTRAINT war_games_creator_id_fkey 
  FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.war_games 
  ADD CONSTRAINT war_games_opponent_id_fkey 
  FOREIGN KEY (opponent_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.war_games 
  ADD CONSTRAINT war_games_winner_id_fkey 
  FOREIGN KEY (winner_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- ============================================================
-- ÉTAPE 8: CRÉER/METTRE À JOUR LES INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_war_games_creator_id ON public.war_games(creator_id);
CREATE INDEX IF NOT EXISTS idx_war_games_opponent_id ON public.war_games(opponent_id);
CREATE INDEX IF NOT EXISTS idx_war_games_status ON public.war_games(status);
CREATE INDEX IF NOT EXISTS idx_war_games_created_at ON public.war_games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_war_games_entry_deadline ON public.war_games(entry_deadline);
CREATE INDEX IF NOT EXISTS idx_war_games_status_deadline ON public.war_games(status, entry_deadline);

-- ============================================================
-- ÉTAPE 9: CRÉER LA FONCTION get_open_war_games
-- ============================================================

CREATE OR REPLACE FUNCTION get_open_war_games()
RETURNS TABLE (
  id UUID,
  creator_id UUID,
  creator_username TEXT,
  points_stake INTEGER,
  entry_deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wg.id,
    wg.creator_id,
    u.username,
    wg.points_stake,
    wg.entry_deadline,
    wg.created_at
  FROM public.war_games wg
  INNER JOIN public.users u ON u.id = wg.creator_id
  WHERE wg.status = 'open'
    AND wg.opponent_id IS NULL
    AND wg.entry_deadline > NOW()
  ORDER BY wg.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ÉTAPE 10: RÉACTIVER RLS ET CRÉER LES POLICIES
-- ============================================================

ALTER TABLE public.war_games ENABLE ROW LEVEL SECURITY;

-- Policy 1: Everyone can view open war games (to join them)
CREATE POLICY "Anyone can view open war games" ON public.war_games
  FOR SELECT
  USING (status = 'open' AND entry_deadline > NOW());

-- Policy 2: Players can view their own war games (any status)
CREATE POLICY "Users can view their own war games" ON public.war_games
  FOR SELECT
  USING (
    get_current_user_id() = creator_id OR 
    get_current_user_id() = opponent_id
  );

-- Policy 3: Authenticated users can create war games
CREATE POLICY "Users can create war games" ON public.war_games
  FOR INSERT
  WITH CHECK (get_current_user_id() = creator_id);

-- Policy 4: Users can join open war games as opponent
CREATE POLICY "Users can join open war games" ON public.war_games
  FOR UPDATE
  USING (
    status = 'open' AND 
    entry_deadline > NOW() AND
    get_current_user_id() != creator_id AND
    opponent_id IS NULL
  )
  WITH CHECK (
    get_current_user_id() = opponent_id AND
    status = 'in_progress'
  );

-- Policy 5: Creator can cancel open war games with no opponent
CREATE POLICY "Creator can cancel open war games" ON public.war_games
  FOR UPDATE
  USING (
    get_current_user_id() = creator_id AND
    status = 'open' AND
    opponent_id IS NULL
  )
  WITH CHECK (status = 'cancelled');

-- Policy 6: Only admins can update completed war games (for result validation)
CREATE POLICY "Admins can update war game results" ON public.war_games
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = get_current_user_id()
      AND users.role = 'king'
    )
  );

-- ============================================================
-- ÉTAPE 11: CRÉER TRIGGER updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_war_games_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_war_games_updated_at ON public.war_games;

CREATE TRIGGER update_war_games_updated_at
  BEFORE UPDATE ON public.war_games
  FOR EACH ROW
  EXECUTE FUNCTION update_war_games_updated_at();

-- ============================================================
-- ÉTAPE 12: GRANT PERMISSIONS
-- ============================================================

GRANT EXECUTE ON FUNCTION get_open_war_games() TO authenticated;

-- ============================================================
-- VÉRIFICATION
-- ============================================================

-- Afficher la structure finale
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'war_games'
ORDER BY ordinal_position;

-- Afficher les policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'war_games';

-- ============================================================
-- MIGRATION TERMINÉE ✅
-- ============================================================

