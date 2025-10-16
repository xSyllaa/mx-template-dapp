# My NFTs - Premium Components Documentation

## 🎨 Overview

Cette documentation décrit les composants premium créés pour la page "Mes NFTs" avec un design moderne et élégant.

## 📦 Composants

### 1. NFTStats Component

**Fichier**: `src/features/myNFTs/components/NFTStats.tsx`

**Description**: Affiche des statistiques visuelles premium sur les NFTs du joueur avec des cartes animées par rareté.

**Props**:
```typescript
interface NFTStatsProps {
  nfts: GalacticXNFT[];
  totalCount: number;
}
```

**Features**:
- 🎴 Carte "Total NFTs" avec emoji et dégradé
- 💎 Cartes par rareté (Mythic, Legendary, Epic, Rare, Common)
- ✨ Animations au hover (scale, shadow)
- 🎨 Couleurs thématiques par rareté
- 📱 Responsive (grid 1-6 colonnes)

**Utilisation**:
```tsx
import { NFTStats } from 'features/myNFTs';

<NFTStats nfts={nfts} totalCount={nftCount} />
```

---

### 2. RaritySelect Component

**Fichier**: `src/features/myNFTs/components/RaritySelect.tsx`

**Description**: Un dropdown premium pour filtrer les NFTs par rareté avec un design moderne et des animations fluides.

**Props**:
```typescript
interface RaritySelectProps {
  value: FilterOption;
  onChange: (value: FilterOption) => void;
  counts: Record<FilterOption, number>;
  labels: Record<FilterOption, string>;
}

type FilterOption = 'all' | 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
```

**Features**:
- 🎯 Indicateur de couleur par rareté (pastille colorée)
- 🔢 Compteur de NFTs pour chaque option
- 🎭 Animation de rotation de la flèche
- 🌐 Backdrop pour fermer au clic extérieur
- 🎨 Bordure gauche colorée sur l'item sélectionné
- ⌨️ Focus ring accessible

**Utilisation**:
```tsx
import { RaritySelect } from 'features/myNFTs';

<RaritySelect
  value={filterRarity}
  onChange={setFilterRarity}
  counts={rarityCounts}
  labels={filterLabels}
/>
```

---

### 3. NFTCard Component (Refonte Premium)

**Fichier**: `src/features/myNFTs/components/NFTCard.tsx`

**Description**: Carte NFT avec un design premium incluant des gradients, des ombres colorées et des animations sophistiquées.

**Props**:
```typescript
interface NFTCardProps {
  nft: GalacticXNFT;
}
```

**Features**:
- 🌈 Bordures et ombres colorées par rareté avec effet glow
- 🎞️ Zoom de l'image au hover
- 💫 Effet shimmer au hover (animation de brillance)
- 🎨 Gradient overlay sur l'image
- 🏷️ Badge de rareté avec dégradé
- 📊 Affichage de la position et numéro
- 🌍 Affichage de la nationalité
- 📱 Responsive et optimisé

**Styles par Rareté**:

| Rareté    | Couleur Principale | Effet Glow        |
|-----------|-------------------|-------------------|
| Mythic    | Rouge → Rose      | Rouge lumineux    |
| Legendary | Jaune → Orange    | Or lumineux       |
| Epic      | Violet → Rose     | Violet lumineux   |
| Rare      | Bleu → Cyan       | Bleu lumineux     |
| Common    | Gris              | Ombre standard    |

**Animations**:
- `hover:-translate-y-2`: Levée de la carte
- `hover:scale-110`: Zoom de l'image
- `animate-[shimmer_2s_infinite]`: Effet de brillance

---

## 🎨 Design System

### Couleurs Thématiques

Tous les composants utilisent les variables CSS du thème actif :

```css
--mvx-text-primary    /* Texte principal */
--mvx-text-secondary  /* Texte secondaire */
--mvx-text-tertiary   /* Texte tertiaire */
--mvx-text-accent     /* Accent coloré */
--mvx-bg-primary      /* Fond principal */
--mvx-bg-secondary    /* Fond secondaire */
--mvx-bg-tertiary     /* Fond tertiaire */
--mvx-bg-accent       /* Fond accent */
--mvx-border          /* Bordures */
```

### Animations Custom

