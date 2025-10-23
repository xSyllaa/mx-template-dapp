# 🚀 GalacticX Backend - Guide de Développement Complet

## 📋 Table des Matières
1. [Stack Technique](#stack-technique)
2. [Architecture du Projet](#architecture-du-projet)
3. [Configuration & Installation](#configuration--installation)
4. [Modèles de Données](#modèles-de-données)
5. [Endpoints API Détaillés](#endpoints-api-détaillés)
6. [Authentification & Sécurité](#authentification--sécurité)
7. [Services & Controllers](#services--controllers)
8. [Middlewares](#middlewares)
9. [Configuration Prisma](#configuration-prisma)
10. [Tests](#tests)
11. [Déploiement](#déploiement)
12. [Variables d'Environnement](#variables-denvironnement)

---

## 🛠 Stack Technique

### Framework Principal : Express.js + TypeScript + Prisma

**Pourquoi cette stack ?**
- ✅ **TypeScript** : Cohérence avec le frontend React + type safety
- ✅ **Express.js** : Écosystème mature, middlewares nombreux, debugging facile
- ✅ **Prisma** : ORM excellent avec Supabase, génération types automatique
- ✅ **Zod** : Validation robuste et type-safe
- ✅ **JWT** : Authentification stateless
- ✅ **Swagger** : Documentation API automatique

### Dépendances Principales

```json
{
  "name": "galacticx-backend",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "prisma": "^5.6.0",
    "@prisma/client": "^5.6.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "zod": "^3.22.4",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "winston": "^3.11.0",
    "dotenv": "^16.3.1",
    "express-rate-limit": "^7.1.5",
    "swagger-ui-express": "^5.0.0",
    "swagger-jsdoc": "^6.2.8",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.9.0",
    "@types/swagger-ui-express": "^4.1.6",
    "@types/swagger-jsdoc": "^6.0.4",
    "typescript": "^5.2.2",
    "nodemon": "^3.0.1",
    "ts-node": "^10.9.1",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.8",
    "supertest": "^6.3.3",
    "@types/supertest": "^2.0.16"
  }
}
```

---

## 🏗 Architecture du Projet

### Structure Complète des Dossiers

```
galacticx-backend/
├── src/
│   ├── controllers/              # Route handlers
│   │   ├── auth.controller.ts
│   │   ├── predictions.controller.ts
│   │   ├── leaderboard.controller.ts
│   │   ├── wargames.controller.ts
│   │   ├── nfts.controller.ts
│   │   ├── streaks.controller.ts
│   │   ├── users.controller.ts
│   │   ├── teams.controller.ts
│   │   └── admin.controller.ts
│   ├── services/                 # Business logic
│   │   ├── auth.service.ts
│   │   ├── predictions.service.ts
│   │   ├── leaderboard.service.ts
│   │   ├── wargames.service.ts
│   │   ├── nfts.service.ts
│   │   ├── streaks.service.ts
│   │   ├── users.service.ts
│   │   ├── teams.service.ts
│   │   └── multiversx.service.ts
│   ├── middlewares/              # Express middlewares
│   │   ├── auth.middleware.ts
│   │   ├── admin.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── error.middleware.ts
│   ├── routes/                   # Route definitions
│   │   ├── auth.routes.ts
│   │   ├── predictions.routes.ts
│   │   ├── leaderboard.routes.ts
│   │   ├── wargames.routes.ts
│   │   ├── nfts.routes.ts
│   │   ├── streaks.routes.ts
│   │   ├── users.routes.ts
│   │   ├── teams.routes.ts
│   │   └── admin.routes.ts
│   ├── types/                    # TypeScript types
│   │   ├── auth.types.ts
│   │   ├── predictions.types.ts
│   │   ├── leaderboard.types.ts
│   │   ├── wargames.types.ts
│   │   ├── nfts.types.ts
│   │   ├── common.types.ts
│   │   └── api.types.ts
│   ├── utils/                    # Utilities
│   │   ├── logger.ts
│   │   ├── validation.ts
│   │   ├── jwt.utils.ts
│   │   ├── multiversx.utils.ts
│   │   └── response.utils.ts
│   ├── config/                   # Configuration
│   │   ├── database.ts
│   │   ├── cors.ts
│   │   ├── swagger.ts
│   │   └── constants.ts
│   └── app.ts                    # Express app setup
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Database migrations
│   └── seed.ts                  # Database seeding
├── tests/                        # Tests
│   ├── controllers/
│   ├── services/
│   ├── utils/
│   └── setup.ts
├── docs/                         # Documentation
│   ├── api.md
│   └── deployment.md
├── .env.example                  # Environment template
├── .gitignore
├── tsconfig.json
├── jest.config.js
├── nodemon.json
└── README.md
```

---

## ⚙️ Configuration & Installation

### 1. Template de Démarrage (Option Recommandée)

```bash
# Cloner le template Express TypeScript
npx degit ljlm0402/typescript-express-starter galacticx-backend
cd galacticx-backend

# Installer les dépendances
npm install

# Ajouter Prisma
npm install prisma @prisma/client
npm install -D prisma

# Initialiser Prisma
npx prisma init

# Copier la configuration
cp .env.example .env
```

### 2. Configuration TypeScript (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@/controllers/*": ["controllers/*"],
      "@/services/*": ["services/*"],
      "@/middlewares/*": ["middlewares/*"],
      "@/types/*": ["types/*"],
      "@/utils/*": ["utils/*"],
      "@/config/*": ["config/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 3. Scripts Package.json

```json
{
  "scripts": {
    "start": "node dist/app.js",
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "test": "jest",
    "test:watch": "jest --watch",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "ts-node prisma/seed.ts"
  }
}
```

---

## 🗄 Modèles de Données

### Schema Prisma Complet (prisma/schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================
// USERS & AUTHENTICATION
// ============================================================

model User {
  id                    String    @id @default(uuid())
  walletAddress         String    @unique @map("wallet_address")
  username              String?   @unique
  role                  Role      @default(USER)
  totalPoints          Int       @default(0) @map("total_points")
  currentStreak        Int       @default(0) @map("current_streak")
  streakLastClaim      DateTime? @map("streak_last_claim")
  nftCount             Int       @default(0) @map("nft_count")
  avatarUrl            String?   @map("avatar_url")
  usernameLastModified DateTime? @map("username_last_modified")
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")
  
  // Relations
  predictions          UserPrediction[]
  warGamesAsCreator    WarGame[] @relation("CreatorGames")
  warGamesAsOpponent   WarGame[] @relation("OpponentGames")
  pointsTransactions   PointsTransaction[]
  weeklyStreaks        WeeklyStreak[]
  savedTeams           SavedTeam[]
  createdPredictions   Prediction[] @relation("CreatedBy")
  createdTeamsOfWeek   TeamOfWeek[] @relation("CreatedBy")
  
  @@map("users")
}

enum Role {
  USER  @map("user")
  ADMIN @map("admin")
  KING  @map("king")
}

// ============================================================
// PREDICTIONS SYSTEM
// ============================================================

model Prediction {
  id                   String    @id @default(uuid())
  competition          String
  homeTeam            String    @map("home_team")
  awayTeam            String    @map("away_team")
  betType             String    @map("bet_type")
  betCalculationType  String    @map("bet_calculation_type")
  extendedBetType     String    @map("extended_bet_type")
  options             Json      // Array of betting options
  startDate           DateTime  @map("start_date")
  closeDate           DateTime  @map("close_date")
  pointsReward        Int       @map("points_reward")
  minBetPoints        Int       @map("min_bet_points")
  maxBetPoints        Int       @map("max_bet_points")
  status              PredictionStatus
  winningOptionId     String?   @map("winning_option_id")
  createdBy           String    @map("created_by")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")
  
  // Relations
  creator             User @relation("CreatedBy", fields: [createdBy], references: [id])
  userPredictions     UserPrediction[]
  
  @@map("predictions")
}

enum PredictionStatus {
  OPEN      @map("open")
  CLOSED    @map("closed")
  RESULTED  @map("resulted")
  CANCELLED @map("cancelled")
}

model UserPrediction {
  id                String    @id @default(uuid())
  userId            String    @map("user_id")
  predictionId      String    @map("prediction_id")
  selectedOptionId  String    @map("selected_option_id")
  pointsWagered     Int       @map("points_wagered")
  pointsEarned      Int       @default(0) @map("points_earned")
  isCorrect         Boolean?  @map("is_correct")
  createdAt         DateTime  @default(now()) @map("created_at")
  
  // Relations
  user              User @relation(fields: [userId], references: [id], onDelete: Cascade)
  prediction        Prediction @relation(fields: [predictionId], references: [id], onDelete: Cascade)
  
  @@unique([userId, predictionId])
  @@map("user_predictions")
}

// ============================================================
// WAR GAMES SYSTEM
// ============================================================

model WarGame {
  id              String        @id @default(uuid())
  creatorId       String        @map("creator_id")
  creatorTeamId   String        @map("creator_team_id")
  opponentId      String?       @map("opponent_id")
  opponentTeamId  String?       @map("opponent_team_id")
  pointsStake     Int           @map("points_stake")
  entryDeadline   DateTime      @map("entry_deadline")
  status          WarGameStatus
  winnerId        String?       @map("winner_id")
  creatorScore    Int?          @map("creator_score")
  opponentScore   Int?          @map("opponent_score")
  createdAt       DateTime      @default(now()) @map("created_at")
  startedAt       DateTime?     @map("started_at")
  completedAt     DateTime?     @map("completed_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")
  
  // Relations
  creator         User @relation("CreatorGames", fields: [creatorId], references: [id])
  opponent        User? @relation("OpponentGames", fields: [opponentId], references: [id])
  creatorTeam     SavedTeam @relation("CreatorTeam", fields: [creatorTeamId], references: [id])
  opponentTeam    SavedTeam? @relation("OpponentTeam", fields: [opponentTeamId], references: [id])
  
  @@map("war_games")
}

enum WarGameStatus {
  OPEN        @map("open")
  IN_PROGRESS @map("in_progress")
  COMPLETED   @map("completed")
  CANCELLED   @map("cancelled")
}

model SavedTeam {
  id            String    @id @default(uuid())
  userId        String    @map("user_id")
  name          String
  formation     String    // "4-3-3", "4-4-2", etc.
  nfts          Json      // Array of NFT identifiers with positions
  totalScore    Float     @map("total_score")
  isValid       Boolean   @default(true) @map("is_valid")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  // Relations
  user                  User @relation(fields: [userId], references: [id], onDelete: Cascade)
  warGamesAsCreator     WarGame[] @relation("CreatorTeam")
  warGamesAsOpponent    WarGame[] @relation("OpponentTeam")
  
  @@map("war_game_teams")
}

// ============================================================
// LEADERBOARD & POINTS
// ============================================================

model PointsTransaction {
  id          String           @id @default(uuid())
  userId      String           @map("user_id")
  amount      Int              // Can be negative for losses
  sourceType  PointsSourceType @map("source_type")
  sourceId    String?          @map("source_id")
  metadata    Json?            // Additional context
  createdAt   DateTime         @default(now()) @map("created_at")
  
  // Relations
  user        User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, createdAt])
  @@index([sourceType])
  @@map("points_transactions")
}

enum PointsSourceType {
  PREDICTION_BET     @map("prediction_bet")
  PREDICTION_WIN     @map("prediction_win")
  STREAK_CLAIM       @map("streak_claim")
  WAR_GAME_WIN       @map("war_game_win")
  WAR_GAME_LOSS      @map("war_game_loss")
  ADMIN_ADJUSTMENT   @map("admin_adjustment")
  BONUS              @map("bonus")
}

// ============================================================
// STREAKS SYSTEM
// ============================================================

model WeeklyStreak {
  id           String    @id @default(uuid())
  userId       String    @map("user_id")
  weekStart    String    @map("week_start") // YYYY-MM-DD format
  claims       Json      // Object with day claims: { monday: true, tuesday: false, ... }
  totalPoints  Int       @default(0) @map("total_points")
  bonusTokens  Int       @default(0) @map("bonus_tokens")
  completed    Boolean   @default(false)
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  
  // Relations
  user         User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, weekStart])
  @@map("weekly_streaks")
}

// ============================================================
// TEAM OF THE WEEK
// ============================================================

model TeamOfWeek {
  id            String    @id @default(uuid())
  weekStartDate String    @map("week_start_date")
  weekEndDate   String    @map("week_end_date")
  title         String
  description   String?
  players       Json      // Array of player NFT identifiers
  totalHolders  Int       @default(0) @map("total_holders")
  createdBy     String    @map("created_by")
  isActive      Boolean   @default(false) @map("is_active")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  // Relations
  creator       User @relation("CreatedBy", fields: [createdBy], references: [id])
  
  @@map("team_of_week")
}
```

---

## 📡 Endpoints API Détaillés

### 1. Authentication Endpoints

```typescript
// POST /api/auth/login
interface LoginRequest {
  walletAddress: string;
  signature: string;
  message: string;
}

interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    walletAddress: string;
    username?: string;
    role: string;
    totalPoints: number;
  };
  accessToken: string;
  expiresIn: number;
}

// GET /api/auth/me
interface MeResponse {
  user: {
    id: string;
    walletAddress: string;
    username?: string;
    role: string;
    totalPoints: number;
    currentStreak: number;
    nftCount: number;
    avatarUrl?: string;
    createdAt: string;
  };
}

// POST /api/auth/refresh
interface RefreshRequest {
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}
```

### 2. Predictions Endpoints

```typescript
// GET /api/predictions
interface PredictionsQuery {
  status?: 'open' | 'closed' | 'resulted';
  limit?: number;
  offset?: number;
}

interface PredictionsResponse {
  predictions: Prediction[];
  total: number;
  hasMore: boolean;
}

// POST /api/predictions/:id/bet
interface BetRequest {
  selectedOptionId: string;
  pointsWagered: number;
}

interface BetResponse {
  success: boolean;
  userPrediction: UserPrediction;
  message: string;
}

// GET /api/predictions/user
interface UserPredictionsQuery {
  status?: 'active' | 'completed';
  limit?: number;
  offset?: number;
}

// POST /api/admin/predictions (Admin only)
interface CreatePredictionRequest {
  competition: string;
  homeTeam: string;
  awayTeam: string;
  betType: string;
  betCalculationType: string;
  extendedBetType: string;
  options: Array<{
    id: string;
    label: string;
    odds?: number;
  }>;
  startDate: string;
  closeDate: string;
  pointsReward: number;
  minBetPoints: number;
  maxBetPoints: number;
}

// POST /api/admin/predictions/:id/validate (Admin only)
interface ValidateResultRequest {
  winningOptionId: string;
}

interface ValidateResultResponse {
  success: boolean;
  prediction: Prediction;
  affectedUsers: number;
  totalWinnings: number;
}
```

### 3. Leaderboard Endpoints

```typescript
// GET /api/leaderboard
interface LeaderboardQuery {
  type: 'all_time' | 'weekly' | 'monthly';
  week?: number;
  month?: number;
  year?: number;
  sourceTypes?: string[]; // Filter by points source types
  limit?: number;
}

interface LeaderboardResponse {
  entries: Array<{
    userId: string;
    username?: string;
    avatarUrl?: string;
    points: number;
    rank: number;
  }>;
  total: number;
}

// GET /api/leaderboard/user-rank
interface UserRankQuery {
  type: 'all_time' | 'weekly' | 'monthly';
  week?: number;
  month?: number;
  year?: number;
}

interface UserRankResponse {
  userId: string;
  username?: string;
  points: number;
  rank: number;
  totalUsers: number;
}

// POST /api/leaderboard/points (Internal/Admin)
interface RecordPointsRequest {
  userId: string;
  amount: number;
  sourceType: PointsSourceType;
  sourceId?: string;
  metadata?: Record<string, any>;
}
```

### 4. War Games Endpoints

```typescript
// GET /api/wargames
interface WarGamesQuery {
  status?: 'open' | 'in_progress' | 'completed';
  userId?: string; // Filter by user participation
  limit?: number;
  offset?: number;
}

interface WarGamesResponse {
  warGames: WarGameWithDetails[];
  total: number;
  hasMore: boolean;
}

// POST /api/wargames
interface CreateWarGameRequest {
  teamId: string;
  pointsStake: number;
  entryDeadline: string; // ISO date string
}

interface CreateWarGameResponse {
  success: boolean;
  warGame: WarGame;
}

// POST /api/wargames/:id/join
interface JoinWarGameRequest {
  teamId: string;
}

interface JoinWarGameResponse {
  success: boolean;
  warGame: WarGame;
  message: string;
}

// DELETE /api/wargames/:id (Cancel war game)
interface CancelWarGameResponse {
  success: boolean;
  message: string;
}
```

### 5. NFTs & Collection Endpoints

```typescript
// GET /api/nfts/collection
interface CollectionInfoResponse {
  collection: string;
  name: string;
  ticker: string;
  owner: string;
  timestamp: number;
  canFreeze: boolean;
  canWipe: boolean;
  canPause: boolean;
  canTransferRole: boolean;
  canMint: boolean;
  canBurn: boolean;
  nfts: number;
  holders: number;
}

// GET /api/nfts/user
interface UserNFTsQuery {
  walletAddress: string;
  withMetadata?: boolean;
  size?: number;
  from?: number;
}

interface UserNFTsResponse {
  nfts: GalacticXNFT[];
  total: number;
  hasMore: boolean;
}

// GET /api/nfts/:identifier
interface NFTDetailsResponse {
  nft: GalacticXNFT;
  holders?: Array<{
    address: string;
    balance: string;
  }>;
}

// GET /api/nfts/holders/:identifier
interface NFTHoldersResponse {
  holders: Array<{
    address: string;
    balance: string;
  }>;
  total: number;
}
```

### 6. Streaks Endpoints

```typescript
// GET /api/streaks/current
interface CurrentStreakResponse {
  weekStreak: WeekStreak | null;
  currentDay: string; // monday, tuesday, etc.
  canClaim: boolean;
  nextReward: number;
  consecutiveDays: number;
}

// POST /api/streaks/claim
interface ClaimStreakRequest {
  dayOfWeek: string; // monday, tuesday, etc.
}

interface ClaimStreakResponse {
  success: boolean;
  pointsEarned: number;
  consecutiveDays: number;
  totalPoints: number;
  message: string;
}

// GET /api/streaks/history
interface StreakHistoryQuery {
  weeks?: number; // Number of weeks to fetch (default: 4)
}

interface StreakHistoryResponse {
  streaks: WeekStreak[];
  totalWeeks: number;
}
```

### 7. Users & Profile Endpoints

```typescript
// GET /api/users/profile
interface UserProfileResponse {
  user: {
    id: string;
    walletAddress: string;
    username?: string;
    role: string;
    totalPoints: number;
    currentStreak: number;
    nftCount: number;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// PUT /api/users/profile
interface UpdateProfileRequest {
  username?: string;
  avatarUrl?: string;
}

// PUT /api/users/username
interface UpdateUsernameRequest {
  username: string;
}

interface UpdateUsernameResponse {
  success: boolean;
  message?: string;
  nextAvailableDate?: string;
}

// GET /api/users/points-history
interface PointsHistoryQuery {
  limit?: number;
  offset?: number;
  sourceType?: PointsSourceType;
}

interface PointsHistoryResponse {
  transactions: PointsTransaction[];
  total: number;
  hasMore: boolean;
}
```

### 8. Saved Teams Endpoints

```typescript
// GET /api/teams/saved
interface SavedTeamsResponse {
  teams: SavedTeam[];
  total: number;
}

// POST /api/teams/saved
interface CreateSavedTeamRequest {
  name: string;
  formation: string;
  nfts: Array<{
    identifier: string;
    position: string;
    playerId?: number;
  }>;
}

interface CreateSavedTeamResponse {
  success: boolean;
  team: SavedTeam;
}

// PUT /api/teams/saved/:id
interface UpdateSavedTeamRequest {
  name?: string;
  formation?: string;
  nfts?: Array<{
    identifier: string;
    position: string;
    playerId?: number;
  }>;
}

// DELETE /api/teams/saved/:id
interface DeleteSavedTeamResponse {
  success: boolean;
  message: string;
}
```

### 9. Team of Week Endpoints

```typescript
// GET /api/team-of-week/active
interface ActiveTeamOfWeekResponse {
  team: TeamOfWeek | null;
}

// GET /api/team-of-week/all (Admin only)
interface AllTeamsOfWeekResponse {
  teams: TeamOfWeek[];
  total: number;
}

// POST /api/team-of-week (Admin only)
interface CreateTeamOfWeekRequest {
  weekStartDate: string;
  weekEndDate: string;
  title: string;
  description?: string;
  players: string[]; // Array of NFT identifiers
}

// PUT /api/team-of-week/:id (Admin only)
interface UpdateTeamOfWeekRequest {
  title?: string;
  description?: string;
  players?: string[];
  isActive?: boolean;
}
```

---

## 🔐 Authentification & Sécurité

### JWT Configuration

```typescript
// src/utils/jwt.utils.ts
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

interface JWTPayload {
  sub: string; // user ID
  walletAddress: string;
  role: string;
  aud: string;
  exp: number;
  iat: number;
  iss: string;
}

export const generateAccessToken = (user: User): string => {
  const payload: JWTPayload = {
    sub: user.id,
    walletAddress: user.walletAddress,
    role: user.role,
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    iat: Math.floor(Date.now() / 1000),
    iss: 'galacticx-api'
  };

  return jwt.sign(payload, process.env.JWT_SECRET!);
};

export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch (error) {
    return null;
  }
};
```

### MultiversX Signature Verification

```typescript
// src/utils/multiversx.utils.ts
import { UserSigner, UserVerifier, Address } from '@multiversx/sdk-core';

export const verifyMultiversXSignature = async (
  walletAddress: string,
  message: string,
  signature: string
): Promise<boolean> => {
  try {
    const userAddress = new Address(walletAddress);
    const messageBytes = Buffer.from(message, 'utf8');
    const signatureBytes = Buffer.from(signature, 'hex');
    
    const verifier = new UserVerifier();
    return await verifier.verify(messageBytes, signatureBytes, userAddress);
  } catch (error) {
    console.error('MultiversX signature verification failed:', error);
    return false;
  }
};

export const generateAuthMessage = (walletAddress: string): string => {
  const nonce = Math.random().toString(36).substring(7);
  const timestamp = Date.now();
  
  return `GalacticX Authentication
Wallet: ${walletAddress}
Nonce: ${nonce}
Timestamp: ${timestamp}

Please sign this message to authenticate with GalacticX.`;
};
```

---

## 🛡 Middlewares

### Authentication Middleware

```typescript
// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/jwt.utils';
import { prisma } from '@/config/database';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    walletAddress: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    if (!payload) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired access token'
      });
    }

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.sub }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    req.user = {
      id: user.id,
      walletAddress: user.walletAddress,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};
```

### Admin Middleware

```typescript
// src/middlewares/admin.middleware.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

export const adminMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'KING') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  next();
};

export const kingMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (req.user.role !== 'KING') {
    return res.status(403).json({
      success: false,
      error: 'King access required'
    });
  }

  next();
};
```

### Validation Middleware

```typescript
// src/middlewares/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Query validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Parameters validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  };
};
```

### Rate Limiting Middleware

```typescript
// src/middlewares/rateLimit.middleware.ts
import rateLimit from 'express-rate-limit';

