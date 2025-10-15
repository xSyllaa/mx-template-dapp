# GalacticX dApp - Architecture Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Project Structure](#project-structure)
5. [Data Flow](#data-flow)
6. [Security Architecture](#security-architecture)
7. [MultiversX Integration](#multiversx-integration)
8. [Deployment Architecture](#deployment-architecture)

---

## Overview

GalacticX is a gamified decentralized application (dApp) that combines football engagement, NFT ownership, and competitive gameplay on the MultiversX blockchain. The platform enables users to participate in prediction games, war games (NFT team battles), weekly claim streaks, and view leaderboards—all while maintaining ownership of their digital assets.

### Key Principles
- **Decentralization**: User authentication via MultiversX wallet
- **NFT-Gated**: Features require GalacticX NFT ownership
- **Security-First**: Row Level Security (RLS) for all database operations
- **Real-time**: Live updates via Supabase subscriptions
- **Modular**: Feature-based architecture for scalability

---

## Tech Stack

### Frontend Layer
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI library for component-based architecture |
| **TypeScript** | 5.2.2 | Type safety and developer experience |
| **Vite** | 4.4.9 | Build tool and development server |
| **TailwindCSS** | 4.0.15 | Utility-first CSS framework |
| **React Router** | 6.16.0 | Client-side routing |

**Justification**: React + Vite provides fast development with HMR, TypeScript ensures code quality, and TailwindCSS enables rapid UI development with theme support.

### Backend Layer (Supabase)
| Component | Purpose |
|-----------|---------|
| **PostgreSQL** | Relational database with full ACID compliance |
| **Row Level Security** | Database-level authorization |
| **Realtime** | WebSocket subscriptions for live data |
| **Edge Functions** | Serverless functions for business logic |
| **Storage** | NFT metadata and asset storage |

**Justification**: Supabase eliminates the need for custom backend development while providing enterprise-grade PostgreSQL with built-in auth, realtime, and serverless functions.

### Blockchain Layer (MultiversX)
| Component | Purpose |
|-----------|---------|
| **@multiversx/sdk-dapp** | Wallet connection and authentication |
| **@multiversx/sdk-core** | Transaction building and signing |
| **MultiversX API** | NFT ownership verification |

**Justification**: MultiversX provides fast, low-cost transactions and robust NFT infrastructure.

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          React Frontend (Vite + TypeScript)              │  │
│  │                                                           │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │  │
│  │  │   Pages     │  │  Features    │  │   Components   │ │  │
│  │  │             │  │              │  │                │ │  │
│  │  │ - Home      │  │ - Predictions│  │ - UI (atoms)   │ │  │
│  │  │ - Predict   │  │ - War Games  │  │ - Shared       │ │  │
│  │  │ - Leaderbd  │  │ - Streaks    │  │ - Layout       │ │  │
│  │  │ - Admin     │  │ - NFT Gallery│  │                │ │  │
│  │  └─────────────┘  └──────────────┘  └────────────────┘ │  │
│  │                                                           │  │
│  │  ┌───────────────────────────────────────────────────┐  │  │
│  │  │         State Management Layer                    │  │  │
│  │  │  - React Context (Auth, Theme)                    │  │  │
│  │  │  - Custom Hooks (Data fetching)                   │  │  │
│  │  │  - Supabase Realtime (Live updates)               │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│                           │ HTTPS                               │
└───────────────────────────┼─────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
┌────────────────┐  ┌────────────────┐  ┌──────────────────┐
│   Supabase     │  │  MultiversX    │  │  External APIs   │
│   (Backend)    │  │  (Blockchain)  │  │                  │
├────────────────┤  ├────────────────┤  ├──────────────────┤
│                │  │                │  │                  │
│ • PostgreSQL   │  │ • Wallet Auth  │  │ • Transfermarkt  │
│ • Auth         │  │ • NFT API      │  │ • Player Stats   │
│ • Realtime     │  │ • Transactions │  │                  │
│ • Edge Funcs   │  │                │  │                  │
│ • Storage      │  │                │  │                  │
│                │  │                │  │                  │
└────────────────┘  └────────────────┘  └──────────────────┘
```

### Component Interaction Flow

```
User Action (e.g., Submit Prediction)
    │
    ▼
React Component (PredictionForm)
    │
    ▼
Custom Hook (useSubmitPrediction)
    │
    ├─► NFT Ownership Check (MultiversX API)
    │       │
    │       └─► Has NFT? ─── No ──► Show Error
    │               │
    │              Yes
    │               │
    ▼               ▼
Service Layer (predictionService.ts)
    │
    ▼
Supabase Client (Insert to user_predictions)
    │
    ▼
PostgreSQL Database
    │
    ├─► RLS Policy Check (User authenticated?)
    │       │
    │      Yes
    │       │
    ▼       ▼
Insert Record + Award Points
    │
    ▼
Trigger Update (update user total_points)
    │
    ▼
Realtime Broadcast (notify leaderboard subscribers)
    │
    ▼
React Component Re-renders (updated data)
```

---

## Project Structure

```
GalacticDapp/
│
├── public/                          # Static assets
│   ├── android-chrome-*.png        # PWA icons
│   ├── dark-theme-bg.png           # Theme backgrounds
│   ├── light-theme-bg.png
│   ├── vibe-theme-bg.png
│   └── manifest.json               # PWA manifest
│
├── src/
│   │
│   ├── components/                 # Reusable components
│   │   ├── ui/                    # Atomic design system components
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── button.styles.ts
│   │   │   │   └── index.ts
│   │   │   ├── Card/
│   │   │   ├── Modal/
│   │   │   ├── Badge/
│   │   │   ├── Input/
│   │   │   └── Loader/
│   │   │
│   │   ├── shared/                # Business logic components
│   │   │   ├── NFTCard/
│   │   │   ├── UserAvatar/
│   │   │   ├── PointsBadge/
│   │   │   ├── StreakProgress/
│   │   │   └── MatchCard/
│   │   │
│   │   └── layout/                # Layout components
│   │       ├── Header/
│   │       ├── Footer/
│   │       ├── Sidebar/
│   │       └── Layout/
│   │
│   ├── features/                  # Feature modules (self-contained)
│   │   │
│   │   ├── predictions/
│   │   │   ├── components/
│   │   │   │   ├── PredictionCard/
│   │   │   │   ├── PredictionForm/
│   │   │   │   ├── PredictionList/
│   │   │   │   └── PredictionHistory/
│   │   │   ├── hooks/
│   │   │   │   ├── usePredictions.ts
│   │   │   │   ├── useSubmitPrediction.ts
│   │   │   │   └── useUserPredictions.ts
│   │   │   ├── services/
│   │   │   │   └── predictionService.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── war-games/
│   │   │   ├── components/
│   │   │   │   ├── TeamBuilder/
│   │   │   │   ├── MatchLobby/
│   │   │   │   ├── WarGameMatch/
│   │   │   │   └── ScoreCalculator/
│   │   │   ├── hooks/
│   │   │   │   ├── useWarGames.ts
│   │   │   │   ├── useCreateWarGame.ts
│   │   │   │   ├── useTeamBuilder.ts
│   │   │   │   └── useNFTLocking.ts
│   │   │   ├── services/
│   │   │   │   ├── warGameService.ts
│   │   │   │   └── scoringService.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── streaks/
│   │   ├── leaderboards/
│   │   ├── nft-gallery/
│   │   ├── team-of-week/
│   │   └── admin/
│   │
│   ├── pages/                     # Page components
│   │   ├── Home/
│   │   ├── Predictions/
│   │   ├── WarGames/
│   │   ├── Leaderboard/
│   │   ├── MyNFTs/
│   │   ├── TeamOfWeek/
│   │   ├── Admin/
│   │   ├── Dashboard/
│   │   └── PageNotFound/
│   │
│   ├── lib/                       # External library integrations
│   │   ├── supabase/
│   │   │   ├── client.ts         # Supabase client initialization
│   │   │   ├── auth.ts           # Auth helpers
│   │   │   └── realtime.ts       # Realtime subscription helpers
│   │   │
│   │   ├── multiversx/            # MultiversX SDK (from template)
│   │   │   ├── sdkDapp/
│   │   │   ├── sdkCore/
│   │   │   └── nftService.ts     # NFT ownership verification
│   │   │
│   │   └── utils/                # General utilities
│   │       ├── formatters.ts
│   │       ├── validators.ts
│   │       └── constants.ts
│   │
│   ├── hooks/                     # Global custom hooks
│   │   ├── useUser.ts            # Current user data
│   │   ├── useAuth.ts            # Authentication state
│   │   ├── useNFTOwnership.ts    # NFT ownership check
│   │   └── useHandleThemeManagement.ts  # Theme switching
│   │
│   ├── contexts/                  # React contexts
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── UserContext.tsx
│   │
│   ├── routes/                    # Routing configuration
│   │   ├── routes.ts             # Route definitions
│   │   └── index.ts
│   │
│   ├── wrappers/                  # HOCs and route guards
│   │   ├── AuthGuard/            # Authenticated route protection
│   │   ├── AdminGuard/           # Admin role protection
│   │   ├── NFTGuard/             # NFT ownership check
│   │   └── AxiosInterceptors/
│   │
│   ├── config/                    # Configuration files
│   │   ├── config.devnet.ts
│   │   ├── config.testnet.ts
│   │   ├── config.mainnet.ts
│   │   └── sharedConfig.ts
│   │
│   ├── types/                     # Global TypeScript types
│   │   ├── user.types.ts
│   │   ├── nft.types.ts
│   │   ├── prediction.types.ts
│   │   └── index.ts
│   │
│   ├── styles/                    # Global styles
│   │   ├── tailwind.css          # TailwindCSS + theme variables
│   │   └── style.css
│   │
│   ├── App.tsx                    # Root component
│   ├── index.tsx                  # Entry point
│   └── initConfig.ts             # App initialization
│
├── supabase/                      # Supabase configuration
│   ├── migrations/                # Database migrations
│   │   ├── 20250115000001_create_users_table.sql
│   │   ├── 20250115000002_create_predictions_tables.sql
│   │   ├── 20250115000003_create_war_games_table.sql
│   │   ├── 20250115000004_create_leaderboards_tables.sql
│   │   └── 20250115000005_create_rls_policies.sql
│   │
│   ├── functions/                 # Edge Functions
│   │   ├── validate-prediction-result/
│   │   ├── process-war-game-result/
│   │   ├── reset-weekly-leaderboard/
│   │   └── sync-nft-ownership/
│   │
│   └── config.toml               # Supabase project config
│
├── docs/                          # Documentation
│   ├── ARCHITECTURE.md           # This file
│   ├── DATABASE_SCHEMA.md        # Database design
│   ├── API_ENDPOINTS.md          # API documentation
│   ├── DESIGN_SYSTEM.md          # UI/UX specifications
│   ├── COMPONENT_STRUCTURE.md    # Frontend architecture
│   ├── MULTIVERSX_INTEGRATION.md # Blockchain integration
│   ├── SUPABASE_SETUP.md         # Backend setup guide
│   └── DEVELOPMENT_WORKFLOW.md   # Development process
│
├── tests/                         # E2E tests (Playwright)
│
├── .cursorrules                   # Cursor AI rules
├── .env.local                     # Local environment variables
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md
```

### Folder Naming Conventions
- **lowercase** for configuration folders (`config/`, `lib/`)
- **PascalCase** for component folders (`Button/`, `PredictionCard/`)
- **kebab-case** for feature folders (`war-games/`, `team-of-week/`)

---

## Data Flow

### 1. Authentication Flow

```
┌─────────────┐
│   User      │
│  Opens App  │
└──────┬──────┘
       │
       ▼
┌──────────────────────────┐
│  Check MultiversX        │
│  Wallet Connection       │
└──────┬───────────────────┘
       │
       ├─── Not Connected ──► Show "Connect Wallet" Modal
       │
       └─── Connected
              │
              ▼
       ┌──────────────────────┐
       │  Get Wallet Address  │
       └──────┬───────────────┘
              │
              ▼
       ┌──────────────────────┐
       │  Query Supabase      │
       │  users table         │
       └──────┬───────────────┘
              │
              ├─── User Exists ──► Load user data
              │
              └─── New User
                     │
                     ▼
              ┌──────────────────┐
              │  Create User     │
              │  Record in DB    │
              │  (RLS: insert    │
              │   own record)    │
              └──────────────────┘
```

### 2. Prediction Submission Flow

```
User fills PredictionForm
    │
    ▼
Click "Submit Prediction"
    │
    ├─► Check: User authenticated? ─── No ──► Redirect to login
    │                │
    │               Yes
    │                │
    ├─► Check: Has NFT? (MultiversX API) ─── No ──► Show error
    │                │
    │               Yes
    │                │
    ├─► Check: Prediction still open? ─── No ──► Show error
    │                │
    │               Yes
    │                │
    ├─► Check: Already submitted? ─── Yes ──► Show error
    │                │
    │                No
    │                │
    ▼                ▼
Call predictionService.submit()
    │
    ▼
Supabase: INSERT into user_predictions
    │
    ├─► RLS Policy: authenticated() ─── Fail ──► 403 Error
    │                │
    │               Pass
    │                │
    ▼                ▼
Insert successful
    │
    ▼
Show success toast
    │
    ▼
Refresh prediction list
```

### 3. Realtime Leaderboard Update Flow

```
User A submits prediction (earns points)
    │
    ▼
Edge Function: validate-prediction-result
    │
    ├─► Update users.total_points
    │
    └─► Update leaderboards table
           │
           ▼
    PostgreSQL Trigger
           │
           ▼
    Broadcast to Realtime channel "leaderboard"
           │
           ▼
    ┌──────────────────┐
    │  All Subscribed  │
    │  Clients Receive │
    │  Update Event    │
    └────────┬─────────┘
             │
   ┌─────────┼─────────┐
   │         │         │
   ▼         ▼         ▼
User A    User B    User C
   │         │         │
   └─────────┴─────────┘
             │
             ▼
   Leaderboard re-renders
   with new rankings
```

### 4. War Game Match Flow

```
Player A creates match
    │
    ▼
Select 11 NFTs + Coach + Stadium
    │
    ▼
Submit team composition
    │
    ▼
Lock NFTs (mark as "in_battle")
    │
    ▼
Wait for Player B
    │
    ▼
Player B joins + submits team
    │
    ▼
Both teams locked
    │
    ▼
Edge Function: process-war-game-result
    │
    ├─► Fetch NFT metadata (stats, position)
    │
    ├─► Calculate Team A score
    │
    ├─► Calculate Team B score
    │
    ├─► Determine winner
    │
    ├─► Award points to winner
    │
    └─► Unlock all NFTs
           │
           ▼
    Update war_games table (status: completed)
           │
           ▼
    Realtime broadcast to both players
           │
           ▼
    Show match result screen
```

---

## Security Architecture

### 1. Database Security (Row Level Security - RLS)

All Supabase tables have RLS enabled. Users can only access/modify their own data unless explicitly granted permission.

#### Example RLS Policies

**users table**:
```sql
-- Users can read all user records (for leaderboards)
CREATE POLICY "Users can view all profiles"
ON users FOR SELECT
TO authenticated
USING (true);

-- Users can only update their own record
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id);
```

**predictions table**:
```sql
-- Anyone can read predictions (public data)
CREATE POLICY "Anyone can view predictions"
ON predictions FOR SELECT
TO authenticated
USING (true);

-- Only KING role can create predictions
CREATE POLICY "Only admin can create predictions"
ON predictions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'king'
  )
);
```

**user_predictions table**:
```sql
-- Users can only view their own predictions
CREATE POLICY "Users can view own predictions"
ON user_predictions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can insert their own predictions
CREATE POLICY "Users can insert own predictions"
ON user_predictions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
```

### 2. Frontend Security

#### NFT Ownership Guard
```typescript
// wrappers/NFTGuard/NFTGuard.tsx
export const NFTGuard = ({ children, minNFTCount = 1 }) => {
  const { address } = useGetAccountInfo();
  const { nftCount, loading } = useNFTOwnership(address);

  if (loading) return <Loader />;
  
  if (nftCount < minNFTCount) {
    return <ErrorScreen message="You need GalacticX NFTs to access this feature" />;
  }

  return <>{children}</>;
};
```

#### Admin Role Guard
```typescript
// wrappers/AdminGuard/AdminGuard.tsx
export const AdminGuard = ({ children }) => {
  const { user, loading } = useUser();

  if (loading) return <Loader />;
  
  if (user?.role !== 'king') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
```

### 3. Edge Function Security

Edge Functions validate all admin operations server-side:

```typescript
// supabase/functions/validate-prediction-result/index.ts
export default async (req: Request) => {
  // 1. Verify JWT token
  const authHeader = req.headers.get('Authorization');
  const { user } = await supabase.auth.getUser(authHeader);
  
  // 2. Check admin role
  const { data: userRecord } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (userRecord.role !== 'king') {
    return new Response('Unauthorized', { status: 403 });
  }
  
  // 3. Process logic
  // ...
};
```

---

## MultiversX Integration

### 1. Wallet Connection
Uses the existing MultiversX template implementation:
- xPortal Mobile
- DeFi Wallet
- Web Wallet
- Ledger
- Passkey Login

### 2. NFT Ownership Verification

```typescript
// lib/multiversx/nftService.ts
export const verifyNFTOwnership = async (
  walletAddress: string
): Promise<NFTOwnership> => {
  try {
    const response = await axios.get(
      `https://api.multiversx.com/accounts/${walletAddress}/nfts?collections=GALACTICX-xxxxx`
    );
    
    const nfts = response.data;
    
    // Cache in Supabase for performance
    await supabase.from('nft_metadata').upsert(
      nfts.map(nft => ({
        nft_id: nft.identifier,
        owner_address: walletAddress,
        metadata_uri: nft.url,
        last_synced: new Date()
      }))
    );
    
    return {
      hasNFT: nfts.length > 0,
      nftCount: nfts.length,
      nfts
    };
  } catch (error) {
    console.error('NFT verification failed:', error);
    throw error;
  }
};
```

### 3. Transaction Signing

For reward distribution (Team of the Week):

```typescript
// features/admin/services/rewardService.ts
export const sendRewards = async (
  recipients: string[],
  amounts: string[]
) => {
  const transactions = recipients.map((address, index) => ({
    value: amounts[index],
    receiver: address,
    data: 'TOTW Reward',
    gasLimit: 50000
  }));
  
  await sendTransactions({ transactions });
};
```

---

## Deployment Architecture

### Development Environment
```
Local Machine (Windows PowerShell)
    │
    ├─► Vite Dev Server (localhost:3000)
    ├─► Supabase Local (via Docker)
    └─► MultiversX Devnet
```

### Production Environment
```
┌─────────────────┐
│   Vercel /      │
│   Netlify       │◄─── Frontend (React build)
│   (CDN + Edge)  │
└────────┬────────┘
         │
         ├──────► Supabase Cloud (PostgreSQL + Edge Functions)
         │
         └──────► MultiversX Mainnet (Blockchain)
```

### Environment Variables

**Development** (`.env.local`):
```bash
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_local_anon_key
VITE_MULTIVERSX_NETWORK=devnet
```

**Production**:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_MULTIVERSX_NETWORK=mainnet
```

---

## Performance Considerations

### 1. Code Splitting
- Lazy load pages: `const AdminPanel = lazy(() => import('pages/Admin'))`
- Dynamic imports for heavy features

### 2. Caching Strategy
- **NFT Metadata**: Cache in Supabase, sync every 24h
- **Leaderboards**: Cache with 5-minute TTL
- **Static assets**: CDN caching

### 3. Database Optimization
- Indexes on frequently queried fields (`wallet_address`, `prediction_id`)
- Materialized views for complex leaderboard queries
- Connection pooling via Supabase

### 4. Realtime Optimization
- Subscribe only to necessary channels
- Unsubscribe on component unmount
- Debounce rapid updates

---

## Scalability

### Horizontal Scaling
- **Frontend**: Vercel/Netlify automatic scaling
- **Database**: Supabase Pro plan (dedicated compute)
- **Edge Functions**: Auto-scale with traffic

### Vertical Scaling
- Database indexing and query optimization
- Implement Redis caching layer (future)
- CDN for static assets

---

## Monitoring & Observability

### Recommended Tools
- **Frontend Errors**: Sentry
- **Database Performance**: Supabase Dashboard
- **Analytics**: PostHog or Mixpanel
- **Uptime**: UptimeRobot

---

## Conclusion

GalacticX dApp combines modern web technologies (React, TypeScript, TailwindCSS) with cutting-edge blockchain infrastructure (MultiversX) and a powerful backend-as-a-service (Supabase). This architecture ensures:

✅ **Security**: RLS, wallet auth, admin guards  
✅ **Performance**: Code splitting, caching, realtime  
✅ **Scalability**: Modular features, serverless functions  
✅ **Developer Experience**: TypeScript, hot reload, clear structure  
✅ **User Experience**: Fast, responsive, real-time updates  

For specific implementation details, refer to:
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database design
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - API documentation
- [COMPONENT_STRUCTURE.md](./COMPONENT_STRUCTURE.md) - Frontend architecture
- [MULTIVERSX_INTEGRATION.md](./MULTIVERSX_INTEGRATION.md) - Blockchain integration


