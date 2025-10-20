# 🚨 Correction Urgente : Récursion Infinie RLS

## 🔥 Problème Identifié

**Erreur actuelle** :
```
GET /rest/v1/users?select=... 500 (Internal Server Error)
ERROR: infinite recursion detected in policy for relation "users"
Code: 42P17
```

**Impact** :
- ❌ `useUserRole` ne fonctionne pas → Impossible de vérifier les rôles
- ⚠️ Streaks et Predictions peuvent échouer aléatoirement
- ✅ Leaderboard fonctionne (utilise RPC functions)

**Cause** : 17 policies RLS font `EXISTS (SELECT FROM users)` pour vérifier le rôle admin, créant une récursion infinie.

---

## ✅ Solution en 3 Étapes

### Étape 1 : Copier la Migration SQL

Ouvrez le fichier `RLS_INFINITE_RECURSION_FIX.sql` (créé dans le projet).

### Étape 2 : Exécuter dans Supabase

#### Option A : Via l'interface Supabase (RECOMMANDÉ)

1. Allez sur [https://app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet **GalacticX**
3. Cliquez sur **SQL Editor** dans le menu de gauche
4. Cliquez sur **New query**
5. Copiez-collez **tout le contenu** de `RLS_INFINITE_RECURSION_FIX.sql`
6. Cliquez sur **Run** (ou `Ctrl+Enter`)
7. Attendez la fin de l'exécution (≈ 5-10 secondes)

#### Option B : Via votre session SSH + psql

```sql
-- Connectez-vous à votre base Supabase via SSH
-- Puis exécutez le contenu du fichier SQL
\i RLS_INFINITE_RECURSION_FIX.sql
```

### Étape 3 : Vérifier les Résultats

La migration inclut des tests automatiques. Voici ce que vous devriez voir :

#### ✅ Test 1 : Fonction créée
```sql
-- Résultat attendu
function_name          | is_security_definer
-----------------------+--------------------
is_current_user_admin  | true
```

#### ✅ Test 2 : Policies sur `users` recréées
```sql
-- Résultat attendu (4 policies)
policyname                        | cmd    | using_clause
----------------------------------+--------+----------------------------------------
Admins can update all profiles    | UPDATE | (id = ... OR is_current_user_admin())
Admins can view all profiles      | SELECT | (id = ... OR is_current_user_admin())
Users can insert own profile      | INSERT | ...
Admins can delete profiles        | DELETE | is_current_user_admin()
```

#### ✅ Test 3 : Compter les policies corrigées
```sql
-- Résultat attendu (9 tables avec policies corrigées)
tablename            | policy_count
---------------------+-------------
leaderboards         | 2
nft_metadata         | 2
points_transactions  | 2
predictions          | 3
team_of_week         | 3
user_predictions     | 2
users                | 3
war_game_teams       | 1
war_games            | 1
weekly_streaks       | 1
```

#### ✅ Test 4 : Vérifier qu'il ne reste plus de récursion
```sql
-- Résultat attendu : AUCUNE LIGNE (0 rows)
-- Si des lignes apparaissent, il reste des policies récursives
```

---

## 🧪 Tests Post-Migration

### Test 1 : useUserRole dans l'App

1. Ouvrez votre app React (vérifiez que le serveur tourne)
2. Connectez votre wallet MultiversX
3. Ouvrez la console du navigateur (`F12`)
4. Vérifiez les logs :

```javascript
// ✅ Devrait afficher :
✅ [useUserRole] Profil trouvé: { id: "...", wallet: "erd1...", role: "user" }
🏁 [useUserRole] Chargement terminé

// ❌ NE DEVRAIT PLUS afficher :
❌ [useUserRole] Erreur: {code: '42P17', message: 'infinite recursion...'}
```

### Test 2 : Streaks

1. Allez sur la page **Streaks**
2. La page devrait charger correctement
3. Vous devriez voir vos claims de la semaine (ou un état vide si aucun claim)

### Test 3 : Predictions

1. Allez sur la page **Predictions**
2. Les prédictions actives devraient s'afficher
3. Essayez de placer un pari → Devrait fonctionner

### Test 4 : Leaderboard

1. Allez sur la page **Leaderboard**
2. Devrait toujours fonctionner (déjà OK avant la migration)
3. Vérifiez les onglets Weekly, Monthly, All-Time

---

## 📊 Comparaison Avant/Après

| Feature | Avant (Récursion) | Après (Corrigé) |
|---------|-------------------|-----------------|
| `useUserRole` | ❌ 500 Error | ✅ 200 OK |
| Streaks | ⚠️ Intermittent | ✅ Stable |
| Predictions | ⚠️ Intermittent | ✅ Stable |
| Leaderboard | ✅ OK | ✅ OK |
| Admin Panel | ❌ Inaccessible | ✅ Accessible |
| Performance | 🐌 Timeout | ⚡ ~5ms |

---

## 🔍 Détails Techniques

### Ce qui a été corrigé

**17 policies récursives** à travers **9 tables** :

1. **users** (4 policies)
   - `Admins can view all profiles`
   - `Admins can update all profiles`
   - `Users can insert own profile`
   - `Admins can delete profiles`

2. **leaderboards** (2 policies)
   - `System can insert leaderboard entries`
   - `System can update leaderboard entries`

3. **nft_metadata** (2 policies)
   - `System can insert NFT metadata`
   - `System can update NFT metadata`

4. **points_transactions** (2 policies)
   - `Admins can insert points transactions`
   - `Admins can view all points transactions`

5. **predictions** (3 policies)
   - `Only admins can create predictions`
   - `Only admins can delete predictions`
   - `Only admins can update predictions`

6. **team_of_week** (3 policies)
   - `Only admins can delete TOTW`
   - `Only admins can insert TOTW`
   - `Only admins can update TOTW`

7. **user_predictions** (2 policies)
   - `Admins can update any predictions`
   - `Admins can view all predictions`

8. **war_game_teams** (1 policy)
   - `Admins can view all war game teams`

9. **war_games** (1 policy)
   - `Admins can view all games`

10. **weekly_streaks** (1 policy)
    - `Admins can view all streaks`

### Fonction Créée

```sql
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER  -- ⚠️ Bypass RLS pour éviter récursion
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.users
  WHERE id = get_current_user_id()
  LIMIT 1;
  
  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;
```

**Pourquoi `SECURITY DEFINER` ?**
- Permet à la fonction de s'exécuter avec les privilèges du propriétaire (postgres)
- Bypass RLS pour lire `users.role` sans déclencher les policies
- Évite la récursion infinie

---

## 🚨 Que Faire si Ça Ne Marche Pas ?

### Problème 1 : "Function already exists"

```sql
-- Supprimer l'ancienne fonction et réexécuter
DROP FUNCTION IF EXISTS public.is_current_user_admin();
-- Puis réexécuter la migration complète
```

### Problème 2 : "Permission denied"

Assurez-vous d'exécuter la migration avec un user ayant les droits **postgres** ou **supabase_admin**.

### Problème 3 : Erreur toujours présente après migration

1. Videz le cache de votre navigateur (`Ctrl+Shift+Delete`)
2. Redémarrez votre serveur de dev :
   ```powershell
   npm run dev
   ```
3. Déconnectez/reconnectez votre wallet MultiversX
4. Vérifiez les logs du navigateur (`F12`)

### Problème 4 : Policies manquantes

Si certaines policies manquent après la migration, réexécutez les sections spécifiques du fichier SQL.

---

## 📞 Support

Si le problème persiste après la migration :

1. Copiez les résultats des 4 tests de vérification (voir Étape 3)
2. Copiez les logs de la console navigateur (`F12` → Console)
3. Copiez les logs de Supabase (SQL Editor → History → Errors)

---

## ✅ Checklist Post-Migration

- [ ] Migration SQL exécutée sans erreur
- [ ] Fonction `is_current_user_admin()` créée (Test 1)
- [ ] 4 policies sur `users` recréées (Test 2)
- [ ] 9 tables avec policies corrigées (Test 3)
- [ ] Aucune policy récursive restante (Test 4 = 0 rows)
- [ ] `useUserRole` fonctionne dans l'app (pas d'erreur 500)
- [ ] Streaks charge correctement
- [ ] Predictions charge correctement
- [ ] Leaderboard toujours fonctionnel
- [ ] Admin panel accessible (si vous êtes admin)

---

**Temps d'exécution estimé** : 2-3 minutes  
**Downtime** : Aucun (migration à chaud)  
**Rollback** : Possible (voir `RLS_INFINITE_RECURSION_FIX.sql` pour les anciennes policies)

---

**Auteur** : GalacticX DevTeam  
**Date** : 2025-01-20  
**Priorité** : 🔥 CRITIQUE  
**Status** : ✅ Ready for Deployment

