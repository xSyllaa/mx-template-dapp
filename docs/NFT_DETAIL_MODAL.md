# 🎴 NFT Detail Modal - Documentation

## 🌟 Vue d'ensemble

Le **NFTDetailModal** est un composant premium qui affiche les détails complets d'un NFT dans une modal avec un **effet 3D spectaculaire**. La carte "vole" vers l'utilisateur avec une animation de perspective 3D.

## ✨ Fonctionnalités

### 🎬 Animation 3D
- **Effet de zoom 3D** : La carte apparaît de loin et se rapproche de l'utilisateur
- **Perspective** : Utilise `perspective(1000px)` pour un effet de profondeur
- **Rotation 3D** : Rotation de 20° sur l'axe X au début de l'animation
- **Translation Z** : La carte part de `-500px` en profondeur et arrive à `0`
- **Scale animé** : De 0.5 à 1.0 pour un effet de zoom progressif

### 🎨 Design Premium
- **Backdrop blur** : Arrière-plan flouté avec opacité
- **Effets glow** : Ombres colorées selon la rareté
- **Gradients** : Dégradés subtils adaptés à chaque rareté
- **Responsive** : S'adapte aux écrans mobile, tablette et desktop

### 📊 Contenu Affiché

#### Section Gauche (Image)
- Image NFT en haute qualité
- Badge de rareté avec gradient
- Gradient overlay pour améliorer la lisibilité

#### Section Droite (Détails)
1. **En-tête**
   - Nom du NFT
   - Identifiant complet

2. **Statistiques principales**
   - Position (pour les joueurs)
   - Numéro du maillot
   - Nationalité
   - Special Perk (pour les cartes spéciales)
   - League (ligue)
   - Capacity (capacité du stade)

3. **Performances** 🏅
   - Liste de toutes les performances (performance_1 à performance_12)
   - Affichées avec des étoiles ⭐
   - Cards individuelles avec gradients

4. **Autres statistiques** 📊
   - Tous les autres attributs
   - Grid responsive

5. **Métadonnées**
   - Score
   - Rank
   - Nonce

## 🔧 Utilisation

### Import
```typescript
import { NFTDetailModal } from 'features/myNFTs';
import type { GalacticXNFT } from 'features/myNFTs';
```

### Mise en place
```typescript
const [selectedNFT, setSelectedNFT] = useState<GalacticXNFT | null>(null);
const [isModalOpen, setIsModalOpen] = useState(false);

const handleNFTClick = (nft: GalacticXNFT) => {
  setSelectedNFT(nft);
  setIsModalOpen(true);
};

const handleCloseModal = () => {
  setIsModalOpen(false);
  // Delay pour l'animation de sortie
  setTimeout(() => setSelectedNFT(null), 300);
};
```

### Render
```tsx
<NFTDetailModal
  nft={selectedNFT}
  isOpen={isModalOpen}
  onClose={handleCloseModal}
/>
```

### Intégration avec NFTCard
```tsx
<NFTCard 
  nft={nft}
  onClick={handleNFTClick}
/>
```

## 🎨 Animations CSS

### Animation `zoomIn3D`
```css
@keyframes zoomIn3D {
  0% {
    opacity: 0;
    transform: perspective(1000px) translateZ(-500px) scale(0.5) rotateX(20deg);
  }
  100% {
    opacity: 1;
    transform: perspective(1000px) translateZ(0) scale(1) rotateX(0deg);
  }
}
```

**Propriétés**:
- **Duration**: 0.5s
- **Easing**: `cubic-bezier(0.34, 1.56, 0.64, 1)` (bounce effect)
- **Transform origin**: Centre de la carte

### Animation `fadeIn`
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Utilisée pour**: Le backdrop (fond flouté)

## 📱 Responsive Design

### Mobile (< 768px)
- **Layout**: 1 colonne (image au-dessus, détails en-dessous)
- **Padding**: 6 (p-6)
- **Scroll**: Vertical activé si contenu trop grand

### Tablet/Desktop (≥ 768px)
- **Layout**: 2 colonnes (image à gauche, détails à droite)
- **Padding**: 8 (md:p-8)
- **Grid**: Grid à 2 colonnes

### Largeur maximale
- **Max width**: 4xl (896px)
- **Max height**: 90vh (avec scroll si dépassement)

## ⌨️ Interactions

### Fermeture de la modal
1. **Clic sur le backdrop** : Ferme la modal
2. **Touche ESC** : Ferme la modal
3. **Bouton X** : Ferme la modal (en haut à droite)

### Prévention du scroll
Quand la modal est ouverte :
- Le scroll du body est désactivé (`overflow: hidden`)
- Le scroll est restauré à la fermeture

### Stop propagation
- Les clics à l'intérieur de la modal ne ferment pas celle-ci

## 🎨 Styles par Rareté

| Rareté    | Gradient                          | Glow                          | Badge                |
|-----------|-----------------------------------|-------------------------------|----------------------|
| Mythic    | Rouge/Rose (20% opacité)          | Rouge 50px                    | Rouge → Rose         |
| Legendary | Jaune/Orange (20% opacité)        | Or 50px                       | Jaune → Orange       |
| Epic      | Violet/Rose (20% opacité)         | Violet 50px                   | Violet → Rose        |
| Rare      | Bleu/Cyan (20% opacité)           | Bleu 50px                     | Bleu → Cyan          |
| Common    | Gris (20% opacité)                | Ombre standard                | Gris → Gris foncé    |

