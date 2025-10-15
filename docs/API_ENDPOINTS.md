# GalacticX dApp - API Endpoints Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Supabase Auto-Generated REST API](#supabase-auto-generated-rest-api)
4. [Edge Functions](#edge-functions)
5. [MultiversX API Integration](#multiversx-api-integration)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)

---

## Overview

GalacticX uses a **hybrid API approach**:

1. **Supabase Auto-Generated REST API**: Direct database access with RLS security
2. **Supabase Edge Functions**: Custom business logic (validation, calculations, cron jobs)
3. **MultiversX API**: Blockchain data (NFT ownership, transactions)

### Base URLs

```bash
# Supabase REST API (auto-generated)
https://your-project.supabase.co/rest/v1/

# Supabase Edge Functions
https://your-project.supabase.co/functions/v1/

# MultiversX API
https://api.multiversx.com/    # Mainnet
https://devnet-api.multiversx.com/  # Devnet
https://testnet-api.multiversx.com/  # Testnet
```

### Authentication Headers

All requests require JWT authentication (except public endpoints):

```typescript
const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${userJWT}`,
  'Content-Type': 'application/json'
};
```

---

## Authentication

### 1. Sign In with MultiversX Wallet

**Endpoint**: Custom implementation via `@multiversx/sdk-dapp`

**Flow**:
```typescript
// Client-side
import { useGetLoginInfo } from '@multiversx/sdk-dapp/hooks';

const { isLoggedIn, tokenLogin } = useGetLoginInfo();

if (isLoggedIn) {
  // User authenticated
  const walletAddress = tokenLogin?.nativeAuthToken;
}
```

### 2. Create/Get User Profile

**Method**: `POST` or `GET`  
**Endpoint**: `/rest/v1/users`  
**Auth**: Required

**Request (Create)**:
```typescript
const { data, error } = await supabase
  .from('users')
  .insert({
    id: auth.user.id,  // Supabase auth ID
    wallet_address: 'erd1...',
    username: 'GalacticPlayer'
  })
  .select()
  .single();
```

**Request (Get)**:
```typescript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('wallet_address', 'erd1...')
  .single();
```

**Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "wallet_address": "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th",
  "username": "GalacticPlayer",
  "role": "user",
  "total_points": 1250,
  "current_streak": 5,
  "nft_count": 3,
  "created_at": "2025-01-15T10:30:00Z"
}
```

---

## Supabase Auto-Generated REST API

Supabase automatically generates REST endpoints for all tables. Access is controlled by RLS policies.

### General Query Patterns

#### Filtering
```typescript
.eq('column', 'value')        // Equal
.neq('column', 'value')       // Not equal
.gt('column', value)          // Greater than
.gte('column', value)         // Greater than or equal
.lt('column', value)          // Less than
.lte('column', value)         // Less than or equal
.like('column', '%pattern%')  // Pattern matching
.in('column', [val1, val2])   // In array
```

#### Ordering & Pagination
```typescript
.order('column', { ascending: false })
.range(0, 9)  // First 10 results (0-indexed)
.limit(20)
```

#### Selecting Columns
```typescript
.select('id, name, total_points')
.select('*, predictions(*)')  // Join with related table
```

---

### Predictions Endpoints

#### Get All Active Predictions

**Method**: `GET`  
**Endpoint**: `/rest/v1/predictions`  
**Auth**: Required

```typescript
const { data, error } = await supabase
  .from('predictions')
  .select('*')
  .eq('status', 'open')
  .gte('close_date', new Date().toISOString())
  .order('start_date', { ascending: true });
```

**Response**:
```json
[
  {
    "id": "pred-123",
    "competition": "Premier League",
    "home_team": "Arsenal",
    "away_team": "Chelsea",
    "bet_type": "result",
    "options": [
      {"id": "1", "label": "Arsenal Win", "odds": "2.1"},
      {"id": "X", "label": "Draw", "odds": "3.5"},
      {"id": "2", "label": "Chelsea Win", "odds": "3.2"}
    ],
    "status": "open",
    "start_date": "2025-01-20T15:00:00Z",
    "close_date": "2025-01-20T14:45:00Z",
    "points_reward": 10
  }
]
```

#### Get Single Prediction

**Method**: `GET`  
**Endpoint**: `/rest/v1/predictions?id=eq.{id}`

```typescript
const { data, error } = await supabase
  .from('predictions')
  .select('*')
  .eq('id', predictionId)
  .single();
```

#### Create Prediction (Admin Only)

**Method**: `POST`  
**Endpoint**: `/rest/v1/predictions`  
**Auth**: Required (Admin role)

```typescript
const { data, error } = await supabase
  .from('predictions')
  .insert({
    competition: 'La Liga',
    home_team: 'Real Madrid',
    away_team: 'Barcelona',
    bet_type: 'result',
    options: [
      {"id": "1", "label": "Real Madrid Win", "odds": "2.3"},
      {"id": "X", "label": "Draw", "odds": "3.1"},
      {"id": "2", "label": "Barcelona Win", "odds": "2.9"}
    ],
    status: 'open',
    start_date: '2025-01-25T20:00:00Z',
    close_date: '2025-01-25T19:45:00Z',
    points_reward: 10,
    created_by: adminUserId
  });
```

**RLS**: Only users with `role = 'king'` can insert.

#### Update Prediction Status (Admin Only)

**Method**: `PATCH`  
**Endpoint**: `/rest/v1/predictions?id=eq.{id}`

```typescript
const { data, error } = await supabase
  .from('predictions')
  .update({ status: 'closed' })
  .eq('id', predictionId);
```

---

### User Predictions Endpoints

#### Submit User Prediction

**Method**: `POST`  
**Endpoint**: `/rest/v1/user_predictions`  
**Auth**: Required

```typescript
const { data, error } = await supabase
  .from('user_predictions')
  .insert({
    user_id: userId,
    prediction_id: predictionId,
    selected_option_id: '1'  // User chose option "1" (Home Win)
  });
```

**RLS**: 
- User must be authenticated
- Prediction must be `status = 'open'`
- User cannot submit duplicate predictions (UNIQUE constraint)

**Response**:
```json
{
  "id": "up-456",
  "user_id": "user-123",
  "prediction_id": "pred-123",
  "selected_option_id": "1",
  "points_earned": 0,  // Not yet determined
  "is_correct": null,   // Not yet determined
  "created_at": "2025-01-18T12:00:00Z"
}
```

#### Get User Prediction History

**Method**: `GET`  
**Endpoint**: `/rest/v1/user_predictions`

```typescript
const { data, error } = await supabase
  .from('user_predictions')
  .select(`
    *,
    predictions (
      competition,
      home_team,
      away_team,
      status,
      winning_option_id
    )
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(20);
```

**Response**:
```json
[
  {
    "id": "up-456",
    "selected_option_id": "1",
    "points_earned": 10,
    "is_correct": true,
    "created_at": "2025-01-18T12:00:00Z",
    "predictions": {
      "competition": "Premier League",
      "home_team": "Arsenal",
      "away_team": "Chelsea",
      "status": "resulted",
      "winning_option_id": "1"
    }
  }
]
```

---

### Leaderboards Endpoints

#### Get All-Time Leaderboard

**Method**: `GET`  
**Endpoint**: `/rest/v1/leaderboards`

```typescript
const { data, error } = await supabase
  .from('leaderboards')
  .select(`
    *,
    users (
      wallet_address,
      username,
      avatar_url
    )
  `)
  .eq('leaderboard_type', 'all_time')
  .order('rank', { ascending: true })
  .limit(100);
```

**Response**:
```json
[
  {
    "id": "lb-1",
    "user_id": "user-123",
    "leaderboard_type": "all_time",
    "points": 5430,
    "rank": 1,
    "users": {
      "wallet_address": "erd1...",
      "username": "GalacticKing",
      "avatar_url": "https://..."
    }
  },
  {
    "rank": 2,
    "points": 4820,
    ...
  }
]
```

#### Get Weekly Leaderboard

**Method**: `GET`  
**Endpoint**: `/rest/v1/leaderboards`

```typescript
const currentWeek = getISOWeek(new Date());
const currentYear = getYear(new Date());

const { data, error } = await supabase
  .from('leaderboards')
  .select('*, users(*)')
  .eq('leaderboard_type', 'weekly')
  .eq('week_number', currentWeek)
  .eq('year', currentYear)
  .order('rank', { ascending: true })
  .limit(100);
```

#### Get User Rank

**Method**: `GET`  
**Endpoint**: `/rest/v1/leaderboards`

```typescript
const { data, error } = await supabase
  .from('leaderboards')
  .select('rank, points, leaderboard_type')
  .eq('user_id', userId)
  .eq('leaderboard_type', 'all_time')
  .single();
```

**Response**:
```json
{
  "rank": 42,
  "points": 2150,
  "leaderboard_type": "all_time"
}
```

---

### War Games Endpoints

#### Get Available Matches (Pending)

**Method**: `GET`  
**Endpoint**: `/rest/v1/war_games`

```typescript
const { data, error } = await supabase
  .from('war_games')
  .select(`
    *,
    users!war_games_player_a_id_fkey (
      wallet_address,
      username
    )
  `)
  .eq('status', 'pending')
  .is('player_b_id', null)
  .order('created_at', { ascending: false });
```

#### Create War Game

**Method**: `POST`  
**Endpoint**: `/rest/v1/war_games`

```typescript
const { data, error } = await supabase
  .from('war_games')
  .insert({
    player_a_id: userId,
    team_a: {
      nfts: [
        { id: 'GALACTICX-abc-01', position: 'GK', score: 88 },
        { id: 'GALACTICX-abc-02', position: 'DEF', score: 82 },
        // ... 11 total
      ],
      coach: { id: 'COACH-xyz-01', bonus: 5 },
      stadium: { id: 'STADIUM-xyz-01', bonus: 3 }
    },
    status: 'pending'
  });
```

#### Join War Game (as Player B)

**Method**: `PATCH`  
**Endpoint**: `/rest/v1/war_games?id=eq.{id}`

```typescript
const { data, error } = await supabase
  .from('war_games')
  .update({
    player_b_id: userId,
    team_b: { /* team composition */ },
    status: 'locked'
  })
  .eq('id', warGameId)
  .eq('status', 'pending');
```

#### Get User War Game History

**Method**: `GET`  
**Endpoint**: `/rest/v1/war_games`

```typescript
const { data, error } = await supabase
  .from('war_games')
  .select('*')
  .or(`player_a_id.eq.${userId},player_b_id.eq.${userId}`)
  .order('match_date', { ascending: false })
  .limit(20);
```

---

### Weekly Streaks Endpoints

#### Get Current Week Streak

**Method**: `GET`  
**Endpoint**: `/rest/v1/weekly_streaks`

```typescript
const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });  // Monday