// General API rate limit
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Auth endpoints rate limit (more restrictive)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.'
  }
});

// Predictions betting rate limit
export const bettingRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 bets per minute
  message: {
    success: false,
    error: 'Too many betting requests, please slow down.'
  }
});
```

---

## 📊 Services Examples

### Predictions Service

```typescript
// src/services/predictions.service.ts
import { prisma } from '@/config/database';
import { Prediction, UserPrediction, PredictionStatus } from '@prisma/client';

export class PredictionsService {
  // Get active predictions
  static async getActivePredictions(): Promise<Prediction[]> {
    return await prisma.prediction.findMany({
      where: {
        status: {
          in: ['OPEN', 'CLOSED']
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });
  }

  // Get prediction by ID
  static async getPredictionById(id: string): Promise<Prediction | null> {
    return await prisma.prediction.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            role: true
          }
        },
        userPredictions: {
          select: {
            id: true,
            userId: true,
            selectedOptionId: true,
            pointsWagered: true,
            pointsEarned: true,
            isCorrect: true
          }
        }
      }
    });
  }

  // Submit user prediction
  static async submitPrediction(
    userId: string,
    predictionId: string,
    selectedOptionId: string,
    pointsWagered: number
  ): Promise<UserPrediction> {
    // Start transaction
    return await prisma.$transaction(async (tx) => {
      // Check if prediction is still open
      const prediction = await tx.prediction.findUnique({
        where: { id: predictionId }
      });

      if (!prediction) {
        throw new Error('Prediction not found');
      }

      if (prediction.status !== 'OPEN') {
        throw new Error('Prediction is no longer open for betting');
      }

      if (new Date() > prediction.closeDate) {
        throw new Error('Prediction betting period has ended');
      }

      // Check if user already has a prediction
      const existingPrediction = await tx.userPrediction.findUnique({
        where: {
          userId_predictionId: {
            userId,
            predictionId
          }
        }
      });

      if (existingPrediction) {
        throw new Error('You have already placed a bet on this prediction');
      }

      // Check user's points balance
      const user = await tx.user.findUnique({
        where: { id: userId }
      });

      if (!user || user.totalPoints < pointsWagered) {
        throw new Error('Insufficient points balance');
      }

      // Validate points wagered within limits
      if (pointsWagered < prediction.minBetPoints || pointsWagered > prediction.maxBetPoints) {
        throw new Error(`Points wagered must be between ${prediction.minBetPoints} and ${prediction.maxBetPoints}`);
      }

      // Create user prediction
      const userPrediction = await tx.userPrediction.create({
        data: {
          userId,
          predictionId,
          selectedOptionId,
          pointsWagered,
          pointsEarned: 0,
          isCorrect: null
        }
      });

      // Record points transaction (deduction)
      await tx.pointsTransaction.create({
        data: {
          userId,
          amount: -pointsWagered,
          sourceType: 'PREDICTION_BET',
          sourceId: predictionId,
          metadata: {
            selectedOptionId,
            predictionTitle: `${prediction.homeTeam} vs ${prediction.awayTeam}`
          }
        }
      });

      // Update user's total points
      await tx.user.update({
        where: { id: userId },
        data: {
          totalPoints: {
            decrement: pointsWagered
          }
        }
      });

      return userPrediction;
    });
  }

  // Create prediction (admin only)
  static async createPrediction(
    data: CreatePredictionRequest,
    createdBy: string
  ): Promise<Prediction> {
    return await prisma.prediction.create({
      data: {
        competition: data.competition,
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        betType: data.betType,
        betCalculationType: data.betCalculationType,
        extendedBetType: data.extendedBetType,
        options: data.options,
        startDate: new Date(data.startDate),
        closeDate: new Date(data.closeDate),
        pointsReward: data.pointsReward,
        minBetPoints: data.minBetPoints,
        maxBetPoints: data.maxBetPoints,
        status: 'OPEN',
        createdBy
      }
    });
  }

  // Validate prediction result (admin only)
  static async validatePredictionResult(
    predictionId: string,
    winningOptionId: string
  ): Promise<{ prediction: Prediction; affectedUsers: number; totalWinnings: number }> {
    return await prisma.$transaction(async (tx) => {
      // Get prediction
      const prediction = await tx.prediction.findUnique({
        where: { id: predictionId },
        include: {
          userPredictions: true
        }
      });

      if (!prediction) {
        throw new Error('Prediction not found');
      }

      if (prediction.status === 'RESULTED') {
        throw new Error('Prediction has already been validated');
      }

      // Update prediction status
      const updatedPrediction = await tx.prediction.update({
        where: { id: predictionId },
        data: {
          status: 'RESULTED',
          winningOptionId
        }
      });

      // Calculate winnings for correct predictions
      const winningBets = prediction.userPredictions.filter(
        bet => bet.selectedOptionId === winningOptionId
      );

      const losingBets = prediction.userPredictions.filter(
        bet => bet.selectedOptionId !== winningOptionId
      );

      if (winningBets.length === 0) {
        // No winners - mark all as losers
        for (const bet of losingBets) {
          await tx.userPrediction.update({
            where: { id: bet.id },
            data: {
              isCorrect: false,
              pointsEarned: 0
            }
          });
        }

        return {
          prediction: updatedPrediction,
          affectedUsers: losingBets.length,
          totalWinnings: 0
        };
      }

      // Calculate winnings distribution
      const totalWageredByWinners = winningBets.reduce((sum, bet) => sum + bet.pointsWagered, 0);
      const totalWageredByLosers = losingBets.reduce((sum, bet) => sum + bet.pointsWagered, 0);
      const totalPool = totalWageredByLosers + prediction.pointsReward;

      let totalWinnings = 0;

      // Distribute winnings proportionally
      for (const bet of winningBets) {
        const proportion = bet.pointsWagered / totalWageredByWinners;
        const winnings = Math.floor(bet.pointsWagered + (totalPool * proportion));

        await tx.userPrediction.update({
          where: { id: bet.id },
          data: {
            isCorrect: true,
            pointsEarned: winnings
          }
        });

        // Record winnings transaction
        await tx.pointsTransaction.create({
          data: {
            userId: bet.userId,
            amount: winnings,
            sourceType: 'PREDICTION_WIN',
            sourceId: predictionId,
            metadata: {
              selectedOptionId: bet.selectedOptionId,
              pointsWagered: bet.pointsWagered,
              predictionTitle: `${prediction.homeTeam} vs ${prediction.awayTeam}`
            }
          }
        });

        // Update user's total points
        await tx.user.update({
          where: { id: bet.userId },
          data: {
            totalPoints: {
              increment: winnings
            }
          }
        });

        totalWinnings += winnings;
      }

      // Mark losers
      for (const bet of losingBets) {
        await tx.userPrediction.update({
          where: { id: bet.id },
          data: {
            isCorrect: false,
            pointsEarned: 0
          }
        });
      }

      return {
        prediction: updatedPrediction,
        affectedUsers: prediction.userPredictions.length,
        totalWinnings
      };
    });
  }
}
```

---

## 🎯 Controllers Examples

### Predictions Controller

```typescript
// src/controllers/predictions.controller.ts
import { Request, Response } from 'express';
import { PredictionsService } from '@/services/predictions.service';
import { AuthenticatedRequest } from '@/middlewares/auth.middleware';
import { z } from 'zod';