## 🔍 Traitement des Attributs

### Performances
```typescript
const performanceAttributes = Object.entries(nft.attributes)
  .filter(([key]) => key.startsWith('performance_'))
  .map(([key, value]) => ({
    key: key.replace('performance_', 'Performance '),
    value: value as string
  }))
  .filter(item => item.value && item.value !== 'None');
```

**Exclusions** : Les performances avec la valeur `"None"` ne sont pas affichées.

### Autres Attributs
```typescript
const otherAttributes = Object.entries(nft.attributes)
  .filter(([key]) => 
    !key.startsWith('performance_') && 
    !['name', 'number', 'position', 'nationality', 'special_perk', 'league', 'capacity'].includes(key)
  )
```

**Exclusions** : 
- Attributs de performance
- Attributs déjà affichés dans la section principale

## 🎯 Accessibility

### Keyboard Navigation
- ✅ ESC pour fermer
- ✅ Focus trap dans la modal
- ✅ ARIA label sur le bouton de fermeture

### Screen Readers
- Label "Close" sur le bouton X
- Structure sémantique HTML

## 🚀 Performance

### Optimisations
- **Conditional rendering** : Ne render que si `isOpen === true`
- **Image lazy loading** : Images chargées à la demande
- **GPU acceleration** : Transform et opacity pour les animations
- **Cleanup** : Event listeners retirés à la fermeture

### Bundle Size
- **Component size** : ~250 lignes
- **No external deps** : Aucune dépendance externe
- **Pure CSS animations** : Pas de bibliothèque d'animation

## 📋 Props

```typescript
interface NFTDetailModalProps {
  nft: GalacticXNFT | null;     // NFT à afficher (null si aucun)
  isOpen: boolean;                // État d'ouverture de la modal
  onClose: () => void;            // Callback de fermeture
}
```

## 🎓 Exemples Avancés

### Avec navigation entre NFTs
```tsx
const [currentIndex, setCurrentIndex] = useState(0);

const handleNext = () => {
  setCurrentIndex((prev) => (prev + 1) % nfts.length);
  setSelectedNFT(nfts[currentIndex + 1]);
};

const handlePrev = () => {
  setCurrentIndex((prev) => (prev - 1 + nfts.length) % nfts.length);
  setSelectedNFT(nfts[currentIndex - 1]);
};
```

### Avec analytics
```tsx
const handleNFTClick = (nft: GalacticXNFT) => {
  // Track l'ouverture
  analytics.track('NFT_DETAIL_OPENED', {
    nftId: nft.identifier,
    rarity: nft.rarity
  });
  
  setSelectedNFT(nft);
  setIsModalOpen(true);
};
```

## ✨ Effets Visuels Détaillés

### Backdrop
- **Opacité** : 70% noir
- **Blur** : Medium (`backdrop-blur-md`)
- **Animation** : Fade in 0.3s

### Modal Container
- **Max width** : 4xl (896px)
- **Max height** : 90vh
- **Overflow** : Scroll Y automatique
- **Pointer events** : None sur le conteneur, auto sur la carte

### Bouton de fermeture
- **Position** : Absolute top-4 right-4
- **Background** : Noir 50% avec blur
- **Hover** : Noir 70% + scale 110%
- **Transitions** : All 0.3s

## 🔄 Lifecycle

### Ouverture
1. User clique sur une NFTCard
2. `handleNFTClick()` est appelé
3. `setSelectedNFT(nft)` définit le NFT
4. `setIsModalOpen(true)` ouvre la modal
5. Animation `zoomIn3D` se joue (0.5s)
6. Backdrop `fadeIn` se joue (0.3s)
7. Scroll du body désactivé

### Fermeture
1. User clique sur backdrop/ESC/bouton X
2. `handleCloseModal()` est appelé
3. `setIsModalOpen(false)` ferme la modal
4. Composant retourne `null` (disparition)
5. `setTimeout` de 300ms avant de clear `selectedNFT`
6. Scroll du body réactivé
7. Event listeners nettoyés

## 🐛 Troubleshooting

### La modal ne se ferme pas avec ESC
- Vérifier que `isOpen` est bien `true`
- Vérifier que les event listeners sont bien attachés
- Vérifier la console pour des erreurs

### Animation saccadée
- S'assurer que le GPU est utilisé (`transform` au lieu de `left/top`)
- Réduire la complexité du blur si nécessaire
- Vérifier les performances du navigateur

### Scroll du body pas restauré
- Vérifier le cleanup dans `useEffect`
- S'assurer que `onClose` est bien appelé
- Vérifier qu'il n'y a pas d'autres modals ouvertes

## 📚 Ressources

### Animations 3D CSS
- [MDN - perspective](https://developer.mozilla.org/en-US/docs/Web/CSS/perspective)
- [MDN - transform](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
- [CSS Tricks - 3D Transforms](https://css-tricks.com/almanac/properties/t/transform/)

### Accessibility
- [WAI-ARIA Modal Practices](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [Focus Management](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/dialog_role)

---

**Créé le** : 15 Octobre 2025  
**Version** : 1.0  
**Auteur** : GalacticX Development Team

