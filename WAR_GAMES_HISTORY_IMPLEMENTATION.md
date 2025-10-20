# War Games - Historique des War Games Complétés

## 🎯 **Fonctionnalité Implémentée**

Un composant d'historique complet qui affiche tous les war games terminés avec:
- **Liste déroulante** des war games complétés
- **Statistiques de base** (score, mise, date)
- **Détails expandables** avec infos complètes des deux joueurs
- **Chronologie** des événements (création, début, fin)
- **Indicateur de victoire** avec mise en évidence du gagnant

## 🔧 **Fichiers Créés/Modifiés**

### **1. Nouveau Composant**

#### **`src/features/warGames/components/WarGameHistory.tsx`**

Composant principal pour afficher l'historique des war games.

**Fonctionnalités:**
- ✅ Affichage de la liste des war games complétés
- ✅ Système de dropdown (click pour expand/collapse)
- ✅ Affichage des scores des deux joueurs
- ✅ Informations détaillées (username, address, team ID)
- ✅ Chronologie complète (créé, démarré, terminé)
- ✅ Indicateur visuel du gagnant (👑)
- ✅ Mise en évidence si l'utilisateur a gagné (fond vert)
- ✅ État de chargement et état vide

**Structure:**
```typescript
interface WarGameHistoryProps {
  userId?: string | null;
}

export const WarGameHistory = ({ userId }: WarGameHistoryProps) => {
  const [completedGames, setCompletedGames] = useState<WarGameWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);
  
  // Load completed games on mount
  useEffect(() => {
    loadCompletedGames();
  }, [userId]);
  
  // ...
};
```

### **2. Service Mis à Jour**

#### **`src/features/warGames/services/warGameService.ts`**

**Nouvelle méthode ajoutée:**
```typescript
/**
 * Get completed war games for a specific user
 */
static async getCompletedWarGames(userId: string): Promise<WarGameWithDetails[]> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const { data, error } = await supabase
      .from('war_games')
      .select(`
        *,
        creator:creator_id(username, avatar_url, address),
        opponent:opponent_id(username, avatar_url, address)
      `)
      .or(`creator_id.eq.${userId},opponent_id.eq.${userId}`)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching completed war games:', error);
      throw new Error('Failed to fetch completed war games');
    }

    return (data || []).map(this.transformWarGame);
  } catch (error) {
    console.error('Error in getCompletedWarGames:', error);
    throw error;
  }
}
```

**Modifications:**
- ✅ `getCompletedWarGames()`: Récupère uniquement les war games complétés
- ✅ `getUserWarGames()`: Mise à jour pour inclure `address` dans la jointure
- ✅ `transformWarGame()`: Mise à jour pour mapper `creatorAddress` et `opponentAddress`

### **3. Export Mis à Jour**

#### **`src/features/warGames/components/index.ts`**
```typescript
export { WarGameHistory } from './WarGameHistory';
```

### **4. Intégration dans la Page**

#### **`src/pages/WarGames/WarGames.tsx`**

**Import:**
```typescript
import { ..., WarGameHistory } from 'features/warGames';
```

**Utilisation:**
```typescript
{/* War Games History */}
<div className="mt-8 w-full max-w-4xl">
  <WarGameHistory userId={supabaseUserId} />
</div>
```

### **5. Traductions**

#### **`src/i18n/locales/en.json`**
```json
"history": {
  "title": "War Games History",
  "loading": "Loading history...",
  "noHistory": "No War Games Yet",
  "noHistoryDescription": "Complete war games will appear here",
  "stake": "Stake",
  "completed": "Completed",
  "creator": "Creator",
  "opponent": "Opponent",
  "username": "Username",
  "address": "Address",
  "score": "Score",
  "teamId": "Team ID",
  "timeline": "Timeline",
  "created": "Created",
  "started": "Started",
  "completedAt": "Completed",
  "winner": "Winner",
  "youWon": "You Won",
  "noWinner": "No Winner"
}
```

#### **`src/i18n/locales/fr.json`**
```json
"history": {
  "title": "Historique War Games",
  "loading": "Chargement de l'historique...",
  "noHistory": "Aucun War Game",
  "noHistoryDescription": "Les war games terminés apparaîtront ici",
  "stake": "Mise",
  "completed": "Terminé",
  "creator": "Créateur",
  "opponent": "Adversaire",
  "username": "Pseudo",
  "address": "Adresse",
  "score": "Score",
  "teamId": "ID Équipe",
  "timeline": "Chronologie",
  "created": "Créé",
  "started": "Démarré",
  "completedAt": "Terminé",
  "winner": "Vainqueur",
  "youWon": "Tu as gagné",
  "noWinner": "Aucun Vainqueur"
}
```