// Validation schemas
const BetSchema = z.object({
  selectedOptionId: z.string().uuid(),
  pointsWagered: z.number().int().positive()
});

const CreatePredictionSchema = z.object({
  competition: z.string().min(1),
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
  betType: z.string().min(1),
  betCalculationType: z.string().min(1),
  extendedBetType: z.string().min(1),
  options: z.array(z.object({
    id: z.string(),
    label: z.string(),
    odds: z.number().optional()
  })),
  startDate: z.string().datetime(),
  closeDate: z.string().datetime(),
  pointsReward: z.number().int().positive(),
  minBetPoints: z.number().int().positive(),
  maxBetPoints: z.number().int().positive()
});

export class PredictionsController {
  // GET /api/predictions
  static async getActivePredictions(req: Request, res: Response) {
    try {
      const predictions = await PredictionsService.getActivePredictions();
      
      res.json({
        success: true,
        predictions,
        total: predictions.length
      });
    } catch (error) {
      console.error('Error fetching active predictions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch predictions'
      });
    }
  }

  // GET /api/predictions/:id
  static async getPredictionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const prediction = await PredictionsService.getPredictionById(id);
      
      if (!prediction) {
        return res.status(404).json({
          success: false,
          error: 'Prediction not found'
        });
      }

      res.json({
        success: true,
        prediction
      });
    } catch (error) {
      console.error('Error fetching prediction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch prediction'
      });
    }
  }

  // POST /api/predictions/:id/bet
  static async submitBet(req: AuthenticatedRequest, res: Response) {
    try {
      const { id: predictionId } = req.params;
      const userId = req.user!.id;
      
      // Validate request body
      const validatedData = BetSchema.parse(req.body);
      
      const userPrediction = await PredictionsService.submitPrediction(
        userId,
        predictionId,
        validatedData.selectedOptionId,
        validatedData.pointsWagered
      );

      res.status(201).json({
        success: true,
        userPrediction,
        message: 'Prediction submitted successfully'
      });
    } catch (error) {
      console.error('Error submitting prediction:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors
        });
      }

      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit prediction'
      });
    }
  }

  // GET /api/predictions/user
  static async getUserPredictions(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { status, limit = 50, offset = 0 } = req.query;

      const whereClause: any = { userId };
      
      if (status === 'active') {
        whereClause.prediction = {
          status: {
            in: ['OPEN', 'CLOSED']
          }
        };
      } else if (status === 'completed') {
        whereClause.prediction = {
          status: 'RESULTED'
        };
      }

      const [userPredictions, total] = await Promise.all([
        prisma.userPrediction.findMany({
          where: whereClause,
          include: {
            prediction: {
              select: {
                id: true,
                competition: true,
                homeTeam: true,
                awayTeam: true,
                betType: true,
                extendedBetType: true,
                options: true,
                startDate: true,
                closeDate: true,
                status: true,
                winningOptionId: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: Number(limit),
          skip: Number(offset)
        }),
        prisma.userPrediction.count({
          where: whereClause
        })
      ]);

      res.json({
        success: true,
        predictions: userPredictions,
        total,
        hasMore: Number(offset) + userPredictions.length < total
      });
    } catch (error) {
      console.error('Error fetching user predictions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user predictions'
      });
    }
  }

  // POST /api/admin/predictions (Admin only)
  static async createPrediction(req: AuthenticatedRequest, res: Response) {
    try {
      const createdBy = req.user!.id;
      
      // Validate request body
      const validatedData = CreatePredictionSchema.parse(req.body);
      
      const prediction = await PredictionsService.createPrediction(validatedData, createdBy);

      res.status(201).json({
        success: true,
        prediction,
        message: 'Prediction created successfully'
      });
    } catch (error) {
      console.error('Error creating prediction:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create prediction'
      });
    }
  }

  // POST /api/admin/predictions/:id/validate (Admin only)
  static async validateResult(req: AuthenticatedRequest, res: Response) {
    try {
      const { id: predictionId } = req.params;
      const { winningOptionId } = req.body;

      if (!winningOptionId) {
        return res.status(400).json({
          success: false,
          error: 'Winning option ID is required'
        });
      }

      const result = await PredictionsService.validatePredictionResult(
        predictionId,
        winningOptionId
      );

      res.json({
        success: true,
        ...result,
        message: `Prediction validated successfully. ${result.affectedUsers} users affected.`
      });
    } catch (error) {
      console.error('Error validating prediction result:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate prediction'
      });
    }
  }
}
```

---

## 🗂 Routes Configuration

### Main Routes Index

```typescript
// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import predictionsRoutes from './predictions.routes';
import leaderboardRoutes from './leaderboard.routes';
import warGamesRoutes from './wargames.routes';
import nftsRoutes from './nfts.routes';
import streaksRoutes from './streaks.routes';
import usersRoutes from './users.routes';
import teamsRoutes from './teams.routes';
import adminRoutes from './admin.routes';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/predictions', predictionsRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/wargames', warGamesRoutes);
router.use('/nfts', nftsRoutes);
router.use('/streaks', streaksRoutes);
router.use('/users', usersRoutes);
router.use('/teams', teamsRoutes);
router.use('/admin', adminRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'GalacticX API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
```

### Predictions Routes

```typescript
// src/routes/predictions.routes.ts
import { Router } from 'express';
import { PredictionsController } from '@/controllers/predictions.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { bettingRateLimit } from '@/middlewares/rateLimit.middleware';

const router = Router();

// Public routes
router.get('/', PredictionsController.getActivePredictions);
router.get('/:id', PredictionsController.getPredictionById);

// Protected routes
router.use(authMiddleware);
router.post('/:id/bet', bettingRateLimit, PredictionsController.submitBet);
router.get('/user/predictions', PredictionsController.getUserPredictions);

export default router;
```

---

## 📱 Application Setup

### Main App Configuration

```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import apiRoutes from '@/routes';
import { errorMiddleware } from '@/middlewares/error.middleware';
import { generalRateLimit } from '@/middlewares/rateLimit.middleware';
import { logger } from '@/utils/logger';
import { corsOptions } from '@/config/cors';
import { swaggerOptions } from '@/config/swagger';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(generalRateLimit);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Swagger documentation
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 GalacticX Backend API started on port ${PORT}`);
  logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});

export default app;
```

---

## 🔧 Configuration Files

### Database Configuration

```typescript
// src/config/database.ts
import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Log database queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug('Database Query:', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`
    });
  });
}

