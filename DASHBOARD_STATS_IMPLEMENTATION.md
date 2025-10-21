# 📊 Dashboard Stats Implementation

## Vue d'ensemble

Le Dashboard a été mis à jour pour récupérer et afficher correctement toutes les statistiques utilisateur de manière centralisée et optimisée.

## ✅ Fonctionnalités implémentées

### Hook centralisé : `useDashboardStats`

Un nouveau hook personnalisé a été créé pour gérer toutes les statistiques du Dashboard :

**Localisation** : `src/hooks/useDashboardStats.ts`

### Statistiques récupérées

Le hook `useDashboardStats` centralise et expose les données suivantes :

```typescript
interface DashboardStats {
  // NFT Stats
  nftCount: number;           // Nombre de NFTs détenus
  hasNFTs: boolean;            // Possède au moins 1 NFT
  
  // Points & Rank
  totalPoints: number;         // Total des points accumulés
  globalRank: number | null;   // Classement global (all-time)
  weeklyRank: number | null;   // Classement hebdomadaire
  monthlyRank: number | null;  // Classement mensuel
  
  // Streak Stats
  currentStreak: number;       // Nombre de jours consécutifs
  streakCompleted: boolean;    // Semaine complétée
  canClaimToday: boolean;      // Peut claim aujourd'hui
  
  // User Info
  username: string | null;     // Nom d'utilisateur
  walletAddress: string | null; // Adresse wallet MultiversX
}
```

## 🏗️ Architecture

### 1. Réutilisation des hooks existants

Le hook `useDashboardStats` **réutilise** les hooks existants pour éviter la duplication :

- **`useMyNFTs()`** : Pour récupérer le nombre de NFTs
- **`useWeeklyStreak()`** : Pour récupérer la streak et son état

### 2. Protection contre les boucles infinies

Le hook utilise plusieurs mécanismes pour éviter les appels en boucle :

#### a) Ref pour tracking des fetches
```typescript
const isFetchingRef = useRef(false);
const lastFetchedUserIdRef = useRef<string | null>(null);

// Prevent duplicate fetches
if (isFetchingRef.current && lastFetchedUserIdRef.current === supabaseUserId) {
  if (DEBUG) console.log('🚫 [useDashboardStats] Fetch already in progress, skipping...');
  return;
}
```

#### b) Séparation des responsabilités
- **`fetchUserStats()`** : Récupère uniquement les données de Supabase (profil + ranks)
- **`useEffect` séparés** : Mettent à jour les stats NFT/Streak sans refetch

```typescript
// Effect 1: Fetch user stats ONLY when auth changes
useEffect(() => {
  if (isAuthenticated && supabaseUserId) {
    fetchUserStats();
  }
}, [isAuthenticated, supabaseUserId, fetchUserStats]);

// Effect 2: Update NFT stats locally (no refetch)
useEffect(() => {
  setStats(prev => ({ ...prev, nftCount, hasNFTs }));
}, [nftCount, hasNFTs]);

// Effect 3: Update Streak stats locally (no refetch)
useEffect(() => {
  setStats(prev => ({ ...prev, currentStreak, streakCompleted, canClaimToday }));
}, [streakStats?.consecutiveDays, streakStats?.isCompleted, canClaimToday]);
```

#### c) Dépendances minimales
Le `fetchUserStats` ne dépend **que** de :
- `address`
- `isAuthenticated`
- `supabaseUserId`

Il ne dépend **PAS** de `nftCount`, `hasNFTs`, `streakStats`, etc. pour éviter les re-renders en cascade.

### 3. Récupération des données Supabase

Le hook effectue les appels suivants :

```typescript
// 1. Profil utilisateur (username, total_points)
const { data: userProfile } = await supabase
  .from('users')
  .select('username, total_points, wallet_address')
  .eq('id', supabaseUserId)
  .maybeSingle();

// 2. Classements (all-time, weekly, monthly)
const [allTimeRank, weeklyRank, monthlyRank] = await Promise.all([
  getUserRank(supabaseUserId, { type: 'all_time' }),
  getUserRank(supabaseUserId, { type: 'weekly', week, year }),
  getUserRank(supabaseUserId, { type: 'monthly', month, year })
]);
```

### 4. Optimisations

#### a) Cache de 5 minutes
Le hook utilise un système de cache pour éviter les appels API inutiles :

```typescript
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache stocké en dehors du composant (persiste entre les renders)
const dashboardCache = new Map<string, CachedDashboardData>();

// Vérification du cache avant fetch
const cached = dashboardCache.get(supabaseUserId);
const now = Date.now();

if (cached && (now - cached.timestamp) < CACHE_DURATION) {
  console.log('💾 Using cached data (age: ' + Math.round((now - cached.timestamp) / 1000) + 's)');
  // Utiliser les données en cache
  return;
}

// Sinon, fetch depuis l'API et mettre en cache
const fetchedData = { /* ... */ };
dashboardCache.set(supabaseUserId, {
  ...fetchedData,
  timestamp: Date.now()
});
```

