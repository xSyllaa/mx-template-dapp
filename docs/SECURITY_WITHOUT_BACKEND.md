# GalacticX - Sécurité sans Backend Traditionnel

## 📋 Table des Matières
1. [Architecture Sécurisée](#architecture-sécurisée)
2. [Comment ça fonctionne sans backend ?](#comment-ça-fonctionne-sans-backend-)
3. [Row Level Security (RLS)](#row-level-security-rls)
4. [Protection des Routes Frontend](#protection-des-routes-frontend)
5. [Protection des Appels API](#protection-des-appels-api)
6. [Cas d'Usage](#cas-dusage)
7. [Points Critiques de Sécurité](#points-critiques-de-sécurité)

---

## Architecture Sécurisée

### Stack GalacticX
```
┌─────────────────────────────────────────┐
│         Frontend (React)                │
│  - Authentification MultiversX Wallet   │
│  - Guards (AdminGuard, AuthGuard)       │
│  - Supabase Client (RLS activé)         │
└──────────────┬──────────────────────────┘
               │
               │ JWT Token
               │
┌──────────────▼──────────────────────────┐
│       Supabase (Backend-as-a-Service)   │
│  ┌──────────────────────────────────┐   │
│  │  PostgreSQL avec RLS              │   │
│  │  - Policies par table             │   │
│  │  - Validation au niveau DB        │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  Edge Functions (Deno)            │   │
│  │  - Validation serveur             │   │
│  │  - Logique métier complexe        │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Principe de Défense en Profondeur (Defense in Depth)

**3 Couches de sécurité** :
1. **Frontend Guards** (UX) : Empêche l'accès visuel aux pages non autorisées
2. **Row Level Security (RLS)** (Database) : **VÉRITABLE SÉCURITÉ** - Empêche l'accès aux données
3. **Edge Functions** (Server-Side) : Validation logique métier complexe

---

## Comment ça fonctionne sans backend ?

### ❌ Architecture Traditionnelle (avec backend)

```
Frontend → Backend API → Database
         ↑
    Toute la sécurité ici
```

Problèmes :
- Coût de développement élevé
- Maintenance complexe
- Besoin de serveurs dédiés

### ✅ Architecture GalacticX (Serverless)

```
Frontend → Supabase (PostgreSQL + RLS) + Edge Functions
                    ↑
              Sécurité ici !
```

Avantages :
- **RLS = Backend intégré dans la DB**
- Auto-scaling automatique
- Pas de serveur à gérer
- Coût réduit

---

## Row Level Security (RLS)

### Qu'est-ce que RLS ?

RLS (Row Level Security) = **Firewall au niveau des lignes de données**

**Analogie** : Imaginez une bibliothèque où chaque livre a un cadenas. Seules les personnes autorisées (par leur badge JWT) peuvent lire/modifier certains livres.

### Comment ça marche ?

#### 1. Authentification MultiversX

```typescript
// L'utilisateur se connecte avec son wallet
const { address } = useGetAccountInfo();

// MultiversX génère un JWT token
// Ce token contient : wallet_address, signature, timestamp
```

#### 2. Supabase vérifie le JWT

```typescript
// À chaque requête Supabase
const { data, error } = await supabase
  .from('predictions')
  .select('*');

// Supabase extrait le JWT et vérifie :
// - Token valide ?
// - Non expiré ?
// - Signature correcte ?
// → auth.uid() = ID de l'utilisateur
```

#### 3. PostgreSQL applique les Policies RLS

```sql
-- Exemple : Table predictions
CREATE POLICY "Only admins can create predictions"
ON predictions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()  -- ← Qui est l'utilisateur ?
    AND users.role = 'admin'      -- ← Est-il admin ?
  )
);
```

**Résultat** :
- ✅ Si admin → insertion autorisée
- ❌ Si user → **PostgreSQL refuse l'insertion** (même si le frontend essaie)

### Exemples de Policies RLS

#### Exemple 1 : Lecture publique

```sql
-- Tout le monde peut lire les prédictions
CREATE POLICY "Predictions are viewable by everyone"
ON predictions FOR SELECT
TO authenticated
USING (true);  -- ← Toujours vrai = accès pour tous
```

#### Exemple 2 : Écriture restreinte à soi-même

```sql
-- Les utilisateurs peuvent uniquement créer leurs propres prédictions
CREATE POLICY "Users can insert own predictions"
ON user_predictions FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()  -- ← Doit correspondre à l'utilisateur connecté
  AND EXISTS (
    SELECT 1 FROM predictions
    WHERE predictions.id = prediction_id
    AND predictions.status = 'open'  -- ← Validation métier
    AND predictions.close_date > NOW()
  )
);
```

#### Exemple 3 : Admin uniquement

```sql
-- Seuls les admins peuvent valider les résultats
CREATE POLICY "Only admins can update predictions"
ON predictions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'  -- ← Vérification du rôle
  )
);
```

---

## Protection des Routes Frontend

### 1. AuthRedirectWrapper

**Objectif** : Rediriger les utilisateurs non connectés

```typescript
// src/wrappers/AuthRedirectWrapper/AuthRedirectWrapper.tsx
export const AuthRedirectWrapper = ({ children }: PropsWithChildren) => {
  const isLoggedIn = useGetIsLoggedIn();
  const currentRoute = routes.find((route) => matchPath(route.path, pathname));

  if (!isLoggedIn && currentRoute?.authenticatedRoute) {
    navigate(RouteNamesEnum.home); // → Redirection vers home
  }

  return <>{children}</>;
};
```

**Utilité** : UX uniquement (l'utilisateur ne voit pas la page)

### 2. AdminGuard

**Objectif** : Vérifier le rôle admin

```typescript
// src/wrappers/AdminGuard/AdminGuard.tsx
export const AdminGuard = ({ children }: PropsWithChildren) => {
  const { isAdmin, loading } = useUserRole();

  if (loading) return <Loader />;

  if (!isAdmin) {
    return <Navigate to={RouteNamesEnum.dashboard} replace />;
  }

  return <>{children}</>;
};
```

**Flux** :
1. L'utilisateur clique sur `/admin`
2. `AdminGuard` appelle Supabase pour récupérer `users.role`
3. Si `role !== 'admin'` → Redirection vers dashboard

### 3. Configuration des Routes

```typescript
// src/routes/routes.ts
export const routes: RouteWithTitleType[] = [
  {
    path: '/admin',
    title: 'Admin',
    component: Admin,
    authenticatedRoute: true,  // ← Nécessite connexion
    adminRoute: true           // ← Nécessite rôle admin
  }
];
```

```typescript
// src/App.tsx
const PageComponent = route.adminRoute ? (
  <AdminGuard>
    <route.component />
  </AdminGuard>
) : (
  <route.component />
);
```

---

## Protection des Appels API

### ⚠️ Important : Le Frontend n'est PAS sécurisé !

**Règle d'or** : N'importe qui peut modifier le code JavaScript du navigateur.

```typescript
// ❌ MAUVAIS : Vérification côté client uniquement
if (userRole === 'admin') {
  await supabase.from('predictions').insert(newPrediction);
}
// → Un utilisateur malin peut bypasser cette vérification
```

### ✅ Solution : RLS côté Supabase

```typescript
// ✅ BON : Tentative d'insertion (même si role !== 'admin')
const { data, error } = await supabase
  .from('predictions')
  .insert(newPrediction);

// PostgreSQL vérifie la policy RLS :
// - Si admin → data = nouvelle prédiction
// - Si user → error = "new row violates row-level security policy"
```

**Résultat** :
- Le frontend peut essayer
- **Mais Supabase refuse au niveau de la base de données**
- **Impossible à contourner** (sauf piratage de la DB, mais c'est un autre niveau)

### Exemple Concret : Créer une Prédiction

#### Frontend (React)

```typescript
// pages/Admin/CreatePrediction.tsx
const handleCreatePrediction = async () => {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .insert({
        competition: 'Premier League',
        home_team: 'Man City',
        away_team: 'Arsenal',
        bet_type: 'result',
        options: [
          { id: '1', label: 'Man City Win', odds: '2.10' },
          { id: 'X', label: 'Draw', odds: '3.50' },
          { id: '2', label: 'Arsenal Win', odds: '3.20' }
        ],
        status: 'open',
        start_date: '2025-10-20T15:00:00Z',
        close_date: '2025-10-20T14:55:00Z',
        points_reward: 100
      });

    if (error) throw error;

    toast.success('Prédiction créée !');
  } catch (error) {
    console.error(error);
    toast.error('Erreur : Vous devez être admin');
  }
};
```

#### Backend (RLS Policy)

```sql
-- Supabase vérifie automatiquement cette policy
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

**Si utilisateur non-admin essaie** :
```json
{
  "error": {
    "message": "new row violates row-level security policy for table \"predictions\"",
    "code": "42501"
  }
}
```

---

## Cas d'Usage

### Cas 1 : Utilisateur Normal Soumet une Prédiction

**Flux** :
1. User se connecte avec wallet → JWT généré
2. User accède à `/predictions` → AuthRedirectWrapper laisse passer
3. User clique sur "Man City Win" → Frontend envoie :
   ```typescript
   supabase.from('user_predictions').insert({
     user_id: auth.uid(),
     prediction_id: 'abc-123',
     selected_option_id: '1'
   })
   ```
4. PostgreSQL vérifie RLS policy :
   - `user_id === auth.uid()` ? ✅
   - Prédiction `status = 'open'` ? ✅
   - `close_date > NOW()` ? ✅
5. Insertion autorisée ✅

### Cas 2 : Utilisateur Malveillant Essaie de Créer une Prédiction

**Flux** :
1. User ouvre la console du navigateur (F12)
2. User essaie de créer une prédiction manuellement :
   ```javascript
   await supabase.from('predictions').insert({
     competition: 'Fake League',
     home_team: 'Fake Team A',
     away_team: 'Fake Team B',
     // ...
   })
   ```
3. PostgreSQL vérifie RLS policy :
   - `EXISTS (... WHERE role = 'admin')` ? ❌
4. **Insertion refusée** ❌ avec erreur `42501`

### Cas 3 : Admin Valide un Résultat

**Flux** :
1. Admin se connecte → JWT avec `role = 'admin'`
2. Admin accède `/admin` → AdminGuard vérifie le rôle ✅
3. Admin clique "Valider résultat" → Edge Function appelée :
   ```typescript
   const response = await fetch(
     'https://project.supabase.co/functions/v1/validate-prediction-result',
     {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${jwt}`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         prediction_id: 'abc-123',
         winning_option_id: '1'
       })
     }
   );
   ```
4. Edge Function vérifie :
   - JWT valide ? ✅
   - User est admin ? ✅
   - Logique métier (calcul points, mise à jour leaderboard) ✅
5. Résultat validé ✅

---

## Points Critiques de Sécurité

### ✅ Ce qui EST sécurisé

1. **Données sensibles** :
   - Impossible de lire les prédictions des autres users
   - Impossible de modifier les points d'un autre user
   - Impossible de créer des prédictions sans être admin

2. **Logique métier** :
   - Impossible de soumettre après `close_date`
   - Impossible de soumettre 2 fois la même prédiction
   - Impossible de valider un résultat sans être admin

3. **Intégrité de la DB** :
   - Contraintes CHECK (statut, rôle)
   - Foreign keys
   - UNIQUE constraints

### ⚠️ Ce qui N'EST PAS sécurisé (et c'est normal)

1. **Code Frontend** :
   - N'importe qui peut voir le code React
   - N'importe qui peut modifier le JavaScript
   - → **Mais ça ne donne pas accès aux données !**

2. **Clés API publiques** :
   - `VITE_SUPABASE_ANON_KEY` est visible
   - → **C'est normal !** Cette clé est conçue pour être publique
   - → La sécurité vient des RLS policies, pas de la clé

3. **Guards Frontend** :
   - `AdminGuard` peut être bypassé (en manipulant le code)
   - → **Mais Supabase refusera quand même l'action !**

### 🛡️ Règles d'Or

1. **Toujours activer RLS** sur toutes les tables
2. **Toujours valider côté serveur** (RLS ou Edge Functions)
3. **Ne jamais faire confiance au frontend** pour la sécurité
4. **Utiliser les Guards** pour l'UX, pas pour la sécurité
5. **Tester les policies RLS** en essayant de contourner les restrictions

---

## Résumé : Qui fait quoi ?

| Composant | Rôle | Sécurité ? |
|-----------|------|-----------|
| **Frontend Guards** | Empêche affichage UI | ❌ Contournable |
| **RLS Policies** | Empêche accès données | ✅ **VÉRITABLE SÉCURITÉ** |
| **Edge Functions** | Logique métier complexe | ✅ Sécurisé |
| **MultiversX Wallet** | Authentification | ✅ Signature cryptographique |
| **Supabase JWT** | Identification utilisateur | ✅ Token signé |

---

## Conclusion

**Sans backend traditionnel, GalacticX est-il sécurisé ?**

✅ **OUI**, car :
1. **Supabase = Backend intégré** (PostgreSQL + RLS)
2. **RLS = Firewall au niveau des lignes**
3. **Impossible de contourner** sans pirater la DB elle-même
4. **Frontend = UX uniquement**, pas de sécurité

**Le frontend peut mentir, mais la base de données ne ment jamais.** 🛡️