prisma.$on('error', (e) => {
  logger.error('Database Error:', e);
});

// Test database connection
prisma.$connect()
  .then(() => {
    logger.info('✅ Database connected successfully');
  })
  .catch((error) => {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  });

export { prisma };
```

### CORS Configuration

```typescript
// src/config/cors.ts
import { CorsOptions } from 'cors';

const allowedOrigins = [
  'http://localhost:3000', // Development frontend
  'https://your-frontend-domain.com', // Production frontend
  process.env.FRONTEND_URL
].filter(Boolean);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization'
  ],
  credentials: true,
  maxAge: 86400 // 24 hours
};
```

### Swagger Configuration

```typescript
// src/config/swagger.ts
import { SwaggerDefinition, Options } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'GalacticX Backend API',
    version: '1.0.0',
    description: 'API for GalacticX dApp - NFT-based football predictions and war games',
    contact: {
      name: 'GalacticX Team',
      email: 'contact@galacticx.com'
    }
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' 
        ? 'https://api.galacticx.com' 
        : `http://localhost:${process.env.PORT || 3001}`,
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    {
      BearerAuth: []
    }
  ]
};

export const swaggerOptions: Options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};
```

---

## 🧪 Tests Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};
```

### Test Setup

```typescript
// tests/setup.ts
import { prisma } from '@/config/database';

beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
});

afterAll(async () => {
  // Clean up and disconnect
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up database before each test
  await prisma.userPrediction.deleteMany();
  await prisma.prediction.deleteMany();
  await prisma.pointsTransaction.deleteMany();
  await prisma.user.deleteMany();
});
```

