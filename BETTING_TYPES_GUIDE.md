# 📊 Guide des Deux Types de Paris - GalacticX

## 🎯 Vue d'Ensemble

Le système de betting de GalacticX supporte maintenant **deux méthodes de calcul des gains** :

### 1. **Cotes Fixes** (`fixed_odds`)
Méthode traditionnelle de bookmaker où les gains sont calculés selon des cotes prédéfinies.

### 2. **Ratio Pool** (`pool_ratio`)
Méthode style Twitch où les gains dépendent de la distribution totale des paris.

---

## 🔢 Type 1 : Cotes Fixes (`fixed_odds`)

### Fonctionnement
Les cotes sont définies par l'admin au moment de la création du pari. Les gains sont calculés en multipliant la mise par la cote.

**Formule :**
```
Gains = Mise × Cote Fixe
```

### Exemple

**Configuration du pari :**
- Manchester United vs Liverpool
- Option 1 : Man United gagne (cote 2.5)
- Option X : Match nul (cote 3.2)
- Option 2 : Liverpool gagne (cote 2.8)

**Scénario :**
- User A parie 100 points sur Man United (cote 2.5)
- User B parie 200 points sur Liverpool (cote 2.8)
- User C parie 50 points sur Man United (cote 2.5)

**Résultat : Man United gagne**

**Calcul des gains :**
- User A : 100 × 2.5 = **250 points**
- User C : 50 × 2.5 = **125 points**
- User B : Perd ses 200 points

**Avantages :**
✅ Gains prévisibles et constants
✅ Familier pour les parieurs habitués aux bookmakers
✅ Contrôle total pour l'admin sur les gains possibles

**Inconvénients :**
❌ Nécessite de définir des cotes équilibrées
❌ Moins dynamique et excitant
❌ Pas d'effet de "underdog surprise"

---

## 🌊 Type 2 : Ratio Pool (`pool_ratio`)

### Fonctionnement
Tous les paris sont mis dans un pool commun. Les gagnants se partagent le pool total proportionnellement à leur mise.

**Formule :**
```
Ratio = Pool Total ÷ Pool Option Gagnante
Gains = Mise × Ratio
```

### Exemple

**Configuration du pari :**
- Manchester United vs Liverpool
- Options identiques, mais sans cotes fixes

**Scénario :**
- User A parie 100 points sur Man United
- User B parie 200 points sur Liverpool
- User C parie 50 points sur Man United
- User D parie 300 points sur Liverpool
- User E parie 150 points sur Liverpool

**Pool Total :** 100 + 200 + 50 + 300 + 150 = **800 points**

**Pools par option :**
- Man United : 100 + 50 = **150 points** (2 parieurs)
- Liverpool : 200 + 300 + 150 = **650 points** (3 parieurs)

**Résultat : Man United gagne**

**Calcul du ratio :**
```
Ratio = 800 ÷ 150 = 5.33x
```

**Calcul des gains :**
- User A : 100 × 5.33 = **533 points**
- User C : 50 × 5.33 = **267 points**
- Users B, D, E : Perdent leurs paris

**Si Liverpool avait gagné :**
```
Ratio = 800 ÷ 650 = 1.23x
```
- User B : 200 × 1.23 = **246 points**
- User D : 300 × 1.23 = **369 points**
- User E : 150 × 1.23 = **185 points**

**Avantages :**
✅ Très excitant (effet "underdog")
✅ Rewards les parieurs qui prennent des risques
✅ Auto-équilibrage (moins de parieurs = meilleurs gains)
✅ Dynamique et imprévisible

**Inconvénients :**
❌ Gains imprévisibles avant la fermeture du pari
❌ Peut être moins rentable si beaucoup parient sur le même résultat
❌ Nécessite une masse critique de parieurs

---

## 🎮 Interface Admin

### Création d'un Pari

Dans `/admin/create-prediction`, l'admin voit maintenant :

**Nouveau sélecteur :**
```
Type de Calcul des Gains *
┌─────────────────────────────────────────┐
│ [ Ratio Pool (Twitch-style)      ▼ ]   │
└─────────────────────────────────────────┘
  Options :
  • Ratio Pool (Twitch-style)
  • Cotes Fixes

Description dynamique :
→ Si "Ratio Pool" : "Gains = Mise × (Pool Total / Pool Option Gagnante)"
→ Si "Cotes Fixes" : "Gains = Mise × Cote Fixe"
```

