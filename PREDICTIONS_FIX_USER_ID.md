# Fix: User ID Issue in Predictions System

## 🐛 Problem Identified

When testing the predictions system, the following error occurred:

```
invalid input syntax for type uuid: "erd13jepran6svqee2cgm6y8uz63ts9ecp7uhqmt04j6lsvwsdkre7lsl5ue3g"
```

**Root Cause:**  
The `PredictionCard` component was using the **MultiversX wallet address** (`address` from `useGetAccount()`) instead of the **Supabase user UUID** (`supabaseUserId` from `useSupabaseAuth()`) when checking user participation and submitting predictions.

## ❌ Incorrect Implementation

```typescript
// WRONG - Using wallet address
const { address } = useGetAccount();
const { userPrediction, hasParticipated, submitting, submit } =
  useUserPrediction(prediction.id, address || null);
```

**Problem:** The `user_predictions` table in Supabase expects a UUID (Supabase auth user ID), not a wallet address.

## ✅ Correct Implementation

```typescript
// CORRECT - Using Supabase UUID
const { address } = useGetAccount();
const { supabaseUserId } = useSupabaseAuth();
const { userPrediction, hasParticipated, submitting, submit } =
  useUserPrediction(prediction.id, supabaseUserId || null);
```

## 🔧 Changes Made

### File: `src/features/predictions/components/PredictionCard.tsx`

1. **Import added:**
   ```typescript
   import { useSupabaseAuth } from 'hooks/useSupabaseAuth';
   ```

2. **Hook usage updated:**
   ```typescript
   const { supabaseUserId } = useSupabaseAuth();
   ```

3. **User prediction hook call fixed:**
   ```typescript
   // Changed from: address || null
   // Changed to:   supabaseUserId || null
   const { userPrediction, hasParticipated, submitting, submit } =
     useUserPrediction(prediction.id, supabaseUserId || null);
   ```

4. **Submit button condition updated:**
   ```typescript
   // Added check for supabaseUserId
   {isOpen && !hasParticipated && selectedOption && address && supabaseUserId && (
     <button onClick={handleSubmit}>...</button>
   )}
   ```

5. **handleSubmit validation updated:**
   ```typescript
   const handleSubmit = async () => {
     // Changed from: !address
     // Changed to:   !supabaseUserId
     if (!selectedOption || !supabaseUserId) return;
     // ...
   };
   ```

## 📊 Data Flow

### Authentication Flow
```
1. User connects MultiversX wallet → address (erd1...)
2. User signs message → Supabase auth
3. Supabase creates user record → supabaseUserId (UUID)
```

### Prediction Submission Flow
```
1. User selects option in PredictionCard
2. PredictionCard calls submit(optionId)
3. useUserPrediction hook → predictionService.submitPrediction()
4. Supabase INSERT into user_predictions:
   - user_id: supabaseUserId (UUID) ✓
   - prediction_id: prediction.id (UUID) ✓
   - selected_option_id: optionId (string) ✓
```

## 🎯 Why Both Are Needed

We use both `address` and `supabaseUserId`:

- **`address` (wallet address)**: 
  - Check if MultiversX wallet is connected
  - Display wallet info in UI
  - Sign transactions on blockchain

- **`supabaseUserId` (UUID)**:
  - Store user data in Supabase
  - Link predictions to users
  - Handle RLS policies
  - Query user-specific data

## ✅ Result

After this fix:
- User predictions are correctly stored with Supabase UUID
- Participation badges display correctly
- No more `invalid input syntax for type uuid` errors
- User can submit predictions successfully

## 📝 Lesson Learned

**Always use the correct identifier for the context:**
- **MultiversX operations** → use `address` (wallet address)
- **Supabase operations** → use `supabaseUserId` (UUID)

Both identifiers are linked in the `users` table:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,              -- Supabase auth UUID
  wallet_address TEXT UNIQUE,       -- MultiversX address
  ...
);
```

---

**Fixed:** January 17, 2025  
**Status:** ✅ Resolved

