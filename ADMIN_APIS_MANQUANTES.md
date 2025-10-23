# 🔐 APIs Admin Manquantes - Backend GalacticX

## 📊 Ce qui EXISTE déjà

D'après ton guide backend et les routes publiques, tu as déjà :

### ✅ Routes Publiques/User Existantes
```
GET  /api/predictions                    # Liste des predictions actives
GET  /api/predictions/:id                # Détails d'une prediction
POST /api/predictions/:id/bet            # Placer un pari
GET  /api/predictions/user/predictions   # Predictions d'un user

GET  /api/leaderboard                    # Leaderboard
GET  /api/leaderboard/user-rank          # Rang de l'user
GET  /api/leaderboard/points-history     # Historique des points

GET  /api/wargames                       # Liste des war games
GET  /api/wargames/:id                   # Détails d'un war game
POST /api/wargames                       # Créer un war game
POST /api/wargames/:id/join              # Rejoindre un war game
DELETE /api/wargames/:id                 # Annuler un war game

GET  /api/teams/saved                    # Teams sauvegardées
POST /api/teams/saved                    # Créer une team
PUT  /api/teams/saved/:id                # Modifier une team
DELETE /api/teams/saved/:id              # Supprimer une team

GET  /api/nfts/user                      # NFTs d'un user
GET  /api/nfts/:identifier               # Détails d'un NFT

GET  /api/streaks/current                # Streak actuel
POST /api/streaks/claim                  # Réclamer un streak
GET  /api/streaks/history                # Historique des streaks

GET  /api/users/profile                  # Profil user
PUT  /api/users/username                 # Modifier username
GET  /api/users/stats                    # Stats user
```

---

## ❌ Ce qui MANQUE - APIs Admin

### 🎯 1. PREDICTIONS ADMIN

#### a) Gestion CRUD Basique
```typescript
// ✅ Déjà documenté dans ton guide
POST   /api/admin/predictions
PUT    /api/admin/predictions/:id
DELETE /api/admin/predictions/:id
```

#### b) Validation des Résultats
```typescript
// ✅ Déjà documenté dans ton guide  
POST /api/admin/predictions/:id/validate
Body: { winningOptionId: string }
Response: {
  success: boolean,
  prediction: Prediction,
  affectedUsers: number,
  totalWinnings: number
}
```

#### c) ❌ MANQUANT - Changement de Statut
```typescript
PUT /api/admin/predictions/:id/status
Body: { status: 'open' | 'closed' | 'cancelled' }
Response: { success: boolean, prediction: Prediction }
```

#### d) ❌ MANQUANT - Annulation avec Remboursement
```typescript
POST /api/admin/predictions/:id/cancel
Response: {
  success: boolean,
  refundedUsers: number,
  refundedAmount: number,
  message: string
}
```

#### e) ❌ MANQUANT - Voir les Paris d'une Prediction
```typescript
GET /api/admin/predictions/:id/bets
Response: {
  success: boolean,
  bets: Array<{
    userId: string,
    username: string,
    selectedOptionId: string,
    pointsWagered: number,
    pointsEarned: number,
    isCorrect: boolean | null,
    createdAt: string
  }>,
  total: number,
  stats: {
    totalPointsWagered: number,
    distributionByOption: Record<string, {
      count: number,
      totalPoints: number
    }>
  }
}
```

#### f) ❌ MANQUANT - Prévisualiser les Gagnants
```typescript
GET /api/admin/predictions/:id/winners-preview?winningOptionId=xxx
Response: {
  success: boolean,
  winningOptionId: string,
  calculationType: 'fixed_odds' | 'pool_ratio',
  totalPool: number,
  winningPool: number,
  losingPool: number,
  ratio?: number, // Si pool_ratio
  winners: Array<{
    userId: string,
    username: string,
    pointsWagered: number,
    estimatedWinnings: number
  }>,
  losersCount: number
}
```

---

### ⚔️ 2. WAR GAMES ADMIN

#### a) ❌ MANQUANT - Obtenir TOUS les War Games (Admin View)
```typescript
GET /api/admin/wargames?status=all&limit=100&offset=0
Response: {
  success: boolean,
  warGames: Array<WarGame>, // Inclut status 'cancelled', 'expired', etc.
  total: number
}
```

#### b) ❌ MANQUANT - Valider le Résultat d'un War Game
```typescript
POST /api/admin/wargames/:id/validate
Body: {
  winnerId: string, // userId du gagnant
  creatorScore: number,
  opponentScore: number
}
Response: {
  success: boolean,
  warGame: WarGame,
  winnerPayout: number,
  message: string
}
```

