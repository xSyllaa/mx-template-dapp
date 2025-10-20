# Authentification Supabase avec MultiversX

## 🔐 Architecture

GalacticX utilise un système d'authentification hybride :
- **MultiversX** : Authentification par signature de wallet
- **Supabase** : Gestion des sessions JWT custom et RLS
- **React Context** : Source unique de vérité pour l'état d'authentification

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
6. Edge Function crée/récupère user dans public.users (PAS auth.users)
   ↓
7. Edge Function génère JWT CUSTOM avec 'sub' = user_id
   ↓
8. Frontend stocke JWT dans localStorage
   ↓
9. AuthContext gère l'état d'authentification React
   ↓
10. Services utilisent userId direct (pas auth.uid())
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

### Niveau 3 : RLS Policies avec JWT Custom
- Vérification au niveau PostgreSQL
- `get_current_user_id()` = Extrait 'sub' du JWT custom
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

## 🔄 RLS avec JWT Custom

### Problème avec auth.uid()
```sql
-- ❌ Ne fonctionne PAS avec JWT custom
CREATE POLICY "Users can insert" ON war_game_teams
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Solution avec get_current_user_id()
```sql
-- ✅ Fonctionne avec JWT custom
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  -- Extraire 'sub' du JWT custom
  RETURN COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'sub')::uuid,
    auth.uid() -- Fallback
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies utilisant la fonction custom
CREATE POLICY "Users can insert" ON war_game_teams
  FOR INSERT WITH CHECK (get_current_user_id() = user_id);
```

### Structure JWT Custom
```json
{
  "sub": "63df3e00-0785-4f4a-a782-bc4ee722f196",  // User ID
  "wallet_address": "erd1...",
  "role": "user",
  "aud": "authenticated",
  "exp": 1234567890,
  "iat": 1234567890,
  "iss": "supabase"
}
```

## 🔄 Migration Temporaire → Sécurisée

### État actuel (Temporaire)
```sql
-- Policies ouvertes (anyone can do anything)
CREATE POLICY "Everyone can view" ON users FOR SELECT USING (true);
```

### État final (Sécurisé)
```sql
-- Policies strictes avec JWT custom
CREATE POLICY "Authenticated can view" ON users 
FOR SELECT 
USING (get_current_user_id() IS NOT NULL);
```

## ✅ Checklist de Déploiement

- [ ] Edge Function créée
- [ ] Edge Function déployée sur Supabase
- [ ] Secrets configurés
- [ ] Hook frontend intégré
- [ ] Tests de signature
- [ ] RLS policies mises à jour
- [ ] Tests de bout en bout



