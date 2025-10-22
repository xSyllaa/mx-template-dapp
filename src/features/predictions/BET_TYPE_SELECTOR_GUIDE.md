# Enhanced Bet Type Selector Guide

## Overview

The new bet type selector provides an advanced interface for selecting football/soccer bet types with comprehensive categorization and search functionality.

## Features

### 🎯 Categories (Non-Selectable Headers)
- **1. Match Result Bets** - Basic match outcome predictions
- **2. Goals Markets** - Goal-related predictions
- **3. Time-Based Bets** - Timing and half-specific bets
- **4. Player Bets** - Individual player performance
- **5. Cards & Bookings** - Disciplinary and card markets
- **6. Corners** - Corner kick markets
- **7. Combination & Accumulator Bets** - Multiple outcome combinations
- **8. Specials / Prop Bets** - Special and novelty markets
- **9. Long-Term / Outright Bets** - Season-long and tournament bets
- **10. Advanced / Niche Markets** - Specialized and statistical markets

### 🔍 Search Functionality
- **Type to filter** - Start typing to filter bet types by name or description
- **Real-time filtering** - Results update as you type
- **Case-insensitive** - Search works regardless of case

### 🎨 Visual Design
- **Category styling** - Each category has a distinct gradient background color:
  - **Match Result Bets** - Blue gradient
  - **Goals Markets** - Green gradient
  - **Time-Based Bets** - Purple gradient
  - **Player Bets** - Orange gradient
  - **Cards & Bookings** - Red gradient
  - **Corners** - Yellow gradient
  - **Combination & Accumulator** - Indigo gradient
  - **Specials / Prop Bets** - Pink gradient
  - **Long-Term / Outright** - Teal gradient
  - **Advanced / Niche** - Gray gradient
- **Bet type borders** - Each bet type has a colored left border matching its category
- **Hover effects** - Interactive hover states for better UX
- **Keyboard navigation** - Full keyboard support (arrows, enter, escape)
- **Responsive design** - Works on all screen sizes

## Usage

### Basic Usage
```tsx
import { BetTypeSelector } from 'features/predictions/components';

function MyComponent() {
  const [selectedBetType, setSelectedBetType] = useState('');

  return (
    <BetTypeSelector
      value={selectedBetType}
      onChange={setSelectedBetType}
      placeholder="Search and select a bet type..."
    />
  );
}
```

### Props
- `value: string` - Currently selected bet type ID
- `onChange: (betTypeId: string) => void` - Callback when selection changes
- `placeholder?: string` - Placeholder text for input field
- `disabled?: boolean` - Disable the selector
- `className?: string` - Additional CSS classes

## Available Bet Types

### 1. Match Result Bets
- **1X2 (Full-Time Result)** - Home Win, Draw, Away Win
- **Double Chance** - Two out of three outcomes combined (1X, X2, 12)
- **Draw No Bet** - If draw, stake is refunded ✨ *Popular*
- **To Win to Nil** - Team wins without conceding
- **Clean Sheet** - Yes/No for either team

### 2. Goals Markets
- **Over/Under Total Goals** - e.g. Over 2.5 goals
- **Both Teams to Score (BTTS)** - Yes/No both teams will score
- **Correct Score** - Predict exact final score
- **Team Total Goals** - Over/Under for individual team
- **First Team to Score** - Which team scores first
- **Last Team to Score** - Which team scores last
- **No Goalscorer** - Often equivalent to 0-0
- **Exact Total Goals in Match** - Exact number of goals
- **Multi-Goal Range** - e.g. 2–3 goals
- **Goal Interval Betting** - Will a goal occur in a certain minute range
- **Odd or Even Goals** - Odd or even number of goals

### 3. Time-Based Bets
- **Half-Time/Full-Time** - Predict both HT and FT results
- **Half-Time Result** - Result at half-time
- **Second Half Result** - Result in second half
- **First Half Goals (Over/Under)** - Goals in first half
- **Second Half Goals (Over/Under)** - Goals in second half
- **First/Last Goal Timing** - e.g. First goal after 30 minutes
- **When Will the First Goal Be Scored** - Minute intervals (0–15, 16–30, etc.)

### 4. Player Bets
- **First Goalscorer** - Which player scores first
- **Anytime Goalscorer** - Player to score at any time
- **Last Goalscorer** - Which player scores last
- **To Score 2 or More Goals** - Player scores 2+ goals
- **To Score a Hat-trick** - Player scores 3 goals
- **Player to Be Booked / Sent Off** - Player receives card or red card
- **Player to Assist** - Player provides assist
- **Player Shots (Total / On Target)** - Player shot statistics
- **Player Passes / Tackles / Interceptions** - Player performance statistics
- **First Player Substituted** - First player taken off

