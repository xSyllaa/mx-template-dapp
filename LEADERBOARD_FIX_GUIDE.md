# Guide de correction du leaderboard - Fonctions SQL manquantes

## Problème
L'application essaie d'appeler la fonction `get_leaderboard` dans Supabase, mais cette fonction n'existe pas dans la base de données, causant une erreur 404.

## Solution
Vous devez déployer les fonctions SQL définies dans `LEADERBOARD_MIGRATION.sql` dans votre base de données Supabase.

## Étapes à suivre

### 1. Accéder au SQL Editor de Supabase

1. Allez sur votre dashboard Supabase
2. Sélectionnez votre projet
3. Allez dans "SQL Editor" dans le menu de gauche

### 2. Exécuter la migration

1. Créez une nouvelle requête SQL
2. Copiez le contenu du fichier `LEADERBOARD_MIGRATION.sql`
3. Collez-le dans l'éditeur SQL
4. Cliquez sur "Run" pour exécuter la requête

### 3. Vérifier l'exécution

Si tout fonctionne correctement, vous devriez voir :
- La table `points_transactions` créée/modifiée
- Les fonctions `get_leaderboard` et `get_user_rank` créées
- Les politiques RLS configurées

### 4. Tester le leaderboard

Une fois la migration exécutée, le leaderboard devrait fonctionner correctement.

## Contenu de la migration

La migration inclut :

- **Table `points_transactions`** : Stockage de toutes les transactions de points
- **Fonction `get_leaderboard`** : Calcule les classements pour différentes périodes (all_time, weekly, monthly)
- **Fonction `get_user_rank`** : Récupère le rang spécifique d'un utilisateur
- **Politiques RLS** : Sécurité pour les transactions de points

## Notes importantes

- Les fonctions utilisent la table `points_transactions` pour calculer les points
- Les périodes sont calculées correctement (semaine du lundi au dimanche)
- Les fonctions supportent le filtrage par type de source de points
- La sécurité est assurée par RLS (Row Level Security)

## Si vous rencontrez des erreurs

Si vous avez des erreurs lors de l'exécution :

1. Vérifiez que vous êtes connecté avec le bon rôle (service_role ou authenticated)
2. Assurez-vous que les tables `users` existent déjà
3. Vérifiez les permissions sur votre base de données

Une fois cette migration exécutée, le leaderboard devrait fonctionner correctement !
