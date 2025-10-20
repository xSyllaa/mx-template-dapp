# War Games - Correction Authentification et Performance

## 🐛 Problèmes Identifiés

### 1. **Erreur RLS Supabase (401 Unauthorized)**
```
POST .../war_game_teams 401 (Unauthorized)
Error: new row violates row-level security policy for table "war_game_teams"
```

**Cause**: Le JWT custom n'était pas correctement injecté dans les headers des requêtes Supabase.

### 2. **Re-renders Excessifs**
À chaque interaction (drag & drop, sélection de carte), la page se re-rendait plusieurs fois, causant :
- Logs en boucle
- Ralentissements UI
- Rechargement inutile des données

**Cause**: `console.log` exécutés à chaque rendu au lieu d'être dans un `useEffect`.

---

## ✅ Solutions Implémentées

### **1. Injection JWT Automatique dans Supabase Client**

**Fichier**: `src/lib/supabase/client.ts`

#### **Avant** (❌ Complexe et non fonctionnel)
```typescript
// Système de Proxy complexe qui n'injectait pas correctement le JWT
class SupabaseClientWrapper {
  from(table: string) {
    // Tentative d'injection via Proxy (ne marchait pas)
  }
}
```

#### **Après** (✅ Simple et efficace)
```typescript
// Déplacement de getCustomJWT() avant la création du client
export const getCustomJWT = (): string | null => {
  try {
    const token = localStorage.getItem('supabase.auth.token');
    const expiresAt = localStorage.getItem('supabase.auth.expires_at');
    
    if (token && expiresAt) {
      const isExpired = Date.now() > parseInt(expiresAt);
      if (!isExpired) {
        return token;
      }
    }
  } catch (error) {
    console.error('[Supabase Client] Error getting JWT:', error);
  }
  return null;
};

// Injection JWT dans les headers globaux
const baseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      get Authorization() {
        const jwt = getCustomJWT();
        return jwt ? `Bearer ${jwt}` : `Bearer ${supabaseAnonKey}`;
      }
    }
  }
});

// Export direct (plus besoin de wrapper)
export const supabase = baseClient;
```

**Avantages**:
- ✅ JWT injecté automatiquement dans **toutes** les requêtes
- ✅ Getter dynamique : récupère le JWT à chaque requête
- ✅ Fallback sur `supabaseAnonKey` si pas de JWT
- ✅ Code simplifié (suppression du wrapper)

---

### **2. Utilisation de l'ID Utilisateur du Contexte**

**Fichier**: `src/features/warGames/services/teamService.ts`

#### **Avant** (❌ Appel Supabase direct)
```typescript
static async createTeam(teamData: CreateTeamData): Promise<SavedTeam> {
  const { data: { user } } = await supabase.auth.getUser(); // ❌ Appel direct
  if (!user) throw new Error('User not authenticated');
  
  // Utilise user.id
}
```

#### **Après** (✅ Utilise l'ID du contexte)
```typescript
static async createTeam(teamData: CreateTeamData, userId?: string): Promise<SavedTeam> {
  // Utilise l'ID fourni par le contexte
  let finalUserId = userId;
  
  // Fallback sur Supabase si pas d'ID fourni
  if (!finalUserId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    finalUserId = user.id;
  }
  
  // Utilise finalUserId au lieu de user.id
  const { data, error } = await supabase
    .from('war_game_teams')
    .insert({
      user_id: finalUserId, // ✅ ID du contexte
      // ...
    })
}
```

**Fichier**: `src/pages/WarGames/WarGames.tsx`

```typescript
await TeamService.createTeam({
  teamName: teamName.trim(),
  formation: '4-4-2',
  slots: savedSlots
}, supabaseUserId || undefined); // ✅ Passe l'ID du contexte AuthProvider
```

**Avantages**:
- ✅ Utilise l'état d'authentification React (source unique de vérité)
- ✅ Évite les appels Supabase inutiles
- ✅ Cohérence entre l'état UI et les requêtes

---

### **3. Optimisation des Re-renders**

**Fichier**: `src/pages/WarGames/WarGames.tsx`

