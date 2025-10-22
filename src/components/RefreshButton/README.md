# RefreshButton Component

Un composant réutilisable pour gérer les boutons d'actualisation avec cooldown, loading et feedback visuel.

## Fonctionnalités

- ✅ **Cooldown configurable** (défaut: 30 secondes)
- ✅ **Loading minimum** (défaut: 1 seconde)
- ✅ **Feedback visuel** (spinner, succès, texte dynamique)
- ✅ **Toast de cooldown** (configurable)
- ✅ **États multiples** : Normal → Loading → Succès → Cooldown
- ✅ **Totalement personnalisable** (texte, icônes, couleurs)

## Utilisation de base

```tsx
import { RefreshButton } from 'components/RefreshButton';

function MyComponent() {
  const handleRefresh = async () => {
    // Votre logique d'actualisation ici
    await fetchData();
  };

  return (
    <RefreshButton
      onRefresh={handleRefresh}
      normalText="Actualiser les données"
      loadingText="Chargement..."
      successText="Actualisé !"
    />
  );
}
```

## Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `onRefresh` | `() => Promise<void> \| void` | **Requis** | Fonction à exécuter lors du clic |
| `cooldownMs` | `number` | `30000` | Durée du cooldown en millisecondes |
| `minLoadingMs` | `number` | `1000` | Durée minimum du loading en millisecondes |
| `variant` | `'primary' \| 'secondary' \| 'neutral'` | `'primary'` | Style du bouton |
| `size` | `'small' \| 'medium' \| 'large'` | `'small'` | Taille du bouton |
| `className` | `string` | `''` | Classes CSS supplémentaires |
| `disabled` | `boolean` | `false` | Bouton désactivé |
| `normalText` | `string` | `'Actualiser'` | Texte normal |
| `loadingText` | `string` | `'Actualisation...'` | Texte pendant le loading |
| `successText` | `string` | `'Actualisé'` | Texte après succès |
| `toastTitle` | `string` | `'Temps d\'attente'` | Titre du toast de cooldown |
| `toastMessage` | `(remainingSeconds: number) => string` | Fonction de message | Message du toast de cooldown |
| `showToasts` | `boolean` | `true` | Afficher les toasts de cooldown |

## États du bouton

| État | Icône | Texte | Comportement |
|------|-------|-------|--------------|
| **Normal** | 🔄 | "Tout actualiser" | ✅ Cliquable |
| **Loading** | ⏳ (spinner) | "Actualisation..." | ❌ Désactivé |
| **Succès** | ✓ | "Actualisé" | ❌ Désactivé (1s) |
| **Cooldown** | 🔄 | "Tout actualiser" | ❌ Désactivé + Toast si cliqué |

## Exemples d'utilisation

### Exemple 1 : Actualisation simple

```tsx
<RefreshButton
  onRefresh={() => fetch('/api/data').then(() => {})}
  normalText="Charger les données"
/>
```

### Exemple 2 : Actualisation avec paramètres personnalisés

```tsx
<RefreshButton
  onRefresh={handleRefresh}
  cooldownMs={60000} // 1 minute de cooldown
  minLoadingMs={2000} // 2 secondes minimum de loading
  normalText="Synchroniser"
  loadingText="Synchronisation..."
  successText="Synchronisé !"
  toastMessage={(seconds) => `⏳ Attendez ${seconds}s avant de resynchroniser`}
/>
```

### Exemple 3 : Dans une page de leaderboard (utilisation actuelle)

```tsx
<RefreshButton
  onRefresh={handleRefreshAll}
  cooldownMs={30000}
  minLoadingMs={1000}
  normalText="Tout actualiser"
  loadingText="Actualisation..."
  successText="Actualisé"
  showToasts={false} // Désactivé car géré par le parent
/>
```

### Exemple 4 : Sans toasts (gestion personnalisée)

```tsx
<RefreshButton
  onRefresh={handleRefresh}
  showToasts={false}
  normalText="Synchroniser"
  loadingText="Synchronisation..."
  successText="Synchronisé !"
/>
```

## Architecture

Le composant gère automatiquement :
- ✅ Les états de chargement et succès
- ✅ Le cooldown entre utilisations
- ✅ Les toasts d'information
- ✅ Les animations et transitions
- ✅ La désactivation intelligente du bouton

## Intégration

Le composant utilise le système de toast existant de l'application et est entièrement compatible avec le système de design actuel.
