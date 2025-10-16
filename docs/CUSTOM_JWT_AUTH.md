# 🔐 Authentification Custom JWT avec MultiversX

## 🎯 Pourquoi Custom JWT ?

### **Problème avec l'approche classique**
```typescript
// ❌ Mauvais : Nécessite un email fictif
await supabaseAdmin.auth.admin.createUser({
  email: `${walletAddress}@galacticx.app`,  // Email bidon
  user_metadata: { wallet_address }
});
```

**Problèmes** :
- Obligation d'avoir un email (même fictif)
- Utilise `auth.users` inutilement
- Pas adapté aux wallets Web3

### **Solution : Custom JWT**
```typescript
// ✅ Bon : JWT signé directement avec wallet
const jwt = await create(
  { alg: 'HS256', typ: 'JWT' },
  {
    sub: userId,
    wallet_address: walletAddress,
    role: userRole,
    aud: 'authenticated'
  },
  SUPABASE_JWT_SECRET
);
```

**Avantages** :
- ✅ Pas d'email du tout
- ✅ Wallet comme identifiant principal
- ✅ Contrôle total sur les claims JWT
- ✅ Compatible avec RLS policies

---

## 🔄 Flow d'Authentification

```
1. User connecte wallet MultiversX
   ↓
2. Frontend génère message unique
   ↓
3. User signe avec wallet (preuve de possession)
   ↓
4. Frontend envoie (wallet + signature + message) à Edge Function
   ↓
5. Edge Function vérifie signature (TODO)
   ↓
6. Edge Function cherche user dans public.users (pas auth.users!)
   ↓
7. Si pas trouvé → Crée nouveau user dans public.users
   ↓
8. Edge Function génère Custom JWT avec :
   - sub: user.id
   - wallet_address: wallet
   - role: user.role
   - aud: 'authenticated'
   ↓
9. Frontend reçoit JWT
   ↓
10. Frontend configure Authorization header pour toutes les requêtes
    ↓
11. Supabase vérifie JWT avec JWT_SECRET
    ↓
12. RLS policies utilisent jwt claims
```

---

## 🔑 Variables d'Environnement Nécessaires

### **Edge Function (Supabase Secrets)**

```bash
SUPABASE_URL=https://qlwmadumwiibypstsivr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Pour créer users
SUPABASE_JWT_SECRET=your_jwt_secret  # Pour signer les JWT custom
```

**Où trouver JWT_SECRET ?**
1. Allez sur : https://app.supabase.com/project/qlwmadumwiibypstsivr/settings/api
2. Section **JWT Settings**
3. Copiez le **JWT Secret**

---

## 📋 Structure du JWT Custom

### **Header**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### **Payload**
```json
{
  "sub": "51b12cda-0dfc-475a-9e93-82db0d2f758c",  // user.id
  "wallet_address": "erd1vyx292gvzy47qfg946u8jjycs863vmrdhkptw35tq8m37zn2hgwqrvkhvv",
  "role": "admin",  // ou "user"
  "aud": "authenticated",  // Requis pour RLS
  "exp": 1760612670,  // Expire dans 1h
  "iat": 1760609070,  // Timestamp de création
  "iss": "supabase"
}
```

### **Signature**
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET
)
```

---

## 🛡️ Adaptation des RLS Policies

### **Avant (avec auth.users)**
```sql
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
TO authenticated
USING (id = auth.uid());  -- ← auth.uid() = ID dans auth.users
```

### **Après (avec Custom JWT)**
```sql
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
TO authenticated
USING (
  id = (auth.jwt() ->> 'sub')::uuid  -- ← sub = user.id dans JWT
);

-- Ou pour vérifier le wallet directement
CREATE POLICY "Users can view own profile by wallet"
ON users FOR SELECT
TO authenticated
USING (
  wallet_address = auth.jwt() ->> 'wallet_address'
);

-- Pour vérifier le rôle admin
CREATE POLICY "Admins can update any user"
ON users FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'admin'
);
```

---

## 🔧 Déploiement

### **Étape 1 : Créer l'Edge Function via Dashboard**

1. Allez sur : https://app.supabase.com/project/qlwmadumwiibypstsivr/functions
2. Cliquez sur **"New function"**
3. Name : `auth-multiversx`
4. Copiez le code de `supabase/functions/auth-multiversx/index.ts`
5. Cliquez sur **"Deploy"**

### **Étape 2 : Configurer les Secrets**

1. Allez sur : https://app.supabase.com/project/qlwmadumwiibypstsivr/settings/vault/secrets
2. Ajoutez :
   - `SUPABASE_SERVICE_ROLE_KEY` = (depuis Settings → API → service_role)
   - `SUPABASE_JWT_SECRET` = (depuis Settings → API → JWT Secret)

### **Étape 3 : Mettre à jour les RLS Policies**

Exécutez dans SQL Editor :

```sql
-- Exemple : Policy pour la table users
DROP POLICY IF EXISTS "Users can view own profile" ON users;

