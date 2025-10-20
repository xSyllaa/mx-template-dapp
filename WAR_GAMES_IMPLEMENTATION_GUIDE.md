# 🎮 War Games - Guide d'Implémentation Complet

## 📋 Vue d'ensemble

Le système War Games permet aux utilisateurs de créer des combats 1v1 avec leurs équipes de 11 NFTs et de défier d'autres joueurs en misant des points.

---

## 🚀 Étapes d'Installation

### 1. Exécuter la Migration SQL

Dans votre dashboard Supabase, exécutez le fichier :

```sql
-- Fichier: WAR_GAMES_CREATE_TABLE_MIGRATION.sql
```

**Ce script va créer :**
- ✅ Table `war_games` avec toutes les colonnes nécessaires
- ✅ Indexes pour optimiser les performances
- ✅ Policies RLS pour la sécurité
- ✅ Fonction `get_open_war_games()` pour récupérer les war games disponibles
- ✅ Trigger `updated_at` automatique

**Vérification :**
```sql
-- Vérifier que la table existe
SELECT * FROM war_games;

-- Vérifier que la fonction existe
SELECT * FROM get_open_war_games();
```

---

### 2. Intégrer la Nouvelle Page

#### Option A: Remplacer l'ancienne page (Recommandé)

```typescript
// src/pages/WarGames/index.ts
export { WarGamesNew as WarGames } from './WarGamesNew';
```

#### Option B: Ajouter comme route séparée

```typescript
// src/routes/routes.ts
import { WarGamesNew } from 'pages/WarGames/WarGamesNew';

// Ajoutez dans vos routes
{
  path: '/war-games-new',
  component: WarGamesNew,
  authenticatedRoute: true
}
```

---

## 📊 Architecture

### Types TypeScript

```typescript
// src/features/warGames/types.ts

export enum WarGameStatus {
  OPEN = 'open',           // En attente d'adversaire
  IN_PROGRESS = 'in_progress', // Les deux joueurs ont rejoint
  COMPLETED = 'completed',     // Terminé avec résultat
  CANCELLED = 'cancelled'      // Annulé par le créateur
}

export interface WarGame {
  id: string;
  creatorId: string;
  creatorTeamId: string;
  opponentId: string | null;
  opponentTeamId: string | null;
  pointsStake: number;
  entryDeadline: string;
  status: WarGameStatus;
  winnerId: string | null;
  creatorScore: number | null;
  opponentScore: number | null;
  // ... timestamps
}
```

### Services

```typescript
// src/features/warGames/services/warGameService.ts

// Récupérer les war games ouverts
const openGames = await WarGameService.getOpenWarGames();

// Créer un war game
const newGame = await WarGameService.createWarGame({
  teamId: 'uuid-team',
  pointsStake: 100,
  entryDeadline: '2025-10-25T18:00:00Z'
}, userId);

// Rejoindre un war game
const joinedGame = await WarGameService.joinWarGame({
  warGameId: 'uuid-war-game',
  teamId: 'uuid-team'
}, userId);

// Annuler un war game (si pas d'adversaire)
await WarGameService.cancelWarGame(warGameId, userId);
```

---

## 🎯 Flux Utilisateur

### Créer un War Game

1. **Sélectionner le mode "Créer"**
   - L'utilisateur clique sur "Create War Game"
   
2. **Configurer le War Game**
   - Sélectionner une équipe sauvegardée (11 NFTs)
   - Définir les points en jeu (ex: 100 points)
   - Fixer la date limite d'inscription
   
3. **Créer et Attendre**
   - War game créé avec status `open`
   - Visible dans la liste des war games disponibles
   - En attente qu'un adversaire rejoigne

### Rejoindre un War Game

1. **Sélectionner le mode "Rejoindre"**
   - L'utilisateur clique sur "Join War Game"
   
2. **Choisir un War Game**
   - Dropdown avec tous les war games `open`
   - Affiche: Créateur, Points en jeu, Date limite
   
3. **Sélectionner son Équipe**
   - Choisir une équipe sauvegardée
   - Valider pour rejoindre
   
4. **War Game commence**
   - Status passe à `in_progress`
   - Les deux équipes sont lockées
   - En attente de validation du résultat (admin)

---

## 🔒 Sécurité (RLS Policies)

### Règles Appliquées

```sql
-- ✅ Tout le monde peut voir les war games ouverts
CREATE POLICY "Anyone can view open war games"
  FOR SELECT USING (status = 'open' AND entry_deadline > NOW());

-- ✅ Users peuvent voir leurs propres war games
CREATE POLICY "Users can view their own war games"
  FOR SELECT USING (
    get_current_user_id() = creator_id OR 
    get_current_user_id() = opponent_id
  );

-- ✅ Users peuvent créer des war games
CREATE POLICY "Users can create war games"
  FOR INSERT WITH CHECK (get_current_user_id() = creator_id);

-- ✅ Users peuvent rejoindre des war games ouverts
CREATE POLICY "Users can join open war games"
  FOR UPDATE USING (
    status = 'open' AND 
    entry_deadline > NOW() AND
    get_current_user_id() != creator_id AND
    opponent_id IS NULL
  );

-- ✅ Créateur peut annuler si pas d'adversaire
CREATE POLICY "Creator can cancel open war games"
  FOR UPDATE USING (
    get_current_user_id() = creator_id AND
    status = 'open' AND
    opponent_id IS NULL
  );

-- ✅ Admins peuvent valider les résultats
CREATE POLICY "Admins can update war game results"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = get_current_user_id()
      AND users.role = 'king'
    )
  );
```

