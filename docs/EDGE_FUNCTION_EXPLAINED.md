# 🔐 Edge Function `auth-multiversx` - Explication Détaillée

## 🎯 Objectif Global

Cette Edge Function sert de **pont d'authentification** entre :
- **MultiversX Wallet** (signature cryptographique)
- **Supabase Auth** (JWT pour RLS policies)

Sans elle, il serait **impossible** de sécuriser votre base de données avec RLS car Supabase ne connaît pas MultiversX nativement.

---

## 📊 Architecture Globale

```
┌─────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   Frontend      │       │  Edge Function   │       │   Supabase DB    │
│   (React)       │       │  (auth-multiversx)│       │   (PostgreSQL)   │
└────────┬────────┘       └────────┬─────────┘       └────────┬─────────┘
         │                         │                          │
         │  1. Connect wallet      │                          │
         │◄────────────────────────┤                          │
         │                         │                          │
         │  2. Sign message        │                          │
         │  (wallet signature)     │                          │
         │                         │                          │
         │  3. Send (wallet +      │                          │
         │     signature +         │                          │
         │     message)            │                          │
         ├────────────────────────►│                          │
         │                         │                          │
         │                         │  4. Verify signature     │
         │                         │     (TODO: à impl)       │
         │                         │                          │
         │                         │  5. Check if user exists │
         │                         │     in auth.users        │
         │                         ├─────────────────────────►│
         │                         │◄─────────────────────────┤
         │                         │                          │
         │                         │  6. Create user if new   │
         │                         ├─────────────────────────►│
         │                         │◄─────────────────────────┤
         │                         │                          │
         │                         │  7. Generate JWT tokens  │
         │                         │     (access + refresh)   │
         │                         │                          │
         │  8. Return JWT tokens   │                          │
         │◄────────────────────────┤                          │
         │                         │                          │
         │  9. Use JWT for all     │                          │
         │     Supabase requests   │                          │
         ├──────────────────────────────────────────────────►│
         │                         │                          │
         │  10. RLS policies use   │                          │
         │      auth.uid() = user  │                          │
         │◄───────────────────────────────────────────────────┤
```

---

## 🔍 Code : Ligne par ligne

### **Partie 1 : Imports & CORS**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
```

**Explication** :
- `serve` : Fonction pour créer un serveur HTTP Deno
- `createClient` : Client Supabase pour accéder à la base de données

**Pourquoi Deno et pas Node.js ?**
- Les Edge Functions Supabase utilisent **Deno** (plus sécurisé, moderne)
- Imports directs depuis des URLs (pas de node_modules)

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

**Explication** :
- **CORS** : Autorise votre frontend (localhost:3000) à appeler l'Edge Function
- `Access-Control-Allow-Origin: '*'` : N'importe quel domaine peut appeler
  - ⚠️ En production, mettez votre domaine exact : `https://galacticx.app`

---

### **Partie 2 : Handler CORS Preflight**

```typescript
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
```

**Explication** :
- **Preflight request** : Avant chaque requête POST, le navigateur envoie une requête OPTIONS pour vérifier les CORS
- Sans cette partie, vous auriez l'erreur CORS que vous avez vue

---

### **Partie 3 : Validation des données**

```typescript
try {
  const { walletAddress, signature, message } = await req.json();

  if (!walletAddress || !signature || !message) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields...' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
```

**Explication** :
- Récupère les 3 paramètres envoyés par le frontend
- **walletAddress** : `erd1vyx292gvzy47qfg946u8...`
- **signature** : La signature cryptographique générée par le wallet
- **message** : Le message qui a été signé (`"GalacticX Authentication\nWallet: erd1...\nNonce: abc123\nTimestamp: 123456"`)

**Pourquoi ces 3 éléments ?**
- **walletAddress** : Identifie l'utilisateur
- **message** : Le texte qu'il a signé
- **signature** : La preuve cryptographique qu'il possède la clé privée du wallet

---

### **Partie 4 : Vérification de la signature (TODO)**