**Shimmer Animation** (`tailwind.css`):
```css
@keyframes shimmer {
  0% {
    transform: translateX(-100%) skewX(-12deg);
  }
  100% {
    transform: translateX(200%) skewX(-12deg);
  }
}
```

Utilisée sur les NFTCards pour un effet de brillance au hover.

---

## 📱 Responsive Design

### NFTStats
- **Mobile (< 768px)**: 1 colonne
- **Tablet (768px - 1024px)**: 3 colonnes
- **Desktop (> 1024px)**: 6 colonnes

### NFTCard Grid
- **Mobile (< 480px)**: 1 colonne
- **xs (480px - 640px)**: 2 colonnes
- **sm (640px - 768px)**: 3 colonnes
- **md (768px - 1024px)**: 4 colonnes
- **lg (> 1024px)**: 5 colonnes

---

## 🔧 Configuration API

**Taille maximale**: L'API MultiversX récupère jusqu'à **500 NFTs** par requête.

```typescript
// src/features/myNFTs/services/nftService.ts
params: {
  search: GALACTIC_COLLECTION_ID,
  size: 500 // Augmenté de 100 à 500
}
```

---

## ✨ Améliorations UX

1. **Lisibilité Améliorée**:
   - Tous les textes utilisent les couleurs thématiques appropriées
   - Contraste optimisé pour les thèmes sombres et clairs

2. **Feedback Visuel**:
   - Hover effects sur toutes les interactions
   - Animations fluides et professionnelles
   - États actifs clairement identifiables

3. **Accessibilité**:
   - Focus rings pour navigation au clavier
   - Contraste des couleurs respectant WCAG
   - États hover et active bien définis

4. **Performance**:
   - Images lazy loaded
   - Animations GPU-accélérées (transform, opacity)
   - Composants légers et optimisés

---

## 🎯 Mode Test (Développement)

Un champ de test d'adresse est disponible pour faciliter le développement :

```tsx
// Toggle du mode test
<button onClick={() => setShowTestInput(!showTestInput)}>
  {showTestInput ? 'Masquer' : 'Afficher'} le mode test
</button>

// Input de test
<input
  value={testAddress}
  onChange={(e) => setTestAddress(e.target.value)}
  placeholder="Entrez une adresse MultiversX..."
/>
<button onClick={handleTestAddressSearch}>
  Rechercher
</button>
```

---

## 📚 Exemples d'Utilisation

### Page MyNFTs Complète

```tsx
import { NFTStats, RaritySelect, NFTCard } from 'features/myNFTs';

export const MyNFTs = () => {
  const { nfts, nftCount } = useMyNFTs();
  const [filterRarity, setFilterRarity] = useState<FilterOption>('all');
  
  const filteredNFTs = filterRarity === 'all' 
    ? nfts 
    : nfts.filter(nft => nft.rarity === filterRarity);
  
  return (
    <div>
      {/* Stats */}
      <NFTStats nfts={nfts} totalCount={nftCount} />
      
      {/* Filter */}
      <RaritySelect
        value={filterRarity}
        onChange={setFilterRarity}
        counts={rarityCounts}
        labels={filterLabels}
      />
      
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        {filteredNFTs.map(nft => (
          <NFTCard key={nft.identifier} nft={nft} />
        ))}
      </div>
    </div>
  );
};
```

---

## 🚀 Prochaines Améliorations

- [ ] Ajout d'un tri par score/rank
- [ ] Modal de détails NFT au clic
- [ ] Recherche par nom/position
- [ ] Export de la collection en PDF
- [ ] Statistiques avancées (moyennes, etc.)

---

## 📝 Notes Techniques

### Architecture

Les composants suivent l'architecture atomique :
- **Atoms**: Pas de composants atomiques créés (utilisation de Tailwind)
- **Molecules**: `NFTCard`, `RaritySelect`
- **Organisms**: `NFTStats`
- **Pages**: `MyNFTs`

### Performance

- Lazy loading des images NFT
- Memoization des calculs de filtrage
- Animations GPU-accélérées
- Aucune dépendance externe supplémentaire

### Compatibilité Thèmes

✅ **Dark Theme** (Nocturne/Élégante)
✅ **Light Theme** (Doré & Élégant)
✅ **Vibe Theme** (Dynamique & Premium)

Tous les composants s'adaptent automatiquement au thème actif.

---

**Créé le**: 15 Octobre 2025
**Version**: 1.0
**Auteur**: GalacticX Development Team

