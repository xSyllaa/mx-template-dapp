# GalacticX dApp - Database Schema Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Database Tables](#database-tables)
3. [Row Level Security Policies](#row-level-security-policies)
4. [Database Functions & Triggers](#database-functions--triggers)
5. [Indexes & Performance](#indexes--performance)
6. [Migrations](#migrations)

---

## Overview

GalacticX uses **PostgreSQL** (via Supabase) as its primary database. All tables implement **Row Level Security (RLS)** to ensure data access is properly controlled at the database level.

### Design Principles
- **Security First**: RLS enabled on all tables
- **Normalization**: Proper foreign key relationships
- **Audit Trail**: `created_at`, `updated_at` timestamps
- **Soft Deletes**: Use status flags instead of hard deletes
- **JSONB for Flexibility**: Complex nested data (team compositions, metadata)

### Entity Relationship Diagram

```
┌─────────────┐
│    users    │
└──────┬──────┘
       │
       │ 1:N
       │
   ┌───┴────────────────────┬────────────────┬──────────────┐
   │                        │                │              │
   ▼                        ▼                ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌─────────────┐  ┌────────────┐
│user_predict. │  │  war_games   │  │weekly_      │  │leaderboards│
│              │  │              │  │streaks      │  │            │
└──────┬───────┘  └──────────────┘  └─────────────┘  └────────────┘
       │
       │ N:1
       │
       ▼
┌──────────────┐
│ predictions  │
└──────────────┘

┌──────────────┐
│team_of_week  │
└──────────────┘

┌──────────────┐
│nft_metadata  │  (Cache table)
└──────────────┘
```

---

## Database Tables

### 1. users

Stores user profiles and stats.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'king')),
  total_points INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  streak_last_claim TIMESTAMP WITH TIME ZONE,
  nft_count INTEGER NOT NULL DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_total_points ON users(total_points DESC);

-- Comments
COMMENT ON TABLE users IS 'User profiles and global stats';
COMMENT ON COLUMN users.role IS 'User role: user (default) or king (admin)';
COMMENT ON COLUMN users.total_points IS 'Cumulative points across all activities';
COMMENT ON COLUMN users.current_streak IS 'Current weekly claim streak (0-7)';
COMMENT ON COLUMN users.nft_count IS 'Cached NFT count from MultiversX';
```

**Fields**:
- `id`: UUID primary key (linked to Supabase auth)
- `wallet_address`: MultiversX wallet address (erd1...)
- `username`: Optional display name
- `role`: `user` (default) or `king` (admin)
- `total_points`: Lifetime accumulated points
- `current_streak`: Current consecutive days claimed (0-7)
- `streak_last_claim`: Last claim timestamp (for validation)
- `nft_count`: Cached NFT ownership count
- `avatar_url`: Profile picture URL

---

### 2. predictions

Admin-created prediction events (matches).

```sql
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  bet_type TEXT NOT NULL CHECK (bet_type IN ('result', 'over_under', 'scorer', 'both_teams_score')),
  options JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'resulted', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  close_date TIMESTAMP WITH TIME ZONE NOT NULL,
  winning_option_id TEXT,
  points_reward INTEGER NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (close_date <= start_date),
  CONSTRAINT valid_options CHECK (jsonb_array_length(options) >= 2)
);

-- Indexes
CREATE INDEX idx_predictions_status ON predictions(status);
CREATE INDEX idx_predictions_start_date ON predictions(start_date DESC);
CREATE INDEX idx_predictions_created_by ON predictions(created_by);

-- Comments
COMMENT ON TABLE predictions IS 'Admin-created prediction events';
COMMENT ON COLUMN predictions.options IS 'JSON array: [{id, label, odds}]';
COMMENT ON COLUMN predictions.bet_type IS 'Type: result, over_under, scorer, both_teams_score';
COMMENT ON COLUMN predictions.status IS 'open -> closed -> resulted/cancelled';
COMMENT ON COLUMN predictions.winning_option_id IS 'Set when admin validates result';
```

**Fields**:
- `id`: UUID primary key
- `competition`: League/tournament name (e.g., "Premier League")
- `home_team`, `away_team`: Team names
- `bet_type`: Type of prediction (result, over/under, etc.)
- `options`: JSONB array of prediction options
  ```json
  [
    {"id": "1", "label": "Home Win", "odds": "2.5"},
    {"id": "X", "label": "Draw", "odds": "3.2"},
    {"id": "2", "label": "Away Win", "odds": "2.8"}
  ]
  ```
- `status`: Lifecycle status
  - `open`: Users can submit predictions
  - `closed`: No more submissions (match started)
  - `resulted`: Admin validated result
  - `cancelled`: Event cancelled
- `start_date`: Match start time
- `close_date`: Deadline for predictions (before match start)
- `winning_option_id`: ID of the correct option (set by admin)
- `points_reward`: Points awarded for correct prediction

**Lifecycle**:
```
open → closed → resulted
  └───────────────┴───► cancelled
```

---

### 3. user_predictions

User submissions for predictions.

```sql
CREATE TABLE user_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  selected_option_id TEXT NOT NULL,
  points_earned INTEGER DEFAULT 0,
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_prediction UNIQUE (user_id, prediction_id)
);