## 🎨 **Interface Utilisateur**

### **Vue Collapsed (Fermée)**

```
┌─────────────────────────────────────────────────────────────────────┐
│ 📜 War Games History (3)                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ⚔️ Player1 (250 pts) vs 👑 Player2 (300 pts)  │ Stake: 100 pts│ │
│ │                                                │ Completed: ... │ │
│ │                                                │              ▶│ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 👑 Player3 (400 pts) vs ⚔️ Player4 (350 pts)  │ Stake: 200 pts│ │
│ │                                                │ Completed: ... │ │
│ │                                                │              ▶│ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### **Vue Expanded (Ouverte)**

```
┌─────────────────────────────────────────────────────────────────────┐
│ ⚔️ Player1 (250 pts) vs 👑 Player2 (300 pts)  │ Stake: 100 pts  │
│                                                │ Completed: ...   │
│                                                │              ▼  │
├─────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────┐ ┌──────────────────────────────────┐ │
│ │ Creator                  │ │ 👑 Opponent                      │ │
│ ├──────────────────────────┤ ├──────────────────────────────────┤ │
│ │ Username: Player1        │ │ Username: Player2                │ │
│ │ Address: erd1xxxx...xxxx │ │ Address: erd1yyyy...yyyy         │ │
│ │ Score: 250 pts           │ │ Score: 300 pts                   │ │
│ │ Team ID: abc123...       │ │ Team ID: def456...               │ │
│ └──────────────────────────┘ └──────────────────────────────────┘ │
│                                                                      │
│ Timeline                                                             │
│ ├─ Created: 20/10/2025 10:00                                       │
│ ├─ Started: 20/10/2025 11:00                                       │
│ └─ Completed: 20/10/2025 12:00                                     │
│                                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │              👑 Winner: Player2                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## 📊 **Fonctionnalités Détaillées**

### **1. Affichage de la Liste**

- **Tri** : Par date de completion (plus récent en premier)
- **Filtrage** : Uniquement les war games où l'utilisateur a participé
- **Status** : Uniquement les war games `completed`
- **Compteur** : Nombre total de war games complétés

### **2. Carte Collapsed**

Chaque carte affiche :
- **Emoji du statut** :
  - `👑` pour le gagnant
  - `⚔️` pour le perdant
- **Noms des joueurs** : Creator vs Opponent
- **Scores** : Entre parenthèses (250 pts)
- **Mise** : Points mis en jeu
- **Date de completion** : Date formatée
- **Indicateur d'expansion** : `▶` (fermé) / `▼` (ouvert)

### **3. Carte Expanded**

#### **Section Creator (Gauche)**
- Username ou "Anonymous"
- Adresse wallet (tronquée)
- Score final
- Team ID (UUID complet)

#### **Section Opponent (Droite)**
- Username ou "Anonymous"
- Adresse wallet (tronquée)
- Score final
- Team ID (UUID complet)

