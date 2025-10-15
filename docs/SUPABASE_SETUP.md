# GalacticX dApp - Supabase Setup Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Database Migration](#database-migration)
5. [Row Level Security Configuration](#row-level-security-configuration)
6. [Edge Functions Setup](#edge-functions-setup)
7. [Environment Variables](#environment-variables)
8. [Local Development](#local-development)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Supabase serves as the complete backend for GalacticX, providing:

- **PostgreSQL Database**: User data, predictions, leaderboards
- **Authentication**: (Optional) Can integrate with MultiversX wallet auth
- **Realtime**: Live leaderboard updates
- **Edge Functions**: Server-side logic (validation, scoring)
- **Storage**: NFT metadata caching

---

## Prerequisites

### Required Tools

1. **Node.js**: v18+ (already required for React)
2. **npm**: Comes with Node.js
3. **Supabase Account**: [https://supabase.com/](https://supabase.com/)
4. **Supabase CLI**: For local development

### Install Supabase CLI

**PowerShell (Windows)**:
```powershell
# Using Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or download binary from GitHub releases
# https://github.com/supabase/cli/releases
```

**Verify Installation**:
```powershell
supabase --version
```

---

## Initial Setup

### Step 1: Create Supabase Project

1. Go to [https://app.supabase.com/](https://app.supabase.com/)
2. Click **"New Project"**
3. Fill in details:
   - **Name**: `galacticx-dapp`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Plan**: Start with Free tier

4. Wait for project to initialize (~2 minutes)

### Step 2: Get API Credentials

Once project is ready:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon (public) key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep secret!)

### Step 3: Initialize Supabase in Project

```powershell
# Navigate to project root
cd C:\Users\felix\Documents\...\GalacticDapp

# Initialize Supabase
supabase init
```

This creates a `supabase/` folder with:
```
supabase/
├── config.toml
├── migrations/
├── functions/
└── seed.sql
```

---

## Database Migration

### Step 1: Create Migration Files

Create SQL migration files in `supabase/migrations/`:

#### Migration 1: Users Table

**File**: `supabase/migrations/20250115000001_create_users_table.sql`

```sql
-- Create users table
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

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all profiles"
ON users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own profile"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE users IS 'User profiles and global stats';
COMMENT ON COLUMN users.role IS 'User role: user (default) or king (admin)';
```

#### Migration 2: Predictions Tables

**File**: `supabase/migrations/20250115000002_create_predictions_tables.sql`

```sql
-- Create predictions table
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
  
  CONSTRAINT valid_dates CHECK (close_date <= start_date),
  CONSTRAINT valid_options CHECK (jsonb_array_length(options) >= 2)
);

-- Create user_predictions table
CREATE TABLE user_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  selected_option_id TEXT NOT NULL,
  points_earned INTEGER DEFAULT 0,
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_prediction UNIQUE (user_id, prediction_id)
);

-- Indexes
CREATE INDEX idx_predictions_status ON predictions(status);
CREATE INDEX idx_predictions_start_date ON predictions(start_date DESC);
CREATE INDEX idx_user_predictions_user_id ON user_predictions(user_id);
CREATE INDEX idx_user_predictions_prediction_id ON user_predictions(prediction_id);

-- Enable RLS
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_predictions ENABLE ROW LEVEL SECURITY;

-- Predictions RLS Policies
CREATE POLICY "Predictions are viewable by everyone"
ON predictions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can create predictions"
ON predictions FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'king')
);

-- User Predictions RLS Policies
CREATE POLICY "Users can view own predictions"
ON user_predictions FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own predictions"
ON user_predictions FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM predictions
    WHERE predictions.id = prediction_id
    AND predictions.status = 'open'
    AND predictions.close_date > NOW()
  )
);

-- Triggers
CREATE TRIGGER update_predictions_updated_at
BEFORE UPDATE ON predictions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Migration 3: War Games, Streaks, Leaderboards

Create similar migration files for remaining tables (see [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for full schemas).

### Step 2: Run Migrations Locally

```powershell
# Link to remote project
supabase link --project-ref your-project-ref

# Run all migrations
supabase db reset
```

### Step 3: Push to Production

```powershell
# Push migrations to remote database
supabase db push
```

---

## Row Level Security Configuration

RLS policies are included in migration files, but you can also manage them via Supabase Dashboard:

### Via Dashboard

1. Go to **Database** → **Tables**
2. Select a table (e.g., `users`)
3. Click **"RLS Policies"**
4. Enable RLS if not already enabled
5. Add policies via UI

### Test RLS Policies

```sql
-- Test as authenticated user
SET request.jwt.claims = '{"sub": "user-id-here"}';

-- Try to select (should work)
SELECT * FROM users;

-- Try to insert another user's record (should fail)
INSERT INTO users (id, wallet_address) VALUES ('other-user-id', 'erd1...');
```

---

## Edge Functions Setup

### Step 1: Create Edge Function

```powershell
# Create a new Edge Function
supabase functions new validate-prediction-result
```

This creates: `supabase/functions/validate-prediction-result/index.ts`

### Step 2: Implement Function

**File**: `supabase/functions/validate-prediction-result/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    // 1. Get authorization token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 });
    }

    // 2. Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    // 3. Verify user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { data: userRecord } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userRecord?.role !== 'king') {
      return new Response('Forbidden: Admin only', { status: 403 });
    }

    // 4. Parse request body
    const { prediction_id, winning_option_id } = await req.json();

    // 5. Update prediction
    const { error: predError } = await supabase
      .from('predictions')
      .update({
        winning_option_id,
        status: 'resulted'
      })
      .eq('id', prediction_id);

    if (predError) throw predError;

    // 6. Get prediction details for points
    const { data: prediction } = await supabase
      .from('predictions')
      .select('points_reward')
      .eq('id', prediction_id)
      .single();

    // 7. Get all user predictions
    const { data: userPredictions } = await supabase
      .from('user_predictions')
      .select('*')
      .eq('prediction_id', prediction_id);

    // 8. Update each user prediction
    let correctCount = 0;
    for (const userPred of userPredictions || []) {
      const isCorrect = userPred.selected_option_id === winning_option_id;
      const points = isCorrect ? prediction.points_reward : 0;

      // Update user_prediction
      await supabase
        .from('user_predictions')
        .update({
          is_correct: isCorrect,
          points_earned: points
        })
        .eq('id', userPred.id);

      // Update user total_points
      if (isCorrect) {
        correctCount++;
        await supabase.rpc('update_user_total_points', {
          p_user_id: userPred.user_id,
          p_points_to_add: points
        });
      }
    }

    // 9. Return success
    return new Response(
      JSON.stringify({
        success: true,
        prediction_id,
        winning_option_id,
        correct_predictions: correctCount,
        total_predictions: userPredictions?.length || 0
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
```

### Step 3: Deploy Edge Function

```powershell
# Deploy to Supabase
supabase functions deploy validate-prediction-result

# Set environment secrets (if needed)
supabase secrets set MY_SECRET=value
```

### Step 4: Test Edge Function

```powershell
# Invoke locally
supabase functions serve validate-prediction-result

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/validate-prediction-result' `
  --header 'Authorization: Bearer YOUR_ANON_KEY' `
  --header 'Content-Type: application/json' `
  --data '{\"prediction_id\":\"123\",\"winning_option_id\":\"1\"}'
```

---

## Environment Variables

### Step 1: Create `.env.local`

**File**: `.env.local` (at project root)

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# MultiversX
VITE_MULTIVERSX_NETWORK=devnet
VITE_GALACTICX_COLLECTION=GALACTICX-abc123
```

**Important**: Add `.env.local` to `.gitignore`!

```gitignore
# .gitignore
.env.local
.env.*.local
```

### Step 2: Create Supabase Client

**File**: `src/lib/supabase/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
```

### Step 3: Use in Application

```typescript
import { supabase } from 'lib/supabase/client';

// Fetch data
const { data, error } = await supabase
  .from('predictions')
  .select('*')
  .eq('status', 'open');
```

---

## Local Development

### Start Supabase Locally (Docker Required)

```powershell
# Start local Supabase (requires Docker Desktop)
supabase start

# Output will show local URLs:
# API URL: http://localhost:54321
# Studio URL: http://localhost:54323
# Anon key: eyJhbG...
```

### Use Local Environment

**File**: `.env.local` (for local dev)

```bash
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### Stop Local Supabase

```powershell
supabase stop
```

---

## Production Deployment

### Step 1: Environment Variables (Production)

Update `.env.production` or configure in your hosting provider (Vercel, Netlify):

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### Step 2: Deploy Migrations

```powershell
# Push all migrations to production
supabase db push
```

### Step 3: Deploy Edge Functions

```powershell
# Deploy all functions
supabase functions deploy validate-prediction-result
supabase functions deploy process-war-game-result
supabase functions deploy process-daily-claim
supabase functions deploy reset-weekly-leaderboard
```

### Step 4: Setup Cron Jobs

For scheduled tasks (e.g., weekly leaderboard reset):

```sql
-- Run in Supabase SQL Editor
SELECT cron.schedule(
  'reset-weekly-leaderboard',
  '0 0 * * 1',  -- Every Monday at midnight UTC
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/reset-weekly-leaderboard',
    headers := jsonb_build_object(
      'Authorization', 'Bearer SERVICE_ROLE_KEY'
    )
  );
  $$
);
```

---

## Troubleshooting

### Issue: Migration Fails

**Error**: `relation "users" does not exist`

**Solution**:
```powershell
# Reset local database
supabase db reset

# Or manually apply migration
supabase migration up
```

### Issue: RLS Policy Blocks Query

**Error**: `new row violates row-level security policy`

**Solution**:
1. Check if RLS is enabled: `ALTER TABLE users ENABLE ROW LEVEL SECURITY;`
2. Verify policy exists and is correct
3. Test with service_role key (bypasses RLS) to isolate issue

### Issue: Edge Function Timeout

**Error**: `Function execution timed out`

**Solution**:
1. Optimize database queries (add indexes)
2. Reduce batch sizes
3. Use background jobs for heavy tasks

### Issue: Cannot Connect to Supabase

**Error**: `fetch failed`

**Solution**:
1. Verify `VITE_SUPABASE_URL` is correct
2. Check network/firewall
3. Ensure project is not paused (Free tier auto-pauses after 1 week inactivity)

### Issue: Realtime Not Working

**Solution**:
1. Enable Realtime for table:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE leaderboards;
   ```
2. Check subscription code:
   ```typescript
   supabase.channel('channel-name').subscribe()
   ```

---

## Useful Commands

```powershell
# Database
supabase db reset                    # Reset local DB
supabase db push                     # Push migrations to remote
supabase db pull                     # Pull schema from remote
supabase db diff                     # Show diff between local and remote

# Migrations
supabase migration new my_migration  # Create new migration
supabase migration up                # Run pending migrations

# Edge Functions
supabase functions new my-function   # Create new function
supabase functions deploy my-function # Deploy function
supabase functions serve             # Run functions locally

# Secrets
supabase secrets set KEY=value       # Set secret for Edge Functions
supabase secrets list                # List all secrets

# Project
supabase link --project-ref abc123   # Link to remote project
supabase projects list               # List all projects
```

---

## Next Steps

After setup:

1. ✅ **Test Database Access**: Query tables from frontend
2. ✅ **Test RLS Policies**: Attempt unauthorized access (should fail)
3. ✅ **Deploy Edge Functions**: Test admin operations
4. ✅ **Setup Realtime**: Test leaderboard live updates
5. ✅ **Seed Test Data**: Add sample predictions, users

---

## Resources

- **Supabase Docs**: https://supabase.com/docs
- **Supabase CLI**: https://supabase.com/docs/guides/cli
- **Edge Functions**: https://supabase.com/docs/guides/functions
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security

---

## Conclusion

Supabase setup for GalacticX provides:

✅ **Complete Backend**: Database, Auth, Realtime, Functions  
✅ **Secure**: RLS policies protect data  
✅ **Scalable**: Auto-scaling, connection pooling  
✅ **Local Dev**: Test locally before deploying  
✅ **Type-Safe**: TypeScript support  

For implementation details, see:
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Full database design
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - API usage
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Overall system design


