# Correction du problème des scores négatifs et du leaderboard qui ne s'affiche pas

## Problème identifié

Le problème vient du fait que les scores négatifs (paris perdus) étaient ajoutés au total des points des utilisateurs, ce qui créait des scores négatifs dans le leaderboard.

## Solution complète

### Étape 1 : Corriger la fonction d'enregistrement des points

La fonction `record_points_transaction` ajoutait tous les montants (positifs et négatifs) au total. Il faut la modifier pour n'ajouter que les gains positifs.

**Fichier à exécuter :** `supabase/migrations/002_fix_total_points_calculation.sql`

Cette migration :
- Modifie `record_points_transaction` pour n'ajouter que les montants positifs (`GREATEST(p_amount, 0)`)
- Recalcule tous les `total_points` existants pour corriger les valeurs négatives

### Étape 2 : Mettre à jour les fonctions de leaderboard

Les fonctions `get_leaderboard` et `get_user_rank` doivent être mises à jour pour fonctionner correctement avec la nouvelle logique.

**Fichier à exécuter :** `supabase/migrations/003_update_leaderboard_functions.sql`

Cette migration :
- Recrée les fonctions avec la logique corrigée
- Utilise `SUM(GREATEST(pt.amount, 0))` pour ne compter que les gains positifs
- Calcule correctement les rangs basés uniquement sur les points positifs

## Instructions d'exécution

### 1. Accéder au SQL Editor de Supabase

1. Allez sur votre dashboard Supabase
2. Sélectionnez votre projet
3. Allez dans "SQL Editor" dans le menu de gauche

### 2. Exécuter les migrations dans l'ordre

1. **D'abord :** Exécuter le contenu de `supabase/migrations/002_fix_total_points_calculation.sql`
2. **Puis :** Exécuter le contenu de `supabase/migrations/003_update_leaderboard_functions.sql`

### 3. Vérifier les résultats

Après l'exécution :
- Les scores négatifs devraient devenir positifs (ou zéro)
- Le leaderboard devrait s'afficher correctement
- Les rangs devraient être calculés uniquement sur les gains positifs

## Ce qui a été corrigé

### Avant la correction :
- Les paris perdus créaient des transactions négatives
- Ces montants négatifs étaient ajoutés au `total_points` des utilisateurs
- Résultat : scores négatifs dans le leaderboard

### Après la correction :
- Les paris perdus créent toujours des transactions négatives (pour l'historique)
- Mais seuls les gains positifs sont ajoutés au `total_points`
- Résultat : scores positifs uniquement dans le leaderboard

## Vérification

Pour vérifier que tout fonctionne :

1. **Vérifiez les données :**
   ```sql
   SELECT id, username, total_points FROM users WHERE total_points < 0;
   ```
   Cette requête devrait retourner peu ou pas de résultats.

2. **Testez le leaderboard :**
   ```sql
   SELECT * FROM get_leaderboard('all_time', 10);
   ```
   Cette requête devrait retourner les 10 meilleurs utilisateurs avec des scores positifs.

3. **Testez le rang d'un utilisateur :**
   ```sql
   SELECT * FROM get_user_rank('user-id-here', 'all_time');
   ```
   Cette requête devrait retourner le rang correct basé uniquement sur les gains positifs.

## Notes importantes

- Les transactions négatives restent dans `points_transactions` pour l'historique des paris
- Seuls les gains positifs comptent pour le classement
- La colonne `total_points` représente maintenant uniquement les points positifs cumulés
- Les fonctions utilisent `GREATEST(amount, 0)` pour filtrer automatiquement les valeurs négatives

Après avoir exécuté ces migrations, votre leaderboard devrait fonctionner correctement avec des scores positifs uniquement ! 🎯