```typescript
console.log('🔐 [Auth] Authentification pour wallet:', walletAddress);

// 2. TODO: Verify MultiversX signature (nécessite @multiversx/sdk-core)
// Pour l'instant, on fait confiance (à sécuriser en production)
// const isValid = await verifyMultiversXSignature(walletAddress, message, signature);
// if (!isValid) throw new Error('Invalid signature');

console.log('✅ [Auth] Signature acceptée (validation à implémenter)');
```

**⚠️ PROBLÈME ACTUEL** :
- **La signature n'est PAS vérifiée** pour l'instant
- N'importe qui pourrait envoyer n'importe quelle signature

**Solution à implémenter** :
```typescript
import { UserPublicKey, Address, SignableMessage } from '@multiversx/sdk-core';

const publicKey = new UserPublicKey(Address.fromBech32(walletAddress).pubkey());
const signableMessage = new SignableMessage({
  address: Address.fromBech32(walletAddress),
  message: Buffer.from(message)
});

const signatureBuffer = Buffer.from(signature, 'hex');
const isValid = publicKey.verify(signableMessage.serializeForSigning(), signatureBuffer);

if (!isValid) {
  throw new Error('Invalid signature');
}
```

**Pourquoi ce n'est pas encore fait ?**
- Le SDK MultiversX utilise des fonctionnalités Node.js qui ne fonctionnent pas directement dans Deno
- Nécessite un polyfill ou une adaptation

---

### **Partie 5 : Création du client Supabase Admin**

```typescript
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

**Explication** :
- **Client Admin** : Utilise la `SERVICE_ROLE_KEY` (clé secrète)
- Cette clé **bypasse tous les RLS** → Pouvoir absolu
- C'est pour ça qu'elle doit RESTER SECRÈTE (jamais dans le frontend)

**Différence avec le client frontend** :
| Client                | Clé utilisée         | Pouvoir                          |
|-----------------------|----------------------|----------------------------------|
| Frontend (anon key)   | `VITE_SUPABASE_ANON_KEY` | Limité par RLS policies        |
| Edge Function (admin) | `SERVICE_ROLE_KEY`       | Accès total, bypass RLS        |

---

### **Partie 6 : Vérifier si l'utilisateur existe**

```typescript
const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
const existingUser = existingUsers.users.find(
  u => u.user_metadata?.wallet_address === walletAddress
);

let userId: string;
let accessToken: string;
let refreshToken: string;

if (existingUser) {
  // User exists - generate new session
  userId = existingUser.id;
  console.log('👤 [Auth] Utilisateur existant:', userId);
```

**Explication** :
- **Cherche dans `auth.users`** (table interne de Supabase Auth)
- Compare le `wallet_address` stocké dans `user_metadata`
- Si trouvé → c'est un utilisateur existant

**Structure de `auth.users`** :
```json
{
  "id": "abc-123-def-456",
  "email": "erd1vyx292...@galacticx.app",
  "user_metadata": {
    "wallet_address": "erd1vyx292gvzy47qfg946u8jjycs863vmrdhkptw35tq8m37zn2hgwqrvkhvv"
  },
  "created_at": "2025-10-16T..."
}
```

---

### **Partie 7 : Générer les tokens JWT**

```typescript
// Generate session tokens
const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
  type: 'magiclink',
  email: `${walletAddress}@galacticx.app`,
});

if (sessionError) throw sessionError;