-- Indexes
CREATE INDEX idx_user_predictions_user_id ON user_predictions(user_id);
CREATE INDEX idx_user_predictions_prediction_id ON user_predictions(prediction_id);
CREATE INDEX idx_user_predictions_is_correct ON user_predictions(is_correct);

-- Comments
COMMENT ON TABLE user_predictions IS 'User submissions for prediction events';
COMMENT ON COLUMN user_predictions.is_correct IS 'NULL until result validated, then TRUE/FALSE';
COMMENT ON COLUMN user_predictions.points_earned IS 'Points awarded (0 if incorrect)';
```

**Fields**:
- `user_id`: FK to users
- `prediction_id`: FK to predictions
- `selected_option_id`: ID of chosen option (from `predictions.options`)
- `points_earned`: Points awarded (set when result validated)
- `is_correct`: NULL (pending), TRUE, or FALSE

**Constraints**:
- One prediction per user per event (`UNIQUE (user_id, prediction_id)`)

---

### 4. war_games

NFT team battles (1v1 matches).

```sql
CREATE TABLE war_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_a_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  player_b_id UUID,
  team_a JSONB NOT NULL,
  team_b JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'locked', 'completed', 'cancelled')),
  winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  points_awarded INTEGER DEFAULT 0,
  match_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT different_players CHECK (player_a_id != player_b_id)
);

-- Indexes
CREATE INDEX idx_war_games_player_a ON war_games(player_a_id);
CREATE INDEX idx_war_games_player_b ON war_games(player_b_id);
CREATE INDEX idx_war_games_status ON war_games(status);
CREATE INDEX idx_war_games_match_date ON war_games(match_date DESC);

-- Comments
COMMENT ON TABLE war_games IS 'NFT team battle matches (1v1)';
COMMENT ON COLUMN war_games.team_a IS 'JSON: {nfts: [], coach, stadium, total_score}';
COMMENT ON COLUMN war_games.status IS 'pending -> locked -> completed/cancelled';
```

**Fields**:
- `player_a_id`: User who created the match
- `player_b_id`: User who joined (NULL if waiting)
- `team_a`, `team_b`: JSONB team compositions
  ```json
  {
    "nfts": [
      {"id": "GALACTICX-abc123-01", "position": "GK", "score": 85},
      {"id": "GALACTICX-abc123-02", "position": "DEF", "score": 78},
      ...
    ],
    "coach": {"id": "COACH-xyz-01", "bonus": 5},
    "stadium": {"id": "STADIUM-xyz-01", "bonus": 3},
    "total_score": 920
  }
  ```
- `status`:
  - `pending`: Waiting for player B
  - `locked`: Both teams submitted, NFTs locked
  - `completed`: Match finished, winner determined
  - `cancelled`: Match aborted
- `winner_id`: FK to users (winner)
- `points_awarded`: Points given to winner

**Lifecycle**:
```
pending → locked → completed
    └──────────────┴───► cancelled
```

---

### 5. weekly_streaks

Daily claim tracking for weekly streaks.

```sql
CREATE TABLE weekly_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  claims JSONB NOT NULL DEFAULT '{}',
  total_points INTEGER NOT NULL DEFAULT 0,
  bonus_tokens DECIMAL(18, 6) DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_week UNIQUE (user_id, week_start)
);

