# Authentification Supabase avec MultiversX

## 🔐 Architecture

GalacticX utilise un système d'authentification hybride :
- **MultiversX** : Authentification par signature de wallet
- **Supabase** : Gestion des sessions JWT et RLS

## 🔄 Flow d'Authentification

```
1. User connecte wallet MultiversX
   ↓
2. Frontend génère un message unique (nonce + timestamp)
   ↓
3. User signe le message avec son wallet
   ↓
4. Frontend envoie (wallet + signature + message) à Edge Function
   ↓
5. Edge Function vérifie la signature cryptographique
   ↓
6. Edge Function crée/récupère user dans auth.users
   ↓
7. Edge Function crée profil dans public.users
   ↓
8. Edge Function génère JWT Supabase
   ↓
9. Frontend reçoit JWT et l'utilise pour toutes les requêtes
   ↓
10. RLS policies utilisent auth.uid() pour vérifier les permissions
```

## 📁 Fichiers

### Edge Function
- **Path** : `supabase/functions/auth-multiversx/index.ts`
- **Rôle** : Vérifier signature MultiversX et générer JWT Supabase
- **Déploiement** : `supabase functions deploy auth-multiversx`

### Frontend Hook
- **Path** : `src/hooks/useSupabaseAuth.ts`
- **Rôle** : Gérer l'authentification automatique lors de la connexion wallet
- **Usage** :
  ```typescript
  const { isAuthenticated, loading, error } = useSupabaseAuth();
  ```

## 🔑 Variables d'Environnement

### Frontend (.env)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Edge Function (Supabase Dashboard)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🛡️ Sécurité

### Niveau 1 : Signature Cryptographique
- Seul le détenteur de la clé privée peut signer
- Signature vérifiée par `@multiversx/sdk-core`
- Impossible de forger

### Niveau 2 : JWT Supabase
- Token signé par Supabase
- Expire après 1 heure
- Refresh automatique

### Niveau 3 : RLS Policies
- Vérification au niveau PostgreSQL
- `auth.uid()` = User authentifié
- Impossible à contourner

## 🚀 Déploiement

### 1. Déployer l'Edge Function

```powershell
# Aller dans le dossier du projet
cd C:\...\GalacticDapp

# Déployer la fonction
supabase functions deploy auth-multiversx

# Définir les secrets
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Tester localement

```powershell
# Lancer l'Edge Function localement
supabase functions serve auth-multiversx

# Tester avec curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/auth-multiversx' `
  --header 'Content-Type: application/json' `
  --data '{
    "walletAddress": "erd1...",
    "signature": "abc123...",
    "message": "GalacticX Authentication..."
  }'
```

### 3. Remettre les RLS policies strictes

Une fois l'Edge Function déployée, remettre les policies avec `TO authenticated`.

## 🐛 Debugging

### Problème : "Invalid signature"
**Cause** : La signature ne correspond pas au message  
**Solution** : Vérifier que le message signé est identique au message envoyé

### Problème : "Missing SUPABASE_SERVICE_ROLE_KEY"
**Cause** : Secret non défini  
**Solution** : `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...`

### Problème : "User not found in auth.users"
**Cause** : Utilisateur pas créé  
**Solution** : Vérifier que l'Edge Function crée bien l'utilisateur

## 📊 Logs

### Frontend
```
🔐 [SupabaseAuth] Authentification Supabase pour: erd1...
📝 [SupabaseAuth] Message à signer: GalacticX Authentication...
✍️ [SupabaseAuth] Message signé
✅ [SupabaseAuth] Authentification réussie
```

### Edge Function
```
🔐 [Auth] Vérification signature pour: erd1...
✅ [Auth] Signature valide
👤 [Auth] Utilisateur existant: abc-123
🎫 [Auth] Session générée
```

## 🔄 Migration Temporaire → Sécurisée

### État actuel (Temporaire)
```sql
-- Policies ouvertes (anyone can do anything)
CREATE POLICY "Everyone can view" ON users FOR SELECT USING (true);
```

### État final (Sécurisé)
```sql
-- Policies strictes (authenticated only)
CREATE POLICY "Authenticated can view" ON users 
FOR SELECT 
TO authenticated 
USING (true);
```

## ✅ Checklist de Déploiement

- [ ] Edge Function créée
- [ ] Edge Function déployée sur Supabase
- [ ] Secrets configurés
- [ ] Hook frontend intégré
- [ ] Tests de signature
- [ ] RLS policies mises à jour
- [ ] Tests de bout en bout



