# 🔧 War Games - Correction Rapide de l'Erreur SQL

## ❌ Erreur Rencontrée

```
Error: Could not find the 'creator_id' column of 'war_games' in the schema cache
```

**Cause :** La table `war_games` existe avec l'ancienne structure (`player_a_id`, `player_b_id`) mais le code utilise la nouvelle structure (`creator_id`, `opponent_id`).

---

## ✅ Solution : Exécuter la Migration SQL

### Étape 1 : Ouvrir Supabase SQL Editor

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet GalacticX
3. Cliquez sur **"SQL Editor"** dans le menu de gauche
4. Cliquez sur **"New query"**

---

### Étape 2 : Copier le Script SQL

Ouvrez le fichier : **`WAR_GAMES_UPDATE_TABLE_MIGRATION.sql`**

Copiez TOUT le contenu du fichier

---

### Étape 3 : Exécuter la Migration

1. Collez le script complet dans l'éditeur SQL
2. Cliquez sur **"Run"** (ou Ctrl+Entrée)
3. Attendez que l'exécution se termine (~5-10 secondes)

---

### Étape 4 : Vérifier le Résultat

À la fin du script, vous verrez :

```
column_name        | data_type
-------------------+-----------
id                 | uuid
creator_id         | uuid        ← ✅ Nouvelle colonne
creator_team_id    | uuid        ← ✅ Nouvelle colonne
opponent_id        | uuid        ← ✅ Nouvelle colonne
opponent_team_id   | uuid        ← ✅ Nouvelle colonne
points_stake       | integer     ← ✅ Nouvelle colonne
entry_deadline     | timestamp   ← ✅ Nouvelle colonne
status             | text
...
```

**Si vous voyez ces colonnes** → ✅ Migration réussie !

---

### Étape 5 : Rafraîchir le Cache de Supabase

**Important !** Supabase met en cache le schéma de la table.

**Option A : Via l'interface Supabase**
1. Allez dans **Table Editor**
2. Cliquez sur la table `war_games`
3. Vérifiez que vous voyez les nouvelles colonnes

**Option B : Commande SQL**
```sql
-- Force le rafraîchissement du cache
NOTIFY pgrst, 'reload schema';
```

**Option C : Redémarrez votre serveur local**
```powershell
# Si vous utilisez un serveur local, redémarrez-le
npm run dev
```

---

### Étape 6 : Tester dans l'Application

1. Rechargez la page `/war-games` (Ctrl+F5)
2. Créez une équipe de 11 NFTs
3. Cliquez sur "Create War Game"
4. Configurez les points et la deadline
5. Cliquez sur "Create War Game"

**Résultat attendu :**
```
✅ War Game created successfully! Waiting for an opponent to join.
```

---

## 🔍 Vérification Post-Migration

### Test 1 : La table a les bonnes colonnes

```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'war_games'
ORDER BY ordinal_position;
```

**Attendu :**
- ✅ `creator_id` (uuid)
- ✅ `creator_team_id` (uuid)
- ✅ `opponent_id` (uuid)
- ✅ `opponent_team_id` (uuid)
- ✅ `points_stake` (integer)
- ✅ `entry_deadline` (timestamp)

---

### Test 2 : Les RLS Policies sont créées

```sql
SELECT policyname 
FROM pg_policies
WHERE tablename = 'war_games';
```

**Attendu :**
- ✅ Anyone can view open war games
- ✅ Users can view their own war games
- ✅ Users can create war games
- ✅ Users can join open war games
- ✅ Creator can cancel open war games
- ✅ Admins can update war game results

---

### Test 3 : La fonction helper existe

```sql
SELECT * FROM get_open_war_games();
```

**Attendu :**
- Retourne une liste vide (si aucun war game créé)
- OU retourne les war games actifs

---

## 🚨 Si l'Erreur Persiste

### Erreur : "war_games_status_check violation"

**Cause :** Il existe des données avec des status invalides (`pending`, `locked`).

**Solution :** La migration les convertit automatiquement :
- `pending` → `open`
- `locked` → `in_progress`

Si ça ne fonctionne pas, exécutez manuellement :

```sql
-- Convertir les anciens statuts
UPDATE public.war_games 
SET status = CASE 
  WHEN status = 'pending' THEN 'open'
  WHEN status = 'locked' THEN 'in_progress'
  ELSE status
END;
```

---

### Erreur : "Could not find creator_id" (persiste)

**Solution :** Videz le cache de Supabase

```sql
-- Dans SQL Editor, exécutez :
NOTIFY pgrst, 'reload schema';

-- Puis rechargez votre application (Ctrl+F5)
```

**OU** Redémarrez votre projet Supabase (bouton "Restart project" dans Settings)

---

## 📝 Résumé

1. ✅ Exécuter `WAR_GAMES_UPDATE_TABLE_MIGRATION.sql`
2. ✅ Vérifier que les colonnes existent
3. ✅ Rafraîchir le cache Supabase
4. ✅ Recharger l'application (Ctrl+F5)
5. ✅ Tester la création de war game

---

**Après cette migration, tout devrait fonctionner parfaitement !** 🎮⚔️