-- Indexes
CREATE INDEX idx_weekly_streaks_user_id ON weekly_streaks(user_id);
CREATE INDEX idx_weekly_streaks_week_start ON weekly_streaks(week_start DESC);
CREATE INDEX idx_weekly_streaks_completed ON weekly_streaks(completed);

-- Comments
COMMENT ON TABLE weekly_streaks IS 'Weekly claim streak tracking (Monday-Sunday)';
COMMENT ON COLUMN weekly_streaks.claims IS 'JSON: {monday: true, tuesday: false, ...}';
COMMENT ON COLUMN weekly_streaks.week_start IS 'Monday date of the week';
COMMENT ON COLUMN weekly_streaks.completed IS 'TRUE if all 7 days claimed';
```

**Fields**:
- `user_id`: FK to users
- `week_start`: Monday date (e.g., 2025-01-13)
- `claims`: JSONB tracking daily claims
  ```json
  {
    "monday": true,
    "tuesday": true,
    "wednesday": false,
    "thursday": false,
    "friday": false,
    "saturday": false,
    "sunday": false
  }
  ```
- `total_points`: Sum of points claimed this week
- `bonus_tokens`: $GOAL tokens earned (Saturday/Sunday)
- `completed`: True if all 7 days claimed

**Rewards per day**:
| Day | Points | Bonus Tokens |
|-----|--------|--------------|
| Monday | 10 | 0 |
| Tuesday | 15 | 0 |
| Wednesday | 20 | 0 |
| Thursday | 25 | 0 |
| Friday | 30 | 0 |
| Saturday | 40 | 0.01 $GOAL |
| Sunday | 50 | 0.02 $GOAL |

---

### 6. leaderboards

Ranking tables (all-time & weekly).

```sql
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leaderboard_type TEXT NOT NULL CHECK (leaderboard_type IN ('all_time', 'weekly')),
  week_number INTEGER,
  year INTEGER,
  points INTEGER NOT NULL DEFAULT 0,
  rank INTEGER NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_leaderboard UNIQUE (user_id, leaderboard_type, week_number, year),
  CONSTRAINT week_required_for_weekly CHECK (
    (leaderboard_type = 'weekly' AND week_number IS NOT NULL AND year IS NOT NULL) OR
    (leaderboard_type = 'all_time' AND week_number IS NULL AND year IS NULL)
  )
);

-- Indexes
CREATE INDEX idx_leaderboards_type ON leaderboards(leaderboard_type);
CREATE INDEX idx_leaderboards_week ON leaderboards(week_number, year);
CREATE INDEX idx_leaderboards_rank ON leaderboards(leaderboard_type, rank);
CREATE INDEX idx_leaderboards_user_id ON leaderboards(user_id);

-- Comments
COMMENT ON TABLE leaderboards IS 'User rankings (all-time and weekly)';
COMMENT ON COLUMN leaderboards.week_number IS 'ISO week number (1-53), required for weekly type';
COMMENT ON COLUMN leaderboards.rank IS 'Position in leaderboard (1 = first place)';
```

**Fields**:
- `user_id`: FK to users
- `leaderboard_type`: `all_time` or `weekly`
- `week_number`: ISO week (1-53) for weekly leaderboards
- `year`: Year for weekly leaderboards
- `points`: Point count for this leaderboard
- `rank`: Position (1 = first)

**Types**:
1. **All-Time**: Cumulative points across all activities
2. **Weekly**: Points earned in specific week (resets Monday)

---

### 7. team_of_week

Weekly showcase of top-performing players.

```sql
CREATE TABLE team_of_week (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  player_names TEXT[] NOT NULL,
  nft_ids TEXT[],
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT unique_week UNIQUE (week_number, year),
  CONSTRAINT valid_player_count CHECK (array_length(player_names, 1) = 15)
);

-- Indexes
CREATE INDEX idx_totw_week ON team_of_week(week_number DESC, year DESC);
CREATE INDEX idx_totw_published ON team_of_week(published_at DESC);