const { data, error } = await supabase
  .from('weekly_streaks')
  .select('*')
  .eq('user_id', userId)
  .eq('week_start', format(weekStart, 'yyyy-MM-dd'))
  .single();
```

**Response**:
```json
{
  "id": "streak-123",
  "user_id": "user-123",
  "week_start": "2025-01-13",
  "claims": {
    "monday": true,
    "tuesday": true,
    "wednesday": true,
    "thursday": false,
    "friday": false,
    "saturday": false,
    "sunday": false
  },
  "total_points": 45,
  "bonus_tokens": 0,
  "completed": false
}
```

#### Claim Daily Reward

**Method**: `POST` (via Edge Function)  
**Endpoint**: `/functions/v1/process-daily-claim`

See [Edge Functions](#edge-functions) section.

---

### Team of the Week Endpoints

#### Get Current TOTW

**Method**: `GET`  
**Endpoint**: `/rest/v1/team_of_week`

```typescript
const { data, error } = await supabase
  .from('team_of_week')
  .select('*')
  .order('published_at', { ascending: false })
  .limit(1)
  .single();
```

**Response**:
```json
{
  "id": "totw-45",
  "week_number": 3,
  "year": 2025,
  "player_names": [
    "Haaland",
    "De Bruyne",
    "Salah",
    // ... 15 total
  ],
  "nft_ids": [
    "GALACTICX-haaland-01",
    "GALACTICX-debruyne-02",
    // ... matched NFTs
  ],
  "published_at": "2025-01-15T12:00:00Z"
}
```

---

### NFT Metadata Endpoints

#### Get User NFTs (Cached)

**Method**: `GET`  
**Endpoint**: `/rest/v1/nft_metadata`

```typescript
const { data, error } = await supabase
  .from('nft_metadata')
  .select('*')
  .eq('owner_address', walletAddress)
  .order('name', { ascending: true });
