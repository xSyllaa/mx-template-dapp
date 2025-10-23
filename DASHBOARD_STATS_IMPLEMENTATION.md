# 📊 Dashboard Stats Implementation

## Vue d'ensemble

Implémentation complète du nouvel endpoint `/api/leaderboard/dashboard-stats` qui retourne toutes les statistiques du dashboard en un seul appel, incluant le nombre total d'utilisateurs pour chaque catégorie de classement.

---

## 🎯 Fonctionnalités Implémentées

### ✅ API Endpoint
- **Endpoint**: `GET /api/leaderboard/dashboard-stats`
- **Authentification**: Bearer Token requis
- **Réponse**: Toutes les stats en un seul appel

### ✅ Services
- `getDashboardStats()` - Service principal
- Gestion d'erreurs robuste
- Logs de débogage

### ✅ Hooks React
- `useDashboardStats()` - Hook principal
- `formatRank()` - Utilitaire de formatage
- `getRankInfo()` - Utilitaire d'extraction

### ✅ Composants UI
- `DashboardStats` - Composant complet
- `CompactDashboardStats` - Version compacte
- Styles CSS avec variables de thème

---

## 📝 Structure de Réponse

```typescript
interface DashboardStats {
  totalPoints: number;
  username: string | null;
  walletAddress: string;
  globalRank: number;
  globalTotalUsers: number;
  weeklyRank: number;
  weeklyTotalUsers: number;
  monthlyRank: number;
  monthlyTotalUsers: number;
}
```

---

## 🚀 Utilisation

### Hook Principal

```typescript
import { useDashboardStats, formatRank, getRankInfo } from 'features/leaderboard';

function MyDashboard() {
  const { stats, loading, error, refresh } = useDashboardStats();

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;
  if (!stats) return <div>Aucune donnée</div>;

  return (
    <div>
      <h2>{stats.username}</h2>
      <p>{stats.totalPoints} points</p>
      
      <div>
        <p>Global: {formatRank(stats.globalRank, stats.globalTotalUsers)}</p>
        <p>Semaine: {formatRank(stats.weeklyRank, stats.weeklyTotalUsers)}</p>
        <p>Mois: {formatRank(stats.monthlyRank, stats.monthlyTotalUsers)}</p>
      </div>
    </div>
  );
}
```

### Composant Prêt à l'Emploi

```typescript
import { DashboardStats, CompactDashboardStats } from 'components/DashboardStats';

// Version complète
<DashboardStats />

// Version compacte pour sidebar
<CompactDashboardStats />
```

### Utilisation Avancée

```typescript
import { useDashboardStats, getRankInfo } from 'features/leaderboard';

function AdvancedDashboard() {
  const { stats } = useDashboardStats();

  if (!stats) return null;

  const globalRank = getRankInfo(stats, 'global');
  const weeklyRank = getRankInfo(stats, 'weekly');
  const monthlyRank = getRankInfo(stats, 'monthly');

  return (
    <div className="dashboard">
      {/* Affichage personnalisé */}
      <div className="rank-card">
        <h3>Classement Global</h3>
        <span className="rank">{globalRank.formatted}</span>
        <span className="details">
          {globalRank.rank > 0 && globalRank.total > 0 && 
            `sur ${globalRank.total} joueurs`
          }
        </span>
      </div>
      
      {/* Autres cartes... */}
    </div>
  );
}
```

---

## 🎨 Styles et Thèmes

### Variables CSS Utilisées

```css
/* Couleurs de thème */
--mvx-bg-color-primary
--mvx-bg-color-secondary
--mvx-text-color-primary
--mvx-text-color-secondary
--mvx-text-accent-color
--mvx-border-color-secondary

/* Utilisation dans les composants */
.dashboard-stats {
  background: var(--mvx-bg-color-secondary);
  color: var(--mvx-text-color-primary);
  border: 1px solid var(--mvx-border-color-secondary);
}
```

### Responsive Design

```css
@media (max-width: 768px) {
  .rankings {
    grid-template-columns: 1fr;
  }
  
  .rank-card {
    padding: 1rem;
  }
}
```

---

## 🔧 Configuration

### Import des Styles

```typescript
import { dashboardStatsStyles, compactDashboardStatsStyles } from 'components/DashboardStats.styles';

// Utilisation avec emotion
<div css={dashboardStatsStyles}>
  <DashboardStats />
</div>
```