-- Comments
COMMENT ON TABLE team_of_week IS 'Weekly top 15 players (real-world performance)';
COMMENT ON COLUMN team_of_week.player_names IS 'Array of 15 player names';
COMMENT ON COLUMN team_of_week.nft_ids IS 'Matched NFT identifiers (auto-populated)';
```

**Fields**:
- `week_number`, `year`: Week identifier
- `player_names`: Array of 15 real-world player names
- `nft_ids`: Matched GalacticX NFT IDs (auto-populated by Edge Function)
- `published_at`: Publication timestamp
- `created_by`: Admin who published (FK to users)

**Process**:
1. Admin enters 15 player names (Wednesday)
2. Edge Function matches names to NFT IDs
3. System identifies holders of matched NFTs
4. Rewards distributed to holders

---

### 8. nft_metadata (Cache Table)

Local cache of NFT metadata from MultiversX.

```sql
CREATE TABLE nft_metadata (
  nft_id TEXT PRIMARY KEY,
  collection TEXT NOT NULL,
  name TEXT NOT NULL,
  position TEXT,
  league TEXT,
  rarity TEXT,
  attributes JSONB,
  metadata_uri TEXT,
  owner_address TEXT,
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_nft_metadata_owner ON nft_metadata(owner_address);
CREATE INDEX idx_nft_metadata_position ON nft_metadata(position);
CREATE INDEX idx_nft_metadata_league ON nft_metadata(league);
CREATE INDEX idx_nft_metadata_rarity ON nft_metadata(rarity);
CREATE INDEX idx_nft_metadata_last_synced ON nft_metadata(last_synced);

-- Comments
COMMENT ON TABLE nft_metadata IS 'Cached NFT data from MultiversX (for performance)';
COMMENT ON COLUMN nft_metadata.last_synced IS 'Last sync from MultiversX API';
```

**Fields**:
- `nft_id`: NFT identifier (e.g., "GALACTICX-abc123-01")
- `collection`: Collection ticker
- `name`: Player name
- `position`: GK, DEF, MID, ATT, COACH, STADIUM
- `league`: Premier League, La Liga, etc.
- `rarity`: Common, Rare, Epic, Legendary
- `attributes`: JSONB with stats (pace, shooting, defense, etc.)
- `metadata_uri`: IPFS or URL
- `owner_address`: Current owner (cached)
- `last_synced`: Last sync timestamp

**Sync Strategy**:
- Daily background sync via Edge Function
- Real-time sync when user connects wallet
- 24-hour TTL for cached data

---

## Row Level Security Policies

### users Table

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone authenticated can view all users (for leaderboards)
CREATE POLICY "Public profiles are viewable by everyone"
ON users FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Users can insert their own profile on first login
CREATE POLICY "Users can insert their own profile"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Policy 4: Only admins (role = 'king') can update other users
CREATE POLICY "Admins can update any user"
ON users FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'king'
  )
);

-- Policy 5: No one can delete users (soft delete only)
-- (No DELETE policy = no deletes allowed)
```

### predictions Table

```sql
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Policy 1: All authenticated users can view predictions
CREATE POLICY "Predictions are viewable by everyone"
ON predictions FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Only admins can create predictions
CREATE POLICY "Only admins can create predictions"
ON predictions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'king'
  )
);

-- Policy 3: Only admins can update predictions
CREATE POLICY "Only admins can update predictions"
ON predictions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'king'
  )
);

-- Policy 4: Only admins can delete predictions
CREATE POLICY "Only admins can delete predictions"
ON predictions FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'king'
  )
);
```

### user_predictions Table

```sql
ALTER TABLE user_predictions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own predictions
CREATE POLICY "Users can view own predictions"
ON user_predictions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 2: Admins can view all predictions
CREATE POLICY "Admins can view all predictions"
ON user_predictions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'king'
  )
);

-- Policy 3: Users can insert their own predictions
CREATE POLICY "Users can insert own predictions"
ON user_predictions FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  -- Check if prediction is still open
  EXISTS (
    SELECT 1 FROM predictions
    WHERE predictions.id = prediction_id
    AND predictions.status = 'open'
    AND predictions.close_date > NOW()
  )
);

-- Policy 4: No updates allowed after submission
-- (No UPDATE policy = no updates)

-- Policy 5: No deletes allowed
-- (No DELETE policy = no deletes)
```

### war_games Table

```sql
ALTER TABLE war_games ENABLE ROW LEVEL SECURITY;

-- Policy 1: Players can view their own war games
CREATE POLICY "Users can view own war games"
ON war_games FOR SELECT
TO authenticated
USING (
  player_a_id = auth.uid() OR
  player_b_id = auth.uid()
);

-- Policy 2: All users can view completed games (for history)
CREATE POLICY "Anyone can view completed games"
ON war_games FOR SELECT
TO authenticated
USING (status = 'completed');

-- Policy 3: Users can create war games
CREATE POLICY "Users can create war games"
ON war_games FOR INSERT
TO authenticated
WITH CHECK (player_a_id = auth.uid());

-- Policy 4: Players can update their own pending games (join as player_b)
CREATE POLICY "Users can join pending games"
ON war_games FOR UPDATE
TO authenticated
USING (
  status = 'pending' AND
  player_a_id != auth.uid()
)
WITH CHECK (player_b_id = auth.uid());

-- Policy 5: Players can cancel their own pending games
CREATE POLICY "Players can cancel own pending games"
ON war_games FOR DELETE
TO authenticated
USING (
  player_a_id = auth.uid() AND
  status = 'pending'
);
```

### weekly_streaks Table

```sql
ALTER TABLE weekly_streaks ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own streaks
CREATE POLICY "Users can view own streaks"
ON weekly_streaks FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 2: Users can insert their own streak records
CREATE POLICY "Users can insert own streaks"
ON weekly_streaks FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy 3: Users can update their own streaks
CREATE POLICY "Users can update own streaks"
ON weekly_streaks FOR UPDATE
TO authenticated
USING (user_id = auth.uid());
```

### leaderboards Table

```sql
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

-- Policy 1: All users can view leaderboards
CREATE POLICY "Leaderboards are viewable by everyone"
ON leaderboards FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Only system (Edge Functions) can insert/update leaderboards
-- (No INSERT/UPDATE policies for users = only service_role can modify)
```

### team_of_week Table

```sql
ALTER TABLE team_of_week ENABLE ROW LEVEL SECURITY;

-- Policy 1: All users can view TOTW
CREATE POLICY "TOTW is viewable by everyone"
ON team_of_week FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Only admins can create TOTW
CREATE POLICY "Only admins can create TOTW"
ON team_of_week FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'king'
  )
);

-- Policy 3: Only admins can update TOTW
CREATE POLICY "Only admins can update TOTW"
ON team_of_week FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'king'
  )
);
```

### nft_metadata Table

```sql
ALTER TABLE nft_metadata ENABLE ROW LEVEL SECURITY;

-- Policy 1: All users can view NFT metadata
CREATE POLICY "NFT metadata is viewable by everyone"
ON nft_metadata FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Only system can insert/update NFT metadata
-- (No user policies = only service_role via Edge Functions)
```

---

## Database Functions & Triggers

### Function: Update `updated_at` Timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_predictions_updated_at BEFORE UPDATE ON predictions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_war_games_updated_at BEFORE UPDATE ON war_games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_streaks_updated_at BEFORE UPDATE ON weekly_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Function: Calculate and Update User Total Points

```sql
CREATE OR REPLACE FUNCTION update_user_total_points(p_user_id UUID, p_points_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET total_points = total_points + p_points_to_add
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Trigger: Update Leaderboard on Points Change

```sql
CREATE OR REPLACE FUNCTION refresh_leaderboards()
RETURNS TRIGGER AS $$
BEGIN
  -- Update all-time leaderboard
  INSERT INTO leaderboards (user_id, leaderboard_type, points, rank)
  VALUES (
    NEW.id,
    'all_time',
    NEW.total_points,
    (SELECT COUNT(*) + 1 FROM users WHERE total_points > NEW.total_points)
  )
  ON CONFLICT (user_id, leaderboard_type, week_number, year)
  DO UPDATE SET
    points = EXCLUDED.points,
    rank = EXCLUDED.rank;
  
  -- Recalculate all ranks (could be optimized with window functions)
  -- This is simplified; in production, use a materialized view or scheduled job
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leaderboard_on_points_change
AFTER UPDATE OF total_points ON users
FOR EACH ROW
EXECUTE FUNCTION refresh_leaderboards();
```

---

## Indexes & Performance

### Composite Indexes

```sql
-- User predictions by user and date
CREATE INDEX idx_user_predictions_user_created ON user_predictions(user_id, created_at DESC);

-- War games by status and date
CREATE INDEX idx_war_games_status_date ON war_games(status, match_date DESC);

-- Leaderboards by type, week, and rank
CREATE INDEX idx_leaderboards_type_week_rank ON leaderboards(leaderboard_type, week_number, year, rank);
```

### Full-Text Search (Future Enhancement)

```sql
-- Search players by name in NFT metadata
CREATE INDEX idx_nft_metadata_name_gin ON nft_metadata USING gin(to_tsvector('english', name));
```

---

## Migrations

All schema changes are managed via Supabase migrations in chronological order.

### Migration Files (supabase/migrations/)

1. **`20250115000001_create_users_table.sql`**
   - Create users table
   - Add indexes
   - Enable RLS
   - Create policies

2. **`20250115000002_create_predictions_tables.sql`**
   - Create predictions table
   - Create user_predictions table
   - Add foreign keys
   - Create indexes
   - Enable RLS
   - Create policies

3. **`20250115000003_create_war_games_table.sql`**
   - Create war_games table
   - Add indexes
   - Enable RLS
   - Create policies

4. **`20250115000004_create_leaderboards_tables.sql`**
   - Create leaderboards table
   - Create weekly_streaks table
   - Add indexes
   - Enable RLS
   - Create policies

5. **`20250115000005_create_team_of_week_and_nft_tables.sql`**
   - Create team_of_week table
   - Create nft_metadata table
   - Add indexes
   - Enable RLS
   - Create policies

6. **`20250115000006_create_functions_and_triggers.sql`**
   - Create utility functions
   - Create triggers
   - Create helper procedures

### Running Migrations

```powershell
# Local development
supabase db reset

# Apply specific migration
supabase migration up --file 20250115000001_create_users_table.sql

# Create new migration
supabase migration new add_user_bio_field

# Push to remote (production)
supabase db push
```

---

## Data Integrity Rules

### Referential Integrity
- All foreign keys use `ON DELETE CASCADE` or `ON DELETE SET NULL`
- Cascade deletes for user-owned data (predictions, streaks)
- Set NULL for audit trail data (created_by fields)

### Constraints
- `CHECK` constraints for enum-like fields (status, role, bet_type)
- `UNIQUE` constraints prevent duplicate submissions
- Date validation ensures logical ordering

### Validation
- JSON schema validation in application layer (Edge Functions)
- Client-side validation for UX
- Database constraints as final safeguard

---

## Backup & Recovery

### Supabase Automatic Backups
- Daily automated backups (Pro plan)
- Point-in-time recovery (PITR)
- Manual backups before major changes

### Backup Strategy
```powershell
# Export schema
supabase db dump --schema public > schema_backup.sql

# Export data
supabase db dump --data-only > data_backup.sql

# Restore
psql -h <host> -U <user> -d <database> -f schema_backup.sql
```

---

## Performance Monitoring

### Key Metrics to Monitor
- Query execution time (use `EXPLAIN ANALYZE`)
- Index usage (pg_stat_user_indexes)
- Table bloat (pg_stat_user_tables)
- Connection pool usage

### Optimization Tips
1. Use `SELECT *` sparingly—specify needed columns
2. Leverage indexes for WHERE, ORDER BY, JOIN clauses
3. Use pagination (LIMIT/OFFSET) for large result sets
4. Consider materialized views for complex leaderboard queries
5. Monitor and vacuum tables regularly

---

## Conclusion

This schema provides a robust, secure, and scalable foundation for GalacticX dApp. Key takeaways:

✅ **Security**: RLS on all tables, admin checks, constrained access  
✅ **Performance**: Strategic indexes, efficient queries, caching  
✅ **Integrity**: Foreign keys, constraints, validation  
✅ **Scalability**: Normalized design, JSONB for flexibility  
✅ **Auditability**: Timestamps, created_by tracking  

For implementation details, see:
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - How to set up the database
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - How to interact with the data
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Overall system design