### 5. Cards & Bookings
- **Total Cards in Match (Over/Under)** - Total yellow/red cards
- **Team Total Cards** - Cards for individual team
- **First Team to Receive a Card** - Which team gets first card
- **First Player to Be Carded** - First player to receive card
- **Red Card in Match (Yes/No)** - Will there be a red card
- **Total Booking Points** - Points based on cards (yellow=10, red=25)
- **Player Booking Specials** - Specific player card markets

### 6. Corners
- **Total Corners in Match (Over/Under)** - Total corner kicks
- **Team Total Corners** - Corners for individual team
- **First Team to Win a Corner** - Which team wins first corner
- **Most Corners** - Which team has more corners
- **Corner Race** - First to reach 3, 5, 7, etc. corners
- **Corner Time Intervals** - Will a corner occur between 0–15 minutes
- **Odd or Even Number of Corners** - Odd or even corners

### 7. Combination & Accumulator Bets
- **Match Result + Both Teams to Score** - Combined result and BTTS
- **Win + Over 2.5 Goals** - Team win and over goals
- **Scorecast** - First Goalscorer + Correct Score
- **Wincast** - First Goalscorer + Team to Win
- **Player to Score + Cards + Win (Bet Builder)** - Multiple selections in one bet
- **Same Game Multi / Bet Builder** - Multiple outcomes from same match
- **Multiple Match Accumulators** - Doubles, Trebles, Accas

### 8. Specials / Prop Bets
- **Penalty Awarded (Yes/No)** - Will a penalty be awarded
- **Penalty Missed** - Will a penalty be missed
- **Own Goal Scored** - Will there be an own goal
- **Woodwork Hit (Yes/No)** - Ball hits post/crossbar
- **VAR Intervention to Change Decision** - VAR changes referee decision
- **Goalkeeper to Save a Penalty** - GK saves penalty kick
- **Shirt Number of First Goalscorer (Over/Under)** - Jersey number of first scorer
- **Manager Booking / Dismissal** - Manager receives card

### 9. Long-Term / Outright Bets
- **League Winner** - Which team wins the league
- **Top 4 / Top 6 Finish** - Team finishes in top positions
- **Relegation / Promotion** - Team relegated or promoted
- **Golden Boot (Top Scorer)** - League top scorer
- **Player of the Tournament / Season** - Best player award
- **To Reach Final / Semi-Final / Quarter-Final** - Tournament progression
- **Group Winner** - Wins group stage
- **Stage of Elimination** - How far team progresses
- **Top Assisting Player / Clean Sheets** - Most assists or clean sheets

### 10. Advanced / Niche Markets
- **Team Offsides (Over/Under)** - Offside statistics
- **Team Fouls Committed (Over/Under)** - Foul statistics
- **Player xG (expected goals) Based Bets** - Expected goals statistics
- **First Throw-in / Goal Kick / Free Kick** - First set piece event
- **Match to Go to Extra Time / Penalties** - For cup matches
- **Golden Goal (Extra Time)** - First goal in extra time
- **To Qualify / Advance to Next Round** - Progression over two legs
- **Match Result Decided by Penalties** - Match goes to penalty shootout

## Technical Implementation

### Data Structure
```typescript
// Categories (non-selectable)
interface BetCategory {
  id: string;
  name: string;
  description?: string;
  isSelectable: false;
}

// Individual bet types (selectable)
interface BetTypeOption {
  id: string;
  name: string;
  description: string;
  category: string;
  isSelectable: true;
  legacyType?: BetType; // For backward compatibility
}
```

### Translation Keys
- Categories: `predictions.betCategories.{categoryId}`
- Category descriptions: `predictions.betCategories.{categoryId}Desc`
- Bet type names: `predictions.betTypes.{betTypeId}`
- Bet type descriptions: `predictions.betTypes.{betTypeId}Desc`

### Backward Compatibility
The system maintains backward compatibility with the existing `BetType` enum:
- `result` - Match result bets
- `over_under` - Over/under and goals markets
- `scorer` - Player scoring bets
- `both_teams_score` - BTTS markets

## Future Enhancements

1. **Icon Support** - Add icons for different bet categories
2. **Favorites** - Allow users to mark frequently used bet types
3. **Recent Selection** - Show recently selected bet types
4. **Advanced Filtering** - Filter by category, popularity, etc.
5. **Custom Bet Types** - Allow admins to create custom bet types
6. **Bet Type Templates** - Pre-configured options for common bet setups

## Migration Guide

### For Developers
1. The new system is fully backward compatible
2. Existing `bet_type` field still works
3. New `extended_bet_type` field provides enhanced information
4. All existing functionality remains unchanged

### For Database
Consider adding an `extended_bet_type` column to the predictions table:
```sql
ALTER TABLE predictions ADD COLUMN extended_bet_type TEXT;
```

## Support

For questions or issues with the bet type selector:
1. Check the console for any error messages
2. Verify that translation keys are properly configured
3. Ensure the component is properly imported and used
4. Test with different bet type values

---

*This enhanced bet type selector provides a comprehensive and user-friendly interface for selecting from the full range of football betting markets available to betting agencies.*