**Avantages** :
- ✅ Pas d'appels API quand on revient sur la page (< 5 min)
- ✅ Affichage instantané des stats
- ✅ Cache invalidé automatiquement après 5 minutes
- ✅ Cache cleared lors des updates real-time (points, profil)

#### b) Cache et réutilisation
- Les hooks `useMyNFTs` et `useWeeklyStreak` ont leur propre cache
- `useLeaderboard` utilise un cache de 5 minutes
- `useDashboardStats` utilise maintenant aussi un cache de 5 minutes
- Pas de duplication des appels API

#### c) Chargement parallèle
```typescript
// Les 3 classements sont récupérés en parallèle
await Promise.all([allTimeRank, weeklyRank, monthlyRank]);
```

#### d) Real-time updates avec invalidation du cache
Le hook s'abonne aux changements en temps réel et **invalide le cache** automatiquement :
- **Table `points_transactions`** : Mise à jour automatique quand l'utilisateur gagne/perd des points
- **Table `users`** : Mise à jour quand le profil change (username, etc.)

```typescript
// Subscription Supabase Realtime avec cache invalidation
const pointsChannel = supabase
  .channel('dashboard-points-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'points_transactions',
    filter: `user_id=eq.${supabaseUserId}`
  }, () => {
    // 1. Invalider le cache
    dashboardCache.delete(supabaseUserId);
    lastFetchedUserIdRef.current = null;
    
    // 2. Rafraîchir les données
    fetchUserStats();
  })
  .subscribe();
```

**Important** : Le cache est automatiquement invalidé lors d'événements real-time pour garantir la fraîcheur des données.

## 🎨 Interface Dashboard mise à jour

### Avant
```typescript
// ❌ Données hardcodées
const userData = {
  username: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Guest',
  totalPoints: 1250,
  currentStreak: 5,
  nftCount: 8,
  globalRank: 142
};
```

### Après
```typescript
// ✅ Données dynamiques du hook
const { stats, loading, error, refresh } = useDashboardStats();

<StatsCard
  icon="⭐"
  label={t('dashboard.stats.totalPoints')}
  value={loading ? '...' : stats.totalPoints.toLocaleString()}
  variant="gold"
/>
```

## 📦 Données affichées

| Statistique | Source | Hook utilisé | Cache |
|------------|--------|--------------|-------|
| **Nombre de NFTs** | MultiversX API | `useMyNFTs()` | Oui (dans le hook) |
| **Total Points** | Supabase `users.total_points` | `useDashboardStats` | **Oui (5 min)** |
| **Classement Global** | Supabase RPC `get_user_rank()` | `useDashboardStats` | **Oui (5 min)** |
| **Classement Weekly** | Supabase RPC `get_user_rank()` | `useDashboardStats` | **Oui (5 min)** |
| **Classement Monthly** | Supabase RPC `get_user_rank()` | `useDashboardStats` | **Oui (5 min)** |
| **Streak Actuelle** | Supabase `week_streaks` | `useWeeklyStreak()` | Oui (dans le hook) |
| **Claim disponible** | Calculé depuis streak | `useWeeklyStreak()` | Oui (dans le hook) |
| **Username** | Supabase `users.username` | `useDashboardStats` | **Oui (5 min)** |

## 🔄 Gestion des états

### Loading State
```typescript
<StatsCard
  icon="⭐"
  label={t('dashboard.stats.totalPoints')}
  value={loading ? '...' : stats.totalPoints.toLocaleString()}
/>
```

### Error State
```typescript
{error && (
  <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
    <p className="text-[var(--mvx-text-color-primary)] text-sm">
      ⚠️ {t('common.error')}: {error.message}
    </p>
    <Button variant="secondary" onClick={refresh}>
      {t('common.retry')}
    </Button>
  </div>
)}
```

### Empty State
```typescript
// Classement non disponible
value={stats.globalRank ? `#${stats.globalRank}` : t('dashboard.stats.noRank')}
```

## 🌍 Internationalisation (i18n)

Nouvelles clés de traduction ajoutées :

### English (`en.json`)
```json
{
  "dashboard": {
    "stats": {
      "noRank": "Unranked",
      "claimAvailable": "Claim available today"
    }
  }
}
```

### French (`fr.json`)
```json
{
  "dashboard": {
    "stats": {
      "noRank": "Non classé",
      "claimAvailable": "Réclamation disponible aujourd'hui"
    }
  }
}
```

## 📋 Utilisation dans d'autres pages

Le hook `useDashboardStats` peut être réutilisé ailleurs :

```typescript
import { useDashboardStats } from 'hooks/useDashboardStats';

