# 🚀 Leaderboard System - Quick Start Guide

This guide will help you get the new leaderboard system up and running.

## 📦 What's New

The GalacticX dApp now has a complete leaderboard system with:

✅ **Points Transaction Tracking** - Every gain/loss recorded  
✅ **Three Leaderboard Types** - All-Time, Weekly, Monthly  
✅ **Real-Time Updates** - Auto-refresh via Supabase Realtime  
✅ **Beautiful UI** - Podium for top 3, rankings for 4-100  
✅ **User Rank Card** - See your position at a glance  

---

## 🗄️ Step 1: Database Migration

### 1.1 Apply Schema Changes

Run the migration SQL file in your Supabase SQL editor or via `psql`:

```powershell
# Option A: Via Supabase Dashboard
# 1. Go to Supabase Dashboard > SQL Editor
# 2. Copy contents of LEADERBOARD_MIGRATION.sql
# 3. Click "Run"

# Option B: Via psql (if you have direct access)
psql -h your-db-host.supabase.co -U postgres -d postgres -f LEADERBOARD_MIGRATION.sql
```

This creates:
- `points_transactions` table
- `record_points_transaction()` function
- `get_leaderboard()` function
- `get_user_rank()` function
- Updates to `leaderboards` table

### 1.2 Migrate Existing Data

Run the data migration script:

```powershell
# Migrate historical prediction and streak data
psql -h your-db-host.supabase.co -U postgres -d postgres -f LEADERBOARD_DATA_MIGRATION.sql
```

This will:
- Migrate all `user_predictions` wins to `points_transactions`
- Migrate all `user_predictions` bets (negative amounts)
- Migrate all `weekly_streaks` claims
- Verify totals match

**Expected output:**
```
NOTICE:  === MIGRATION VERIFICATION ===
NOTICE:  Users total_points: 125000
NOTICE:  Transactions sum: 125000
NOTICE:  Difference: 0
NOTICE:  Migration successful! ✓
```

---

## 💻 Step 2: Update Environment (Already Done)

The following files have already been updated:

### Services
- ✅ `src/features/predictions/services/predictionService.ts`
- ✅ `src/features/streaks/services/streakService.ts`

Now using `record_points_transaction()` instead of `update_user_total_points()`.

### New Feature Module
- ✅ `src/features/leaderboard/` - Complete leaderboard feature
  - `types.ts` - TypeScript types
  - `services/leaderboardService.ts` - API calls
  - `hooks/` - Custom React hooks
  - `components/` - UI components

### Updated Pages
- ✅ `src/pages/Leaderboard/Leaderboard.tsx` - Now fully functional!

### Translations
- ✅ `src/i18n/locales/en.json` - English translations
- ✅ `src/i18n/locales/fr.json` - French translations

---

## 🧪 Step 3: Test the System

### 3.1 Test Database Functions

Open Supabase SQL Editor and run:

```sql
-- Test: Record a transaction
SELECT record_points_transaction(
  (SELECT id FROM users LIMIT 1),  -- Get first user
  100,
  'admin_adjustment',
  NULL,
  '{"reason": "test"}'::JSONB
);

-- Test: Get all-time leaderboard
SELECT * FROM get_leaderboard('all_time', NULL, NULL, NULL, 10, NULL);

-- Test: Get weekly leaderboard
SELECT * FROM get_leaderboard('weekly', 42, 2025, NULL, 10, NULL);

-- Test: Get user rank
SELECT * FROM get_user_rank(
  (SELECT id FROM users LIMIT 1),
  'all_time',
  NULL, NULL, NULL, NULL
);
```

### 3.2 Test the UI

1. **Start your development server**:
   ```powershell
   npm run dev
   ```

2. **Navigate to Leaderboards**:
   - Go to `http://localhost:5173/leaderboards` (or your dev URL)
   - You should see the leaderboard page instead of "Coming Soon"

3. **Test the tabs**:
   - Click "All Time" - should show cumulative rankings
   - Click "This Week" - should show weekly rankings
   - Click "This Month" - should show monthly rankings

4. **Test real-time updates**:
   - Open two browser windows
   - In one window, claim a streak reward or submit a prediction
   - The leaderboard should update automatically in the other window (within 2-3s)

