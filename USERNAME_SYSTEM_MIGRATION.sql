-- ============================================================
-- GalacticX dApp - Username Management System
-- Migration: Add username modification tracking and security
-- ============================================================

-- Ajouter la colonne username_last_modified
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username_last_modified TIMESTAMP WITH TIME ZONE;

-- Ajouter la contrainte UNIQUE sur username (ignore les NULL)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_username'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT unique_username UNIQUE (username);
  END IF;
END $$;

-- Créer un index pour les recherches
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL;

-- ============================================================
-- SÉCURITÉ: Fonction pour vérifier le cooldown (SECURITY DEFINER)
-- ============================================================
CREATE OR REPLACE FUNCTION can_update_username(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- IMPORTANT: Cette fonction ne vérifie QUE le cooldown
  -- La vérification d'identité est faite par la politique RLS
  RETURN (
    SELECT COALESCE(
      username_last_modified IS NULL OR 
      username_last_modified < NOW() - INTERVAL '7 days',
      TRUE
    )
    FROM users
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SÉCURITÉ: Politique RLS stricte pour l'update du username
-- ============================================================

-- Supprimer l'ancienne politique générale d'update si elle existe
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile (non-username)" ON users;
DROP POLICY IF EXISTS "Users can update own username with cooldown" ON users;

-- Politique unique: Users can update their own profile with username cooldown check
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Vérifier le cooldown si le username existe (sera vérifié par le trigger)
  can_update_username(id)
);

-- ============================================================
-- SÉCURITÉ: Trigger pour mettre à jour username_last_modified
-- ============================================================
CREATE OR REPLACE FUNCTION update_username_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le username a changé, mettre à jour le timestamp
  IF NEW.username IS DISTINCT FROM OLD.username THEN
    NEW.username_last_modified = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_username_last_modified ON users;

CREATE TRIGGER set_username_last_modified
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_username_timestamp();

-- Commentaires
COMMENT ON COLUMN users.username_last_modified IS 'Timestamp of last username change (7 days cooldown)';
COMMENT ON FUNCTION can_update_username IS 'Checks if user can update username (7 days cooldown). Identity check done by RLS.';

-- ============================================================
-- Verification
-- ============================================================
-- Pour vérifier que tout fonctionne, vous pouvez exécuter :
-- SELECT can_update_username(auth.uid());