---

## 🎨 Composants UI

### 1. WarGameModeSelector
Écran de sélection entre Créer/Rejoindre

```typescript
<WarGameModeSelector
  onSelectCreate={() => setMode('create')}
  onSelectJoin={() => setMode('join')}
/>
```

### 2. CreateWarGameModal
Modal pour créer un war game

```typescript
<CreateWarGameModal
  userId={supabaseUserId}
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    // War game créé avec succès
    refreshList();
  }}
/>
```

### 3. JoinWarGameModal
Modal pour rejoindre un war game

```typescript
<JoinWarGameModal
  userId={supabaseUserId}
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    // War game rejoint avec succès
    navigate('/war-games/active');
  }}
/>
```

---

## 🌐 Traductions i18n

Toutes les traductions ont été ajoutées dans :
- `src/i18n/locales/en.json`
- `src/i18n/locales/fr.json`

### Clés Disponibles

```json
{
  "pages": {
    "warGames": {
      "mode": {
        "title": "Select War Game Mode",
        "create": { ... },
        "join": { ... }
      },
      "create": {
        "title": "Create War Game",
        "fields": { ... },
        "errors": { ... }
      },
      "join": {
        "title": "Join War Game",
        "fields": { ... },
        "errors": { ... }
      }
    }
  }
}
```

---

## 🔧 Gestion des Résultats (À Implémenter)

### Admin Panel

Vous devrez créer une interface admin pour valider les résultats :

```typescript
// Exemple de fonction pour valider un résultat
const validateWarGameResult = async (
  warGameId: string,
  winnerId: string,
  creatorScore: number,
  opponentScore: number
) => {
  const { data, error } = await supabase
    .from('war_games')
    .update({
      status: 'completed',
      winner_id: winnerId,
      creator_score: creatorScore,
      opponent_score: opponentScore,
      completed_at: new Date().toISOString()
    })
    .eq('id', warGameId);

  if (error) throw error;

  // Distribution des points au gagnant
  await distributePoints(winnerId, pointsStake);
};
```

### Calcul des Scores

Vous pouvez calculer automatiquement les scores basés sur les stats des NFTs :

```typescript
const calculateTeamScore = (team: SavedTeam, nfts: GalacticXNFT[]) => {
  let totalScore = 0;
  
  for (const slot of team.slots) {
    const nft = nfts.find(n => n.identifier === slot.nftIdentifier);
    if (nft) {
      totalScore += nft.score || 0;
    }
  }
  
  return totalScore;
};
```

---

## 📝 Prochaines Étapes

### 1. Tester la Migration
```sql
-- Créer un war game test
INSERT INTO war_games (
  creator_id, 
  creator_team_id, 
  points_stake, 
  entry_deadline
) VALUES (
  'your-user-id',
  'your-team-id',
  100,
  NOW() + INTERVAL '1 day'
);

-- Vérifier
SELECT * FROM war_games;
```

### 2. Tester l'Interface
1. Créez une équipe de 11 NFTs
2. Créez un war game
3. Avec un autre compte, rejoignez le war game
4. Vérifiez que le status passe à `in_progress`

### 3. Implémenter la Validation des Résultats
- Page admin pour voir les war games `in_progress`
- Interface pour entrer les scores
- Automatisation du calcul de score (optionnel)
- Distribution des points au gagnant

### 4. Ajouterdes Notifications (Optionnel)
- Notifier le créateur quand quelqu'un rejoint
- Notifier les joueurs quand le résultat est validé
- Utiliser Supabase Realtime pour les updates en direct

---

## 🐛 Troubleshooting

### Erreur: "column creator_id does not exist"
**Solution:** Exécutez la migration SQL complète

### Erreur: "function get_open_war_games does not exist"
**Solution:** Vérifiez que la fonction a été créée dans la migration

### Erreur: "User ID is required"
**Solution:** Vérifiez que l'utilisateur est authentifié et que `supabaseUserId` n'est pas null

### Erreur: "Failed to fetch teams"
**Solution:** Assurez-vous que l'utilisateur a créé au moins une équipe dans `war_game_teams`

### War Game n'apparaît pas dans la liste
**Solution:** Vérifiez que :
- `status = 'open'`
- `opponent_id IS NULL`
- `entry_deadline > NOW()`

---

## 📚 Ressources

- **Documentation Supabase RLS:** https://supabase.com/docs/guides/auth/row-level-security
- **MultiversX SDK:** https://docs.multiversx.com/sdk-and-tools/sdk-js/
- **React i18next:** https://react.i18next.com/

---

## ✅ Checklist de Déploiement

- [ ] Migration SQL exécutée
- [ ] Table `war_games` créée
- [ ] Fonction `get_open_war_games()` fonctionne
- [ ] RLS Policies activées
- [ ] Page WarGamesNew intégrée
- [ ] Traductions i18n ajoutées
- [ ] Tests de création de war game
- [ ] Tests de rejoindre un war game
- [ ] Admin panel pour validation (à venir)
- [ ] Documentation utilisateur (à venir)

---

**Fait avec ❤️ pour GalacticX**

Pour toute question, consultez les fichiers de code ou la documentation technique.