5. **Test your rank card**:
   - If you're logged in and have points, you should see a sticky card at the bottom showing your rank

---

## 📊 Step 4: Verify Data

### Check Transaction Counts

```sql
SELECT 
  source_type,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM points_transactions
GROUP BY source_type
ORDER BY count DESC;
```

Expected output:
```
 source_type     | count | total_amount
-----------------+-------+--------------
 prediction_bet  |  150  |    -45000
 prediction_win  |   60  |     90000
 streak_claim    |  200  |     35000
```

### Verify User Points Match

```sql
-- Check if users.total_points matches transaction totals
SELECT 
  u.id,
  u.username,
  u.total_points as cached_points,
  COALESCE(SUM(pt.amount), 0) as calculated_points,
  u.total_points - COALESCE(SUM(pt.amount), 0) as difference
FROM users u
LEFT JOIN points_transactions pt ON u.id = pt.user_id
GROUP BY u.id, u.username, u.total_points
HAVING ABS(u.total_points - COALESCE(SUM(pt.amount), 0)) > 0
ORDER BY difference DESC;
```

If this returns no rows, all points are correctly synced! ✅

---

## 🎨 Step 5: Customize (Optional)

### Change Leaderboard Limit

In `src/pages/Leaderboard/Leaderboard.tsx`:

```typescript
const { entries, loading } = useLeaderboard({
  ...filters,
  limit: 200 // Default is 100
});
```

### Filter by Activity Type

Show only predictions leaderboard:

```typescript
const { entries } = useLeaderboard({
  type: 'all_time',
  sourceTypes: ['prediction_win'] // Only wins
});
```

### Adjust Real-time Debounce

In `src/features/leaderboard/hooks/useLeaderboard.ts`:

```typescript
setTimeout(() => {
  fetchLeaderboard();
}, 5000); // Change from 2000ms to 5000ms
```

---

## 🐛 Troubleshooting

### Issue: "Function record_points_transaction does not exist"

**Solution**: Re-run `LEADERBOARD_MIGRATION.sql`

### Issue: Leaderboard shows no data

**Solution**: 
1. Check if users have points:
   ```sql
   SELECT COUNT(*) FROM users WHERE total_points > 0;
   ```
2. Check if transactions exist:
   ```sql
   SELECT COUNT(*) FROM points_transactions;
   ```
3. If no transactions, run `LEADERBOARD_DATA_MIGRATION.sql`

### Issue: User rank not showing

**Solution**: Make sure you're logged in and have earned points in the selected period.

### Issue: Real-time updates not working

**Solution**:
1. Check Supabase Realtime is enabled for your project
2. Check browser console for WebSocket errors
3. Verify RLS policies allow SELECT on `points_transactions`

---

## 📚 Next Steps

### For Developers

1. **Read the full documentation**: [docs/LEADERBOARD_SYSTEM.md](docs/LEADERBOARD_SYSTEM.md)
2. **Review the architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
3. **Check database schema**: [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)

### For Admins

1. **Monitor performance**: Check query times in Supabase Dashboard
2. **Review transactions**: Regularly audit `points_transactions` table
3. **Adjust limits**: If needed, increase leaderboard limit or add pagination

### Future Features

- 🏆 Leaderboard rewards (automatic prizes for top 10)
- 🎖️ Achievement badges
- 👥 Private leagues (friend groups)
- 📈 Historical charts (points over time)
- 🔔 Rank change notifications

---

## ✅ Checklist

- [ ] Run `LEADERBOARD_MIGRATION.sql`
- [ ] Run `LEADERBOARD_DATA_MIGRATION.sql`
- [ ] Verify data migration (check SQL output)
- [ ] Test leaderboard UI (all 3 tabs)
- [ ] Test real-time updates
- [ ] Verify user rank card appears
- [ ] Check points match between `users` and `points_transactions`
- [ ] Read full documentation

---

## 🆘 Need Help?

- Check [docs/LEADERBOARD_SYSTEM.md](docs/LEADERBOARD_SYSTEM.md) for detailed docs
- Review migration files for SQL details
- Check browser console for errors
- Verify Supabase logs for function errors

**System Version**: 1.0.0  
**Last Updated**: October 17, 2025

