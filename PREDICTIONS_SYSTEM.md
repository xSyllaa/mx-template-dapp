# Predictions System - Complete Implementation

## 📋 Overview

A complete prediction betting system has been implemented for GalacticX dApp, allowing admins to create match predictions and users to participate and earn points.

## 🎯 Features Implemented

### For Users
- ✅ View active predictions (open status)
- ✅ Submit predictions by selecting an option
- ✅ See participation status with badges (Participated / Participate)
- ✅ View prediction history (last 24h with pagination)
- ✅ See results and points earned
- ✅ Real-time status updates
- ✅ One prediction per match (enforced by DB constraint)

### For Admins
- ✅ Create new predictions with custom options
- ✅ Manage all predictions (view, edit status, delete)
- ✅ Validate results and award points automatically
- ✅ Change prediction status (open → closed → resulted)
- ✅ Delete predictions
- ✅ Admin dashboard with action cards

## 📂 File Structure

```
src/
├── features/
│   └── predictions/
│       ├── types.ts                          # TypeScript interfaces
│       ├── services/
│       │   └── predictionService.ts          # Supabase CRUD operations
│       ├── hooks/
│       │   ├── usePredictions.ts             # Fetch predictions
│       │   └── useUserPrediction.ts          # User participation
│       ├── components/
│       │   ├── ParticipationBadge.tsx        # Status badge component
│       │   ├── PredictionCard.tsx            # Individual prediction display
│       │   └── PredictionList.tsx            # List with tabs
│       └── index.ts                          # Public exports
├── pages/
│   ├── Predictions/
│   │   └── Predictions.tsx                   # User-facing page
│   └── Admin/
│       ├── Admin.tsx                         # Admin dashboard (updated)
│       ├── CreatePrediction.tsx              # NEW: Create prediction form
│       ├── ManagePredictions.tsx             # NEW: Manage/validate predictions
│       └── index.ts                          # Exports
├── i18n/locales/
│   ├── en.json                               # English translations (updated)
│   └── fr.json                               # French translations (updated)
└── routes/
    └── routes.ts                             # Routes (updated)
```

## 🔧 Technical Implementation

### Database Tables Used

**predictions** - Stores match predictions
```sql
- id (UUID)
- competition (TEXT)
- home_team (TEXT)
- away_team (TEXT)
- bet_type (TEXT: result, over_under, scorer, both_teams_score)
- options (JSONB: [{id, label, odds}])
- status (TEXT: open, closed, resulted, cancelled)
- start_date (TIMESTAMP)
- close_date (TIMESTAMP)
- winning_option_id (TEXT)
- points_reward (INTEGER)
- created_by (UUID FK → users)
```

**user_predictions** - User submissions
```sql
- id (UUID)
- user_id (UUID FK → users)
- prediction_id (UUID FK → predictions)
- selected_option_id (TEXT)
- points_earned (INTEGER)
- is_correct (BOOLEAN)
- created_at (TIMESTAMP)
UNIQUE(user_id, prediction_id)
```

### Service Functions

**User Operations:**
- `getActivePredictions()` - Fetch open predictions
- `getRecentHistory(limit, offset)` - Fetch last 24h with pagination
- `submitPrediction(userId, predictionId, optionId)` - Submit user choice
- `getUserPrediction(userId, predictionId)` - Check if user participated

**Admin Operations:**
- `createPrediction(data, createdBy)` - Create new prediction
- `getAllPredictions()` - Fetch all predictions
- `validateResult(predictionId, winningOptionId)` - Validate and award points
- `updatePrediction(predictionId, data)` - Update prediction
- `deletePrediction(predictionId)` - Delete prediction
- `changePredictionStatus(predictionId, status)` - Change status

### Custom Hooks

**`usePredictions(filter, limit)`**
- `filter`: 'active' | 'history' | 'all'
- `limit`: Number of items per page (default: 10)
- Returns: `{ predictions, loading, error, refresh, loadMore, hasMore }`

**`useUserPrediction(predictionId, userId)`**
- Returns: `{ userPrediction, hasParticipated, loading, error, submit, refresh }`

### Component Features

**PredictionCard**
- Displays match info, competition, dates
- Shows prediction options with odds
- Participation badge (green if participated, gray if not)
- Submit button (only for open predictions)
- Result display with winning option highlighted
- Points earned indicator for correct predictions
- Theme-aware styling using CSS variables

**PredictionList**
- Tabs: "Active" and "History"
- Active tab: Shows all open predictions
- History tab: Last 24h with "Load More" pagination
- Empty states
- Refresh functionality

**ParticipationBadge**
- ✓ Participé (green badge with checkmark)
- Participer (gray badge)

## 🎨 Styling

All components use theme-aware CSS variables:
- `--mvx-bg-color-primary` - Main background
- `--mvx-bg-color-secondary` - Cards, sections
- `--mvx-bg-accent-color` - Subtle backgrounds
- `--mvx-text-color-primary` - Main text
- `--mvx-text-color-secondary` - Muted text
- `--mvx-text-accent-color` - Accent color
- `--mvx-border-color-secondary` - Borders

Status colors use opacity overlays:
- Success: `bg-green-500/20`
- Error: `bg-red-500/20`
- Warning: `bg-orange-500/20`

## 🔒 Security

### RLS Policies (Already in place)
- Users can view all predictions
- Only admins can create/update/delete predictions
- Users can only view/insert their own user_predictions
- All enforced at database level via Supabase RLS