CREATE POLICY "Users can view own profile"
ON users FOR SELECT
TO authenticated
USING (
  id = (auth.jwt() ->> 'sub')::uuid
);

-- Exemple : Policy pour vérifier le rôle admin
DROP POLICY IF EXISTS "Admins can update any user" ON users;

CREATE POLICY "Admins can update any user"
ON users FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'admin'
);
```

---

## 🧪 Testing

### **1. Test de génération de JWT**

```bash
# Appeler l'Edge Function
curl -X POST https://qlwmadumwiibypstsivr.supabase.co/functions/v1/auth-multiversx \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{
    "walletAddress": "erd1test...",
    "signature": "abc123...",
    "message": "GalacticX Authentication..."
  }'
```

**Réponse attendue** :
```json
{
  "success": true,
  "user_id": "abc-123-def-456",
  "wallet_address": "erd1test...",
  "role": "user",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

### **2. Décoder le JWT**

Allez sur https://jwt.io et collez le `access_token` pour vérifier son contenu.

### **3. Tester avec le frontend**

```typescript
// Dans la console browser
const token = localStorage.getItem('supabase.auth.token');
console.log('Token:', token);

// Décoder (partie payload)
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Payload:', payload);
```

---

## 📊 Comparaison : Email Fictif VS Custom JWT

| Aspect                | Email Fictif ❌          | Custom JWT ✅             |
|-----------------------|-------------------------|---------------------------|
| **Email requis**      | Oui (fictif)            | Non                       |
| **Table auth.users**  | Utilisée                | Pas utilisée              |
| **Identifiant**       | Email + wallet          | Wallet uniquement         |
| **Claims custom**     | Limités                 | Totalement custom         |
| **Adapté Web3**       | Non                     | Oui                       |
| **Complexité**        | Moyenne                 | Moyenne                   |
| **Sécurité**          | Bonne                   | Bonne                     |

---

## ⚠️ Points d'Attention

### **1. Refresh Token**

Le Custom JWT actuel n'a **pas de refresh token**. Solution :

**Option A : Redemander signature après expiration**
```typescript
// Après 1h, redemander signature
if (tokenExpired) {
  await authenticateWithSupabase(); // Re-signe
}
```

**Option B : Stocker refresh token custom**
```typescript
// Dans Edge Function, générer aussi un refresh token
const refreshToken = crypto.randomUUID();
await supabaseAdmin
  .from('refresh_tokens')
  .insert({ user_id, token: refreshToken, expires_at: ... });
```

### **2. Vérification de signature**

**Actuellement** :
```typescript
// TODO: Verify signature
console.log('✅ Signature acceptée (validation à implémenter)');
```

**À implémenter** : Vérification cryptographique réelle (voir `EDGE_FUNCTION_EXPLAINED.md`)

### **3. JWT_SECRET**

⚠️ **CRITIQUE** : Le `JWT_SECRET` doit **rester absolument secret**
- Ne jamais le commiter dans Git
- Ne jamais l'exposer côté frontend
- Seule l'Edge Function doit y avoir accès

---

## ✅ Checklist de Migration

- [ ] Récupérer le JWT_SECRET depuis Supabase Dashboard
- [ ] Configurer le secret dans Edge Function
- [ ] Déployer l'Edge Function modifiée
- [ ] Mettre à jour les RLS policies pour utiliser `auth.jwt()`
- [ ] Tester la connexion wallet
- [ ] Vérifier que le JWT est bien stocké
- [ ] Tester les requêtes Supabase avec le JWT
- [ ] Vérifier les logs de l'Edge Function

---

## 🚀 Résultat Final

```
User connecte wallet
  ↓
Signe message
  ↓
Edge Function génère Custom JWT (pas d'email!)
  ↓
Frontend reçoit JWT
  ↓
Toutes les requêtes utilisent ce JWT
  ↓
RLS vérifie jwt.sub, jwt.wallet_address, jwt.role
  ↓
✅ Authentification sécurisée sans email!
```

**Plus besoin de `auth.users` !**  
**Wallet = identité unique** 🎯


