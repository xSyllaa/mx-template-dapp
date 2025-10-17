# 🎯 Betting System - Quick Start Guide

## ⚡ Immediate Action Required

### 1. Execute SQL Migration (5 minutes)

```sql
-- Open Supabase Dashboard > SQL Editor
-- Copy and run the contents of: BETTING_SYSTEM_MIGRATION.sql
```

**What it does:**
- Adds `min_bet_points` and `max_bet_points` to `predictions` table
- Adds `points_wagered` to `user_predictions` table
- Creates performance index
- Adds validation constraints

### 2. Test the System (10 minutes)

1. **Create a Test Prediction (as Admin)**
   - Navigate to `/admin/create-prediction`
   - Fill in match details
   - Set min bet: 10 points
   - Set max bet: 1000 points
   - Create prediction

2. **Place Test Bets (as User)**
   - Navigate to `/predictions`
   - Select the test prediction
   - View betting pool statistics (should show 0 initially)
   - Click an option
   - Use bet amount input:
     - Try quick-select buttons (Min, 25%, 50%, Max)
     - Try manual input
     - See validation errors when out of range
   - Submit bet
   - Watch real-time stats update

3. **Validate Result (as Admin)**
   - Navigate to `/admin/manage-predictions`
   - Click "Validate Result" on the test prediction
   - Select winning option
   - Check that winnings are correctly calculated

## 🎨 Key Features

### For Users
- **Variable Betting**: Choose how many points to wager (within min/max limits)
- **Real-Time Stats**: See live betting pool, odds, and participants
- **Quick Actions**: Fast bet selection with preset percentages
- **Balance Validation**: Can't bet more than you have
- **Instant Feedback**: Clear error messages and confirmations

### For Admins
- **Flexible Limits**: Set different min/max for each prediction
- **Automatic Calculation**: Winnings calculated using Twitch-style ratios
- **No Manual Work**: System handles point distribution

## 📊 How Winnings Are Calculated

**Twitch-Style Pool Ratio:**
```
Total Pool = Sum of all bets across all options
Option Total = Sum of bets on the winning option
Ratio = Total Pool ÷ Option Total
Winnings = User's Bet × Ratio
```

**Example:**
- Total pool: 10,000 points
- Option A total: 3,000 points (wins)
- Option B total: 7,000 points
- Ratio = 10,000 ÷ 3,000 = 3.33x
- User bet 100 points on A → Wins 333 points

## 🔧 Troubleshooting

### Issue: Stats not updating in real-time
**Solution**: Check Supabase Realtime is enabled for `user_predictions` table

### Issue: Can't submit bet
**Checklist**:
- ✅ Wallet connected?
- ✅ Supabase authenticated?
- ✅ Bet amount >= min_bet_points?
- ✅ Bet amount <= max_bet_points?
- ✅ Bet amount <= user's balance?
- ✅ Prediction status = 'open'?

### Issue: Min/Max fields missing in admin form
**Solution**: Clear browser cache, the form should show new fields after CreatePrediction.tsx update

## 📁 Important Files

### To Execute:
- `BETTING_SYSTEM_MIGRATION.sql` - Database changes

### Documentation:
- `BETTING_SYSTEM_IMPLEMENTATION.md` - Full implementation details
- `betting-amounts-system.plan.md` - Original plan

### New Components (Ready to Use):
- `BetAmountInput` - Betting amount selector
- `PredictionStatsDisplay` - Pool statistics display

### New Hooks:
- `useUserPoints(userId)` - Get user's current balance
- `usePredictionStats(predictionId)` - Get betting pool stats

## 🎉 You're Done!

After executing the SQL migration, the system is fully functional and ready for production use.

**Features Working:**
✅ Variable bet amounts with min/max limits
✅ Real-time betting pool statistics
✅ Twitch-style win ratio calculation
✅ Automatic point deduction and distribution
✅ Theme-adaptive UI
✅ Full English and French translations

**Need Help?**
- Check `BETTING_SYSTEM_IMPLEMENTATION.md` for full details
- Review component source code for customization
- Test with small amounts first!

---

**Status**: 🚀 Ready to Launch (after SQL migration)

