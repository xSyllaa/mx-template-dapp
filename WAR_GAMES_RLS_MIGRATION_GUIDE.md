# War Games RLS Migration Guide

## 🚨 Problème Actuel

Vous avez l'erreur :
```
401 (Unauthorized)
new row violates row-level security policy for table "war_game_teams"
```

**Cause** : Les politiques RLS utilisent `auth.uid()` qui ne fonctionne pas avec votre JWT custom.

## ✅ Solution : Migration RLS

### **Étape 1 : Appliquer la Migration SQL**

Exécutez ce script dans votre **Supabase Dashboard** → **SQL Editor** :

```sql
-- WAR_GAMES_RLS_CUSTOM_JWT_FIX.sql
-- Fix RLS Policies for Custom JWT Authentication

-- 1. Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view their own teams" ON war_game_teams;
DROP POLICY IF EXISTS "Users can insert their own teams" ON war_game_teams;
DROP POLICY IF EXISTS "Users can update their own teams" ON war_game_teams;
DROP POLICY IF EXISTS "Users can delete their own teams" ON war_game_teams;

-- 2. Créer la fonction pour extraire user_id du JWT custom
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  -- Extraire 'sub' du JWT custom (votre user_id)
  RETURN COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'sub')::uuid,
    auth.uid() -- Fallback si JWT standard
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Donner les permissions
GRANT EXECUTE ON FUNCTION get_current_user_id() TO authenticated, anon;

-- 4. Créer les nouvelles politiques avec la fonction custom
CREATE POLICY "Users can view their own teams" ON war_game_teams
  FOR SELECT USING (get_current_user_id() = user_id);

CREATE POLICY "Users can insert their own teams" ON war_game_teams
  FOR INSERT WITH CHECK (get_current_user_id() = user_id);

CREATE POLICY "Users can update their own teams" ON war_game_teams
  FOR UPDATE USING (get_current_user_id() = user_id);

CREATE POLICY "Users can delete their own teams" ON war_game_teams
  FOR DELETE USING (get_current_user_id() = user_id);
```

### **Étape 2 : Vérifier la Migration**

Après avoir exécuté le script, vérifiez dans **Supabase Dashboard** → **Authentication** → **Policies** que vous avez :

1. ✅ **Fonction créée** : `get_current_user_id()`
2. ✅ **4 politiques mises à jour** avec la nouvelle fonction
3. ✅ **RLS activé** sur la table `war_game_teams`

### **Étape 3 : Tester la Sauvegarde**

1. **Connecter** votre wallet MultiversX
2. **Signer** le message d'authentification
3. **Ajouter** quelques NFTs sur le terrain
4. **Sauvegarder** une équipe avec un nom
5. **Vérifier** que ça fonctionne sans erreur 401

---

## 🔍 Debugging

### **Vérifier l'État d'Authentification**
```javascript
// Console du navigateur
console.log('Auth State:', {
  isAuthenticated: true,
  supabaseUserId: "63df3e00-0785-4f4a-a782-bc4ee722f196"
});
```

### **Vérifier le JWT Custom**
```javascript
// Vérifier le JWT dans localStorage
const jwt = localStorage.getItem('supabase.auth.token');
if (jwt) {
  const payload = JSON.parse(atob(jwt.split('.')[1]));
  console.log('JWT Payload:', payload);
  console.log('User ID (sub):', payload.sub);
}
```

### **Tester la Fonction RLS**
```sql
-- Dans Supabase SQL Editor
SELECT get_current_user_id();
-- Doit retourner votre UUID utilisateur
```

---

## 📊 Comparaison Avant/Après

### **❌ Avant (Ne fonctionne pas)**
```sql
-- Politiques utilisant auth.uid() (JWT standard)
CREATE POLICY "Users can insert" ON war_game_teams
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```
**Problème** : `auth.uid()` ne fonctionne pas avec JWT custom.

### **✅ Après (Fonctionne)**
```sql
-- Politiques utilisant get_current_user_id() (JWT custom)
CREATE POLICY "Users can insert" ON war_game_teams
  FOR INSERT WITH CHECK (get_current_user_id() = user_id);
```
**Solution** : `get_current_user_id()` extrait l'ID du JWT custom.

---

## 🎯 Structure JWT Custom

Votre JWT custom a cette structure :
```json
{
  "sub": "63df3e00-0785-4f4a-a782-bc4ee722f196",  // ← User ID (extrait par get_current_user_id())
  "wallet_address": "erd1...",
  "role": "user",
  "aud": "authenticated",
  "exp": 1234567890,
  "iat": 1234567890,
  "iss": "supabase"
}
```

La fonction `get_current_user_id()` extrait la valeur `sub` qui contient votre `user_id`.

---

## ✅ Checklist de Migration

- [ ] **Script SQL exécuté** dans Supabase Dashboard
- [ ] **Fonction `get_current_user_id()` créée**
- [ ] **4 politiques RLS mises à jour**
- [ ] **RLS activé** sur `war_game_teams`
- [ ] **Test de sauvegarde** d'équipe réussi
- [ ] **Pas d'erreur 401** dans la console
- [ ] **Équipe visible** dans la liste des équipes sauvegardées

---

## 🚀 Résultat Attendu

Après la migration, vous devriez voir :
```
✅ Creating team for user: 63df3e00-0785-4f4a-a782-bc4ee722f196
✅ Team data: {teamName: 'Test', formation: '4-4-2', slots: Array(2)}
✅ Team saved successfully!
```

**Plus d'erreur 401** ! 🎉

---

**Date**: 2025-01-18  
**Version**: 1.0  
**Status**: Ready to Deploy