### Configuration du Hook

```typescript
// Avec realtime désactivé
const { stats } = useDashboardStats(false);

// Avec realtime activé (par défaut)
const { stats } = useDashboardStats(true);
```

---

## 📊 Exemples de Données

### Réponse API

```json
{
  "success": true,
  "data": {
    "totalPoints": 542,
    "username": "NicoTest",
    "walletAddress": "erd13jepran6svqee2cgm6y8uz63ts9ecp7uhqmt04j6lsvwsdkre7lsl5ue3g",
    "globalRank": 1,
    "globalTotalUsers": 12,
    "weeklyRank": 1,
    "weeklyTotalUsers": 12,
    "monthlyRank": 1,
    "monthlyTotalUsers": 12
  }
}
```

### Formatage des Rangs

```typescript
// Cas normaux
formatRank(1, 100) // "#1/100"
formatRank(5, 50)  // "#5/50"

// Cas non classé
formatRank(0, 0)   // "Non classé"
formatRank(0, 10)  // "Non classé"
```

---

## 🚨 Gestion d'Erreurs

### États du Hook

```typescript
const { stats, loading, error, refresh } = useDashboardStats();

// loading: true - En cours de chargement
// error: Error - Erreur de récupération
// stats: null - Aucune donnée disponible
// stats: DashboardStats - Données disponibles
```

### Gestion des Erreurs

```typescript
if (error) {
  console.error('Erreur dashboard stats:', error);
  // Afficher message d'erreur
  // Proposer bouton de retry
}

if (!stats) {
  // Aucune donnée - utilisateur pas encore classé
  // Afficher message "Pas encore classé"
}
```

---

## ⚡ Performances

### Avantages

1. **Un seul appel API** au lieu de 3-4 appels
2. **Données complètes** avec total d'utilisateurs
3. **Cache automatique** via le hook
4. **Realtime updates** optionnels
5. **Gestion d'erreurs** robuste

### Optimisations

```typescript
// Éviter les re-renders inutiles
const memoizedStats = useMemo(() => stats, [stats]);

// Debounce des updates realtime
const debouncedRefresh = useCallback(
  debounce(refresh, 1000),
  [refresh]
);
```

---

## 🔄 Migration depuis l'Ancien Système

### Avant (Multiples Appels)

```typescript
// ❌ Ancien système
const allTimeRank = await getUserRank(userId, { type: 'all_time' });
const weeklyRank = await getUserRank(userId, { type: 'weekly' });
const monthlyRank = await getUserRank(userId, { type: 'monthly' });
const userProfile = await getUserProfile(userId);

// Pas d'info sur le total d'utilisateurs
// 4 appels API séparés
```

### Après (Un Seul Appel)

```typescript
// ✅ Nouveau système
const { stats } = useDashboardStats();

// Toutes les données en un appel
// Inclut automatiquement le total d'utilisateurs
// Gestion d'erreurs unifiée
```

---

## 📁 Fichiers Créés/Modifiés

### Nouveaux Fichiers
- `src/features/leaderboard/hooks/useDashboardStats.ts`
- `src/components/DashboardStats.tsx`
- `src/components/DashboardStats.styles.ts`

### Fichiers Modifiés
- `src/api/leaderboard.ts` - Ajout endpoint dashboard-stats
- `src/features/leaderboard/services/leaderboardService.ts` - Ajout getDashboardStats
- `src/features/leaderboard/hooks/index.ts` - Export nouveaux hooks
- `src/features/leaderboard/index.ts` - Export public API

---

## 🎯 Prochaines Étapes

1. **Tester l'endpoint** avec des données réelles
2. **Intégrer dans le dashboard** principal
3. **Ajouter animations** pour les transitions
4. **Optimiser le cache** si nécessaire
5. **Ajouter tests unitaires** pour les hooks

---

## ✨ Résumé

✅ **Endpoint API** - `/api/leaderboard/dashboard-stats`  
✅ **Service** - `getDashboardStats()`  
✅ **Hook React** - `useDashboardStats()`  
✅ **Composants UI** - `DashboardStats` & `CompactDashboardStats`  
✅ **Utilitaires** - `formatRank()` & `getRankInfo()`  
✅ **Styles** - CSS avec variables de thème  
✅ **Types** - TypeScript complet  
✅ **Documentation** - Exemples d'utilisation  

Le système est maintenant prêt pour être utilisé dans l'application ! 🚀