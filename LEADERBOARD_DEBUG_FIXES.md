# 🔧 Corrections du système de Leaderboards - Debug

## 🐛 Problème identifié

La page leaderboard faisait des **boucles infinies de chargement** à cause de plusieurs problèmes :

### 1. **Boucles de re-render causées par `filters`**
- L'objet `filters` était recréé à chaque render
- Cela relançait les `useCallback` et `useEffect` en boucle
- **Solution** : `useMemo` pour stabiliser l'objet `filters`

### 2. **Real-time subscriptions multiples**
- Chaque changement de `filters` créait une nouvelle subscription
- Les anciennes subscriptions n'étaient pas toujours nettoyées
- **Solution** : Dépendances optimisées + cleanup approprié

### 3. **Fetches en double**
- Pas de protection contre les appels API en double
- **Solution** : `useRef` pour tracker les derniers appels

## ✅ Corrections appliquées

### 1. **Stabilisation des filters** (`useLeaderboard.ts`, `useUserRank.ts`)

```typescript
// AVANT (❌ boucle infinie)
const fetchLeaderboard = useCallback(async () => {
  // ...
}, [filters]); // filters change à chaque render !

// APRÈS (✅ stable)
const memoizedFilters = useMemo(() => filters, [
  filters.type,
  filters.week,
  filters.month,
  filters.year,
  JSON.stringify(filters.sourceTypes || [])
]);

const fetchLeaderboard = useCallback(async () => {
  // ...
}, [memoizedFilters]); // Stable !
```

### 2. **Protection contre les fetches en double**

```typescript
const lastFetchRef = useRef<string>('');

const fetchLeaderboard = useCallback(async () => {
  const filterKey = JSON.stringify(memoizedFilters);
  
  // Prevent duplicate fetches
  if (lastFetchRef.current === filterKey) {
    console.log('🔄 Skipping duplicate fetch');
    return;
  }
  
  lastFetchRef.current = filterKey;
  // ... fetch logic
}, [memoizedFilters]);
```

### 3. **Optimisation des subscriptions real-time**

```typescript
// AVANT (❌ trop de dépendances)
useEffect(() => {
  // ...
}, [enableRealtime, fetchLeaderboard]); // fetchLeaderboard change souvent !

// APRÈS (✅ dépendances minimales)
useEffect(() => {
  // ...
}, [enableRealtime, memoizedFilters.type]); // Seulement le type !
```

### 4. **Logs de debug ajoutés**

- **Page Leaderboard** : Logs des props et état des hooks
- **Hooks** : Logs des fetches, subscriptions, et erreurs
- **Service** : Logs des appels API Supabase

### 5. **Mode debug temporaire**

```typescript
// Désactivation du real-time pour debug
const { entries, loading, error, refresh } = useLeaderboard(filters, false);

// Retour de données vides pour éviter les erreurs
export const getLeaderboard = async () => {
  console.log('📡 Returning empty array for debugging');
  return []; // TODO: Remove after migration
};
```

## 🔍 Comment diagnostiquer

### 1. **Ouvrez la console du navigateur**

Vous devriez voir ces logs :

```
🏆 [Leaderboard] Render: { activeTab: "all_time", supabaseUserId: "...", ... }
🏆 [Leaderboard] Hooks state: { entriesCount: 0, loading: true, ... }
🏆 [useLeaderboard] Fetching leaderboard: { type: "all_time", ... }
📡 [LeaderboardService] Returning empty array for debugging
🏆 [useLeaderboard] Received data: 0 entries
```

### 2. **Si vous voyez des boucles**

Recherchez ces patterns dans les logs :

```
🔄 [useLeaderboard] Skipping duplicate fetch: {...}  ✅ Normal
🏆 [useLeaderboard] Fetching leaderboard: {...}      ✅ Normal (1x)
🏆 [useLeaderboard] Fetching leaderboard: {...}      ❌ Problème (multiple)
🏆 [useLeaderboard] Fetching leaderboard: {...}      ❌ Problème (multiple)
```

### 3. **Si vous voyez des erreurs Supabase**

```
📡 [LeaderboardService] Supabase error: { code: "22P02", ... }
```

→ **Cause probable** : Fonctions PostgreSQL pas encore créées ou données manquantes

## 🚀 Prochaines étapes

### 1. **Testez la page leaderboard**

- Actualisez votre navigateur (F5)
- Allez sur `/leaderboards`
- Vérifiez la console : **plus de boucles infinies** ✅

### 2. **Si ça fonctionne, réactivez les vraies données**

Dans `leaderboardService.ts`, décommentez :

```typescript
// Comment out debug version:
// console.log('📡 Returning empty array for debugging');
// return [];

// Uncomment real version:
const { data, error } = await supabase.rpc('get_leaderboard', {
  p_type: type,
  p_week: week || null,
  p_month: month || null,
  p_year: year || null,
  p_limit: limit,
  p_source_types: sourceTypes || null
});
```

### 3. **Exécutez la migration des données**

```sql
-- Dans Supabase SQL Editor
-- Copiez/collez le contenu de LEADERBOARD_DATA_MIGRATION.sql
```

### 4. **Réactivez le real-time**

Dans `Leaderboard.tsx` :

```typescript
// Change back to:
const { entries, loading, error, refresh } = useLeaderboard(filters, true);
const { rank: userRank, loading: rankLoading, refresh: refreshRank } = useUserRank(supabaseUserId, filters, true);
```

## 📋 Checklist de validation

- [ ] Page leaderboard se charge sans boucles infinies
- [ ] Console montre des logs de debug propres
- [ ] Onglets fonctionnent (All-Time, Weekly, Monthly)
- [ ] Pas d'erreurs Supabase dans la console
- [ ] Migration des données exécutée
- [ ] Données réelles affichées
- [ ] Real-time réactivé et fonctionnel

## 🎯 Résultat attendu

Après ces corrections, vous devriez avoir :

1. ✅ **Page stable** : Plus de boucles de chargement
2. ✅ **Logs clairs** : Debug facile des problèmes
3. ✅ **Performance optimisée** : Pas de fetches en double
4. ✅ **Real-time fonctionnel** : Updates automatiques
5. ✅ **Leaderboards opérationnels** : Données affichées correctement

---

**Note** : Ces corrections résolvent les problèmes de performance et de stabilité. Une fois la migration des données exécutée, le système sera 100% fonctionnel.