### Example Test

```typescript
// tests/controllers/predictions.test.ts
import request from 'supertest';
import app from '@/app';
import { prisma } from '@/config/database';
import { generateAccessToken } from '@/utils/jwt.utils';

describe('Predictions Controller', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        walletAddress: 'erd1test123',
        username: 'testuser',
        role: 'USER',
        totalPoints: 1000
      }
    });

    userId = user.id;
    authToken = generateAccessToken(user);
  });

  describe('GET /api/predictions', () => {
    it('should return active predictions', async () => {
      // Create test prediction
      await prisma.prediction.create({
        data: {
          competition: 'Premier League',
          homeTeam: 'Liverpool',
          awayTeam: 'Manchester City',
          betType: 'result',
          betCalculationType: 'fixed',
          extendedBetType: '1x2',
          options: [
            { id: '1', label: 'Liverpool Win', odds: 2.5 },
            { id: 'x', label: 'Draw', odds: 3.2 },
            { id: '2', label: 'Manchester City Win', odds: 2.8 }
          ],
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          closeDate: new Date(Date.now() + 23 * 60 * 60 * 1000),
          pointsReward: 100,
          minBetPoints: 10,
          maxBetPoints: 500,
          status: 'OPEN',
          createdBy: userId
        }
      });

      const response = await request(app)
        .get('/api/predictions')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.predictions).toHaveLength(1);
      expect(response.body.predictions[0].homeTeam).toBe('Liverpool');
    });
  });

  describe('POST /api/predictions/:id/bet', () => {
    let predictionId: string;

    beforeEach(async () => {
      const prediction = await prisma.prediction.create({
        data: {
          competition: 'Premier League',
          homeTeam: 'Liverpool',
          awayTeam: 'Manchester City',
          betType: 'result',
          betCalculationType: 'fixed',
          extendedBetType: '1x2',
          options: [
            { id: '1', label: 'Liverpool Win' },
            { id: 'x', label: 'Draw' },
            { id: '2', label: 'Manchester City Win' }
          ],
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          closeDate: new Date(Date.now() + 23 * 60 * 60 * 1000),
          pointsReward: 100,
          minBetPoints: 10,
          maxBetPoints: 500,
          status: 'OPEN',
          createdBy: userId
        }
      });

      predictionId = prediction.id;
    });

    it('should submit a valid bet', async () => {
      const response = await request(app)
        .post(`/api/predictions/${predictionId}/bet`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          selectedOptionId: '1',
          pointsWagered: 100
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.userPrediction.pointsWagered).toBe(100);
      expect(response.body.userPrediction.selectedOptionId).toBe('1');
    });

    it('should fail with insufficient points', async () => {
      const response = await request(app)
        .post(`/api/predictions/${predictionId}/bet`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          selectedOptionId: '1',
          pointsWagered: 2000 // More than user has
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Insufficient points');
    });
  });
});
```