const MyComponent = () => {
  const { stats, loading, error, refresh } = useDashboardStats();
  
  return (
    <div>
      <p>Total Points: {stats.totalPoints}</p>
      <p>NFTs: {stats.nftCount}</p>
      <p>Rank: #{stats.globalRank}</p>
    </div>
  );
};
```

## 🚀 Avantages de cette implémentation

### ✅ Performance
- **Cache intelligent** : Pas de requêtes inutiles
- **Chargement parallèle** : Les classements sont récupérés simultanément
- **Réutilisation des hooks** : Pas de duplication des appels API

### ✅ Maintenabilité
- **Centralisé** : Toutes les stats du Dashboard dans un seul hook
- **Réutilisable** : Peut être utilisé dans d'autres composants
- **Typé** : TypeScript pour la sécurité des types

### ✅ UX
- **Real-time** : Mises à jour automatiques via Supabase Realtime
- **États clairs** : Loading, error, empty states gérés
- **Multilingue** : Support EN/FR

### ✅ Évolutivité
- Facile d'ajouter de nouvelles stats
- Facile de modifier les sources de données
- Facile d'ajouter de nouveaux classements (daily, yearly, etc.)

## 🔧 Maintenance

### Ajouter une nouvelle statistique

1. **Mettre à jour l'interface `DashboardStats`**
```typescript
export interface DashboardStats {
  // ... existing stats
  newStat: number; // 👈 Nouvelle stat
}
```

2. **Récupérer la donnée dans `fetchUserStats`**
```typescript
const newStatValue = await fetchNewStat(userId);

setStats({
  // ... existing stats
  newStat: newStatValue
});
```

3. **Afficher dans le Dashboard**
```typescript
<StatsCard
  icon="🎯"
  label="New Stat"
  value={stats.newStat}
/>
```

## ⚠️ Points d'attention

### Authentification
Le hook nécessite que l'utilisateur soit authentifié :
- `isAuthenticated` doit être `true`
- `supabaseUserId` doit être défini

### Dépendances
Le hook dépend de :
- **AuthContext** : Pour `isAuthenticated` et `supabaseUserId`
- **useMyNFTs** : Pour les NFTs
- **useWeeklyStreak** : Pour la streak
- **Supabase** : Pour les points et classements

### Real-time
Les subscriptions Realtime sont automatiquement nettoyées lors du démontage du composant.

### Protection contre les boucles infinies
Le hook utilise plusieurs mécanismes pour éviter les appels en boucle :
1. **Ref `isFetchingRef`** : Empêche les fetches simultanés
2. **Ref `lastFetchedUserIdRef`** : Vérifie si l'user a déjà été fetch
3. **Séparation NFT/Streak** : Les stats NFT/Streak sont mises à jour localement sans refetch
4. **Dépendances minimales** : `fetchUserStats` ne dépend que de l'authentification

## 🐛 Problèmes résolus

### ❌ Problème : Boucle infinie d'appels API
**Symptôme** : Les logs montrent des centaines d'appels à `getUserRank()` en boucle
```
📡 [LeaderboardService] Fetching user rank for all_time leaderboard...
📡 [LeaderboardService] Fetching user rank for weekly leaderboard...
📡 [LeaderboardService] Fetching user rank for monthly leaderboard...
📡 [LeaderboardService] Fetching user rank for all_time leaderboard... (x100)
```

**Cause** : Dépendances circulaires dans `useEffect`
- `fetchUserStats` dépendait de `nftCount`, `hasNFTs`, `streakStats`, `canClaimToday`
- Ces valeurs changent fréquemment (hooks `useMyNFTs` et `useWeeklyStreak`)
- Chaque changement recréait `fetchUserStats` → déclenchait le `useEffect` → refetch → changement des stats → boucle infinie

**Solution** :
1. ✅ **Retirer les dépendances NFT/Streak** de `fetchUserStats`
2. ✅ **Séparer les `useEffect`** : un pour fetch, d'autres pour update local
3. ✅ **Ajouter une ref** `isFetchingRef` pour bloquer les fetches simultanés
4. ✅ **Utiliser `setStats(prev => ({...prev}))`** pour update incrémentale

### ✅ Résultat après correction

#### Premier chargement (cache vide)
```
📊 [useDashboardStats] Fetching user stats from API for: [userId]
📡 [LeaderboardService] Fetching user rank for all_time leaderboard...
📡 [LeaderboardService] Fetching user rank for weekly leaderboard...
📡 [LeaderboardService] Fetching user rank for monthly leaderboard...
✅ [useDashboardStats] Stats fetched successfully
```

#### Retour sur la page (< 5 minutes)
```
💾 [useDashboardStats] Using cached data (age: 45s)
```
**Aucun appel API** ! Les données sont affichées instantanément depuis le cache.

#### Retour sur la page (> 5 minutes)
```
📊 [useDashboardStats] Fetching user stats from API for: [userId]
📡 [LeaderboardService] Fetching user rank for all_time leaderboard...
// ... (refetch car cache expiré)
```

**Une seule fois** lors du chargement initial, puis :
- **Cache pendant 5 minutes** → Affichage instantané
- **Mises à jour locales** pour NFT/Streak
- **Invalidation automatique** lors d'événements real-time

## 🎯 Prochaines étapes possibles

1. **Dashboard avancé**
   - Graphiques d'évolution des points
   - Historique des classements
   - Comparaison avec d'autres joueurs

2. **Cache amélioré**
   - IndexedDB pour persistance offline
   - Service Worker pour sync en arrière-plan

3. **Notifications**
   - Alertes quand classement change
   - Notifications de nouveaux points

---

**Date de création** : 21 octobre 2025  
**Version** : 1.0  
**Statut** : ✅ Implémenté et fonctionnel

