# GalacticX dApp - Development Workflow

## 📋 Table of Contents
1. [Overview](#overview)
2. [Development Environment Setup](#development-environment-setup)
3. [Git Workflow](#git-workflow)
4. [Feature Development Process](#feature-development-process)
5. [Code Review Guidelines](#code-review-guidelines)
6. [Testing Strategy](#testing-strategy)
7. [Deployment Process](#deployment-process)
8. [Maintenance & Updates](#maintenance--updates)

---

## Overview

This document outlines the development workflow for the GalacticX project, ensuring consistency, quality, and collaboration across the team.

### Development Principles

1. **Feature-Based Development**: Work in isolated feature branches
2. **Small, Focused PRs**: Each PR addresses one feature or fix
3. **Test Before Deploy**: All code tested locally before merge
4. **Documentation First**: Update docs alongside code
5. **Code Reviews**: All code reviewed by at least one peer

---

## Development Environment Setup

### 1. Initial Clone & Setup

```powershell
# Clone repository
git clone https://github.com/your-org/GalacticDapp.git
cd GalacticDapp

# Install dependencies
npm install

# Copy environment template
Copy-Item .env.example .env.local

# Edit .env.local with your credentials
notepad .env.local
```

### 2. Configure Environment Variables

**File**: `.env.local`

```bash
# Supabase (get from Supabase Dashboard)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# MultiversX
VITE_MULTIVERSX_NETWORK=devnet
VITE_GALACTICX_COLLECTION=GALACTICX-devnet-123

# Feature Flags (optional)
VITE_ENABLE_WAR_GAMES=true
VITE_ENABLE_TEAM_OF_WEEK=false
```

### 3. Start Development Server

```powershell
# Start React dev server (Devnet)
npm run start-devnet

# Or for other networks
npm run start-testnet
npm run start-mainnet
```

**Access**: `http://localhost:3000`

### 4. Setup Supabase Local (Optional)

```powershell
# Start local Supabase (requires Docker)
supabase start

# Apply migrations
supabase db reset
```

---

## Git Workflow

### Branch Strategy

We use **Git Flow** with the following branches:

```
main          → Production (stable releases)
├─ develop    → Integration branch (next release)
   ├─ feature/prediction-game
   ├─ feature/war-games
   ├─ fix/leaderboard-sorting
   └─ refactor/nft-service
```

### Branch Naming Convention

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/description` | `feature/prediction-game` |
| Bug Fix | `fix/description` | `fix/leaderboard-sorting` |
| Hotfix | `hotfix/description` | `hotfix/security-patch` |
| Refactor | `refactor/description` | `refactor/nft-service` |
| Documentation | `docs/description` | `docs/api-endpoints` |
| Chore | `chore/description` | `chore/update-dependencies` |

### Commit Message Format

Follow **Conventional Commits**:

```
<type>(<scope>): <short summary>

<optional body>

<optional footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactor (no behavior change)
- `docs`: Documentation changes
- `style`: Code style (formatting, no logic change)
- `test`: Add/update tests
- `chore`: Build/tooling changes

**Examples**:

```bash
feat(predictions): add prediction submission flow

- Implement PredictionCard component
- Add useSubmitPrediction hook
- Integrate with Supabase

Closes #42
```

```bash
fix(leaderboard): correct sorting by points descending

Previously sorted ascending, now correctly shows top players first.

Fixes #58
```

### Daily Workflow

#### 1. Start Your Day

```powershell
# Switch to develop branch
git checkout develop

# Pull latest changes
git pull origin develop

# Create feature branch
git checkout -b feature/my-new-feature
```

#### 2. During Development

```powershell
# Make changes
# ...

# Stage files
git add .

# Commit with descriptive message
git commit -m "feat(streaks): add weekly claim calendar component"

# Push to remote regularly
git push origin feature/my-new-feature
```

#### 3. Before Creating PR

```powershell
# Ensure develop is up to date
git checkout develop
git pull origin develop

# Rebase your feature branch
git checkout feature/my-new-feature
git rebase develop

# Fix any conflicts, then
git push origin feature/my-new-feature --force-with-lease
```

#### 4. Create Pull Request

1. Go to GitHub
2. Click **"New Pull Request"**
3. Base: `develop` ← Compare: `feature/my-new-feature`
4. Fill in PR template (see below)
5. Request reviewers
6. Wait for CI checks to pass

---

## Feature Development Process

### Phase 1: Planning

1. **Create GitHub Issue**: Describe feature, requirements, acceptance criteria
2. **Review PRD**: Ensure alignment with product requirements
3. **Technical Design**: Sketch component structure, data flow
4. **Estimate Effort**: Size the task (S, M, L, XL)

### Phase 2: Implementation

#### Step 1: Create Feature Module

```powershell
# Create feature folder structure
New-Item -ItemType Directory -Path src/features/my-feature
New-Item -ItemType Directory -Path src/features/my-feature/components
New-Item -ItemType Directory -Path src/features/my-feature/hooks
New-Item -ItemType Directory -Path src/features/my-feature/services
New-Item -ItemType File -Path src/features/my-feature/types.ts
New-Item -ItemType File -Path src/features/my-feature/index.ts
```

#### Step 2: Build Components (Bottom-Up)

```typescript
// 1. Define types
// features/my-feature/types.ts
export interface MyFeatureData {
  id: string;
  name: string;
}

// 2. Create service
// features/my-feature/services/myFeatureService.ts
export const myFeatureService = {
  async getData() {
    const { data } = await supabase.from('my_table').select('*');
    return data;
  }
};

// 3. Create hook
// features/my-feature/hooks/useMyFeature.ts
export const useMyFeature = () => {
  const [data, setData] = useState([]);
  // ... logic
  return { data, loading, error };
};

// 4. Create component
// features/my-feature/components/MyFeatureCard/MyFeatureCard.tsx
export const MyFeatureCard = ({ data }: Props) => {
  return <Card>{data.name}</Card>;
};

// 5. Export public API
// features/my-feature/index.ts
export { MyFeatureCard } from './components/MyFeatureCard';
export { useMyFeature } from './hooks/useMyFeature';
```

#### Step 3: Create Page

```typescript
// pages/MyFeature/MyFeature.tsx
import { Layout } from 'components/layout/Layout';
import { MyFeatureCard } from 'features/my-feature';
import { useMyFeature } from 'features/my-feature';

export const MyFeature = () => {
  const { data, loading } = useMyFeature();
  
  return (
    <Layout>
      <h1>My Feature</h1>
      {data.map(item => <MyFeatureCard key={item.id} data={item} />)}
    </Layout>
  );
};
```

#### Step 4: Add Route

```typescript
// routes/routes.ts
import { MyFeature } from 'pages/MyFeature';

export const routes = [
  // ...existing routes
  {
    path: '/my-feature',
    title: 'My Feature',
    component: MyFeature,
    authenticatedRoute: true
  }
];
```

### Phase 3: Testing

#### Manual Testing Checklist

- [ ] Feature works in all 3 themes (dark, light, vibe)
- [ ] Responsive on mobile (375px), tablet (768px), desktop (1280px)
- [ ] Loading states display correctly
- [ ] Error states handle gracefully
- [ ] Authentication checks work
- [ ] NFT ownership checks work (if applicable)
- [ ] Data persists to Supabase correctly
- [ ] Realtime updates work (if applicable)

#### Automated Testing (Future)

```typescript
// features/my-feature/components/MyFeatureCard/MyFeatureCard.test.tsx
import { render, screen } from '@testing-library/react';
import { MyFeatureCard } from './MyFeatureCard';

test('renders feature card with data', () => {
  const data = { id: '1', name: 'Test' };
  render(<MyFeatureCard data={data} />);
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

### Phase 4: Documentation

Update relevant docs:

- [ ] Add component to `docs/COMPONENT_STRUCTURE.md` (if significant)
- [ ] Update `docs/API_ENDPOINTS.md` (if new API calls)
- [ ] Update `README.md` features list
- [ ] Add inline code comments (JSDoc)

### Phase 5: Code Review

Submit PR and address review feedback.

---

## Code Review Guidelines

### For Authors (Before Submitting PR)

**Self-Review Checklist**:

- [ ] Code follows `.cursorrules` conventions
- [ ] No commented-out code or debug logs
- [ ] No hardcoded values (use constants/env vars)
- [ ] Components under 200 lines
- [ ] TypeScript types defined for all props/functions
- [ ] Imports organized correctly
- [ ] No linter errors (`npm run lint`)
- [ ] Tested manually in all 3 themes
- [ ] PR description filled out completely

**PR Template**:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation update

## Related Issues
Closes #42

## Screenshots (if UI change)
[Attach screenshots]

## Testing Checklist
- [ ] Tested locally
- [ ] Tested in dark theme
- [ ] Tested in light theme
- [ ] Tested in vibe theme
- [ ] Tested on mobile
- [ ] Tested authentication flow
- [ ] Tested NFT ownership check

## Reviewer Notes
Any specific areas to focus on during review
```

### For Reviewers

**Review Checklist**:

- [ ] Code is readable and maintainable
- [ ] Logic is sound and efficient
- [ ] No security vulnerabilities (RLS bypasses, exposed secrets)
- [ ] Error handling is comprehensive
- [ ] TypeScript types are accurate
- [ ] Component structure follows architecture
- [ ] UI matches design system
- [ ] Accessibility considered (ARIA labels, keyboard nav)
- [ ] Performance optimized (no unnecessary re-renders)

**Review Comments**:

Use constructive language:

✅ **Good**:
> "Consider extracting this logic into a custom hook for better reusability. For example: `useFeatureLogic()`"

❌ **Bad**:
> "This is wrong. Use a hook."

**Approval Process**:

1. At least **1 approval** required before merge
2. All **CI checks** must pass
3. No **unresolved conversations**
4. **Author** merges after approval

---

## Testing Strategy

### Testing Pyramid

```
        /\
       /  \      E2E Tests (Few)
      /____\     
     /      \    Integration Tests (Some)
    /        \   
   /__________\  Unit Tests (Many)
```

### Unit Tests (Future)

Test individual functions and hooks:

```typescript
// hooks/usePredictions.test.ts
import { renderHook } from '@testing-library/react';
import { usePredictions } from './usePredictions';

test('fetches predictions on mount', async () => {
  const { result } = renderHook(() => usePredictions());
  expect(result.current.loading).toBe(true);
  // ... assertions
});
```

### Integration Tests

Test feature flows:

```typescript
// features/predictions/__tests__/submission-flow.test.tsx
test('user can submit prediction', async () => {
  // Render component
  // Click option
  // Click submit
  // Verify success message
});
```

### E2E Tests (Playwright - Already in template)

Critical user journeys:

```typescript
// tests/PredictionFlow/submit-prediction.spec.ts
import { test, expect } from '@playwright/test';

test('user submits prediction successfully', async ({ page }) => {
  // 1. Connect wallet
  await page.goto('/unlock');
  await page.click('[data-testid="connect-wallet-btn"]');
  
  // 2. Navigate to predictions
  await page.goto('/predictions');
  
  // 3. Select option
  await page.click('[data-testid="prediction-option-1"]');
  
  // 4. Submit
  await page.click('[data-testid="submit-prediction-btn"]');
  
  // 5. Verify success
  await expect(page.locator('.toast-success')).toBeVisible();
});
```

**Run E2E Tests**:

```powershell
npm run run-playwright-test
```

---

## Deployment Process

### Development Environment (Automatic)

**Trigger**: Push to `develop` branch

**Process**:
1. GitHub Actions runs CI checks (lint, test)
2. If pass, auto-deploy to Vercel preview URL
3. Test on preview before merging to main

### Staging Environment

**Trigger**: Manual deploy from `develop` branch

**Process**:
```powershell
# Build for testnet
npm run build-testnet

# Deploy to staging server
# (Configure deployment tool: Vercel, Netlify, etc.)
```

### Production Environment

**Trigger**: Merge to `main` branch (via PR from `develop`)

**Process**:

1. **Pre-Deployment Checklist**:
   - [ ] All features tested on staging
   - [ ] Database migrations tested
   - [ ] Edge Functions deployed and tested
   - [ ] Environment variables configured
   - [ ] Team approval obtained

2. **Deployment Steps**:

```powershell
# 1. Merge develop into main
git checkout main
git pull origin main
git merge develop

# 2. Tag release
git tag -a v1.2.0 -m "Release v1.2.0: Prediction Game"
git push origin v1.2.0

# 3. Build for production
npm run build-mainnet

# 4. Deploy (Vercel example)
vercel --prod
```

3. **Post-Deployment**:
   - [ ] Smoke test production site
   - [ ] Monitor error logs (Sentry, Supabase logs)
   - [ ] Announce release in team chat
   - [ ] Update `CHANGELOG.md`

### Rollback Plan

If critical issue detected:

```powershell
# Revert to previous version
vercel rollback

# Or git revert
git revert <commit-hash>
git push origin main
```

---

## Maintenance & Updates

### Dependency Updates

**Monthly**:

```powershell
# Check for outdated packages
npm outdated

# Update non-breaking (patch/minor)
npm update

# Test thoroughly
npm run start-devnet
```

**Major Updates** (review changelog):

```powershell
# Update specific package
npm install @multiversx/sdk-dapp@latest

# Test extensively before deploying
```

### Database Migrations

**Adding New Migration**:

```powershell
# Create new migration
supabase migration new add_user_bio_field

# Edit migration file
notepad supabase\migrations\<timestamp>_add_user_bio_field.sql
```

```sql
-- Add column
ALTER TABLE users ADD COLUMN bio TEXT;

-- Update RLS policy if needed
```

```powershell
# Test locally
supabase db reset

# Push to production
supabase db push
```

### Monitoring & Alerts

**Tools**:
- **Supabase Dashboard**: Database performance, errors
- **Vercel Analytics**: Page load times, traffic
- **Sentry** (optional): JavaScript error tracking
- **PostHog** (optional): User analytics

**Weekly Review**:
- Check error logs
- Review performance metrics
- Identify slow queries (Supabase logs)
- Optimize as needed

---

## Common Commands Reference

### Git

```powershell
git status                           # Check status
git checkout -b feature/my-feature   # Create branch
git add .                            # Stage all changes
git commit -m "feat: message"        # Commit
git push origin branch-name          # Push
git pull origin develop              # Pull latest
git rebase develop                   # Rebase on develop
git log --oneline                    # View commit history
```

### npm

```powershell
npm install                          # Install dependencies
npm run start-devnet                 # Start dev server (devnet)
npm run build-mainnet                # Build for production
npm run lint                         # Run linter
npm run test                         # Run tests (future)
```

### Supabase

```powershell
supabase start                       # Start local instance
supabase stop                        # Stop local instance
supabase db reset                    # Reset local DB
supabase db push                     # Push migrations
supabase functions deploy my-func    # Deploy Edge Function
supabase migration new my-migration  # Create migration
```

### Playwright

```powershell
npm run run-playwright-test          # Run all E2E tests
npm run run-playwright-test-ui       # Run with UI
npx playwright test --grep "login"   # Run specific test
```

---

## Troubleshooting Development Issues

### Issue: npm install fails

**Solution**:
```powershell
# Clear cache
npm cache clean --force

# Delete node_modules and lockfile
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstall
npm install
```

### Issue: Vite dev server won't start

**Solution**:
1. Check port 3000 is not in use
2. Clear Vite cache: `Remove-Item -Recurse -Force node_modules/.vite`
3. Restart dev server

### Issue: Supabase client errors

**Solution**:
1. Verify `.env.local` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Check Supabase project is not paused (free tier auto-pauses)
3. Verify RLS policies allow your operation

### Issue: MultiversX wallet won't connect

**Solution**:
1. Ensure correct network (devnet/testnet/mainnet)
2. Clear browser cache/cookies
3. Try different wallet provider (xPortal, DeFi Wallet, Web Wallet)

---

## Conclusion

Following this workflow ensures:

✅ **Consistency**: All developers follow same process  
✅ **Quality**: Code reviewed and tested before merge  
✅ **Collaboration**: Clear communication via PRs and issues  
✅ **Traceability**: Git history and commit messages provide context  
✅ **Stability**: Production deployments are safe and reversible  

For technical details, see:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [COMPONENT_STRUCTURE.md](./COMPONENT_STRUCTURE.md) - Code organization
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Backend setup
- `.cursorrules` - Coding standards


