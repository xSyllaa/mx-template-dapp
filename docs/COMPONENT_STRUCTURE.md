# GalacticX dApp - Component Structure Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture Philosophy](#architecture-philosophy)
3. [Folder Structure](#folder-structure)
4. [Component Categories](#component-categories)
5. [Component Patterns](#component-patterns)
6. [Feature Modules](#feature-modules)
7. [State Management](#state-management)
8. [Best Practices](#best-practices)

---

## Overview

GalacticX follows a **feature-based modular architecture** inspired by atomic design principles. This structure ensures:

- **Scalability**: Easy to add new features without touching existing code
- **Maintainability**: Components are self-contained and easy to understand
- **Reusability**: Shared components across features
- **Testability**: Isolated units for testing
- **Performance**: Code splitting and lazy loading

### Key Principles

1. **Separation of Concerns**: UI, logic, data separated
2. **Single Responsibility**: Each component has one job
3. **Composition Over Inheritance**: Build complex UIs from simple components
4. **DRY (Don't Repeat Yourself)**: Reuse common logic via hooks
5. **Progressive Enhancement**: Work from simple to complex

---

## Architecture Philosophy

### Atomic Design Layers

```
Atoms (ui/)
  ↓
Molecules (shared/)
  ↓
Organisms (features/{feature}/components/)
  ↓
Pages (pages/)
```

**Example Flow**:
```
Button (atom)
  ↓
PredictionOptionButton (molecule)
  ↓
PredictionCard (organism)
  ↓
PredictionsPage (page)
```

---

## Folder Structure

### Complete Frontend Structure

```
src/
├── components/                    # Reusable components
│   ├── ui/                       # Atoms (design system)
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.types.ts
│   │   │   ├── button.styles.ts   (optional)
│   │   │   └── index.ts
│   │   ├── Card/
│   │   ├── Modal/
│   │   ├── Badge/
│   │   ├── Input/
│   │   ├── Select/
│   │   ├── Checkbox/
│   │   ├── Radio/
│   │   ├── Tooltip/
│   │   └── Loader/
│   │
│   ├── shared/                   # Molecules (business components)
│   │   ├── NFTCard/
│   │   │   ├── NFTCard.tsx
│   │   │   ├── NFTCard.types.ts
│   │   │   └── index.ts
│   │   ├── UserAvatar/
│   │   ├── PointsBadge/
│   │   ├── StreakProgress/
│   │   ├── MatchCard/
│   │   └── TeamCompositionCard/
│   │
│   └── layout/                   # Layout components
│       ├── Header/
│       │   ├── Header.tsx
│       │   ├── header.styles.ts
│       │   ├── components/
│       │   │   ├── ThemeSwitch/
│       │   │   ├── WalletConnect/
│       │   │   └── Navigation/
│       │   └── index.ts
│       ├── Footer/
│       ├── Sidebar/
│       └── Layout/
│
├── features/                      # Feature modules (organisms)
│   ├── predictions/
│   │   ├── components/
│   │   │   ├── PredictionCard/
│   │   │   │   ├── PredictionCard.tsx
│   │   │   │   ├── PredictionCard.types.ts
│   │   │   │   ├── components/
│   │   │   │   │   ├── PredictionOptions/
│   │   │   │   │   └── PredictionStatus/
│   │   │   │   └── index.ts
│   │   │   ├── PredictionForm/
│   │   │   ├── PredictionList/
│   │   │   ├── PredictionHistory/
│   │   │   └── AdminPredictionForm/
│   │   ├── hooks/
│   │   │   ├── usePredictions.ts
│   │   │   ├── useSubmitPrediction.ts
│   │   │   ├── useUserPredictions.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── predictionService.ts
│   │   │   └── index.ts
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   └── index.ts
│   │
│   ├── war-games/
│   │   ├── components/
│   │   │   ├── TeamBuilder/
│   │   │   ├── MatchLobby/
│   │   │   ├── WarGameMatch/
│   │   │   └── ScoreCalculator/
│   │   ├── hooks/
│   │   │   ├── useWarGames.ts
│   │   │   ├── useCreateWarGame.ts
│   │   │   ├── useTeamBuilder.ts
│   │   │   └── useNFTLocking.ts
│   │   ├── services/
│   │   │   ├── warGameService.ts
│   │   │   └── scoringService.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── streaks/
│   ├── leaderboards/
│   ├── nft-gallery/
│   ├── team-of-week/
│   └── admin/
│
├── pages/                         # Page components
│   ├── Home/
│   ├── Predictions/
│   ├── WarGames/
│   ├── Leaderboard/
│   ├── MyNFTs/
│   ├── TeamOfWeek/
│   ├── Admin/
│   └── Dashboard/
│
├── hooks/                         # Global hooks
│   ├── useUser.ts
│   ├── useAuth.ts
│   ├── useNFTOwnership.ts
│   └── useHandleThemeManagement.ts
│
├── contexts/                      # React contexts
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── UserContext.tsx
│
├── lib/                           # External integrations
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   └── realtime.ts
│   ├── multiversx/
│   │   └── nftService.ts
│   └── utils/
│       ├── formatters.ts
│       ├── validators.ts
│       └── constants.ts
│
├── types/                         # Global TypeScript types
│   ├── user.types.ts
│   ├── nft.types.ts
│   └── index.ts
│
└── styles/
    ├── tailwind.css
    └── style.css
```

---

## Component Categories

### 1. UI Components (Atoms)

**Location**: `src/components/ui/`

**Purpose**: Basic, reusable design system components.

**Characteristics**:
- **No business logic**
- **Highly reusable**
- **Fully typed props**
- **Theme-aware**
- **Accessible**

**Example: Button**

```typescript
// src/components/ui/Button/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';
import { ButtonProps } from './Button.types';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className,
  ...props
}: ButtonProps) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200';
  
  const variantClasses = {
    primary: 'bg-[var(--mvx-accent)] text-white hover:bg-[var(--mvx-hover)]',
    secondary: 'border-2 border-[var(--mvx-border)] hover:border-[var(--mvx-accent)]',
    gold: 'bg-[var(--mvx-gold)] text-white hover:shadow-[0_0_20px_rgba(130,120,94,0.4)]',
    ghost: 'hover:bg-[var(--mvx-bg-secondary)]'
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  return (
    <button
      className={classNames(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        {
          'opacity-50 cursor-not-allowed': disabled || isLoading,
          'hover:-translate-y-1 hover:shadow-lg': !disabled && !isLoading
        },
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
};
```

```typescript
// src/components/ui/Button/Button.types.ts
import { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'gold' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}
```

```typescript
// src/components/ui/Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button.types';
```

---

### 2. Shared Components (Molecules)

**Location**: `src/components/shared/`

**Purpose**: Composite components with light business logic, reused across features.

**Example: NFTCard**

```typescript
// src/components/shared/NFTCard/NFTCard.tsx
import { Card } from 'components/ui/Card';
import { Badge } from 'components/ui/Badge';
import { NFTCardProps } from './NFTCard.types';

export const NFTCard = ({
  nft,
  onClick,
  isSelected = false,
  showStats = false
}: NFTCardProps) => {
  const { name, position, rarity, metadata_uri, attributes } = nft;
  
  return (
    <Card
      className={classNames('cursor-pointer transition-all', {
        'ring-2 ring-[var(--mvx-accent)]': isSelected
      })}
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={metadata_uri}
          alt={name}
          className="w-full h-48 object-cover rounded-t-lg"
          loading="lazy"
        />
        <Badge variant={rarityVariant(rarity)} className="absolute top-2 right-2">
          {rarity}
        </Badge>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-[var(--mvx-text-primary)]">
          {name}
        </h3>
        <p className="text-sm text-[var(--mvx-text-secondary)]">
          {position}
        </p>
        
        {showStats && attributes && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <StatItem label="PAC" value={attributes.pace} />
            <StatItem label="SHO" value={attributes.shooting} />
            <StatItem label="DEF" value={attributes.defense} />
          </div>
        )}
      </div>
    </Card>
  );
};
```

---

### 3. Feature Components (Organisms)

**Location**: `src/features/{feature}/components/`

**Purpose**: Feature-specific, complex components with full business logic.

**Example: PredictionCard**

```typescript
// src/features/predictions/components/PredictionCard/PredictionCard.tsx
import { useState } from 'react';
import { Card } from 'components/ui/Card';
import { Button } from 'components/ui/Button';
import { Badge } from 'components/ui/Badge';
import { MatchCard } from 'components/shared/MatchCard';
import { useSubmitPrediction } from '../../hooks/useSubmitPrediction';
import { PredictionCardProps } from './PredictionCard.types';

export const PredictionCard = ({ prediction }: PredictionCardProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const { submit, isLoading } = useSubmitPrediction();
  
  const handleSubmit = async () => {
    if (!selectedOption) return;
    
    await submit({
      prediction_id: prediction.id,
      selected_option_id: selectedOption
    });
  };
  
  return (
    <Card className="p-6">
      {/* Match Info */}
      <MatchCard
        homeTeam={prediction.home_team}
        awayTeam={prediction.away_team}
        competition={prediction.competition}
        startDate={prediction.start_date}
      />
      
      {/* Status Badge */}
      <Badge variant={getStatusVariant(prediction.status)}>
        {prediction.status}
      </Badge>
      
      {/* Prediction Options */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-4">
        {prediction.options.map((option) => (
          <Button
            key={option.id}
            variant={selectedOption === option.id ? 'primary' : 'secondary'}
            onClick={() => setSelectedOption(option.id)}
            disabled={prediction.status !== 'open'}
          >
            <div className="text-center">
              <div className="font-bold">{option.label}</div>
              <div className="text-xs opacity-75">Odds: {option.odds}</div>
            </div>
          </Button>
        ))}
      </div>
      
      {/* Points Reward */}
      <div className="text-center text-[var(--mvx-gold)] font-semibold">
        Reward: +{prediction.points_reward} points
      </div>
      
      {/* Submit Button */}
      <Button
        variant="gold"
        className="w-full mt-4"
        onClick={handleSubmit}
        disabled={!selectedOption || prediction.status !== 'open'}
        isLoading={isLoading}
      >
        Submit Prediction
      </Button>
    </Card>
  );
};
```

---

### 4. Page Components

**Location**: `src/pages/{PageName}/`

**Purpose**: Full page layouts composing organisms and handling routing.

**Example: Predictions Page**

```typescript
// src/pages/Predictions/Predictions.tsx
import { Layout } from 'components/layout/Layout';
import { PredictionList } from 'features/predictions/components/PredictionList';
import { PredictionHistory } from 'features/predictions/components/PredictionHistory';
import { Tabs } from 'components/ui/Tabs';

export const Predictions = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-[var(--mvx-text-primary)] mb-8">
          Prediction Game
        </h1>
        
        <Tabs defaultTab="active">
          <Tabs.List>
            <Tabs.Tab value="active">Active Predictions</Tabs.Tab>
            <Tabs.Tab value="history">My History</Tabs.Tab>
          </Tabs.List>
          
          <Tabs.Panel value="active">
            <PredictionList />
          </Tabs.Panel>
          
          <Tabs.Panel value="history">
            <PredictionHistory />
          </Tabs.Panel>
        </Tabs>
      </div>
    </Layout>
  );
};
```

---

## Component Patterns

### Pattern 1: Container/Presentational

**Container (Logic)**: Handles data fetching, state, side effects

```typescript
// features/predictions/components/PredictionList/PredictionListContainer.tsx
export const PredictionListContainer = () => {
  const { predictions, loading, error } = usePredictions({ status: 'open' });
  
  if (loading) return <Loader />;
  if (error) return <ErrorState error={error} />;
  if (predictions.length === 0) return <EmptyState />;
  
  return <PredictionListPresentation predictions={predictions} />;
};
```

**Presentational (UI)**: Pure UI component

```typescript
// features/predictions/components/PredictionList/PredictionListPresentation.tsx
export const PredictionListPresentation = ({ predictions }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {predictions.map((prediction) => (
        <PredictionCard key={prediction.id} prediction={prediction} />
      ))}
    </div>
  );
};
```

---

### Pattern 2: Compound Components

**Parent component exposes child components as properties**

```typescript
// components/ui/Tabs/Tabs.tsx
export const Tabs = ({ children, defaultTab }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
};

Tabs.List = TabsList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

// Usage
<Tabs defaultTab="active">
  <Tabs.List>
    <Tabs.Tab value="active">Active</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="active">Content</Tabs.Panel>
</Tabs>
```

---

### Pattern 3: Render Props

```typescript
<DataFetcher
  url="/api/predictions"
  render={({ data, loading }) => (
    loading ? <Loader /> : <PredictionList predictions={data} />
  )}
/>
```

---

### Pattern 4: Custom Hooks (Preferred)

```typescript
// hooks/usePredictions.ts
export const usePredictions = (filters?: PredictionFilters) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        const data = await predictionService.getPredictions(filters);
        setPredictions(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPredictions();
  }, [filters]);
  
  return { predictions, loading, error };
};

// Usage in component
const { predictions, loading, error } = usePredictions({ status: 'open' });
```

---

## Feature Modules

### Feature Module Structure

Each feature is **self-contained** with its own components, hooks, services, and types.

```
features/predictions/
├── components/        # Feature-specific components
├── hooks/            # Feature-specific hooks
├── services/         # API/Supabase interactions
├── types.ts          # TypeScript types
├── constants.ts      # Constants (status values, etc.)
└── index.ts          # Public API
```

### Public API Pattern

**Only export what's needed outside the feature**

```typescript
// features/predictions/index.ts
export { PredictionList } from './components/PredictionList';
export { PredictionCard } from './components/PredictionCard';
export { usePredictions } from './hooks/usePredictions';
export type { Prediction, PredictionStatus } from './types';

// Internal components NOT exported
// - PredictionOptions (used only inside PredictionCard)
// - PredictionStatus (used only inside PredictionCard)
```

---

## State Management

### 1. Local Component State (useState)

Use for:
- UI state (modals, dropdowns, tabs)
- Form inputs
- Temporary selections

```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedOption, setSelectedOption] = useState<string | null>(null);
```

---

### 2. React Context (Global State)

Use for:
- User authentication
- Theme preferences
- Global UI state (sidebar open/closed)

```typescript
// contexts/UserContext.tsx
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch user on mount
    fetchUser();
  }, []);
  
  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
```

---

### 3. Supabase Realtime (Live Data)

Use for:
- Leaderboards
- Live match updates
- Notifications

```typescript
// hooks/useRealtimeLeaderboard.ts
export const useRealtimeLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  
  useEffect(() => {
    // Initial fetch
    const fetchLeaderboard = async () => {
      const { data } = await supabase
        .from('leaderboards')
        .select('*')
        .order('rank');
      setLeaderboard(data || []);
    };
    fetchLeaderboard();
    
    // Subscribe to changes
    const channel = supabase
      .channel('leaderboard')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leaderboards' },
        () => fetchLeaderboard()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  return leaderboard;
};
```

---

## Best Practices

### 1. Component Size

**Keep components under 200 lines**

If larger, split into:
- Sub-components
- Custom hooks
- Helper functions

```typescript
// Bad: 500-line component
const PredictionCard = () => {
  // Too much logic here
};

// Good: Split into smaller pieces
const PredictionCard = () => {
  const { handleSubmit, selectedOption } = usePredictionSubmit();
  
  return (
    <>
      <PredictionHeader />
      <PredictionOptions onSelect={setSelectedOption} />
      <PredictionSubmitButton onClick={handleSubmit} />
    </>
  );
};
```

---

### 2. Props Destructuring

**Always destructure props in function signature**

```typescript
// Good
const Button = ({ children, variant, onClick }: ButtonProps) => {
  return <button>{children}</button>;
};

// Bad
const Button = (props: ButtonProps) => {
  return <button>{props.children}</button>;
};
```

---

### 3. Named Exports

**Use named exports, NOT default exports**

```typescript
// Good
export const Button = () => {};
import { Button } from './Button';

// Bad
export default Button;
import Button from './Button';  // Can be renamed, confusing
```

---

### 4. File Naming

```
PascalCase: Components (Button.tsx, PredictionCard.tsx)
camelCase: Hooks, services, utilities (useUser.ts, predictionService.ts)
kebab-case: CSS files (button.styles.ts)
```

---

### 5. Import Organization

```typescript
// 1. React & React-related
import { useState, useEffect } from 'react';

// 2. Third-party libraries
import classNames from 'classnames';

// 3. Absolute imports (from src/)
import { Button } from 'components/ui/Button';
import { supabase } from 'lib/supabase';

// 4. Relative imports
import { PredictionOptions } from './PredictionOptions';
import { usePredictionSubmit } from '../../hooks/usePredictionSubmit';

// 5. Types
import type { Prediction } from '../../types';

// 6. Styles (if separate)
import './prediction-card.styles.css';
```

---

### 6. TypeScript Types

**Always type props, hooks, and functions**

```typescript
// Component props
interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
}

// Hook return type
interface UsePredictionsReturn {
  predictions: Prediction[];
  loading: boolean;
  error: Error | null;
}

// Function types
const formatPoints = (points: number): string => {
  return `${points.toLocaleString()} pts`;
};
```

---

### 7. Error Boundaries

**Wrap pages in error boundaries**

```typescript
// wrappers/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorPage />;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <Predictions />
</ErrorBoundary>
```

---

## Conclusion

GalacticX component architecture provides:

✅ **Modular**: Features are self-contained  
✅ **Scalable**: Easy to add new features  
✅ **Maintainable**: Clear structure, single responsibility  
✅ **Reusable**: Shared components across features  
✅ **Testable**: Isolated units  
✅ **Type-Safe**: Full TypeScript coverage  

For implementation, see:
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Component styling
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Overall system design
- `.cursorrules` - Development guidelines