#### c) ❌ MANQUANT - Annuler un War Game (Force)
```typescript
POST /api/admin/wargames/:id/force-cancel
Body: { reason: string }
Response: {
  success: boolean,
  refundedUsers: number,
  refundedAmount: number
}
```

#### d) ❌ MANQUANT - Statistiques War Games
```typescript
GET /api/admin/wargames/stats
Response: {
  totalGames: number,
  byStatus: {
    open: number,
    in_progress: number,
    completed: number,
    cancelled: number
  },
  totalPointsStaked: number,
  averageStake: number,
  mostActiveUsers: Array<{
    userId: string,
    username: string,
    gamesPlayed: number,
    winRate: number
  }>
}
```

---

### 👥 3. USERS ADMIN

#### a) ❌ MANQUANT - Liste de TOUS les Utilisateurs
```typescript
GET /api/admin/users?limit=100&offset=0&search=&sortBy=created_at&role=all
Response: {
  success: boolean,
  users: Array<{
    id: string,
    walletAddress: string,
    username: string,
    role: string,
    totalPoints: number,
    nftCount: number,
    createdAt: string,
    lastActive?: string
  }>,
  total: number,
  hasMore: boolean
}
```

#### b) ❌ MANQUANT - Détails Complets d'un User
```typescript
GET /api/admin/users/:id
Response: {
  success: boolean,
  user: User,
  stats: {
    totalPredictions: number,
    correctPredictions: number,
    winRate: number,
    totalWarGames: number,
    warGamesWon: number,
    totalPointsEarned: number,
    totalPointsSpent: number,
    netPoints: number
  },
  recentActivity: Array<{
    type: string,
    description: string,
    timestamp: string
  }>
}
```

#### c) ❌ MANQUANT - Changer le Rôle d'un User
```typescript
PUT /api/admin/users/:id/role
Body: { role: 'user' | 'king' | 'banned' }
Response: {
  success: boolean,
  user: User,
  message: string
}
```

#### d) ❌ MANQUANT - Ajuster les Points Manuellement
```typescript
POST /api/admin/users/:id/adjust-points
Body: {
  amount: number, // positif = ajouter, négatif = retirer
  reason: string,
  metadata?: any
}
Response: {
  success: boolean,
  newTotalPoints: number,
  transaction: PointsTransaction
}
```

#### e) ❌ MANQUANT - Bannir/Débannir
```typescript
POST /api/admin/users/:id/ban
Body: { reason: string, duration?: number } // duration en jours

POST /api/admin/users/:id/unban
```

---

### 🏆 4. LEADERBOARD ADMIN

#### a) ❌ MANQUANT - Ajuster Points Manuellement (Global)
```typescript
POST /api/admin/leaderboard/adjust-points
Body: {
  userId: string,
  amount: number,
  reason: string,
  sourceType: 'admin_adjustment'
}
Response: {
  success: boolean,
  transaction: PointsTransaction,
  newUserPoints: number
}
```

#### b) ❌ MANQUANT - Reset Leaderboard
```typescript
POST /api/admin/leaderboard/reset
Body: {
  type: 'weekly' | 'monthly',
  confirmationCode: string
}
Response: {
  success: boolean,
  message: string,
  affectedUsers: number
}
```

#### c) ❌ MANQUANT - Statistiques Globales
```typescript
GET /api/admin/leaderboard/stats
Response: {
  totalUsers: number,
  totalPointsInCirculation: number,
  pointsDistributedToday: number,
  pointsDistributedThisWeek: number,
  topEarners: Array<{userId, username, totalEarned}>,
  topSpenders: Array<{userId, username, totalSpent}>,
  averageUserPoints: number,
  medianUserPoints: number
}
```

---

### 🎯 5. STREAKS ADMIN

#### a) ❌ MANQUANT - Statistiques des Streaks
```typescript
GET /api/admin/streaks/stats
Response: {
  currentWeek: {
    totalActiveStreaks: number,
    completedStreaks: number,
    averageProgress: number,
    pointsDistributed: number
  },
  allTime: {
    totalStreaksCompleted: number,
    totalPointsDistributed: number,
    mostConsistentUsers: Array<{userId, username, weeksCompleted}>
  }
}
```

#### b) ❌ MANQUANT - Ajuster le Streak d'un User
```typescript
POST /api/admin/streaks/:userId/adjust
Body: {
  action: 'reset' | 'complete_day' | 'complete_week',
  dayOfWeek?: DayOfWeek,
  reason: string
}
Response: {
  success: boolean,
  weekStreak: WeekStreak,
  message: string
}
```

