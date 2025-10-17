# GalacticX - Flow d'Authentification et Récupération du Profil

## 📋 Vue d'ensemble

GalacticX utilise un système d'authentification **wallet-first** avec MultiversX, combiné à Supabase pour la gestion des profils utilisateurs.

---

## 🔄 Process Complet de Connexion

### Étape 1 : Connexion Wallet MultiversX

```typescript
// L'utilisateur clique sur "Connect Wallet"
// MultiversX SDK gère la connexion
const { address } = useGetAccount();
// → address = "erd1qqqqqqqqqqqqqpgq..."
```

**Ce qui se passe** :
- L'utilisateur signe une transaction avec son wallet (xPortal, Extension, Web Wallet)
- MultiversX SDK stocke l'adresse wallet dans le localStorage
- Le hook `useGetAccount()` récupère l'adresse

---

### Étape 2 : Interrogation Supabase

```typescript
// Hook useUserRole() s'exécute automatiquement
useEffect(() => {
  if (address) {
    // Query Supabase
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', address)
      .single();
  }
}, [address]);
```

**Requête SQL générée** :
```sql
SELECT id, wallet_address, username, role, total_points, nft_count
FROM users
WHERE wallet_address = 'erd1qqqqqqqqqqqqqpgq...'
LIMIT 1;
```

---

### Étape 3 : Scénario A - Profil Existant ✅

**Si l'utilisateur existe déjà dans la base de données** :

```typescript
// Supabase retourne les données
{
  id: "cd4c7fed-d5ca-4aca-9314-f8168852e672",
  wallet_address: "erd1kingowlgalacticx000000000000000000000000000000000000000",
  username: "KingOwl",
  role: "admin",  // ← Peut être 'admin' ou 'user'
  total_points: 5000,
  nft_count: 50
}
```

**Logs Console** :
```
✅ [useUserRole] Profil trouvé:
{
  id: "cd4c7fed-d5ca-4aca-9314-f8168852e672",
  wallet: "erd1kingowlgalacticx000000000000000000000000000000000000000",
  username: "KingOwl",
  role: "admin",
  isAdmin: true,
  points: 5000,
  nftCount: 50
}
👑 [useUserRole] ACCÈS ADMIN DÉTECTÉ
```

**Résultat dans l'UI** :
- ✅ Menu "Admin" apparaît dans la sidebar
- ✅ Points affichés : 5000
- ✅ Route `/admin` accessible

---

### Étape 4 : Scénario B - Nouveau Profil ➕

**Si l'utilisateur n'existe PAS dans la base de données** :

```typescript
// Supabase retourne une erreur PGRST116 (no rows)
if (fetchError.code === 'PGRST116') {
  // Créer automatiquement un nouveau profil
  const { data: newUser } = await supabase
    .from('users')
    .insert({
      wallet_address: address,
      role: 'user',        // ← Nouveau = toujours 'user'
      total_points: 0,
      nft_count: 0
    })
    .select('*')
    .single();
}
```

**Requête SQL générée** :
```sql
INSERT INTO users (wallet_address, role, total_points, nft_count)
VALUES ('erd1newuser...', 'user', 0, 0)
RETURNING *;
```

**Logs Console** :
```
👤 [useUserRole] Profil non trouvé → Création d'un nouveau profil
✅ [useUserRole] Nouveau profil créé:
{
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  wallet: "erd1newuser...",
  role: "user",
  points: 0
}
👤 [useUserRole] Utilisateur standard
```

**Résultat dans l'UI** :
- ❌ Menu "Admin" caché
- ✅ Points affichés : 0
- ❌ Route `/admin` redirige vers dashboard

---

## 🔍 Flow Détaillé avec Logs

### 1. Avant la Connexion

```
Console (F12):
🔌 [useUserRole] Pas de wallet connecté
```

**État de l'application** :
- `address` = `undefined`
- `userProfile` = `null`
- `isAdmin` = `false`
- `loading` = `false`

---

### 2. Connexion en cours

```
Console (F12):
🚀 [useUserRole] Wallet connecté: erd1kingowlgalacticx...
📡 [useUserRole] Interrogation Supabase...
```

**État de l'application** :
- `address` = `"erd1kingowlgalacticx..."`
- `userProfile` = `null`
- `isAdmin` = `false`
- `loading` = `true` ← Affiche un loader

---

### 3. Profil Récupéré (Admin)

```
Console (F12):
✅ [useUserRole] Profil trouvé:
{
  id: "cd4c7fed-d5ca-4aca-9314-f8168852e672",
  wallet: "erd1kingowlgalacticx...",
  username: "KingOwl",
  role: "admin",
  isAdmin: true,
  points: 5000,
  nftCount: 50
}
👑 [useUserRole] ACCÈS ADMIN DÉTECTÉ
🏁 [useUserRole] Chargement terminé
```

**État de l'application** :
- `address` = `"erd1kingowlgalacticx..."`
- `userProfile` = `{ id: "...", role: "admin", ... }`
- `isAdmin` = `true` ← Menu admin visible
- `loading` = `false`

---

### 4. Profil Récupéré (Utilisateur Normal)

```
Console (F12):
✅ [useUserRole] Profil trouvé:
{
  id: "12345678-abcd-efgh-ijkl-mnopqrstuvwx",
  wallet: "erd1normaluser...",
  username: null,
  role: "user",
  isAdmin: false,
  points: 250,
  nftCount: 3
}
👤 [useUserRole] Utilisateur standard
🏁 [useUserRole] Chargement terminé
```