// Extract tokens from the link
const url = new URL(sessionData.properties.action_link);
accessToken = url.searchParams.get('access_token') || '';
refreshToken = url.searchParams.get('refresh_token') || '';
```

**Explication** :
- **Magic Link** : Normalement utilisé pour envoyer un email avec un lien de connexion
- Ici, on **détourne** cette fonctionnalité pour générer des tokens
- On extrait `access_token` et `refresh_token` de l'URL générée

**Structure du JWT (access_token décodé)** :
```json
{
  "aud": "authenticated",
  "exp": 1760612670,
  "iat": 1760609070,
  "sub": "abc-123-def-456",  // ← C'est le auth.uid() utilisé par RLS
  "email": "erd1vyx292...@galacticx.app",
  "user_metadata": {
    "wallet_address": "erd1vyx292gvzy47qfg946u8jjycs863vmrdhkptw35tq8m37zn2hgwqrvkhvv"
  },
  "role": "authenticated"  // ← Nécessaire pour les RLS policies "TO authenticated"
}
```

---

### **Partie 8 : Créer un nouvel utilisateur (si n'existe pas)**

```typescript
} else {
  // Create new user
  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: `${walletAddress}@galacticx.app`,
    email_confirm: true,
    user_metadata: {
      wallet_address: walletAddress
    }
  });

  if (createError) throw createError;
  userId = newUser.user.id;
  
  console.log('✨ [Auth] Nouvel utilisateur créé:', userId);

  // Create profile in public.users
  await supabaseAdmin
    .from('users')
    .insert({
      id: userId,  // ← Même ID que dans auth.users
      wallet_address: walletAddress,
      role: 'user',
      total_points: 0,
      nft_count: 0
    });
```

**Explication** :
1. **Crée dans `auth.users`** (table système Supabase)
   - Email fictif : `erd1vyx292...@galacticx.app`
   - `email_confirm: true` → Pas besoin de vérifier l'email
   
2. **Crée dans `public.users`** (votre table)
   - **Même `id`** que `auth.users` → Permet la relation
   - `role: 'user'` par défaut
   
**Pourquoi 2 tables ?**
- `auth.users` : Gérée par Supabase Auth (JWT, sessions, passwords)
- `public.users` : Votre table avec les données métier (points, nfts, role)

**Lien entre les deux** :
```sql
-- Dans vos RLS policies
WHERE users.id = auth.uid()
      ↑            ↑
   public.users  auth.users
```

---

### **Partie 9 : Retourner les tokens au frontend**

```typescript
console.log('🎫 [Auth] Session générée avec succès');