### Toast de Succès

Après création d'un pari, l'admin voit un **toast vert de confirmation** :
```
✅ Prédiction Créée !
   Manchester United vs Liverpool - Premier League
```

Le toast s'affiche pendant 3 secondes avant la redirection.

---

## 🎨 Interface Utilisateur

### Affichage des Statistiques

**En mode Cotes Fixes :**
```
┌─────────────────────────────────────┐
│ Manchester United                   │
│ ████████████░░░░░░░░░░ 60%         │
│                                     │
│ Total Parié: 600 pts  Cote: 2.5    │
│ Participants: 12      Plus Grosse: │
│                       150 pts       │
└─────────────────────────────────────┘
```

**En mode Ratio Pool :**
```
┌─────────────────────────────────────┐
│ Manchester United                   │
│ ████████████░░░░░░░░░░ 60%         │
│                                     │
│ Total Parié: 600 pts  Ratio: 1.33x │
│ Participants: 12      Plus Grosse: │
│                       150 pts       │
└─────────────────────────────────────┘
```

**Différence clé :** Les cotes fixes sont affichées, le ratio dynamique aussi.

---

## 🔄 Validation des Résultats

### Backend (automatique)

Le système détecte automatiquement le type lors de la validation :

**Code (simplifié) :**
```typescript
if (prediction.bet_calculation_type === 'fixed_odds') {
  // Utilise les cotes prédéfinies
  winnings = bet * parseFloat(option.odds);
} else {
  // Calcule le ratio du pool
  ratio = total_pool / winning_pool;
  winnings = bet * ratio;
}
```

---

## 📊 Comparaison Rapide

| Critère | Cotes Fixes | Ratio Pool |
|---------|-------------|------------|
| **Prévisibilité** | ✅ Élevée | ❌ Faible |
| **Excitation** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Complexité Admin** | Moyenne (définir cotes) | Faible (automatique) |
| **Risque/Reward** | Fixe | Variable |
| **Favorise underdog** | Non | ✅ Oui |
| **Besoin masse critique** | Non | ✅ Oui |
| **Familiarité** | ✅ Traditionnel | Nouveau (Twitch) |

---

## 🎯 Recommandations d'Utilisation

### Utilisez **Cotes Fixes** pour :
- ✅ Matchs où vous voulez des gains garantis et prévisibles
- ✅ Événements où vous avez des données statistiques solides
- ✅ Utilisateurs habitués aux bookmakers traditionnels
- ✅ Contrôle total sur les gains maximaux

### Utilisez **Ratio Pool** pour :
- ✅ Événements communautaires excitants
- ✅ Matchs avec des underdogs intéressants
- ✅ Grande base d'utilisateurs actifs
- ✅ Maximiser l'engagement et l'excitation
- ✅ Récompenser les prises de risque

---

## 🔧 Configuration Technique

### Base de Données

**Nouvelle colonne :**
```sql
predictions.bet_calculation_type TEXT CHECK (bet_calculation_type IN ('fixed_odds', 'pool_ratio'))
DEFAULT 'pool_ratio'
```

### TypeScript

**Nouveau type :**
```typescript
export type BetCalculationType = 'fixed_odds' | 'pool_ratio';
```

**Ajouté à :**
- `Prediction` interface
- `CreatePredictionData` interface
- `UpdatePredictionData` interface

---

## ✅ Checklist de Migration

- [x] Type `BetCalculationType` créé
- [x] Colonne `bet_calculation_type` dans la table `predictions`
- [x] Service de validation mis à jour (deux logiques de calcul)
- [x] Interface admin mise à jour (sélecteur)
- [x] Toast de succès ajouté à la création
- [x] Stats display mise à jour (affichage conditionnel)
- [x] Documentation complète

---

## 🚀 Prochaines Étapes

1. **Exécuter la migration SQL** dans Supabase
2. **Tester les deux types** de paris
3. **Comparer les réactions** des utilisateurs
4. **Ajuster selon les retours**

---

**Status** : ✅ Implémentation Complète

**Date** : Octobre 2025

**Version** : 2.0.0 - Dual Betting System