---

### 📊 6. ANALYTICS & MONITORING ADMIN

#### a) ❌ MANQUANT - Vue d'Ensemble (Dashboard)
```typescript
GET /api/admin/analytics/overview
Response: {
  users: {
    total: number,
    activeToday: number,
    activeThisWeek: number,
    newThisWeek: number
  },
  predictions: {
    total: number,
    open: number,
    totalBets: number,
    totalPointsWagered: number
  },
  warGames: {
    total: number,
    active: number,
    totalPointsStaked: number
  },
  economy: {
    totalPointsInCirculation: number,
    pointsDistributedToday: number,
    pointsDistributedThisWeek: number
  },
  engagement: {
    dailyActiveUsers: Array<{date: string, count: number}>,
    predictionParticipation: number, // %
    warGameParticipation: number // %
  }
}
```

#### b) ❌ MANQUANT - Activité Récente
```typescript
GET /api/admin/analytics/activity?hours=24&limit=100
Response: {
  logins: Array<{timestamp, userId, username}>,
  predictions: Array<{timestamp, predictionId, userId, pointsWagered}>,
  warGames: Array<{timestamp, warGameId, userId, action}>,
  pointsTransactions: Array<{timestamp, userId, amount, type}>
}
```

---

### 🛠️ 7. SYSTEM ADMIN

#### a) ❌ MANQUANT - Health Check Détaillé
```typescript
GET /api/admin/system/health
Response: {
  status: 'healthy' | 'degraded' | 'down',
  timestamp: string,
  uptime: number,
  services: {
    database: {
      connected: boolean,
      latency: number,
      activeConnections: number
    },
    multiversxAPI: {
      available: boolean,
      latency: number
    },
    cache: {
      hitRate: number,
      size: number
    }
  },
  memory: {
    used: number,
    total: number,
    percentage: number
  },
  errors: Array<{timestamp, type, message}>
}
```

#### b) ❌ MANQUANT - Gestion du Cache
```typescript
POST /api/admin/system/cache/clear
Body: { type: 'all' | 'users' | 'nfts' | 'predictions' }

GET /api/admin/system/cache/stats
Response: {
  totalEntries: number,
  hitRate: number,
  missRate: number,
  byType: Record<string, {entries: number, size: number}>
}
```

#### c) ❌ MANQUANT - Logs Système
```typescript
GET /api/admin/system/logs?level=error&limit=100&offset=0
Response: {
  logs: Array<{
    timestamp: string,
    level: string,
    message: string,
    context?: any
  }>,
  total: number
}
```

---

## 🔒 Middleware Admin Requis

Pour TOUTES ces routes, tu dois avoir un middleware `requireAdmin`:

```typescript
// backend/src/middlewares/adminAuth.middleware.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/types';

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (user.role !== 'king') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required. Your role: ' + user.role
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authorization check failed'
    });
  }
};
```

---

## 📋 Structure des Routes Admin

