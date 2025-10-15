# GalacticX dApp - Internationalisation (i18n)

## 📋 Table of Contents
1. [Overview](#overview)
2. [Setup](#setup)
3. [Available Languages](#available-languages)
4. [Translation Files Structure](#translation-files-structure)
5. [Usage in Components](#usage-in-components)
6. [Language Switcher](#language-switcher)
7. [Adding a New Language](#adding-a-new-language)
8. [Best Practices](#best-practices)

---

## Overview

GalacticX uses **react-i18next** for internationalization. All text content is translated and stored in JSON files, making it easy to add new languages and maintain consistency across the application.

### Installed Packages
```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

### Features
- ✅ Multiple language support (English, French)
- ✅ Automatic language detection based on browser settings
- ✅ Persistent language selection (stored in localStorage)
- ✅ Dynamic language switching without page reload
- ✅ Type-safe translations with TypeScript
- ✅ Fallback to English if translation missing

---

## Setup

### 1. Configuration File
**File:** `src/i18n/config.ts`

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import fr from './locales/fr.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr }
    },
    fallbackLng: 'en',
    defaultNS: 'translation',
    supportedLngs: ['en', 'fr'],
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });
```

### 2. Initialization
**File:** `src/index.tsx`

```typescript
import './i18n'; // Must be imported before App component
```

---

## Available Languages

| Language | Code | Flag | Status |
|----------|------|------|--------|
| **English** | `en` | 🇬🇧 | ✅ Default |
| **French** | `fr` | 🇫🇷 | ✅ Complete |

---

## Translation Files Structure

**Location:** `src/i18n/locales/`

### File Organization

```
src/i18n/
├── config.ts           # i18n configuration
├── index.ts            # Exports
└── locales/
    ├── en.json         # English translations
    └── fr.json         # French translations
```

### JSON Structure

Translations are organized by feature/section:

```json
{
  "common": {
    "galacticx": "GalacticX",
    "connect": "Connect",
    "disconnect": "Disconnect",
    "loading": "Loading...",
    "points": "points"
  },
  "nav": {
    "dashboard": "Dashboard",
    "predictions": "Predictions",
    "warGames": "War Games"
  },
  "home": {
    "title": "GalacticX",
    "subtitle": "The ultimate gamified football experience",
    "features": {
      "predictions": {
        "title": "Match Predictions",
        "description": "Bet on match results and earn points"
      }
    }
  },
  "dashboard": {
    "welcome": "Welcome, {{username}}",
    "stats": {
      "totalPoints": "Total Points"
    }
  }
}
```

---

## Usage in Components

### 1. Basic Usage

```typescript
import { useTranslation } from 'react-i18next';

export const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.subtitle')}</p>
    </div>
  );
};
```

### 2. With Variables (Interpolation)

```typescript
const { t } = useTranslation();
const username = 'John';

// Translation: "Welcome, {{username}}"
return <h1>{t('dashboard.welcome', { username })}</h1>;
// Output: "Welcome, John"
```

### 3. With Plurals

```typescript
const { t } = useTranslation();
const count = 5;

return <p>{t('dashboard.stats.days', { count })}</p>;
```

### 4. With Nested Keys

```typescript
const { t } = useTranslation();

return (
  <div>
    <h2>{t('home.features.predictions.title')}</h2>
    <p>{t('home.features.predictions.description')}</p>
  </div>
);
```

---

## Language Switcher

### Component
**File:** `src/components/LanguageSwitcher/LanguageSwitcher.tsx`

```typescript
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <div>
      <button onClick={() => handleLanguageChange('en')}>🇬🇧 EN</button>
      <button onClick={() => handleLanguageChange('fr')}>🇫🇷 FR</button>
    </div>
  );
};
```

### Location
The LanguageSwitcher is available in:
- **Header** (desktop and tablet)
- **Sidebar** (optional)

---

## Adding a New Language

### Step 1: Create Translation File

Create a new file: `src/i18n/locales/{code}.json`

Example for Spanish (`es.json`):

```json
{
  "common": {
    "galacticx": "GalacticX",
    "connect": "Conectar",
    "disconnect": "Desconectar"
  },
  "nav": {
    "dashboard": "Tablero",
    "predictions": "Predicciones"
  }
}
```

### Step 2: Update Config

**File:** `src/i18n/config.ts`

```typescript
import es from './locales/es.json';

export const resources = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es }  // Add new language
} as const;

i18n.init({
  resources,
  supportedLngs: ['en', 'fr', 'es'],  // Add to supported
  // ...
});
```

### Step 3: Update Language Switcher

**File:** `src/components/LanguageSwitcher/LanguageSwitcher.tsx`

```typescript
const languages = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'es', label: 'ES', flag: '🇪🇸' }  // Add new language
];
```

---

## Best Practices

### ✅ DO

1. **Use descriptive keys**
   ```typescript
   // Good
   t('dashboard.stats.totalPoints')
   
   // Bad
   t('tp')
   ```

2. **Group related translations**
   ```json
   {
     "dashboard": {
       "stats": {
         "totalPoints": "...",
         "currentStreak": "..."
       }
     }
   }
   ```

3. **Use variables for dynamic content**
   ```typescript
   t('dashboard.welcome', { username: user.name })
   ```

4. **Keep fallback language (EN) complete**
   - English should always have all keys
   - Other languages can be incomplete (will fallback to EN)

5. **Use consistent naming**
   - camelCase for keys: `totalPoints`, `currentStreak`
   - Group by feature/page: `dashboard`, `predictions`, `nav`

### ❌ DON'T

1. **Hardcode text in components**
   ```typescript
   // Bad
   <h1>Welcome</h1>
   
   // Good
   <h1>{t('dashboard.welcome')}</h1>
   ```

2. **Duplicate translations**
   - Use common keys for shared text
   - Example: `common.connect` instead of multiple "Connect" keys

3. **Forget plurals**
   ```json
   {
     "items_one": "{{count}} item",
     "items_other": "{{count}} items"
   }
   ```

4. **Mix languages in one file**
   - Keep each language in its own file

---

## Translation Coverage

### Current Status

| Section | EN | FR |
|---------|----|----|
| Common | ✅ | ✅ |
| Navigation | ✅ | ✅ |
| Home | ✅ | ✅ |
| Dashboard | ✅ | ✅ |
| Pages (Predictions, etc.) | ✅ | ✅ |
| Sidebar | ✅ | ✅ |
| Themes | ✅ | ✅ |

---

## Troubleshooting

### Translation not showing?

1. **Check if key exists** in JSON file
2. **Check for typos** in key path
3. **Verify JSON syntax** (no trailing commas)
4. **Clear localStorage** and test again
5. **Check console** for i18next errors

### Language not persisting?

- Verify localStorage is enabled
- Check browser console for errors
- Ensure `detection.caches: ['localStorage']` in config

### New language not appearing?

1. Verify language code is in `supportedLngs`
2. Check import in `config.ts`
3. Update `LanguageSwitcher` component

---

## Future Enhancements

- 🔄 Real-time language switching for dynamic content
- 📦 Lazy loading of translation files
- 🌐 More languages (Spanish, German, Portuguese, etc.)
- 🔍 Translation validation tests
- 📝 Crowdin/Locize integration for community translations

---

## Resources

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [Language Detector](https://github.com/i18next/i18next-browser-languageDetector)

---

**Last Updated:** 2025-01-15  
**Contributors:** GalacticX Team

