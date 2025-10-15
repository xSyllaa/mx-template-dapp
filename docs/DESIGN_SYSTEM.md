# GalacticX dApp - Design System Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Color Palettes](#color-palettes)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Icons & Imagery](#icons--imagery)
7. [Animations & Transitions](#animations--transitions)
8. [Responsive Design](#responsive-design)
9. [Accessibility](#accessibility)

---

## Overview

GalacticX design system is built around **three premium themes** that convey football elegance, competitive energy, and community engagement. The system is:

- **Theme-Adaptive**: All components work across 3 themes
- **Mobile-First**: Responsive from 320px to 4K
- **Accessible**: WCAG 2.1 AA compliant
- **Modular**: Reusable components with variants
- **Consistent**: Unified visual language

### Design Principles

1. **Premium Feel**: Elegant gold accents, smooth animations, high-quality imagery
2. **Clear Hierarchy**: Typography and spacing guide user attention
3. **Football-Centric**: Inspired by modern football apps (Socios, FIFA Ultimate Team)
4. **Trust & Security**: Visual cues for blockchain/NFT interactions
5. **Performance**: Lightweight, optimized assets

---

## Color Palettes

### Theme 1: Dark Theme — Nocturne / Élégante 🌑

**Purpose**: Immersive, luxurious experience with high contrast.

| Variable | Hex | RGB | Usage |
|----------|-----|-----|-------|
| `--mvx-bg-primary` | `#0F3A46` | `15, 58, 70` | Main background (body, cards) |
| `--mvx-bg-secondary` | `#11222D` | `17, 34, 45` | Secondary surfaces (navbar, footer) |
| `--mvx-accent` | `#177071` | `23, 112, 113` | Buttons, links, highlights |
| `--mvx-gold` | `#82785E` | `130, 120, 94` | Premium elements (titles, icons, badges) |
| `--mvx-text-primary` | `#FFFFFF` | `255, 255, 255` | Primary text |
| `--mvx-text-secondary` | `#B8C4C9` | `184, 196, 201` | Secondary text |
| `--mvx-border` | `#1A4A58` | `26, 74, 88` | Borders, dividers |
| `--mvx-hover` | `#0E505F` | `14, 80, 95` | Hover states |
| `--mvx-success` | `#22C55E` | `34, 197, 94` | Success messages |
| `--mvx-error` | `#EF4444` | `239, 68, 68` | Error messages |

**Background Gradient** (Hero sections):
```css
background: linear-gradient(135deg, #0F3A46 0%, #11222D 100%);
```

**CSS Variables**:
```css
:root[data-mvx-theme='mvx:dark-theme'] {
  --mvx-bg-primary: #0F3A46;
  --mvx-bg-secondary: #11222D;
  --mvx-accent: #177071;
  --mvx-gold: #82785E;
  --mvx-text-primary: #FFFFFF;
  --mvx-text-secondary: #B8C4C9;
  --mvx-border: #1A4A58;
  --mvx-hover: #0E505F;
  --mvx-success: #22C55E;
  --mvx-error: #EF4444;
}
```

---

### Theme 2: Light Theme — Doré & Élégant 🌕

**Purpose**: Clean, premium aesthetic with gold accents.

| Variable | Hex | RGB | Usage |
|----------|-----|-----|-------|
| `--mvx-bg-primary` | `#FFFFFF` | `255, 255, 255` | Main background |
| `--mvx-bg-secondary` | `#F8F9FA` | `248, 249, 250` | Cards, panels |
| `--mvx-accent` | `#177071` | `23, 112, 113` | Buttons, links |
| `--mvx-gold` | `#82785E` | `130, 120, 94` | Titles, premium icons |
| `--mvx-text-primary` | `#3D4643` | `61, 70, 67` | Primary text |
| `--mvx-text-secondary` | `#6B7280` | `107, 114, 128` | Secondary text |
| `--mvx-border` | `#E5E7EB` | `229, 231, 235` | Borders, dividers |
| `--mvx-hover` | `#0F3A46` | `15, 58, 70` | Hover states |
| `--mvx-success` | `#10B981` | `16, 185, 129` | Success messages |
| `--mvx-error` | `#DC2626` | `220, 38, 38` | Error messages |

**CSS Variables**:
```css
:root[data-mvx-theme='mvx:light-theme'] {
  --mvx-bg-primary: #FFFFFF;
  --mvx-bg-secondary: #F8F9FA;
  --mvx-accent: #177071;
  --mvx-gold: #82785E;
  --mvx-text-primary: #3D4643;
  --mvx-text-secondary: #6B7280;
  --mvx-border: #E5E7EB;
  --mvx-hover: #0F3A46;
  --mvx-success: #10B981;
  --mvx-error: #DC2626;
}
```

---

### Theme 3: Vibe Theme — Dynamique & Premium ⚡

**Purpose**: Modern, energetic, esport-inspired aesthetic.

| Variable | Hex | RGB | Usage |
|----------|-----|-----|-------|
| `--mvx-bg-primary` | `#177071` | `23, 112, 113` | Main background (bold) |
| `--mvx-bg-secondary` | `#11222D` | `17, 34, 45` | Navbar, footer, cards |
| `--mvx-accent` | `#0F3A46` | `15, 58, 70` | Interactive elements |
| `--mvx-gold` | `#82785E` | `130, 120, 94` | Highlights, badges |
| `--mvx-text-primary` | `#FFFFFF` | `255, 255, 255` | Primary text |
| `--mvx-text-secondary` | `#B8C4C9` | `184, 196, 201` | Secondary text |
| `--mvx-border` | `#1A888A` | `26, 136, 138` | Borders (vibrant) |
| `--mvx-hover` | `#1A9A9C` | `26, 154, 156` | Hover states |
| `--mvx-success` | `#34D399` | `52, 211, 153` | Success messages |
| `--mvx-error` | `#F87171` | `248, 113, 113` | Error messages |

**CSS Variables**:
```css
:root[data-mvx-theme='mvx:vibe-theme'] {
  --mvx-bg-primary: #177071;
  --mvx-bg-secondary: #11222D;
  --mvx-accent: #0F3A46;
  --mvx-gold: #82785E;
  --mvx-text-primary: #FFFFFF;
  --mvx-text-secondary: #B8C4C9;
  --mvx-border: #1A888A;
  --mvx-hover: #1A9A9C;
  --mvx-success: #34D399;
  --mvx-error: #F87171;
}
```

---

## Typography

### Font Family

**Primary**: Satoshi (custom font, already included in template)

```css
font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Weights**:
- Regular: 400
- Medium: 500
- Bold: 700

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|--------|-------------|----------------|-------|
| **H1** | 48px (3rem) | 700 | 1.2 | -0.02em | Page titles |
| **H2** | 36px (2.25rem) | 700 | 1.3 | -0.01em | Section headers |
| **H3** | 28px (1.75rem) | 700 | 1.4 | 0 | Subsection headers |
| **H4** | 24px (1.5rem) | 600 | 1.4 | 0 | Card titles |
| **H5** | 20px (1.25rem) | 600 | 1.5 | 0 | Small headers |
| **H6** | 18px (1.125rem) | 600 | 1.5 | 0 | Micro headers |
| **Body Large** | 18px (1.125rem) | 400 | 1.6 | 0 | Intro text |
| **Body** | 16px (1rem) | 400 | 1.6 | 0 | Primary content |
| **Body Small** | 14px (0.875rem) | 400 | 1.6 | 0 | Secondary content |
| **Caption** | 12px (0.75rem) | 400 | 1.5 | 0.01em | Labels, captions |
| **Overline** | 12px (0.75rem) | 600 | 1.5 | 0.1em | All caps labels |

### TailwindCSS Classes

```typescript
// Headings
className="text-5xl font-bold"        // H1
className="text-4xl font-bold"        // H2
className="text-3xl font-bold"        // H3
className="text-2xl font-semibold"    // H4

// Body
className="text-lg"                   // Body Large
className="text-base"                 // Body
className="text-sm"                   // Body Small
className="text-xs"                   // Caption
```

### Color Usage

```typescript
// Primary text
className="text-[var(--mvx-text-primary)]"

// Secondary text
className="text-[var(--mvx-text-secondary)]"

// Gold accent (premium)
className="text-[var(--mvx-gold)]"

// Link/interactive
className="text-[var(--mvx-accent)]"
```

---

## Spacing & Layout

### Spacing Scale (Tailwind)

| Token | Value | Usage |
|-------|-------|-------|
| `0` | 0px | No spacing |
| `1` | 4px | Micro spacing |
| `2` | 8px | Small padding/margin |
| `3` | 12px | Compact spacing |
| `4` | 16px | Default spacing |
| `6` | 24px | Medium spacing |
| `8` | 32px | Large spacing |
| `12` | 48px | Section spacing |
| `16` | 64px | Hero spacing |
| `24` | 96px | Major sections |

### Layout Grid

**Container Max Widths**:
```css
.container {
  max-width: 1280px;  /* xl */
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 1536px) {
  .container {
    max-width: 1440px;  /* 2xl */
  }
}
```

**Breakpoints**:
```typescript
xs: '480px'    // 30rem (custom)
sm: '640px'    // 40rem
md: '768px'    // 48rem
lg: '1024px'   // 64rem
xl: '1280px'   // 80rem
2xl: '1536px'  // 96rem
```

### Component Spacing

```typescript
// Card padding
className="p-6"        // Mobile
className="md:p-8"     // Desktop

// Section margins
className="my-12"      // Between sections
className="my-16 md:my-24"  // Hero sections

// Component gaps
className="gap-4"      // Between items
className="space-y-6"  // Vertical stack
```

---

## Components

### Buttons

#### Variants

**1. Primary Button**

```tsx
<Button variant="primary">
  Submit Prediction
</Button>
```

**Styles**:
```css
background: var(--mvx-accent);
color: var(--mvx-text-primary);
padding: 12px 24px;
border-radius: 8px;
font-weight: 600;
transition: all 0.2s ease;

&:hover {
  background: var(--mvx-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
```

**2. Secondary Button**

```tsx
<Button variant="secondary">
  Cancel
</Button>
```

**Styles**:
```css
background: transparent;
border: 2px solid var(--mvx-border);
color: var(--mvx-text-primary);
padding: 12px 24px;
border-radius: 8px;

&:hover {
  border-color: var(--mvx-accent);
  background: rgba(23, 112, 113, 0.1);
}
```

**3. Gold Button** (Premium actions)

```tsx
<Button variant="gold">
  Claim Reward
</Button>
```

**Styles**:
```css
background: var(--mvx-gold);
color: #FFFFFF;
padding: 12px 24px;
border-radius: 8px;
font-weight: 700;

&:hover {
  background: #9A8F6F;
  box-shadow: 0 0 20px rgba(130, 120, 94, 0.4);
}
```

**4. Outline Button**

```tsx
<Button variant="outline">
  View Details
</Button>
```

**5. Ghost Button**

```tsx
<Button variant="ghost">
  Learn More
</Button>
```

#### Sizes

```tsx
<Button size="sm">Small</Button>        // 10px 20px
<Button size="md">Medium</Button>       // 12px 24px (default)
<Button size="lg">Large</Button>        // 14px 28px
<Button size="xl">Extra Large</Button>  // 16px 32px
```

#### States

- **Default**: Normal state
- **Hover**: `transform: translateY(-2px)` + shadow
- **Active**: `transform: scale(0.98)`
- **Disabled**: `opacity: 0.5`, `cursor: not-allowed`
- **Loading**: Spinner icon, `pointer-events: none`

---

### Cards

#### Base Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Prediction Card</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    <Button>Submit</Button>
  </CardFooter>
</Card>
```

**Styles**:
```css
background: var(--mvx-bg-secondary);
border-radius: 16px;
padding: 24px;
border: 1px solid var(--mvx-border);
transition: transform 0.2s ease, box-shadow 0.2s ease;

&:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}
```

#### Card Variants

**1. Prediction Card**
- Match teams (badges)
- Betting options (buttons)
- Status badge (open/closed)
- Countdown timer

**2. NFT Card**
- NFT image
- Player name
- Position badge
- Rarity indicator
- Stats (optional)

**3. War Game Card**
- Team A vs Team B
- Score preview
- Status (pending/locked/completed)
- Join/View button

**4. Leaderboard Card**
- Rank badge (1st, 2nd, 3rd get gold/silver/bronze)
- User avatar
- Username
- Points
- Trophy icon (top 3)

---

### Badges

#### Status Badges

```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Closed</Badge>
<Badge variant="info">Upcoming</Badge>
```

**Styles**:
```css
/* Success (green) */
background: rgba(34, 197, 94, 0.1);
color: var(--mvx-success);
border: 1px solid var(--mvx-success);

/* Warning (yellow) */
background: rgba(251, 191, 36, 0.1);
color: #FBBF24;
border: 1px solid #FBBF24;

/* Error (red) */
background: rgba(239, 68, 68, 0.1);
color: var(--mvx-error);
border: 1px solid var(--mvx-error);
```

#### Rarity Badges (NFTs)

```tsx
<Badge variant="common">Common</Badge>
<Badge variant="rare">Rare</Badge>
<Badge variant="epic">Epic</Badge>
<Badge variant="legendary">Legendary</Badge>
```

**Colors**:
- Common: `#9CA3AF` (gray)
- Rare: `#3B82F6` (blue)
- Epic: `#A855F7` (purple)
- Legendary: `#F59E0B` (gold)

#### Points Badge

```tsx
<PointsBadge points={1250} />
```

**Style**: Gold background, animated on update

---

### Modals

```tsx
<Modal isOpen={isOpen} onClose={handleClose}>
  <ModalHeader>
    <ModalTitle>Submit Prediction</ModalTitle>
    <ModalClose />
  </ModalHeader>
  <ModalBody>
    Content
  </ModalBody>
  <ModalFooter>
    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
    <Button variant="primary" onClick={handleSubmit}>Confirm</Button>
  </ModalFooter>
</Modal>
```

**Styles**:
```css
/* Overlay */
background: rgba(0, 0, 0, 0.75);
backdrop-filter: blur(4px);

/* Modal */
background: var(--mvx-bg-primary);
border-radius: 16px;
max-width: 500px;
box-shadow: 0 20px 60px rgba(0,0,0,0.5);

/* Animation */
animation: fadeInScale 0.3s ease-out;
```

---

### Forms

#### Input Fields

```tsx
<Input
  type="text"
  placeholder="Enter your username"
  label="Username"
  error="Username is required"
/>
```

**Styles**:
```css
background: var(--mvx-bg-secondary);
border: 2px solid var(--mvx-border);
border-radius: 8px;
padding: 12px 16px;
color: var(--mvx-text-primary);
transition: border-color 0.2s ease;

&:focus {
  border-color: var(--mvx-accent);
  outline: none;
  box-shadow: 0 0 0 3px rgba(23, 112, 113, 0.1);
}

&:error {
  border-color: var(--mvx-error);
}
```

#### Select Dropdowns

```tsx
<Select options={options} onChange={handleChange} />
```

#### Checkbox / Radio

```tsx
<Checkbox label="I agree to terms" checked={checked} />
<Radio name="option" value="1" label="Option 1" />
```

---

### Tooltips

```tsx
<Tooltip content="This is a tooltip">
  <span>Hover me</span>
</Tooltip>
```

**Styles**:
```css
background: var(--mvx-bg-secondary);
color: var(--mvx-text-primary);
border: 1px solid var(--mvx-border);
padding: 8px 12px;
border-radius: 6px;
font-size: 14px;
box-shadow: 0 4px 12px rgba(0,0,0,0.3);
```

---

### Loaders

#### Spinner

```tsx
<Loader />
<Loader size="sm" />
<Loader size="lg" />
```

**Style**: Rotating circular spinner with accent color

#### Skeleton

```tsx
<Skeleton width="100%" height="200px" />
```

**Style**: Animated gradient shimmer

---

## Icons & Imagery

### Icon Library

Using **FontAwesome** (already in template):
```typescript
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faFutbol, faUsers } from '@fortawesome/free-solid-svg-icons';
```

### Icon Usage

- **Size**: 16px (sm), 20px (md), 24px (lg), 32px (xl)
- **Color**: Match text or accent color
- **Spacing**: 8px margin from adjacent text

### Custom Icons (SVG)

Store in `src/assets/icons/` with descriptive names:
- `trophy-icon.svg`
- `nft-icon.svg`
- `wallet-icon.svg`

### NFT Images

- **Format**: WebP (fallback to PNG)
- **Sizes**: 
  - Thumbnail: 200x200px
  - Card: 400x400px
  - Full: 800x800px
- **Loading**: Lazy load, placeholder blur

### Background Images

- Hero sections: `public/{theme}-theme-bg.png`
- Optimize for web (< 500KB)
- Use CSS `background-size: cover`

---

## Animations & Transitions

### Transition Durations

```css
--transition-fast: 150ms;
--transition-normal: 200ms;
--transition-slow: 300ms;
```

### Common Animations

#### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
animation: fadeIn 0.3s ease-out;
```

#### Slide Up
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
animation: slideUp 0.4s ease-out;
```

#### Scale Pop
```css
@keyframes scalePop {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
animation: scalePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
```

#### Hover Lift
```css
transition: transform 0.2s ease, box-shadow 0.2s ease;

&:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}
```

#### Points Update (Number Counter)
```typescript
// Use CountUp.js or custom animation
<AnimatedNumber value={points} duration={1000} />
```

---

## Responsive Design

### Mobile-First Approach

```css
/* Mobile (default) */
.card {
  padding: 16px;
  grid-template-columns: 1fr;
}

/* Tablet */
@media (min-width: 768px) {
  .card {
    padding: 24px;
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .card {
    padding: 32px;
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Responsive Typography

```tsx
className="text-2xl md:text-4xl lg:text-5xl"  // Headings scale
className="text-sm md:text-base"              // Body text
```

### Grid Layouts

```tsx
// Auto-responsive grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
```

---

## Accessibility

### Color Contrast

All text meets **WCAG 2.1 AA** standards:
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum

### Focus States

```css
&:focus-visible {
  outline: 2px solid var(--mvx-accent);
  outline-offset: 2px;
}
```

### ARIA Labels

```tsx
<button aria-label="Submit prediction">
  <IconSubmit />
</button>

<img src="nft.png" alt="Erling Haaland Legendary NFT" />
```

### Keyboard Navigation

- All interactive elements accessible via Tab
- Modal traps focus
- Escape closes modals

---

## Design Tokens (CSS Variables Reference)

```css
:root {
  /* Colors */
  --mvx-bg-primary: ...;
  --mvx-bg-secondary: ...;
  --mvx-accent: ...;
  --mvx-gold: ...;
  --mvx-text-primary: ...;
  --mvx-text-secondary: ...;
  --mvx-border: ...;
  --mvx-hover: ...;
  --mvx-success: ...;
  --mvx-error: ...;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.15);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.2);
  --shadow-xl: 0 20px 60px rgba(0,0,0,0.5);
  
  /* Transitions */
  --transition-fast: 150ms;
  --transition-normal: 200ms;
  --transition-slow: 300ms;
}
```

---

## Conclusion

GalacticX design system provides a cohesive, premium visual experience across all user touchpoints. Key features:

✅ **3 Distinct Themes**: Dark, Light, Vibe  
✅ **Consistent Components**: Buttons, cards, modals, forms  
✅ **Responsive**: Mobile-first, scales to 4K  
✅ **Accessible**: WCAG 2.1 AA compliant  
✅ **Performant**: Optimized assets, smooth animations  

For implementation, refer to:
- `src/styles/tailwind.css` - Theme variables
- `src/components/ui/` - Component implementations
- [COMPONENT_STRUCTURE.md](./COMPONENT_STRUCTURE.md) - Architecture details


