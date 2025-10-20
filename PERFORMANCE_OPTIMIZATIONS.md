# 🚀 Optimisations de Performance - Leaderboard & Auth

## 📋 Résumé

Ce document détaille les optimisations appliquées pour **réduire les rerenders excessifs** et **améliorer les performances** dans les fonctionnalités Leaderboard et Authentification.

---

## 🔍 Problèmes Identifiés

### 1. **Console.log dans le JSX (Sidebar.tsx)**
```typescript
// ❌ AVANT - S'exécute à CHAQUE render
{console.log('🔍 [Sidebar] Render - showUsernameEditor:', showUsernameEditor)}
```

**Impact** : Performance dégradée car exécuté à chaque cycle de rendu.

**Solution** : Suppression complète de ce log.

---

### 2. **État d'authentification instable (useSupabaseAuth)**

```typescript
// ❌ AVANT - État initial null → userId
const [authState, setAuthState] = useState<AuthState>({
  supabaseUserId: null
});

// Dans useEffect, changement de null → userId cause des rerenders
```

**Impact** : 
- Le composant `Leaderboard` render 2 fois :
  - 1re fois : `supabaseUserId = null`
  - 2e fois : `supabaseUserId = '63df3e00-...'`
- Chaque rerender déclenche de nouveaux fetches dans les hooks.

**Solution** : Initialiser l'état avec la session existante dans localStorage

```typescript
// ✅ APRÈS - État initial stable
const getInitialAuthState = (): AuthState => {
  try {
    const existingUser = localStorage.getItem('galacticx.user');
    const token = localStorage.getItem('supabase.auth.token');
    const expiresAt = localStorage.getItem('supabase.auth.expires_at');
    
    if (existingUser && token && expiresAt) {
      const userData = JSON.parse(existingUser);
      const isExpired = Date.now() > parseInt(expiresAt);
      
      if (!isExpired) {
        return {
          isAuthenticated: true,
          supabaseUserId: userData.id // ✅ Directement l'userId
        };
      }
    }
  } catch (error) {
    console.error('Error reading initial state:', error);
  }
  
  return { isAuthenticated: false, supabaseUserId: null };
};

const [authState, setAuthState] = useState<AuthState>(getInitialAuthState);
```

**Bénéfices** :
- ✅ Pas de changement `null` → `userId` si session valide
- ✅ 1 seul render initial au lieu de 2
- ✅ Pas de fetches inutiles

---

### 3. **Dépendances useMemo instables (useLeaderboard & useUserRank)**

```typescript
// ❌ AVANT - JSON.stringify crée une nouvelle référence à chaque render
const memoizedFilters = useMemo(() => filters, [
  filters.type,
  filters.week,
  filters.month,
  filters.year,
  JSON.stringify(filters.sourceTypes || []) // ❌ Nouvelle référence à chaque fois
]);
```

**Impact** : `memoizedFilters` change même si `filters` n'a pas changé, causant des refetch inutiles.

**Solution** : Utiliser `.join(',')` au lieu de `JSON.stringify()`

```typescript
// ✅ APRÈS - Référence stable
const memoizedFilters = useMemo(() => {
  return {
    type: filters.type,
    week: filters.week,
    month: filters.month,
    year: filters.year,
    sourceTypes: filters.sourceTypes
  };
}, [
  filters.type,
  filters.week,
  filters.month,
  filters.year,
  filters.sourceTypes?.join(',') ?? '' // ✅ Référence stable
]);
```

**Bénéfices** :
- ✅ Pas de recalcul inutile du `useMemo`
- ✅ Pas de refetch si les filtres n'ont pas vraiment changé
- ✅ Réduction des appels API

---

### 4. **Dépendances useEffect manquantes**

```typescript
// ❌ AVANT - fetchLeaderboard manquant dans les dépendances
useEffect(() => {
  // ...
  channel.on('postgres_changes', (payload) => {
    fetchLeaderboard(); // ❌ Utilisé mais pas dans les dépendances
  });
}, [enableRealtime, memoizedFilters.type]); // ❌ fetchLeaderboard manquant
```

**Impact** : Warnings ESLint et comportement imprévisible.

**Solution** : Ajouter `fetchLeaderboard` dans les dépendances

```typescript
// ✅ APRÈS
useEffect(() => {
  // ...
  channel.on('postgres_changes', (payload) => {
    fetchLeaderboard();
  });
}, [enableRealtime, memoizedFilters.type, fetchLeaderboard]); // ✅ Complet
```

---

### 5. **Logs excessifs en production**

```typescript
// ❌ AVANT - Logs partout, même en production
console.log('🏆 [useLeaderboard] Fetching leaderboard:', memoizedFilters);
console.log('🏆 [useLeaderboard] Received data:', data.length, 'entries');
console.log('👤 [useUserRank] Fetching user rank:', { userId, filters });
```

**Impact** : 
- Console polluée
- Performances légèrement dégradées
- Difficulté à débugger