```

**Response**:
```json
[
  {
    "nft_id": "GALACTICX-abc123-01",
    "collection": "GALACTICX-abc123",
    "name": "Erling Haaland",
    "position": "ATT",
    "league": "Premier League",
    "rarity": "Legendary",
    "attributes": {
      "pace": 95,
      "shooting": 94,
      "passing": 70,
      "dribbling": 80,
      "defense": 45,
      "physical": 88
    },
    "metadata_uri": "ipfs://...",
    "owner_address": "erd1...",
    "last_synced": "2025-01-15T10:00:00Z"
  }
]
```

---

## Edge Functions

Supabase Edge Functions handle custom business logic, validation, and server-side operations.

### 1. Validate Prediction Result

**Path**: `supabase/functions/validate-prediction-result/index.ts`  
**Method**: `POST`  
**Endpoint**: `/functions/v1/validate-prediction-result`  
**Auth**: Required (Admin only)

**Purpose**: Admin sets the winning option for a prediction and awards points to correct users.

**Request**:
```json
{
  "prediction_id": "pred-123",
  "winning_option_id": "1"
}
```

**Logic**:
1. Verify admin role (`role = 'king'`)
2. Update prediction: `winning_option_id`, `status = 'resulted'`
3. Query all `user_predictions` for this prediction
4. For each user:
   - If `selected_option_id == winning_option_id`:
     - Set `is_correct = true`
     - Set `points_earned = prediction.points_reward`
     - Update `users.total_points`
   - Else:
     - Set `is_correct = false`
     - Set `points_earned = 0`
5. Update leaderboards

**Response**:
```json
{
  "success": true,
  "prediction_id": "pred-123",
  "winning_option_id": "1",
  "correct_predictions": 342,
  "total_predictions": 1250,
  "points_distributed": 3420
}
```

**Error Responses**:
```json
// Unauthorized
{
  "error": "Unauthorized",
  "message": "Only admins can validate results"
}