#### **Section Timeline (Bas)**
- **Created** : Date de création
- **Started** : Date de début (quand l'adversaire a rejoint)
- **Completed** : Date de fin

#### **Bannière Winner**
- **Si l'utilisateur a gagné** : Fond vert avec "🎉 You Won"
- **Si l'utilisateur a perdu** : Fond neutre avec "👑 Winner: [Name]"

### **4. États de l'Interface**

#### **Loading State**
```
┌─────────────────────────────────────────────┐
│            🔄 Loading history...            │
│                                             │
└─────────────────────────────────────────────┘
```

#### **Empty State**
```
┌─────────────────────────────────────────────┐
│               📜                            │
│        No War Games Yet                     │
│ Complete war games will appear here         │
│                                             │
└─────────────────────────────────────────────┘
```

## 🎯 **Logique d'Affichage**

### **Détermination du Gagnant**

```typescript
const getWinnerLabel = (game: WarGameWithDetails) => {
  if (!game.winnerId) return t('pages.warGames.history.noWinner');
  
  if (game.winnerId === game.creatorId) {
    return game.creatorUsername || t('common.anonymous');
  } else {
    return game.opponentUsername || t('common.anonymous');
  }
};
```

### **Vérification de Victoire Utilisateur**

```typescript
const isUserWinner = (game: WarGameWithDetails) => {
  return game.winnerId === userId;
};
```

### **Style Conditionnel**

```typescript
// Couleur du texte du joueur
className={`${
  isUserWinner(game) && game.winnerId === game.creatorId 
    ? 'text-green-500 font-bold' 
    : ''
}`}

// Fond de la bannière winner
className={`${
  isUserWinner(game) 
    ? 'bg-green-500/20 border border-green-500' 
    : 'bg-[var(--mvx-bg-color-primary)] border border-[var(--mvx-border-color-secondary)]'
}`}
```

## 🔄 **Flux de Données**

```
1. Composant WarGameHistory monté
   └─> useEffect appelé avec userId
       └─> loadCompletedGames()
           └─> WarGameService.getCompletedWarGames(userId)
               └─> Supabase query:
                   - Table: war_games
                   - Filter: creator_id = userId OR opponent_id = userId
                   - Filter: status = 'completed'
                   - Order: completed_at DESC
                   - Join: users (creator & opponent)
               └─> Transform data
                   └─> setCompletedGames(games)
```

## 🎨 **Thèmes Supportés**

Le composant utilise les variables CSS pour s'adapter aux 3 thèmes :
- ✅ **Dark Theme** (mvx:dark-theme)
- ✅ **Light Theme** (mvx:light-theme)
- ✅ **Vibe Theme** (mvx:vibe-theme)

**Variables utilisées:**
- `--mvx-text-color-primary`
- `--mvx-text-color-secondary`
- `--mvx-text-accent-color`
- `--mvx-bg-color-primary`
- `--mvx-bg-color-secondary`
- `--mvx-border-color-secondary`

## 📱 **Responsive Design**

Le composant est responsive avec des breakpoints:
- **Mobile** : Layout en colonne
- **Tablet (md)** : Layout en 2 colonnes pour les détails
- **Desktop (lg)** : Layout optimisé

## 🚀 **Utilisation**

### **Dans la Page WarGames**

```typescript
import { WarGameHistory } from 'features/warGames';

// Dans le composant
<WarGameHistory userId={supabaseUserId} />
```

### **Props**

```typescript
interface WarGameHistoryProps {
  userId?: string | null;  // ID de l'utilisateur connecté
}
```

## 🔍 **Requête Supabase**

```typescript
const { data, error } = await supabase
  .from('war_games')
  .select(`
    *,
    creator:creator_id(username, avatar_url, address),
    opponent:opponent_id(username, avatar_url, address)
  `)
  .or(`creator_id.eq.${userId},opponent_id.eq.${userId}`)
  .eq('status', 'completed')
  .order('completed_at', { ascending: false });
```

**Détails:**
- **Table** : `war_games`
- **Joins** : `users` (via creator_id et opponent_id)
- **Filtres** :
  - Utilisateur = créateur OU adversaire
  - Status = 'completed'
- **Tri** : Par `completed_at` descendant (plus récent en premier)

## 🎯 **Informations Affichées**

### **Vue Générale**
- Nom du créateur
- Nom de l'adversaire
- Score du créateur
- Score de l'adversaire
- Mise (points)
- Date de completion
- Indicateur de gagnant (👑)

### **Vue Détaillée**
- **Creator** :
  - Username
  - Adresse wallet
  - Score
  - Team ID
- **Opponent** :
  - Username
  - Adresse wallet
  - Score
  - Team ID
- **Timeline** :
  - Date de création
  - Date de début
  - Date de fin
- **Winner** :
  - Nom du gagnant
  - Indicateur visuel (vert si l'utilisateur a gagné)

## ✅ **Résumé**

**Fonctionnalités Implémentées :**
- ✅ Composant `WarGameHistory` créé
- ✅ Méthode `getCompletedWarGames()` ajoutée au service
- ✅ Système de dropdown (expand/collapse)
- ✅ Affichage des scores et statistiques
- ✅ Détails des deux joueurs (username, address, team ID)
- ✅ Chronologie complète (création, début, fin)
- ✅ Indicateur visuel du gagnant
- ✅ Mise en évidence des victoires utilisateur
- ✅ États de chargement et état vide
- ✅ Support i18n complet (EN/FR)
- ✅ Support des 3 thèmes
- ✅ Design responsive
- ✅ Intégration dans la page WarGames

**L'historique des War Games est maintenant fonctionnel !** 🎉

Les utilisateurs peuvent voir tous leurs war games complétés avec toutes les informations importantes et une interface claire pour consulter les détails de chaque match.