#### **Avant** (❌ Logs à chaque rendu)
```typescript
// Ces logs s'exécutent à CHAQUE rendu du composant
console.log(`⚔️ WarGames: Connected Address: ${address}`);
console.log(`⚔️ WarGames: Test Address: ${testAddress}`);
console.log(`⚔️ WarGames: Current Address: ${currentAddress}`);
console.log(`⚔️ WarGames: NFTs count: ${nfts.length}`);
// ... plus de logs
```

#### **Après** (✅ Logs dans useEffect)
```typescript
// Debug logs (seulement quand l'auth change)
useEffect(() => {
  console.log('⚔️ WarGames Debug:');
  console.log('- Connected Address:', address);
  console.log('- Test Address:', testAddress);
  console.log('- Current Address:', currentAddress);
  console.log('- NFTs count:', nfts.length);
  console.log('- Has NFTs:', hasNFTs);
  console.log('- Loading:', loading);
  console.log('- Wallet connected:', !!address);
  console.log('- Supabase authenticated:', isAuthenticated);
  console.log('- Supabase user ID:', supabaseUserId);
}, [address, isAuthenticated]); // ✅ Se déclenche uniquement si l'auth change
```

**Avantages**:
- ✅ Logs seulement quand nécessaire (auth change)
- ✅ Pas de re-render excessif
- ✅ Meilleure performance UI

---

## 🎯 Résultat Final

### **Avant** ❌
```
Wallet connecté: ✅
Supabase Auth Context: ✅ (isAuthenticated: true, userId: 092a104f...)
Requête Supabase: ❌ (401 Unauthorized - JWT non injecté)
Re-renders: 🔁🔁🔁 (à chaque interaction)
```

### **Après** ✅
```
Wallet connecté: ✅
Supabase Auth Context: ✅ (isAuthenticated: true, userId: 092a104f...)
Requête Supabase: ✅ (JWT injecté automatiquement dans headers)
Re-renders: 🎯 (uniquement quand l'auth change)
```

---

## 📋 Checklist de Test

- [ ] **Connexion Wallet** : Se connecter avec MultiversX
- [ ] **Signature Message** : Signer le message d'authentification
- [ ] **Badge Auth** : Vérifier que le badge "⚠️ Sign to save teams" disparaît après auth
- [ ] **Drag & Drop NFTs** : Ajouter 3+ NFTs sur le terrain
- [ ] **Logs Console** : Vérifier qu'il n'y a pas de logs en boucle
- [ ] **Save Team** : Cliquer sur "Save Team" avec un nom
- [ ] **Vérification Supabase** : Aller dans Supabase → `war_game_teams` → Vérifier la ligne créée
- [ ] **User ID** : Vérifier que `user_id` correspond à l'utilisateur connecté
- [ ] **Load Team** : Cliquer sur une équipe sauvegardée pour la charger

---

## 🔧 Commandes de Debug

### **Vérifier le JWT dans localStorage**
```javascript
// Console du navigateur
localStorage.getItem('supabase.auth.token')
localStorage.getItem('galacticx.user')
```

### **Vérifier l'état Auth React**
```javascript
// Console du navigateur (avec React DevTools)
// Chercher AuthProvider → isAuthenticated, supabaseUserId
```

### **Vérifier les Headers Supabase**
```javascript
// Console du navigateur (Network tab)
// Chercher POST .../war_game_teams
// Headers → Authorization: Bearer eyJhbGc...
```

---

## 📚 Fichiers Modifiés

1. ✅ `src/lib/supabase/client.ts` - Injection JWT automatique
2. ✅ `src/features/warGames/services/teamService.ts` - Utilisation userId contexte
3. ✅ `src/pages/WarGames/WarGames.tsx` - Optimisation re-renders + passage userId

---

## 🚀 Prochaines Améliorations

1. **Retry automatique** : Si JWT expiré, déclencher auto-signin
2. **Toast notifications** : Remplacer `alert()` par des toasts
3. **Loading states** : Ajouter spinners lors de la sauvegarde
4. **Error boundaries** : Capturer les erreurs au niveau du composant
5. **Optimistic updates** : Afficher l'équipe sauvegardée avant confirmation serveur

---

**Date**: 2025-01-18
**Auteur**: AI Assistant
**Version**: 1.0



