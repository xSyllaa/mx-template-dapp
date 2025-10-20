# War Games RLS - Fix pour "Policy Already Exists"

## 🚨 Erreur Rencontrée

```
ERROR: 42710: policy "Users can insert their own teams" for table "war_game_teams" already exists
```

## ✅ Solution : Script de Migration Robuste

### **Étape 1 : Utiliser le Script Final**

Au lieu du script `WAR_GAMES_RLS_CUSTOM_JWT_FIX.sql`, utilisez le nouveau script `WAR_GAMES_RLS_FIX_FINAL.sql` qui :

1. **Supprime automatiquement** toutes les politiques existantes
2. **Recrée** la fonction `get_current_user_id()`
3. **Crée** les nouvelles politiques avec la fonction custom

### **Étape 2 : Exécuter le Script**

Dans **Supabase Dashboard** → **SQL Editor** :

```sql
-- Copier-coller le contenu de WAR_GAMES_RLS_FIX_FINAL.sql
-- Ce script gère automatiquement les politiques existantes
```

### **Étape 3 : Vérifier la Migration**

Exécuter le script de vérification `WAR_GAMES_RLS_VERIFICATION.sql` pour s'assurer que :

- ✅ Fonction `get_current_user_id()` créée
- ✅ 4 politiques RLS mises à jour
- ✅ RLS activé sur la table
- ✅ Permissions correctes

---

## 🔍 Pourquoi Cette Erreur ?

### **Cause**
Les politiques RLS existent déjà dans votre Supabase avec les noms :
- "Users can view their own teams"
- "Users can insert their own teams" 
- "Users can update their own teams"
- "Users can delete their own teams"

### **Solution**
Le script `WAR_GAMES_RLS_FIX_FINAL.sql` utilise une boucle `DO $$` pour :
1. **Lister** toutes les politiques existantes
2. **Les supprimer** une par une
3. **Recréer** les nouvelles avec la fonction custom

---

## 📋 Checklist de Résolution

- [ ] **Erreur identifiée** : Policy already exists
- [ ] **Script final utilisé** : `WAR_GAMES_RLS_FIX_FINAL.sql`
- [ ] **Migration exécutée** dans Supabase Dashboard
- [ ] **Vérification effectuée** avec script de vérification
- [ ] **Test de sauvegarde** d'équipe réussi
- [ ] **Plus d'erreur 401** dans la console

---

## 🎯 Résultat Attendu

Après la migration, vous devriez voir :

```sql
-- Vérification des politiques
SELECT policyname FROM pg_policies WHERE tablename = 'war_game_teams';
-- Résultat : 4 politiques avec get_current_user_id()

-- Test de la fonction
SELECT get_current_user_id();
-- Résultat : Votre UUID utilisateur (si connecté)
```

---

## 🚀 Test Final

1. **Connecter** wallet MultiversX
2. **Signer** message d'authentification
3. **Ajouter** NFTs sur le terrain
4. **Sauvegarder** équipe avec nom
5. **Vérifier** : `✅ Team saved successfully!`

**Plus d'erreur 401** ! 🎉

---

**Date**: 2025-01-18  
**Version**: 1.1 (Error Fix)  
**Status**: Ready to Deploy