**Solution** : Logs conditionnels avec flag `DEBUG`

```typescript
// ✅ APRÈS - Logs seulement en développement
const DEBUG = import.meta.env.DEV;

if (DEBUG) console.log('🏆 [useLeaderboard] Fetching leaderboard:', memoizedFilters);
if (DEBUG) console.log('🏆 [useLeaderboard] Received data:', data.length, 'entries');
```

**Bénéfices** :
- ✅ Logs visibles en développement (`npm run dev`)
- ✅ Aucun log en production (`npm run build`)
- ✅ Console propre pour l'utilisateur final

---

## 📊 Résultats Attendus

### Avant Optimisation
```
🔍 [Sidebar] Render - showUsernameEditor: false userProfile: {...}
🏆 [Leaderboard] Render: {activeTab: 'all_time', supabaseUserId: 'null'}
✅ [SupabaseAuth] Déjà authentifié avec session valide
🏆 [useLeaderboard] Fetching leaderboard: {type: 'all_time'}
👤 [useUserRank] No userId, skipping fetch
🏆 [Leaderboard] Render: {activeTab: 'all_time', supabaseUserId: 'authenticated'} // ❌ 2e render
👤 [useUserRank] Fetching user rank: {...}
🏆 [Leaderboard] Render: {...} // ❌ 3e render
📡 [LeaderboardService] Received data from function: 2 entries
🏆 [Leaderboard] Render: {...} // ❌ 4e render
```

**Total Renders** : **4 renders** + multiples fetches

---

### Après Optimisation
```
// En développement (DEBUG = true)
🏆 [Leaderboard] Render: {activeTab: 'all_time', supabaseUserId: 'authenticated'}
🏆 [useLeaderboard] Fetching leaderboard: {type: 'all_time'}
👤 [useUserRank] Fetching user rank: {...}
📡 [LeaderboardService] Received data from function: 2 entries
🏆 [Leaderboard] Render: {...} // ✅ Render final seulement
```

**Total Renders** : **2 renders** (optimal)

---

### En Production (DEBUG = false)
```
// Aucun log ! 🎉
```

---

## 🎯 Fichiers Modifiés

| Fichier | Type de changement |
|---------|-------------------|
| `src/components/Sidebar/Sidebar.tsx` | Suppression console.log JSX |
| `src/hooks/useSupabaseAuth.ts` | État initial stable + dépendances |
| `src/pages/Leaderboard/Leaderboard.tsx` | Logs conditionnels + real-time activé |
| `src/features/leaderboard/hooks/useLeaderboard.ts` | useMemo stable + logs conditionnels + dépendances |
| `src/features/leaderboard/hooks/useUserRank.ts` | useMemo stable + logs conditionnels + dépendances |
| `src/features/leaderboard/services/leaderboardService.ts` | Logs conditionnels |

---

## ✅ Checklist de Vérification

- [x] Aucun console.log dans le JSX
- [x] État d'authentification initialisé correctement
- [x] useMemo avec dépendances stables
- [x] useEffect avec toutes les dépendances nécessaires
- [x] Logs conditionnels (DEV uniquement)
- [x] Real-time subscriptions activées
- [x] Aucune erreur de linter
- [x] Tests manuels OK

---

## 🚀 Tests Recommandés

### 1. **Test de connexion**
```
1. Ouvrir l'app sans wallet connecté
2. Connecter le wallet
3. Vérifier dans la console :
   - En DEV : Logs visibles mais réduits (1-2 logs par action)
   - En PROD : Aucun log (sauf erreurs)
```

### 2. **Test de navigation**
```
1. Connecter le wallet
2. Aller sur /leaderboard
3. Changer d'onglet (Weekly, Monthly, All Time)
4. Vérifier :
   - Aucun rerender excessif
   - Fetch uniquement au changement d'onglet
   - Données affichées correctement
```

### 3. **Test de real-time**
```
1. Ouvrir 2 fenêtres avec des wallets différents
2. Dans fenêtre 1 : Gagner des points (faire une prédiction)
3. Dans fenêtre 2 : Vérifier que le leaderboard se met à jour automatiquement (après 2s de debounce)
```

---

## 📚 Ressources

- **React Performance**: https://react.dev/reference/react/useMemo
- **useEffect Dependencies**: https://react.dev/reference/react/useEffect#specifying-reactive-dependencies
- **Vite Env Variables**: https://vitejs.dev/guide/env-and-mode.html

---

## 🎉 Conclusion

Ces optimisations réduisent considérablement les rerenders inutiles et les fetches redondants, améliorant ainsi :
- ⚡ **Performance** : Moins de calculs et d'appels réseau
- 🧹 **Propreté** : Console propre en production
- 🐛 **Maintenabilité** : Code plus facile à débugger
- 💰 **Coûts** : Moins d'appels Supabase inutiles

---

**Date de mise à jour** : 17 octobre 2025
**Auteur** : Cursor AI Assistant