### Frontend Guards
- `AdminGuard` wrapper protects admin routes
- Admin pages check `useUserRole()` hook
- Submit button only shown for authenticated users
- One prediction per user enforced by DB constraint

## 🌐 Internationalization

All text uses `t()` function from react-i18next:
- English: `src/i18n/locales/en.json`
- French: `src/i18n/locales/fr.json`

Key namespaces:
- `predictions.*` - General prediction text
- `predictions.admin.*` - Admin-specific text
- `predictions.status.*` - Status labels
- `common.*` - Shared text (loading, error, etc.)

## 🚀 Usage

### For Users

1. **View Active Predictions:**
   - Navigate to `/predictions`
   - See all open predictions
   - Badge shows participation status

2. **Submit a Prediction:**
   - Click on an option
   - Click "Submit Prediction" button
   - Confirmation shown

3. **View History:**
   - Click "History" tab
   - See last 24h of closed/resulted predictions
   - Click "Load More" for pagination
   - See points earned for correct predictions

### For Admins

1. **Create Prediction:**
   - Navigate to `/admin`
   - Click "Create Prediction"
   - Fill form:
     - Competition name
     - Home/Away teams
     - Bet type
     - Options (min 2, can add more)
     - Start/Close dates
     - Points reward
   - Click "Create Prediction"

2. **Manage Predictions:**
   - Navigate to `/admin`
   - Click "Manage Predictions"
   - Actions available:
     - **Validate Result**: Select winning option → awards points automatically
     - **Close**: Change status from open to closed
     - **Delete**: Remove prediction

3. **Validate Result:**
   - Click "Validate Result" button
   - Select winning option from dropdown
   - Click "Validate"
   - System automatically:
     - Updates prediction status to "resulted"
     - Sets winning_option_id
     - Marks correct user_predictions
     - Awards points to winners
     - Updates user total_points

## 🔄 Prediction Lifecycle

```
CREATE → open → closed → resulted
                   └──────┴────→ cancelled
```

1. **open**: Users can submit predictions
2. **closed**: No more submissions (match started)
3. **resulted**: Admin validated result, points awarded
4. **cancelled**: Event cancelled

## 📊 Points System

- Admin sets `points_reward` when creating prediction
- Users submit their prediction (free, no stake)
- When admin validates:
  - Correct predictions: Earn `points_reward` points
  - Incorrect predictions: Earn 0 points
- Points automatically added to `users.total_points`

## 🧪 Testing Checklist

### User Flow
- [ ] Can view active predictions
- [ ] Can submit prediction (wallet connected)
- [ ] Badge shows "Participated" after submission
- [ ] Cannot submit twice to same prediction
- [ ] Can view history (last 24h)
- [ ] "Load More" button works for history
- [ ] Can see points earned for correct predictions

### Admin Flow
- [ ] Can access admin dashboard
- [ ] Can navigate to create prediction
- [ ] Form validation works
- [ ] Can create prediction successfully
- [ ] Can view all predictions in manage page
- [ ] Can validate result and select winner
- [ ] Points awarded to correct predictions
- [ ] Can delete prediction
- [ ] Can change status (open → closed)

### Security
- [ ] Non-admin redirected from admin pages
- [ ] RLS prevents unauthorized actions
- [ ] User can only see own predictions in user_predictions

### Responsiveness
- [ ] Works on mobile (320px+)
- [ ] Works on tablet (768px+)
- [ ] Works on desktop (1024px+)

### Themes
- [ ] All colors work in Dark theme
- [ ] All colors work in Light theme
- [ ] All colors work in Vibe theme

## 📝 API Examples

### Create Prediction (Admin)
```typescript
import { predictionService } from 'features/predictions';

await predictionService.createPrediction({
  competition: 'Premier League',
  home_team: 'Manchester United',
  away_team: 'Liverpool',
  bet_type: 'result',
  options: [
    { id: '1', label: 'Home Win', odds: '2.5' },
    { id: 'X', label: 'Draw', odds: '3.2' },
    { id: '2', label: 'Away Win', odds: '2.8' }
  ],
  start_date: '2025-01-20T15:00:00Z',
  close_date: '2025-01-20T14:45:00Z',
  points_reward: 10
}, supabaseUserId);
```

### Submit Prediction (User)
```typescript
const { submit } = useUserPrediction(predictionId, userId);
await submit('1'); // Submit "Home Win"
```

### Validate Result (Admin)
```typescript
await predictionService.validateResult(predictionId, '1'); // Set "Home Win" as winner
```

## 🐛 Known Limitations

1. **24h History Window**: Only shows predictions from last 24 hours
2. **Manual Status Changes**: Admin must manually close predictions (no auto-close on match start)
3. **No Edit Feature**: Once created, prediction details cannot be edited (only status can change)
4. **No Stake System**: Users don't bet their points (coming in future)

## 🔮 Future Enhancements

- [ ] Auto-close predictions on match start
- [ ] Edit prediction details (before users participate)
- [ ] Betting with user points (stake system)
- [ ] Live odds updates
- [ ] Prediction analytics dashboard
- [ ] User prediction history page
- [ ] Leaderboard for best predictors
- [ ] Prediction notifications

## 🎉 Summary

✅ **Complete prediction system implemented**
✅ **Admin can create, manage, validate predictions**
✅ **Users can participate and earn points**
✅ **Theme-aware UI with responsive design**
✅ **Multilingual support (EN/FR)**
✅ **Secure with RLS policies**
✅ **Clean, maintainable code following atomic design**

---

**Ready to use!** 🚀