// 5. Return session data
return new Response(
  JSON.stringify({
    success: true,
    user_id: userId,
    wallet_address: walletAddress,
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: 3600  // 1 heure
  }),
  {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  }
);
```

**Explication** :
- Retourne les tokens en JSON
- Le frontend utilise `supabase.auth.setSession()` avec ces tokens
- **Durée** : 1 heure, puis auto-refresh avec `refresh_token`

---

### **Partie 10 : Gestion des erreurs**

```typescript
  } catch (error) {
    console.error('❌ [Auth] Erreur:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Authentication failed',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
```

**Explication** :
- Catch toutes les erreurs
- Retourne un message d'erreur en JSON
- Status 500 = Erreur serveur

---

## 🤔 **Backend dédié VS Supabase : Comparaison**

### **Option A : Backend Node.js/Express Classique**

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │─────►│   Backend    │─────►│  PostgreSQL  │
│   (React)    │      │ (Node.js +   │      │   (Database) │
└──────────────┘      │  Express)    │      └──────────────┘
                      └──────────────┘
```

**Architecture** :
```javascript
// backend/server.js
app.post('/api/auth/multiversx', async (req, res) => {
  const { walletAddress, signature, message } = req.body;
  
  // Vérifier signature
  // Créer/récupérer user dans DB
  // Générer JWT avec jsonwebtoken
  // Retourner JWT
});

app.get('/api/predictions', authMiddleware, async (req, res) => {
  const predictions = await db.query('SELECT * FROM predictions');
  res.json(predictions);
});

app.post('/api/predictions/:id/vote', authMiddleware, async (req, res) => {
  // Vérifier que user a le droit
  // Insérer dans user_predictions
  // Retourner résultat
});

// ... 30+ autres endpoints
```

**Avantages** :
- ✅ Contrôle total du code
- ✅ Vérification de signature MultiversX plus facile
- ✅ Logique métier côté serveur
- ✅ Pas de dépendance à Supabase

**Inconvénients** :
- ❌ Vous devez coder **TOUS** les endpoints (30+)
- ❌ Vous devez gérer la sécurité (SQL injection, XSS, CSRF)
- ❌ Vous devez héberger le serveur (coût, maintenance)
- ❌ Vous devez gérer les sessions/JWT manuellement
- ❌ Vous devez gérer le scaling si beaucoup d'utilisateurs
- ❌ Vous devez gérer les backups de la DB
- ❌ Temps de développement : **2-3 semaines** minimum

---

### **Option B : Supabase + Edge Function (Actuel)**

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │─────►│ Edge Function│─────►│  Supabase    │
│   (React)    │      │ (1 seule)    │      │  (Auth + DB) │
│              │─────────────────────────────►│              │
│              │  Direct via client Supabase  │              │
└──────────────┘                              └──────────────┘
```

**Architecture** :
```typescript
// Seule Edge Function
supabase/functions/auth-multiversx/index.ts

// Frontend : Accès direct à la DB
const { data } = await supabase
  .from('predictions')
  .select('*')
  .eq('status', 'open');

// RLS policies protègent automatiquement
```

**Avantages** :
- ✅ **1 seule Edge Function** pour l'auth
- ✅ Tout le reste = requêtes directes (SELECT, INSERT, UPDATE)
- ✅ RLS policies = sécurité au niveau DB
- ✅ Pas de serveur à gérer
- ✅ Realtime gratuit (websockets)
- ✅ Auto-scaling gratuit
- ✅ Backups automatiques
- ✅ Temps de développement : **Déjà fait !**

**Inconvénients** :
- ❌ Dépendance à Supabase
- ❌ Vérification signature MultiversX plus complexe (Deno)
- ❌ Logique métier en partie côté frontend

---

## 🎯 **Ma Recommandation**

### **Pour GalacticX : Restez avec Supabase**

**Raisons** :
1. **MVP rapide** : Vous gagnez 2-3 semaines de dev
2. **Sécurité** : RLS policies sont très robustes
3. **Coût** : Gratuit jusqu'à 50k users
4. **Scaling** : Automatique
5. **Realtime** : Gratuit (leaderboards, war games)

### **Quand passer à un backend dédié ?**

- ✅ Si vous atteignez **100k+ utilisateurs** (limites Supabase)
- ✅ Si vous avez besoin de **logique métier complexe** côté serveur
- ✅ Si vous voulez **0 dépendance** externe
- ✅ Si vous avez **une équipe backend** dédiée

---

## 🔒 **Sécurité Actuelle : Ce qui manque**

### **Critique : Vérification de signature**

**Actuellement** :
```typescript
// TODO: Verify MultiversX signature
console.log('✅ [Auth] Signature acceptée (validation à implémenter)');
```

**À implémenter** :
```typescript
// Solution 1 : Vérifier dans l'Edge Function (difficile avec Deno)
// Solution 2 : Vérifier côté frontend PUIS faire confiance (pas idéal)
// Solution 3 : Créer un micro-service Node.js juste pour la vérification
```

---

## 📊 **Résumé : Pourquoi cette architecture**

```
Sans Edge Function:
Frontend → Supabase (anon key) → RLS bloque tout ❌

Avec Edge Function:
Frontend → Sign message → Edge Function → Vérifie signature
→ Crée user dans auth.users → Génère JWT → Frontend reçoit JWT
→ Toutes les requêtes utilisent JWT → RLS permet l'accès ✅
```

**L'Edge Function est le pont** entre MultiversX (que Supabase ne connaît pas) et Supabase Auth (que vos RLS utilisent).

---

## 🚀 **Prochaine Étape**

Voulez-vous que je :

**A)** Vous aide à déployer l'Edge Function via le Dashboard Supabase ?

**B)** Implémente la vérification de signature MultiversX (solution de contournement) ?

**C)** Vous montre comment migrer vers un backend Node.js si vous préférez ?

**D)** Continue avec Supabase et on test tout de suite ?


