# 🌌 GalacticX dApp

> A gamified football dApp combining NFT ownership, predictions, and competitive gameplay on MultiversX blockchain.

[![License](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](LICENSE)
[![MultiversX](https://img.shields.io/badge/blockchain-MultiversX-00d4ff.svg)](https://multiversx.com/)
[![React](https://img.shields.io/badge/react-18.2.0-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.2.2-3178c6.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/backend-Supabase-3ecf8e.svg)](https://supabase.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Documentation](#documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**GalacticX** is a next-generation football engagement platform where fans can:

- 🎯 **Predict Match Results** - Earn points for correct predictions
- ⚔️ **Battle with NFT Teams** - War Games mode with 11-player squads
- 🔥 **Maintain Weekly Streaks** - Daily claim rewards
- 🏆 **Climb Leaderboards** - Compete globally and weekly
- ⭐ **Team of the Week** - Earn rewards when your NFT player is featured
- 🖼️ **Collect & Own NFTs** - Real football player digital collectibles

All powered by **MultiversX blockchain** for true digital ownership and **Supabase** for real-time, secure backend.

---

## Features

### ⚽ Prediction Game

- Admin-created prediction events (match results, over/under, scorers)
- Points-based rewards system
- NFT ownership required to participate
- Real-time status updates

### ⚔️ War Games

- 1v1 NFT team battles
- Select 11 players + coach + stadium
- Score calculation based on real-world player stats
- Winner takes points

### 🔥 Weekly Claim Streak

- Daily claim rewards (Monday-Sunday)
- Progressive point bonuses (10-50 points)
- Bonus tokens on weekends ($GOAL)
- Auto-reset each Monday

### 🏆 Leaderboards

- **All-Time**: Cumulative lifetime points
- **Weekly**: Resets every Monday
- Top 10 monthly rewards
- Real-time updates via Supabase

### ⭐ Team of the Week

- Weekly showcase of top 15 real-world players
- NFT holders of featured players receive rewards
- Admin-managed, published every Wednesday

### 🖼️ NFT Gallery

- View all owned GalacticX NFTs
- Filter by position, league, rarity
- Direct links to Transfermarkt profiles
- Real-time ownership verification via MultiversX API

### 👑 Admin Panel

- Protected route (KING role only)
- CRUD operations for predictions
- Result validation & point distribution
- User management
- Team of the Week editor
- Analytics dashboard

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI library |
| **TypeScript** | 5.2.2 | Type safety |
| **Vite** | 4.4.9 | Build tool & dev server |
| **TailwindCSS** | 4.0.15 | Utility-first CSS |
| **React Router** | 6.16.0 | Client-side routing |

### Backend

| Technology | Purpose |
|------------|---------|
| **Supabase** | PostgreSQL database + Auth + Realtime + Edge Functions |
| **PostgreSQL** | Relational database with RLS |
| **Edge Functions** | Serverless functions (Deno) |

### Blockchain

| Technology | Purpose |
|------------|---------|
| **MultiversX** | Layer 1 blockchain |
| **@multiversx/sdk-dapp** | Wallet connection & authentication |
| **@multiversx/sdk-core** | Transaction building & signing |

### Development Tools

- **npm** - Package manager
- **PowerShell** - Shell (Windows)
- **Playwright** - E2E testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## Getting Started

### Prerequisites

- **Node.js**: v18+ ([Download](https://nodejs.org/))
- **npm**: Comes with Node.js
- **Git**: For version control
- **Supabase Account**: [Sign up](https://supabase.com/)
- **MultiversX Wallet**: xPortal, DeFi Wallet, or Web Wallet

### Installation

1. **Clone the repository**:

```powershell
git clone https://github.com/your-org/GalacticDapp.git
cd GalacticDapp
```

2. **Install dependencies**:

```powershell
npm install
```

3. **Configure environment variables**:

```powershell
# Copy template
Copy-Item .env.example .env.local

# Edit with your credentials
notepad .env.local
```

**Required variables**:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# MultiversX
VITE_MULTIVERSX_NETWORK=devnet  # or testnet, mainnet
VITE_GALACTICX_COLLECTION=GALACTICX-abc123

# WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

4. **Start development server**:

```powershell
# Devnet (development)
npm run start-devnet

# Testnet (staging)
npm run start-testnet

# Mainnet (production)
npm run start-mainnet
```

5. **Open browser**: `http://localhost:3000`

---

## Project Structure

```
GalacticDapp/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Design system (atoms)
│   │   ├── shared/         # Business components (molecules)
│   │   └── layout/         # Layout components
│   │
│   ├── features/           # Feature modules
│   │   ├── predictions/
│   │   ├── war-games/
│   │   ├── streaks/
│   │   ├── leaderboards/
│   │   ├── nft-gallery/
│   │   ├── team-of-week/
│   │   └── admin/
│   │
│   ├── pages/              # Page components
│   ├── hooks/              # Global custom hooks
│   ├── lib/                # External integrations
│   │   ├── supabase/       # Supabase client
│   │   └── multiversx/     # MultiversX SDK
│   ├── routes/             # Routing configuration
│   ├── types/              # TypeScript types
│   └── styles/             # Global styles + themes
│
├── supabase/               # Supabase configuration
│   ├── migrations/         # Database migrations
│   └── functions/          # Edge Functions
│
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_ENDPOINTS.md
│   ├── DESIGN_SYSTEM.md
│   ├── COMPONENT_STRUCTURE.md
│   ├── MULTIVERSX_INTEGRATION.md
│   ├── SUPABASE_SETUP.md
│   └── DEVELOPMENT_WORKFLOW.md
│
├── tests/                  # E2E tests (Playwright)
├── public/                 # Static assets
├── .cursorrules            # Cursor AI development rules
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Development

### Available Scripts

```powershell
# Development
npm run start-devnet        # Start dev server (Devnet)
npm run start-testnet       # Start dev server (Testnet)
npm run start-mainnet       # Start dev server (Mainnet)

# Build
npm run build-devnet        # Build for Devnet
npm run build-testnet       # Build for Testnet
npm run build-mainnet       # Build for Mainnet

# Code Quality
npm run lint                # Run ESLint
npm run lint -- --fix       # Fix linting issues

# Testing
npm run test                # Run unit tests (Jest)
npm run run-playwright-test # Run E2E tests (Playwright)
npm run run-playwright-test-ui  # Run E2E with UI
```

### Three Theme System

GalacticX supports **3 premium themes**:

1. **Dark Theme** (`mvx:dark-theme`) - Nocturne/Élégante
   - Deep ocean blues with gold accents
   - High contrast for immersive experience

2. **Light Theme** (`mvx:light-theme`) - Doré & Élégant
   - Clean white with gold highlights
   - Premium, sophisticated feel

3. **Vibe Theme** (`mvx:vibe-theme`) - Dynamique & Premium
   - Bold teal with dark accents
   - Modern, energetic esport aesthetic

Toggle themes in the app header (top-right icon).

### Coding Standards

Follow the guidelines in [`.cursorrules`](./.cursorrules):

- **Components**: PascalCase, max 200 lines
- **Files**: Named exports only
- **TypeScript**: Full type coverage
- **Styling**: TailwindCSS + CSS variables
- **State**: React Context + Hooks + Supabase Realtime

---

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) folder:

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design, tech stack, data flow |
| [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) | PostgreSQL tables, RLS policies, migrations |
| [API_ENDPOINTS.md](./docs/API_ENDPOINTS.md) | Supabase REST API & Edge Functions |
| [DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) | Color palettes, typography, components |
| [COMPONENT_STRUCTURE.md](./docs/COMPONENT_STRUCTURE.md) | Frontend architecture, patterns |
| [MULTIVERSX_INTEGRATION.md](./docs/MULTIVERSX_INTEGRATION.md) | Wallet auth, NFT verification, transactions |
| [SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md) | Backend setup, migrations, Edge Functions |
| [DEVELOPMENT_WORKFLOW.md](./docs/DEVELOPMENT_WORKFLOW.md) | Git workflow, testing, deployment |

---

## Deployment

### Vercel (Recommended)

1. **Connect repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Set build settings**:
   - Build Command: `npm run build-mainnet`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy**: Automatic on push to `main`

### Manual Deployment

```powershell
# Build for production
npm run build-mainnet

# Deploy dist/ folder to your hosting provider
```

### Supabase Production Setup

```powershell
# Push migrations to production
supabase link --project-ref your-production-ref
supabase db push

# Deploy Edge Functions
supabase functions deploy validate-prediction-result
supabase functions deploy process-war-game-result
supabase functions deploy process-daily-claim
supabase functions deploy reset-weekly-leaderboard
```

---

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'feat: add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow [`.cursorrules`](./.cursorrules) coding standards
- Write descriptive commit messages (Conventional Commits)
- Update documentation for new features
- Add tests for critical functionality
- Ensure all 3 themes work correctly
- Test on mobile, tablet, and desktop

---

## Roadmap

### Phase 1: Core Features ✅
- [x] Wallet authentication
- [x] Three theme system
- [x] Documentation complete

### Phase 2: Predictions Game (Sprint 1-2)
- [ ] Prediction creation (admin)
- [ ] Prediction submission (user)
- [ ] Result validation
- [ ] Points distribution
- [ ] Leaderboards (all-time + weekly)

### Phase 3: Engagement Features (Sprint 3-4)
- [ ] Weekly claim streak system
- [ ] NFT gallery
- [ ] Team of the Week

### Phase 4: War Games (Sprint 5-6)
- [ ] Team builder (11 NFTs + coach + stadium)
- [ ] Match lobby
- [ ] Score calculation engine
- [ ] Match history

### Phase 5: Admin Panel (Sprint 7)
- [ ] Admin dashboard
- [ ] User management
- [ ] Analytics

### Phase 6: Polish & Launch (Sprint 8)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Beta testing
- [ ] Production launch

---

## Troubleshooting

### Common Issues

**Issue**: npm install fails  
**Solution**: Clear cache with `npm cache clean --force`, delete `node_modules`, reinstall

**Issue**: Wallet won't connect  
**Solution**: Ensure correct network (devnet/testnet/mainnet), clear browser cache

**Issue**: Supabase errors  
**Solution**: Verify `.env.local` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Issue**: NFT ownership not detected  
**Solution**: Check collection ID in `.env.local`, verify NFTs exist on correct network

For more troubleshooting, see [DEVELOPMENT_WORKFLOW.md](./docs/DEVELOPMENT_WORKFLOW.md#troubleshooting-development-issues).

---

## Security

- **Private Keys**: Never stored or handled by the dApp
- **Wallet Signatures**: All transactions signed client-side
- **RLS Policies**: Database-level access control
- **Admin Guards**: Role verification on frontend + backend
- **Environment Variables**: Never commit `.env.local` to git

Report security issues to: security@galacticx.io

---

## License

This project is licensed under the **GPL-3.0-or-later** License.  
See [LICENSE](./LICENSE) for details.

---

## Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/GalacticDapp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/GalacticDapp/discussions)
- **Discord**: [Join our community](https://discord.gg/galacticx)
- **Twitter**: [@GalacticX](https://twitter.com/galacticx)

---

## Acknowledgments

- **MultiversX** - For the robust blockchain infrastructure
- **Supabase** - For the powerful backend-as-a-service
- **MultiversX dApp Template** - For the solid foundation
- **Community** - For the continuous feedback and support

---

<div align="center">

**Built with ❤️ by the GalacticX Team**

[Website](https://galacticx.io) • [Twitter](https://twitter.com/galacticx) • [Discord](https://discord.gg/galacticx)

</div>
