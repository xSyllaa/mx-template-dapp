# 🧪 Guide de Test - Leaderboards

## ✅ Corrections appliquées

### 1. **Optimisation des re-renders**
- ✅ `useMemo` pour stabiliser `filters` et `periodInfo`
- ✅ `useCallback` pour `handleTabChange` et `handleRefresh`
- ✅ Logs réduits (moins verbeux)

### 2. **Fallback intelligent**
- ✅ Essaie d'abord les fonctions PostgreSQL
- ✅ Si fonctions inexistantes → fallback vers table `users`
- ✅ Affiche **tous les utilisateurs** avec leurs points

---

## 🚀 Testez maintenant

### 1. **Actualisez votre navigateur** (F5)
### 2. **Allez sur `/leaderboards`**

### Ce que vous devriez voir dans la console :

```
🏆 [Leaderboard] Render: { activeTab: "all_time", supabaseUserId: "authenticated", filtersType: "all_time" }
📡 [LeaderboardService] Calling get_leaderboard with: { type: "all_time", ... }
📡 [LeaderboardService] Function not found, falling back to users table
📡 [LeaderboardService] Fallback data: X entries
```

### 3. **Résultat attendu**

- ✅ **Plus de boucles infinies** dans les logs
- ✅ **Leaderboard affiché** avec tous les utilisateurs
- ✅ **Onglets fonctionnels** (All-Time, Weekly, Monthly)
- ✅ **Points affichés** depuis `users.total_points`

---

## 📊 Si vous voyez des données

**Félicitations !** Votre leaderboard fonctionne avec :
- Tous les utilisateurs affichés
- Points depuis `users.total_points`
- Rangs calculés (1, 2, 3, ...)

---

## 🔧 Si vous ne voyez pas de données

### Option 1: Vérifiez la table users
```sql
-- Dans Supabase SQL Editor
SELECT username, total_points 
FROM users 
WHERE total_points > 0 
ORDER BY total_points DESC 
LIMIT 10;
```

### Option 2: Ajoutez des données de test
```sql
-- Mettre à jour quelques utilisateurs avec des points
UPDATE users 
SET total_points = 1000 
WHERE username = 'votre_nom_utilisateur';

UPDATE users 
SET total_points = 800 
WHERE username = 'autre_utilisateur';
```

---

## 🎯 Prochaines étapes

### 1. **Si ça fonctionne** ✅
- Exécutez `LEADERBOARD_MIGRATION.sql` pour créer les fonctions PostgreSQL
- Exécutez `LEADERBOARD_DATA_MIGRATION.sql` pour migrer les données
- Réactivez le real-time

### 2. **Si vous voulez des données plus réalistes**
- Créez quelques prédictions
- Réclamez des streaks
- Le système enregistrera automatiquement les points

---

## 🔍 Debug des logs

### Logs normaux (✅)
```
🏆 [Leaderboard] Render: { activeTab: "all_time", ... }  // 1x par changement d'onglet
📡 [LeaderboardService] Fallback data: 5 entries         // 1x par fetch
```

### Logs problématiques (❌)
```
🏆 [Leaderboard] Render: { ... }  // Multiple fois rapidement
🏆 [Leaderboard] Render: { ... }  // = Boucle infinie
🏆 [Leaderboard] Render: { ... }
```

---

## 📱 Test des onglets

1. **All-Time** → Affiche tous les utilisateurs
2. **Weekly** → Même chose (fallback)
3. **Monthly** → Même chose (fallback)

*Note: Weekly/Monthly ne seront vraiment fonctionnels qu'après la migration des données*

---

**Testez et dites-moi ce que vous voyez !** 🎉