---

## 🚀 Déploiement

### Environment Variables (.env.example)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/galacticx?schema=public"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# JWT
JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters"
JWT_EXPIRES_IN="24h"

# MultiversX
MULTIVERSX_API_URL="https://api.multiversx.com"

# Server
PORT=3001
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:3000"

# Logging
LOG_LEVEL="info"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=galacticx
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

### Deployment Scripts

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Deploying GalacticX Backend..."

# Build application
npm run build

# Run database migrations
npm run db:migrate

# Start application with PM2
pm2 start dist/app.js --name "galacticx-backend"

echo "✅ Deployment complete!"
```

---

## 📋 Checklist de Développement

### Phase 1: Setup & Configuration ✅
- [ ] Créer la structure du projet
- [ ] Configurer TypeScript
- [ ] Installer et configurer Prisma
- [ ] Configurer les variables d'environnement
- [ ] Setup des middlewares de base (CORS, Helmet, etc.)

### Phase 2: Authentification ✅
- [ ] Implémenter la vérification de signature MultiversX
- [ ] Créer le système JWT
- [ ] Middleware d'authentification
- [ ] Middleware d'autorisation admin
- [ ] Tests d'authentification

### Phase 3: Base de Données ✅
- [ ] Définir le schema Prisma complet
- [ ] Créer et tester les migrations
- [ ] Configurer la connexion Supabase
- [ ] Tests de base de données

### Phase 4: API Predictions ✅
- [ ] Service predictions (CRUD)
- [ ] Controller predictions
- [ ] Routes predictions
- [ ] Validation des données
- [ ] Tests predictions

### Phase 5: API Leaderboard ✅
- [ ] Service leaderboard
- [ ] Controller leaderboard
- [ ] Routes leaderboard
- [ ] Système de points transactions
- [ ] Tests leaderboard

### Phase 6: API War Games ✅
- [ ] Service war games
- [ ] Controller war games
- [ ] Routes war games
- [ ] Système de teams sauvegardées
- [ ] Tests war games

### Phase 7: APIs Restantes ✅
- [ ] API NFTs & Collection
- [ ] API Streaks
- [ ] API Users & Profiles
- [ ] API Team of Week
- [ ] Tests complets

### Phase 8: Documentation & Monitoring ✅
- [ ] Documentation Swagger complète
- [ ] Logging avec Winston
- [ ] Monitoring de santé
- [ ] Rate limiting
- [ ] Tests d'intégration

### Phase 9: Déploiement ✅
- [ ] Configuration Docker
- [ ] Scripts de déploiement
- [ ] Variables d'environnement production
- [ ] Tests end-to-end en production

---

## 📚 Ressources Utiles

### Documentation
- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/docs)
- [TypeScript](https://www.typescriptlang.org/docs)
- [JWT](https://jwt.io/)
- [Zod](https://zod.dev/)
- [MultiversX SDK](https://docs.multiversx.com/sdk-and-tools/overview)

### Templates
- [Express TypeScript Starter](https://github.com/ljlm0402/typescript-express-starter)
- [Prisma Examples](https://github.com/prisma/prisma-examples)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Outils de Développement
- [Postman](https://www.postman.com/) - Test des APIs
- [Prisma Studio](https://www.prisma.io/studio) - Interface graphique DB
- [JWT.io](https://jwt.io/) - Debugger JWT
- [DB Diagram](https://dbdiagram.io/) - Design de schéma DB

---

Ce guide contient toutes les informations techniques nécessaires pour développer le backend GalacticX de A à Z. Suivez les phases dans l'ordre et n'hésitez pas à adapter selon vos besoins spécifiques.

**Bonne chance avec le développement ! 🚀**
