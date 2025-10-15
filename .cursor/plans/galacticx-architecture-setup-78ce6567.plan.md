<!-- 78ce6567-fe3a-4241-ae1e-169e124462e2 3f575baa-2a58-4b03-994e-2e1d84a4fe6c -->
# Plan Frontend GalacticX - Interface & Navigation

## Phase 1: Adaptation des Thèmes (30 min)

### 1.1 Mettre à jour tailwind.css avec les couleurs GalacticX

Adapter les 3 thèmes en gardant la structure existante du template mais en utilisant les couleurs de la documentation:

**Dark Theme (Nocturne/Élégante)**:

- `--mvx-bg-color-primary`: #0F3A46 (ocean deep)
- `--mvx-bg-color-secondary`: #11222D (ocean dark)
- `--mvx-text-color-primary`: #FFFFFF
- `--mvx-text-color-secondary`: #B8C4C9
- `--mvx-link-color`: #177071 (teal)
- Accent gold: #82785E

**Light Theme (Doré & Élégant)**:

- `--mvx-bg-color-primary`: #FFFFFF
- `--mvx-bg-color-secondary`: #F8F9FA
- `--mvx-text-color-primary`: #3D4643
- `--mvx-button-bg-primary`: #177071
- Gold accents: #82785E

**Vibe Theme (Dynamique & Premium)**:

- `--mvx-bg-color-primary`: #177071 (teal bold)
- `--mvx-bg-color-secondary`: #11222D
- Accents: #0F3A46
- Gold: #82785E

### 1.2 Ajouter variables manquantes pour cohérence

- Success colors
- Error colors
- Border colors
- Hover states

## Phase 2: Landing Page (Home - Non Connecté) (1h)

### 2.1 Créer nouveau Hero Section

**Fichier**: `src/pages/Home/components/HomeHero/HomeHero.tsx`

**Contenu**:

- Logo GalacticX (grand)
- Titre: "GalacticX Socios"
- Sous-titre: "Le football gamifié sur MultiversX"
- Description courte: "Prédis les résultats, affronte d'autres joueurs, et gagne des récompenses avec tes NFTs"
- CTA Button: "Connecter mon Wallet"
- Lien secondaire: "En savoir plus"

### 2.2 Créer Features Section

**Nouveau composant**: `src/pages/Home/components/HomeFeatures/HomeFeatures.tsx`

**4 Feature Cards**:

1. **Predictions**

   - Icône: ⚽
   - Titre: "Prédictions de matchs"
   - Description: "Parie sur les résultats et gagne des points"

2. **War Games**

   - Icône: ⚔️
   - Titre: "Combats d'équipes NFT"
   - Description: "Affronte d'autres joueurs avec tes 11 NFTs"

3. **Leaderboards**

   - Icône: 🏆
   - Titre: "Classements"
   - Description: "Grimpe au sommet et remporte des récompenses"

4. **Streaks**

   - Icône: 🔥
   - Titre: "Streaks hebdomadaires"
   - Description: "Claim quotidien pour des bonus progressifs"

### 2.3 Créer Footer Section

**Contenu**:

- Liens: Discord, Twitter, Documentation
- Copyright GalacticX 2025

## Phase 3: Sidebar Navigation (Application Connectée) (1h30)

### 3.1 Créer Sidebar Component

**Fichier**: `src/components/layout/Sidebar/Sidebar.tsx`

**Structure**:

```typescript
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Items de menu**:

1. 🏠 Dashboard (Home)
2. ⚽ Predictions
3. ⚔️ War Games
4. 🏆 Leaderboards
5. 🔥 Streaks
6. 🖼️ Mes NFTs
7. ⭐ Team of the Week
8. 👑 Admin (si role = king)

**Features**:

- Active state sur item actuel
- Logo GalacticX en haut
- User info en bas (wallet + points)
- Responsive (collapse sur mobile)

### 3.2 Modifier Layout Component

**Fichier**: `src/components/Layout/Layout.tsx`

**Changements**:

- Intégrer Sidebar à gauche
- Content area à droite
- Header minimaliste (juste wallet connect + theme switcher)
- Burger menu pour mobile

### 3.3 Créer pages vides pour navigation

**Créer structure de base pour**:

- `src/pages/Predictions/Predictions.tsx`
- `src/pages/WarGames/WarGames.tsx`
- `src/pages/Leaderboard/Leaderboard.tsx`
- `src/pages/Streaks/Streaks.tsx`
- `src/pages/MyNFTs/MyNFTs.tsx`
- `src/pages/TeamOfWeek/TeamOfWeek.tsx`
- `src/pages/Admin/Admin.tsx`

Chaque page: Titre + "Coming soon" message + thème fonctionnel

### 3.4 Mettre à jour routes

**Fichier**: `src/routes/routes.ts`

Ajouter toutes les nouvelles routes avec protection AuthGuard

## Phase 4: Dashboard Page (Page d'accueil connecté) (45 min)

### 4.1 Refonte Dashboard

**Fichier**: `src/pages/Dashboard/Dashboard.tsx`

**Contenu**:

- Welcome message avec username/wallet
- Stats cards (3 colonnes):
  - Total Points
  - Current Streak
  - NFT Count
  - Global Rank
- Quick Actions:
  - "Voir les predictions actives"
  - "Claim daily reward"
  - "Créer un War Game"
- Recent Activity feed (placeholder)

### 4.2 Créer Stats Card Component

**Fichier**: `src/components/shared/StatsCard/StatsCard.tsx`

Design: Card avec icône, valeur grande, label, et changement (+/- depuis hier)

## Phase 5: Polish & Responsive (30 min)

### 5.1 Responsive Design

- Landing page: Mobile-first
- Sidebar: Hamburger menu sur mobile
- Dashboard: Cards empilées sur mobile

### 5.2 Transitions & Animations

- Sidebar slide-in
- Page transitions
- Hover effects sur cards

### 5.3 Theme Switcher

- S'assurer que tout fonctionne sur les 3 thèmes
- Icons thèmes mis à jour

---

## Ordre d'implémentation

1. **Thèmes** → Couleurs adaptées (tailwind.css)
2. **Landing Page** → Hero + Features + Footer
3. **Sidebar** → Composant + integration Layout
4. **Pages vides** → Structure + routes
5. **Dashboard** → Stats + Quick actions
6. **Polish** → Responsive + animations

## Livrables

- ✅ 3 thèmes GalacticX fonctionnels
- ✅ Landing page attractive
- ✅ Sidebar navigation complète
- ✅ 7 pages avec structure de base
- ✅ Dashboard informatif
- ✅ Responsive mobile/desktop
- ✅ Routing complet

### To-dos

- [ ] Adapter les 3 thèmes dans tailwind.css avec les couleurs GalacticX de la documentation
- [ ] Créer nouveau Hero section pour la landing page
- [ ] Créer Features section avec 4 cards
- [ ] Créer composant Sidebar avec menu de navigation
- [ ] Créer structure de base pour toutes les pages (Predictions, WarGames, etc.)
- [ ] Mettre à jour routes.ts avec toutes les nouvelles pages
- [ ] Refaire la page Dashboard avec stats et quick actions
- [ ] Polish responsive et animations