```typescript
// backend/src/routes/admin.routes.ts
import { Router } from 'express';
import { AdminPredictionsController } from '@/controllers/admin/predictions.controller';
import { AdminWarGamesController } from '@/controllers/admin/wargames.controller';
import { AdminUsersController } from '@/controllers/admin/users.controller';
import { AdminLeaderboardController } from '@/controllers/admin/leaderboard.controller';
import { AdminStreaksController } from '@/controllers/admin/streaks.controller';
import { AdminAnalyticsController } from '@/controllers/admin/analytics.controller';
import { AdminSystemController } from '@/controllers/admin/system.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { requireAdmin } from '@/middlewares/adminAuth.middleware';

const router = Router();

// Tous les endpoints admin nécessitent auth + admin
router.use(authMiddleware);
router.use(requireAdmin);

// ========================================
// PREDICTIONS ADMIN
// ========================================
router.post('/predictions', AdminPredictionsController.create);
router.put('/predictions/:id', AdminPredictionsController.update);
router.delete('/predictions/:id', AdminPredictionsController.delete);
router.put('/predictions/:id/status', AdminPredictionsController.updateStatus);
router.post('/predictions/:id/validate', AdminPredictionsController.validateResult);
router.post('/predictions/:id/cancel', AdminPredictionsController.cancelWithRefund);
router.get('/predictions/:id/bets', AdminPredictionsController.getBets);
router.get('/predictions/:id/winners-preview', AdminPredictionsController.previewWinners);

// ========================================
// WAR GAMES ADMIN
// ========================================
router.get('/wargames', AdminWarGamesController.getAll);
router.post('/wargames/:id/validate', AdminWarGamesController.validateResult);
router.post('/wargames/:id/force-cancel', AdminWarGamesController.forceCancel);
router.get('/wargames/stats', AdminWarGamesController.getStats);

// ========================================
// USERS ADMIN
// ========================================
router.get('/users', AdminUsersController.getAll);
router.get('/users/:id', AdminUsersController.getDetails);
router.put('/users/:id/role', AdminUsersController.updateRole);
router.post('/users/:id/adjust-points', AdminUsersController.adjustPoints);
router.post('/users/:id/ban', AdminUsersController.ban);
router.post('/users/:id/unban', AdminUsersController.unban);

// ========================================
// LEADERBOARD ADMIN
// ========================================
router.post('/leaderboard/adjust-points', AdminLeaderboardController.adjustPoints);
router.post('/leaderboard/reset', AdminLeaderboardController.reset);
router.get('/leaderboard/stats', AdminLeaderboardController.getStats);

// ========================================
// STREAKS ADMIN
// ========================================
router.get('/streaks/stats', AdminStreaksController.getStats);
router.post('/streaks/:userId/adjust', AdminStreaksController.adjustUserStreak);

// ========================================
// ANALYTICS ADMIN
// ========================================
router.get('/analytics/overview', AdminAnalyticsController.getOverview);
router.get('/analytics/activity', AdminAnalyticsController.getRecentActivity);

// ========================================
// SYSTEM ADMIN
// ========================================
router.get('/system/health', AdminSystemController.getHealth);
router.post('/system/cache/clear', AdminSystemController.clearCache);
router.get('/system/cache/stats', AdminSystemController.getCacheStats);
router.get('/system/logs', AdminSystemController.getLogs);

export default router;
```

---

## 🎯 Ordre d'Implémentation Recommandé

### Phase 1 - Critique ⭐⭐⭐ (Commence par ça)
1. **Predictions Admin**
   - `PUT /admin/predictions/:id/status` - Changer statut
   - `POST /admin/predictions/:id/cancel` - Annuler avec remboursement
   - `GET /admin/predictions/:id/bets` - Voir les paris
   - `GET /admin/predictions/:id/winners-preview` - Prévisualiser gagnants

2. **Users Admin**
   - `GET /admin/users` - Liste des users
   - `GET /admin/users/:id` - Détails user
   - `PUT /admin/users/:id/role` - Changer rôle
   - `POST /admin/users/:id/adjust-points` - Ajuster points

### Phase 2 - Important ⭐⭐
3. **War Games Admin**
   - `GET /admin/wargames` - Tous les war games
   - `POST /admin/wargames/:id/validate` - Valider résultat
   - `GET /admin/wargames/stats` - Stats

4. **Analytics**
   - `GET /admin/analytics/overview` - Dashboard
   - `GET /admin/analytics/activity` - Activité récente

### Phase 3 - Nice to Have ⭐
5. **Leaderboard Admin**
   - `GET /admin/leaderboard/stats` - Stats globales
   - `POST /admin/leaderboard/adjust-points` - Ajuster points

6. **System**
   - `GET /admin/system/health` - Health check
   - `POST /admin/system/cache/clear` - Vider cache

7. **Streaks Admin**
   - `GET /admin/streaks/stats` - Stats des streaks

---

## 📝 Résumé Quantitatif

| Catégorie | Endpoints à Créer |
|-----------|-------------------|
| Predictions Admin | 6 endpoints |
| War Games Admin | 4 endpoints |
| Users Admin | 6 endpoints |
| Leaderboard Admin | 3 endpoints |
| Streaks Admin | 2 endpoints |
| Analytics Admin | 2 endpoints |
| System Admin | 4 endpoints |
| **TOTAL** | **27 endpoints** |

---

## 🚀 Ce que tu dois faire maintenant

1. **Créer le middleware `requireAdmin`** (priorité 1)
2. **Créer la structure `/controllers/admin/`** avec les controllers
3. **Implémenter Phase 1** (Predictions + Users - 12 endpoints)
4. **Tester avec Swagger/Postman**
5. **Implémenter Phase 2** (War Games + Analytics - 6 endpoints)
6. **Implémenter Phase 3** (Le reste - 9 endpoints)

---

**📌 Note**: Toutes ces routes doivent utiliser le JWT existant et vérifier `user.role === 'king'` via le middleware.