// Prediction not found
{
  "error": "Not Found",
  "message": "Prediction does not exist"
}

// Already resulted
{
  "error": "Bad Request",
  "message": "Prediction already has a result"
}
```

---

### 2. Process War Game Result

**Path**: `supabase/functions/process-war-game-result/index.ts`  
**Method**: `POST`  
**Endpoint**: `/functions/v1/process-war-game-result`  
**Auth**: Required (System or Admin)

**Purpose**: Calculate team scores, determine winner, award points, unlock NFTs.

**Request**:
```json
{
  "war_game_id": "wg-456"
}
```

**Logic**:
1. Fetch war game record
2. Verify both teams submitted (`team_a` and `team_b` not null)
3. Calculate Team A score:
   - Sum NFT scores by position weights
   - Apply coach bonus
   - Apply stadium bonus
4. Calculate Team B score (same logic)
5. Determine winner (higher score)
6. Award points to winner
7. Update war game:
   - `winner_id`
   - `points_awarded`
   - `status = 'completed'`
8. Unlock all NFTs (remove from "in_battle" state)

**Response**:
```json
{
  "success": true,
  "war_game_id": "wg-456",
  "team_a_score": 925,
  "team_b_score": 910,
  "winner_id": "user-123",
  "points_awarded": 50
}
```

---

### 3. Process Daily Claim

**Path**: `supabase/functions/process-daily-claim/index.ts`  
**Method**: `POST`  
**Endpoint**: `/functions/v1/process-daily-claim`  
**Auth**: Required

**Purpose**: Validate and process daily claim for weekly streak.

**Request**:
```json
{
  "user_id": "user-123"
}
```

**Logic**:
1. Get current week (Monday start)
2. Fetch or create `weekly_streaks` record for user + week
3. Determine current day (Monday-Sunday)
4. Check if already claimed today
5. If not claimed:
   - Update `claims.{day} = true`
   - Calculate points for day (10-50)
   - Add bonus tokens if weekend
   - Update `total_points`, `bonus_tokens`
   - Update user's `current_streak`, `total_points`
6. Check if week completed (all 7 days)

**Response**:
```json
{
  "success": true,
  "day": "wednesday",
  "points_earned": 20,
  "bonus_tokens": 0,
  "current_streak": 3,
  "week_completed": false
}
```

**Error**:
```json
{
  "error": "Already Claimed",
  "message": "You have already claimed today's reward"
}
```

---

### 4. Reset Weekly Leaderboard

**Path**: `supabase/functions/reset-weekly-leaderboard/index.ts`  
**Method**: `POST` (Cron trigger)  
**Endpoint**: `/functions/v1/reset-weekly-leaderboard`  
**Auth**: Service role (scheduled)

**Purpose**: Reset weekly leaderboard every Monday at 00:00 UTC.

**Trigger**: Supabase Cron Job
```sql
SELECT cron.schedule(
  'reset-weekly-leaderboard',
  '0 0 * * 1',  -- Every Monday at midnight
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/reset-weekly-leaderboard',
    headers := '{"Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

**Logic**:
1. Archive previous week's leaderboard
2. Delete current weekly leaderboard entries
3. Create new leaderboard entries from users with points > 0
4. Reset user weekly point counters (if tracked separately)

**Response**:
```json
{
  "success": true,
  "week_archived": 2,
  "year": 2025,
  "users_reset": 1543
}
```

---

### 5. Sync NFT Ownership

**Path**: `supabase/functions/sync-nft-ownership/index.ts`  
**Method**: `POST`  
**Endpoint**: `/functions/v1/sync-nft-ownership`  
**Auth**: Required

**Purpose**: Sync user's NFT ownership from MultiversX to local cache.

**Request**:
```json
{
  "wallet_address": "erd1..."
}
```

**Logic**:
1. Fetch NFTs from MultiversX API: `/accounts/{address}/nfts?collections=GALACTICX`
2. Parse NFT metadata (name, position, rarity, attributes)
3. Upsert into `nft_metadata` table
4. Update user's `nft_count`
5. Return NFT list

**Response**:
```json
{
  "success": true,
  "nft_count": 7,
  "nfts": [
    {
      "nft_id": "GALACTICX-abc123-01",
      "name": "Erling Haaland",
      "position": "ATT",
      "rarity": "Legendary"
    },
    ...
  ],
  "last_synced": "2025-01-15T14:30:00Z"
}
```

---

## MultiversX API Integration

### Base URL
```
Mainnet: https://api.multiversx.com
Devnet: https://devnet-api.multiversx.com
Testnet: https://testnet-api.multiversx.com
```

### Get Account NFTs

**Method**: `GET`  
**Endpoint**: `/accounts/{address}/nfts`

**Parameters**:
- `collections`: Filter by collection (e.g., `GALACTICX-abc123`)
- `size`: Number of results (default: 100)
- `from`: Pagination offset

**Example**:
```typescript
const response = await axios.get(
  `https://api.multiversx.com/accounts/${walletAddress}/nfts`,
  {
    params: {
      collections: 'GALACTICX-abc123',
      size: 100
    }
  }
);
```

**Response**:
```json
[
  {
    "identifier": "GALACTICX-abc123-01",
    "collection": "GALACTICX-abc123",
    "name": "Erling Haaland",
    "nonce": 1,
    "type": "NonFungibleESDT",
    "owner": "erd1...",
    "url": "ipfs://QmXxxx...",
    "metadata": {
      "attributes": "cGFjZTo5NQ==",  // Base64 encoded
      "description": "...",
      "tags": ["football", "striker"]
    }
  }
]
```

### Get NFT Metadata

**Method**: `GET`  
**Endpoint**: `/nfts/{identifier}`

```typescript
const response = await axios.get(
  `https://api.multiversx.com/nfts/GALACTICX-abc123-01`
);
```

### Send Transaction (Rewards)

**Method**: Using `@multiversx/sdk-dapp`

```typescript
import { sendTransactions } from '@multiversx/sdk-dapp/services';

