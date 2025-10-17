# Predictions System - Debug Guide

## 🔍 Problèmes Identifiés et Solutions

### 1. Bouton de validation manquant pour les utilisateurs

**Symptôme:** Pas de bouton "Submit Prediction" même après avoir sélectionné une option.

**Causes possibles:**
- `supabaseUserId` est `null` (problème d'authentification Supabase)
- `address` est `null` (wallet non connecté)
- `isOpen` est `false` (prédiction fermée)
- `hasParticipated` est `true` (déjà participé)

**Debug ajouté:**
```typescript
// Dans PredictionCard.tsx - Debug info temporaire
{isOpen && !hasParticipated && selectedOption && (
  <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400">
    Debug: {address ? '✅ Wallet' : '❌ Wallet'} | {supabaseUserId ? '✅ Supabase' : '❌ Supabase'}
  </div>
)}
```

**Solution:**
1. Vérifiez que le debug info montre `✅ Wallet` et `✅ Supabase`
2. Si `❌ Supabase`, rafraîchissez la page ou reconnectez le wallet
3. Vérifiez que la `close_date` de la prédiction est dans le futur

### 2. "User not authenticated" en tant qu'admin

**Symptôme:** Message d'erreur lors de la création d'une prédiction admin.

**Causes possibles:**
- `supabaseUserId` est `null` malgré l'authentification
- Problème de timing dans le hook `useSupabaseAuth`
- Session Supabase expirée

**Debug ajouté:**
```typescript
// Dans CreatePrediction.tsx - Auth status debug
<div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-400">
  Auth: {address ? '✅ Wallet' : '❌ Wallet'} | {supabaseUserId ? '✅ Supabase' : '❌ Supabase'}
</div>
```

**Solution:**
1. Vérifiez que le debug info montre `✅ Wallet` et `✅ Supabase`
2. Si `❌ Supabase`, rafraîchissez la page
3. Vérifiez la console pour les logs d'authentification

## 🛠 Corrections Apportées

### 1. Hook useSupabaseAuth amélioré

**Ajout de `supabaseUserId`:**
```typescript
interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: Error | null;
  canRetry: boolean;
  supabaseUserId: string | null; // ← NOUVEAU
}
```

**Gestion des sessions existantes:**
```typescript
// Vérifier si on a déjà une session valide
const existingUser = localStorage.getItem('galacticx.user');
const token = localStorage.getItem('supabase.auth.token');
const expiresAt = localStorage.getItem('supabase.auth.expires_at');

if (existingUser && token && expiresAt) {
  const userData = JSON.parse(existingUser);
  const isExpired = Date.now() > parseInt(expiresAt);
  
  if (!isExpired && userData.wallet_address === address) {
    // Session valide, utiliser l'ID existant
    setAuthState({
      isAuthenticated: true,
      loading: false,
      error: null,
      canRetry: false,
      supabaseUserId: userData.id // ← ID utilisateur récupéré
    });
    return;
  }
}
```

### 2. Debug temporaire ajouté

**Dans PredictionCard.tsx:**
- Logs détaillés dans `handleSubmit`
- Debug info visuel pour voir l'état d'authentification

**Dans CreatePrediction.tsx:**
- Logs d'authentification dans `useEffect`
- Debug info visuel pour voir l'état d'authentification
- Message d'erreur plus détaillé

## 🧪 Tests à Effectuer

### Test 1: Authentification Admin
1. Connectez votre wallet
2. Naviguez vers `/admin/create-prediction`
3. Vérifiez que le debug info montre `✅ Wallet` et `✅ Supabase`
4. Si `❌ Supabase`, rafraîchissez la page
5. Essayez de créer une prédiction

### Test 2: Participation Utilisateur
1. Créez une prédiction avec `close_date` dans le futur
2. Naviguez vers `/predictions`
3. Sélectionnez une option
4. Vérifiez que le debug info montre `✅ Wallet` et `✅ Supabase`
5. Le bouton "Submit Prediction" devrait apparaître

### Test 3: Vérification Console
Ouvrez la console et vérifiez ces logs :
```
[SupabaseAuth] Déjà authentifié avec session valide
[CreatePrediction] Auth Status: { address: "erd1...", supabaseUserId: "uuid...", authLoading: false }
[PredictionCard] Cannot submit: { selectedOption: "1", supabaseUserId: "uuid...", address: "erd1..." }
```

## 🔧 Actions de Debug

### Si le problème persiste :

1. **Videz le localStorage:**
   ```javascript
   // Dans la console du navigateur
   localStorage.clear();
   // Puis reconnectez le wallet
   ```

2. **Vérifiez les données stockées:**
   ```javascript
   // Dans la console du navigateur
   console.log('galacticx.user:', localStorage.getItem('galacticx.user'));
   console.log('supabase.auth.token:', localStorage.getItem('supabase.auth.token'));
   ```

3. **Forcez la re-authentification:**
   ```javascript
   // Dans la console du navigateur
   localStorage.removeItem('supabase.auth.token');
   localStorage.removeItem('galacticx.user');
   // Puis rafraîchissez la page
   ```

## 📝 Logs à Surveiller

### Authentification réussie:
```
✅ [SupabaseAuth] Déjà authentifié avec session valide
[CreatePrediction] Auth Status: { address: "erd1...", supabaseUserId: "uuid...", authLoading: false }
```

### Authentification échouée:
```
❌ [SupabaseAuth] Erreur: ...
[CreatePrediction] Auth Status: { address: "erd1...", supabaseUserId: null, authLoading: false }
```

### Participation utilisateur:
```
[PredictionCard] Cannot submit: { selectedOption: "1", supabaseUserId: null, address: "erd1..." }
```

## 🎯 Prochaines Étapes

1. **Testez les corrections** avec les instructions ci-dessus
2. **Supprimez les debug info** une fois que tout fonctionne
3. **Signalez** si les problèmes persistent

---

**Status:** ✅ Corrections appliquées  
**Debug:** 🔍 Info temporaire ajoutée  
**Next:** 🧪 Tests à effectuer