**État de l'application** :
- `address` = `"erd1normaluser..."`
- `userProfile` = `{ id: "...", role: "user", ... }`
- `isAdmin` = `false` ← Menu admin caché
- `loading` = `false`

---

## 🧪 Comment Tester

### Test 1 : Connexion en tant qu'Admin

1. **Ouvrez la console** (F12)
2. **Connectez-vous** avec l'une des adresses admin :
   - `erd1kingowlgalacticx000000000000000000000000000000000000000`
   - `erd1mishugalacticx00000000000000000000000000000000000000000`
   - `erd1syllagalacticx00000000000000000000000000000000000000000`
3. **Observez les logs** :
   ```
   👑 [useUserRole] ACCÈS ADMIN DÉTECTÉ
   ```
4. **Vérifiez la sidebar** : Le menu "👑 Admin" doit apparaître

### Test 2 : Connexion en tant qu'Utilisateur Normal

1. **Connectez-vous** avec n'importe quelle autre adresse wallet
2. **Observez les logs** :
   ```
   👤 [useUserRole] Profil non trouvé → Création d'un nouveau profil
   ✅ [useUserRole] Nouveau profil créé
   👤 [useUserRole] Utilisateur standard
   ```
3. **Vérifiez la sidebar** : Le menu "👑 Admin" doit être caché

### Test 3 : Vérifier dans Supabase Dashboard

1. Allez sur [https://app.supabase.com](https://app.supabase.com)
2. Ouvrez votre projet **GalacticX**
3. Allez dans **Table Editor** → **users**
4. Vous devriez voir votre nouveau profil créé automatiquement

---

## 🔐 Sécurité

### Niveau 1 : Frontend Guard (UX)

```typescript
// src/wrappers/AdminGuard/AdminGuard.tsx
if (!isAdmin) {
  return <Navigate to="/dashboard" replace />;
}
```

**Protection** : ❌ Peut être contournée (DevTools)  
**But** : UX uniquement (cache la page)

### Niveau 2 : Row Level Security (DATABASE)

```sql
-- Supabase PostgreSQL
CREATE POLICY "Only admins can create predictions"
ON predictions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

**Protection** : ✅ **IMPOSSIBLE À CONTOURNER**  
**But** : Véritable sécurité

---

## 📊 Diagramme de Séquence

```
┌─────────┐         ┌──────────────┐         ┌──────────┐         ┌────────┐
│  User   │         │   Frontend   │         │MultiversX│         │Supabase│
└────┬────┘         └──────┬───────┘         └────┬─────┘         └───┬────┘
     │                     │                      │                    │
     │ 1. Click "Connect" │                      │                    │
     ├────────────────────>│                      │                    │
     │                     │                      │                    │
     │                     │ 2. Request signature │                    │
     │                     ├─────────────────────>│                    │
     │                     │                      │                    │
     │ 3. Sign with wallet │                      │                    │
     │<────────────────────┤                      │                    │
     │                     │                      │                    │
     │                     │ 4. Return address    │                    │
     │                     │<─────────────────────┤                    │
     │                     │                      │                    │
     │                     │ 5. Query profile (SELECT * WHERE wallet_address = ?)
     │                     ├──────────────────────────────────────────>│
     │                     │                      │                    │
     │                     │ 6a. Profile found    │                    │
     │                     │<──────────────────────────────────────────┤
     │                     │    OR                │                    │
     │                     │ 6b. Profile not found│                    │
     │                     │<──────────────────────────────────────────┤
     │                     │                      │                    │
     │                     │ 7. Create new profile (INSERT INTO users)  │
     │                     ├──────────────────────────────────────────>│
     │                     │                      │                    │
     │                     │ 8. Return user data  │                    │
     │                     │<──────────────────────────────────────────┤
     │                     │                      │                    │
     │ 9. Show dashboard   │                      │                    │
     │    + admin menu     │                      │                    │
     │<────────────────────┤                      │                    │
     │                     │                      │                    │
```

---

## 🎯 Points Clés

1. **Automatique** : Pas besoin de créer manuellement les profils
2. **Sécurisé** : RLS empêche les modifications non autorisées
3. **Transparent** : Les logs montrent chaque étape
4. **Réactif** : L'UI s'adapte au rôle (admin/user)

---

## 🐛 Debugging

### Problème : Menu admin ne s'affiche pas

**Vérifiez** :
1. Console : `👑 [useUserRole] ACCÈS ADMIN DÉTECTÉ` ?
2. Supabase Dashboard : `users.role = 'admin'` ?
3. Wallet address correct ?

### Problème : Erreur "new row violates row-level security"

**Cause** : RLS policy bloque l'action  
**Solution** : Vérifier que l'utilisateur a les droits nécessaires

### Problème : Profil pas créé automatiquement

**Vérifiez** :
1. `.env` : `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` corrects ?
2. RLS : Policy `"Users can insert their own profile"` activée ?
3. Console : Erreur affichée ?

---

## 📚 Ressources

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [MultiversX SDK Dapp](https://docs.multiversx.com/sdk-and-tools/sdk-js/)
- `docs/SECURITY_WITHOUT_BACKEND.md` - Guide sécurité détaillé
- `docs/DATABASE_SCHEMA.md` - Schéma complet de la base de données