await sendTransactions({
  transactions: [
    {
      value: '1000000000000000000',  // 1 EGLD
      receiver: 'erd1...',
      data: 'TOTW Reward',
      gasLimit: 50000
    }
  ]
});
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": {
    "field": "Additional context"
  },
  "code": "ERROR_CODE",
  "timestamp": "2025-01-15T14:30:00Z"
}
```

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Request completed successfully |
| 201 | Created | Resource created (POST) |
| 400 | Bad Request | Invalid input, validation error |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions (RLS failure) |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry (UNIQUE constraint) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

### Supabase-Specific Errors

```json
// RLS Policy Violation
{
  "code": "42501",
  "message": "new row violates row-level security policy",
  "details": "Policy 'Users can insert own predictions' failed"
}

// Unique Constraint Violation
{
  "code": "23505",
  "message": "duplicate key value violates unique constraint",
  "details": "Key (user_id, prediction_id) already exists"
}

// Foreign Key Violation
{
  "code": "23503",
  "message": "insert or update on table violates foreign key constraint",
  "details": "Key (prediction_id) not found in table predictions"
}
```

### Client-Side Error Handling

```typescript
try {
  const { data, error } = await supabase
    .from('user_predictions')
    .insert({ ... });
  
  if (error) {
    // Handle Supabase error
    if (error.code === '23505') {
      toast.error('You have already submitted a prediction for this match');
    } else if (error.code === '42501') {
      toast.error('You do not have permission to perform this action');
    } else {
      toast.error('An error occurred. Please try again.');
    }
    console.error('Supabase error:', error);
    return;
  }
  
  // Success
  toast.success('Prediction submitted successfully!');
} catch (error) {
  // Handle network or unexpected errors
  console.error('Unexpected error:', error);
  toast.error('Network error. Please check your connection.');
}
```

---

## Rate Limiting

### Supabase Limits (Free Tier)

- **API Requests**: 500 requests/second
- **Realtime Connections**: 200 concurrent
- **Edge Function Invocations**: 500,000/month
- **Database Size**: 500 MB

### Custom Rate Limiting (Edge Functions)

Implement rate limiting for sensitive operations:

```typescript
// Edge Function rate limiter
const rateLimiter = new Map<string, number[]>();

