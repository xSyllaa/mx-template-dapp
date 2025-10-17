# Theme Adaptation Guide - Weekly Streaks Feature

## ✅ Changements Appliqués

### 1. **Règle Cursor Ajoutée** ✅

**Fichier**: `.cursorrules`

Nouvelle section ajoutée : **"Theme Color Variables (MANDATORY)"**

#### Règles strictes :
- ✅ **TOUJOURS** utiliser les variables CSS pour les couleurs
- ❌ **JAMAIS** hardcoder les classes de couleur

#### Variables disponibles :

**Text Colors:**
- `text-[var(--mvx-text-primary)]` - Couleur de texte principale
- `text-[var(--mvx-text-secondary)]` - Texte secondaire/muté
- `text-[var(--mvx-text-disabled)]` - Texte désactivé

**Background Colors:**
- `bg-[var(--mvx-bg-primary)]` - Fond principal
- `bg-[var(--mvx-bg-secondary)]` - Cartes, sections
- `bg-[var(--mvx-bg-tertiary)]` - États hover, fonds subtils

**Accent Colors:**
- `bg-[var(--mvx-accent)]` - Couleur d'action primaire
- `text-[var(--mvx-accent)]` - Texte d'accent
- `border-[var(--mvx-accent)]` - Bordures d'accent

**Borders:**
- `border-[var(--mvx-border)]` - Bordures standard

**Status Colors (sémantiques):**
- Success: `bg-green-500/20 text-[var(--mvx-text-primary)]`
- Error: `bg-red-500/20 text-[var(--mvx-text-primary)]`
- Warning: `bg-yellow-500/20 text-[var(--mvx-text-primary)]`
- Info: `bg-blue-500/20 text-[var(--mvx-text-primary)]`

---

### 2. **ClaimButton Component** ✅

**Fichier**: `src/features/streaks/components/ClaimButton.tsx`

#### Avant (❌):
```typescript
messageSuccess: 'text-green-500'  // Couleur fixe
messageError: 'text-red-500'      // Couleur fixe
```

#### Après (✅):
```typescript
messageSuccess: 'bg-green-500/20 px-4 py-2 rounded-lg text-[var(--mvx-text-primary)]'
messageError: 'bg-red-500/20 px-4 py-2 rounded-lg text-[var(--mvx-text-primary)]'
```

**Améliorations:**
- ✅ Texte s'adapte au thème avec `text-[var(--mvx-text-primary)]`
- ✅ Fond sémantique avec opacité (vert/rouge à 20%)
- ✅ Padding et border-radius pour meilleure lisibilité
- ✅ Fonctionne sur les 3 thèmes (dark, light, vibe)

---

### 3. **Streaks Page** ✅

**Fichier**: `src/pages/Streaks/Streaks.tsx`

#### Avant (❌):
```typescript
authWarningText: 'text-yellow-200'  // Couleur fixe
errorText: 'text-red-200'            // Couleur fixe
```

#### Après (✅):
```typescript
authWarningText: 'text-[var(--mvx-text-primary)]'
errorText: 'text-[var(--mvx-text-primary)]'
```

**Zones corrigées:**
1. **Auth Warning** - Texte adaptatif
2. **Error Display** - Texte adaptatif
3. **Info Section** - Déjà conforme (bullet avec accent)

---

## 🎨 Compatibilité des Thèmes

### Dark Theme (`mvx:dark-theme`)
- Texte principal : Blanc/gris clair
- Texte secondaire : Gris moyen
- Fond : Noir/gris foncé
- Accent : Couleur vive (bleu/cyan)

### Light Theme (`mvx:light-theme`)
- Texte principal : Noir/gris foncé
- Texte secondaire : Gris moyen
- Fond : Blanc/gris très clair
- Accent : Couleur doré/élégante

### Vibe Theme (`mvx:vibe-theme`)
- Texte principal : Dynamique
- Texte secondaire : Contrasté
- Fond : Premium/gradient
- Accent : Couleur énergique

---

## 📋 Checklist de Vérification

### Pour chaque nouveau composant :

- [ ] Tous les textes utilisent `text-[var(--mvx-text-primary)]` ou `text-[var(--mvx-text-secondary)]`
- [ ] Tous les fonds utilisent `bg-[var(--mvx-bg-*)]`
- [ ] Les accents utilisent `text-[var(--mvx-accent)]` ou `bg-[var(--mvx-accent)]`
- [ ] Les bordures utilisent `border-[var(--mvx-border)]`
- [ ] Les couleurs sémantiques (success/error) utilisent l'opacité + texte theme-aware
- [ ] Aucune couleur fixe type `text-white`, `text-gray-600`, `bg-blue-500`
- [ ] Test sur les 3 thèmes (dark, light, vibe)

---

## 🚫 Anti-Patterns à Éviter

### ❌ NE PAS FAIRE :
```typescript
className="text-white"              // Trop rigide
className="text-gray-600"           // Ne s'adapte pas
className="bg-blue-500"             // Couleur fixe
className="text-green-500"          // Pas theme-aware
className="text-yellow-200"         // Couleur spécifique au dark
```

### ✅ À FAIRE :
```typescript
className="text-[var(--mvx-text-primary)]"
className="text-[var(--mvx-text-secondary)]"
className="bg-[var(--mvx-bg-secondary)]"
className="bg-green-500/20 text-[var(--mvx-text-primary)]"  // Sémantique + adaptatif
className="border-[var(--mvx-border)]"
```

---

## 🧪 Tests Recommandés

### Test manuel :
1. Ouvrir l'app avec le theme **Dark**
   - Vérifier que le texte est lisible
   - Vérifier les contrastes
2. Changer pour **Light**
   - S'assurer que rien ne disparaît
   - Vérifier les états success/error
3. Changer pour **Vibe**
   - Tester toutes les interactions
   - Vérifier l'harmonie visuelle

### Test automatisé (futur) :
```typescript
describe('Theme Adaptation', () => {
  ['dark', 'light', 'vibe'].forEach(theme => {
    it(`should render correctly in ${theme} theme`, () => {
      // Test theme application
    });
  });
});
```

---

## 📝 Documentation pour les Développeurs

Quand vous créez un nouveau composant dans GalacticX :

1. **Lisez `.cursorrules`** - Section "Theme Color Variables"
2. **Utilisez UNIQUEMENT les variables CSS** définies
3. **Pour les états sémantiques** (success/error/warning):
   - Background : `bg-[couleur]/20`
   - Text : `text-[var(--mvx-text-primary)]`
4. **Testez sur les 3 thèmes** avant de commit
5. **Documentez** tout usage de couleur custom

---

## ✨ Résultat Final

### Weekly Streaks Feature - Adaptation Complète ✅

Tous les composants de la feature Weekly Streaks sont maintenant **100% theme-aware** :

- ✅ **WeekCalendar** - Déjà conforme
- ✅ **ClaimButton** - Corrigé (success/error messages)
- ✅ **WeekStats** - Déjà conforme
- ✅ **Streaks Page** - Corrigé (warning/error displays)

**Résultat** : L'expérience utilisateur est homogène sur tous les thèmes ! 🎉

---

## 🔄 Prochaines Étapes

1. Appliquer ces règles à tous les composants existants
2. Créer un composant `Toast` theme-aware pour les notifications
3. Documenter les variables CSS dans un design system
4. Ajouter des tests visuels automatisés

---

**Date de mise à jour** : 17 Octobre 2025  
**Auteur** : GalacticX Dev Team

