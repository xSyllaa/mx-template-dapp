# Predictions - Date Logic Explanation

## 📅 Date Fields Explained

### Close Date (Date Limite des Paris)
**Deadline for users to submit their predictions**
- Users can participate up until this date/time
- Must be set BEFORE the match starts
- Example: 15 minutes before kickoff

### Start Date (Date de Début du Match)
**When the match actually starts**
- The actual kickoff time
- After this time, no more predictions accepted
- Example: 15:00 on match day

## ⏰ Timeline Example

```
┌─────────────────────────────────────────────────────────┐
│                    PREDICTION LIFECYCLE                   │
└─────────────────────────────────────────────────────────┘

📅 January 20, 2025

14:00      14:45      15:00      17:00      18:00
  │          │          │          │          │
  │          │          │          │          │
  │          │          │          │          │
  ▼          ▼          ▼          ▼          ▼
Create    CLOSE      START      End      Validate
Pred.     Betting    Match      Match    Result
          ━━━━━━     
  │◄────────┤          
  │  Users can         
  │  participate       
  │                    
  │                 ◄──────────────────┤
  │                    Match in progress
  │                    
  └────────────────────────────────────────►
              Admin validates result here
```

## ✅ Valid Example

```typescript
{
  competition: "Premier League",
  home_team: "Manchester United",
  away_team: "Liverpool",
  start_date: "2025-01-20T15:00:00Z",  // Match starts
  close_date: "2025-01-20T14:45:00Z",  // Betting closes 15min before
  points_reward: 10
}
```

**✅ Valid**: Close Date (14:45) < Start Date (15:00)

## ❌ Invalid Example

```typescript
{
  start_date: "2025-01-20T14:45:00Z",  // Match starts
  close_date: "2025-01-20T15:00:00Z",  // Betting closes AFTER match?!
}
```

**❌ Invalid**: Close Date (15:00) > Start Date (14:45)  
**Error**: "La date limite des paris doit être avant le début du match"

## 🎯 Why This Logic?

1. **Fair Play**: Users shouldn't be able to bet after seeing the match start
2. **Integrity**: Close betting before match begins
3. **Admin Control**: Admin can close early if needed (e.g., 1 hour before)

## 🔍 Database Constraint

```sql
CREATE TABLE predictions (
  -- ...
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  close_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Ensures close_date is before (or equal to) start_date
  CONSTRAINT valid_dates CHECK (close_date <= start_date)
);
```

## 📝 UI Labels (Updated)

### English
- **Start Date** → "Match Start Date"
- **Close Date** → "Betting Close Date"

### French
- **Date de Début** → "Date de Début du Match"
- **Date de Fermeture** → "Date Limite des Paris"

## 💡 Best Practices

**Recommended buffer time**: 15-30 minutes before match start

```typescript
// Good: 15 minutes buffer
start_date: "2025-01-20T15:00:00Z"
close_date: "2025-01-20T14:45:00Z"

// Good: 1 hour buffer
start_date: "2025-01-20T15:00:00Z"
close_date: "2025-01-20T14:00:00Z"

// Not recommended: Same time
start_date: "2025-01-20T15:00:00Z"
close_date: "2025-01-20T15:00:00Z"
```

## 🚦 Status Flow

```
CREATE → open (users can bet)
         ↓
      [close_date reached]
         ↓
      closed (no more bets, waiting for result)
         ↓
      [admin validates result]
         ↓
      resulted (points distributed)
```

---

**Updated:** January 17, 2025  
**Clarification:** Labels updated to avoid confusion between betting deadline and match start