function checkRateLimit(userId: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const userRequests = rateLimiter.get(userId) || [];
  
  // Remove old requests outside window
  const recentRequests = userRequests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return false;  // Rate limit exceeded
  }
  
  recentRequests.push(now);
  rateLimiter.set(userId, recentRequests);
  return true;
}

// Usage
if (!checkRateLimit(userId, 10, 60000)) {  // 10 requests per minute
  return new Response('Rate limit exceeded', { status: 429 });
}
```

---

## API Usage Examples

### Complete Prediction Submission Flow

```typescript
// 1. Check NFT ownership
const { hasNFT } = await fetch('/functions/v1/sync-nft-ownership', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwt}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ wallet_address: userAddress })
}).then(r => r.json());

if (!hasNFT) {
  throw new Error('You need at least 1 GalacticX NFT');
}

// 2. Fetch active predictions
const { data: predictions } = await supabase
  .from('predictions')
  .select('*')
  .eq('status', 'open')
  .gte('close_date', new Date().toISOString());

// 3. Submit prediction
const { data, error } = await supabase
  .from('user_predictions')
  .insert({
    user_id: userId,
    prediction_id: selectedPrediction.id,
    selected_option_id: selectedOption
  });

if (error) {
  handleError(error);
} else {
  toast.success('Prediction submitted!');
}
```

---

## Conclusion

GalacticX API architecture provides:

✅ **Secure**: RLS policies, JWT auth, admin validation  
✅ **Flexible**: Auto-generated REST + custom Edge Functions  
✅ **Real-time**: Supabase subscriptions for live updates  
✅ **Blockchain-Integrated**: MultiversX API for NFT ownership  
✅ **Developer-Friendly**: Typed SDK, clear error messages  

For implementation details, see:
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database structure
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - How to set up Supabase
- [MULTIVERSX_INTEGRATION.md](./MULTIVERSX_INTEGRATION.md) - Blockchain integration


