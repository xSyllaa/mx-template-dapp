import type { BetCategory, BetTypeOption, BetDropdownItem } from './types';

/**
 * Generate i18n key for bet type based on category and position
 */
const generateI18nKey = (categoryId: string, position: number): string => {
  const categoryIndex = BET_CATEGORIES.findIndex(cat => cat.id === categoryId);
  // Use (index + 1) for 1-based numbering, fallback to '1' if categoryId not found
  const categoryNumber = categoryIndex !== -1 ? (categoryIndex + 1).toString() : '1';
  return `${categoryNumber}-${position}`;
};

/**
 * Football/Soccer bet categories and types data
 * Based on comprehensive betting agency offerings
 */
export const BET_CATEGORIES: BetCategory[] = [
  {
    id: 'match-result',
    name: '1. Match Result Bets',
    description: 'Basic match outcome predictions',
    isSelectable: false
  },
  {
    id: 'goals-markets',
    name: '2. Goals Markets',
    description: 'Goal-related predictions',
    isSelectable: false
  },
  {
    id: 'time-based',
    name: '3. Time-Based Bets',
    description: 'Timing and half-specific bets',
    isSelectable: false
  },
  {
    id: 'player-bets',
    name: '4. Player Bets',
    description: 'Individual player performance',
    isSelectable: false
  },
  {
    id: 'cards-bookings',
    name: '5. Cards & Bookings',
    description: 'Disciplinary and card markets',
    isSelectable: false
  },
  {
    id: 'corners',
    name: '6. Corners',
    description: 'Corner kick markets',
    isSelectable: false
  },
  {
    id: 'combination',
    name: '7. Combination & Accumulator Bets',
    description: 'Multiple outcome combinations',
    isSelectable: false
  },
  {
    id: 'specials',
    name: '8. Specials / Prop Bets',
    description: 'Special and novelty markets',
    isSelectable: false
  },
  {
    id: 'outright',
    name: '9. Long-Term / Outright Bets',
    description: 'Season-long and tournament bets',
    isSelectable: false
  },
  {
    id: 'advanced',
    name: '10. Advanced / Niche Markets',
    description: 'Specialized and statistical markets',
    isSelectable: false
  }
];

export const BET_TYPES: BetTypeOption[] = [
  // 1. Match Result Bets
  {
    id: '1x2',
    name: '1X2 (Full-Time Result)',
    description: 'Home Win, Draw, Away Win',
    category: 'match-result',
    isSelectable: true,
    i18nKey: generateI18nKey('match-result', 1),
    legacyType: 'result'
  },
  {
    id: 'double-chance',
    name: 'Double Chance',
    description: 'Two out of three outcomes combined (1X, X2, 12)',
    category: 'match-result',
    isSelectable: true,
    i18nKey: generateI18nKey('match-result', 2),
    legacyType: 'result'
  },
  {
    id: 'draw-no-bet',
    name: 'Draw No Bet',
    description: 'If draw, stake is refunded',
    category: 'match-result',
    isSelectable: true,
    i18nKey: generateI18nKey('match-result', 3),
    legacyType: 'result'
  },
  {
    id: 'win-to-nil',
    name: 'To Win to Nil',
    description: 'Team wins without conceding',
    category: 'match-result',
    isSelectable: true,
    i18nKey: generateI18nKey('match-result', 4),
    legacyType: 'result'
  },
  {
    id: 'clean-sheet',
    name: 'Clean Sheet',
    description: 'Yes/No for either team',
    category: 'match-result',
    isSelectable: true,
    i18nKey: generateI18nKey('match-result', 5),
    legacyType: 'result'
  },

  // 2. Goals Markets
  {
    id: 'over-under-goals',
    name: 'Over/Under Total Goals',
    description: 'e.g. Over 2.5 goals',
    category: 'goals-markets',
    isSelectable: true,
    i18nKey: generateI18nKey('goals-markets', 1),
    legacyType: 'over_under'
  },
  {
    id: 'both-teams-score',
    name: 'Both Teams to Score (BTTS)',
    description: 'Yes/No both teams will score',
    category: 'goals-markets',
    isSelectable: true,
    i18nKey: generateI18nKey('goals-markets', 2),
    legacyType: 'both_teams_score'
  },
  {
    id: 'correct-score',
    name: 'Correct Score',
    description: 'Predict exact final score',
    category: 'goals-markets',
    isSelectable: true,
    i18nKey: generateI18nKey('goals-markets', 3),
    legacyType: 'result'
  },
  {
    id: 'team-total-goals',
    name: 'Team Total Goals',
    description: 'Over/Under for individual team',
    category: 'goals-markets',
    isSelectable: true,
    i18nKey: generateI18nKey('goals-markets', 4),
    legacyType: 'over_under'
  },
  {
    id: 'first-team-score',
    name: 'First Team to Score',
    description: 'Which team scores first',
    category: 'goals-markets',
    isSelectable: true,
    i18nKey: generateI18nKey('goals-markets', 5),
    legacyType: 'result'
  },
  {
    id: 'last-team-score',
    name: 'Last Team to Score',
    description: 'Which team scores last',
    category: 'goals-markets',
    isSelectable: true,
    i18nKey: generateI18nKey('goals-markets', 6),
    legacyType: 'result'
  },
  {
    id: 'no-goalscorer',
    name: 'No Goalscorer',
    description: 'Often equivalent to 0-0',
    category: 'goals-markets',
    isSelectable: true,
    i18nKey: generateI18nKey('goals-markets', 7),
    legacyType: 'result'
  },
  {
    id: 'exact-total-goals',
    name: 'Exact Total Goals in Match',
    description: 'Exact number of goals',
    category: 'goals-markets',
    isSelectable: true,
    i18nKey: generateI18nKey('goals-markets', 8),
    legacyType: 'over_under'
  },
  {
    id: 'multi-goal-range',
    name: 'Multi-Goal Range',
    description: 'e.g. 2–3 goals',
    category: 'goals-markets',
    isSelectable: true,
    i18nKey: generateI18nKey('goals-markets', 9),
    legacyType: 'over_under'
  },
  {
    id: 'goal-interval',
    name: 'Goal Interval Betting',
    description: 'Will a goal occur in a certain minute range',
    category: 'goals-markets',
    isSelectable: true,
    i18nKey: generateI18nKey('goals-markets', 10),
    legacyType: 'over_under'
  },
  {
    id: 'odd-even-goals',
    name: 'Odd or Even Goals',
    description: 'Odd or even number of goals',
    category: 'goals-markets',
    isSelectable: true,
    i18nKey: generateI18nKey('goals-markets', 11),
    legacyType: 'over_under'
  },

  // 3. Time-Based Bets
  {
    id: 'half-time-full-time',
    name: 'Half-Time/Full-Time',
    description: 'Predict both HT and FT results',
    category: 'time-based',
    isSelectable: true,
    i18nKey: generateI18nKey('time-based', 1),
    legacyType: 'result'
  },
  {
    id: 'half-time-result',
    name: 'Half-Time Result',
    description: 'Result at half-time',
    category: 'time-based',
    isSelectable: true,
    i18nKey: generateI18nKey('time-based', 2),
    legacyType: 'result'
  },
  {
    id: 'second-half-result',
    name: 'Second Half Result',
    description: 'Result in second half',
    category: 'time-based',
    isSelectable: true,
    i18nKey: generateI18nKey('time-based', 3),
    legacyType: 'result'
  },
  {
    id: 'first-half-goals',
    name: 'First Half Goals (Over/Under)',
    description: 'Goals in first half',
    category: 'time-based',
    isSelectable: true,
    i18nKey: generateI18nKey('time-based', 4),
    legacyType: 'over_under'
  },
  {
    id: 'second-half-goals',
    name: 'Second Half Goals (Over/Under)',
    description: 'Goals in second half',
    category: 'time-based',
    isSelectable: true,
    i18nKey: generateI18nKey('time-based', 5),
    legacyType: 'over_under'
  },
  {
    id: 'first-goal-timing',
    name: 'First/Last Goal Timing',
    description: 'e.g. First goal after 30 minutes',
    category: 'time-based',
    isSelectable: true,
    i18nKey: generateI18nKey('time-based', 6),
    legacyType: 'over_under'
  },
  {
    id: 'goal-minute-intervals',
    name: 'When Will the First Goal Be Scored',
    description: 'Minute intervals (0–15, 16–30, etc.)',
    category: 'time-based',
    isSelectable: true,
    i18nKey: generateI18nKey('time-based', 7),
    legacyType: 'over_under'
  },

  // 4. Player Bets
  {
    id: 'first-goalscorer',
    name: 'First Goalscorer',
    description: 'Which player scores first',
    category: 'player-bets',
    isSelectable: true,
    i18nKey: generateI18nKey('player-bets', 1),
    legacyType: 'scorer'
  },
  {
    id: 'anytime-goalscorer',
    name: 'Anytime Goalscorer',
    description: 'Player to score at any time',
    category: 'player-bets',
    isSelectable: true,
    i18nKey: generateI18nKey('player-bets', 2),
    legacyType: 'scorer'
  },
  {
    id: 'last-goalscorer',
    name: 'Last Goalscorer',
    description: 'Which player scores last',
    category: 'player-bets',
    isSelectable: true,
    i18nKey: generateI18nKey('player-bets', 3),
    legacyType: 'scorer'
  },
  {
    id: 'score-2-or-more',
    name: 'To Score 2 or More Goals',
    description: 'Player scores 2+ goals',
    category: 'player-bets',
    isSelectable: true,
    i18nKey: generateI18nKey('player-bets', 4),
    legacyType: 'scorer'
  },
  {
    id: 'hat-trick',
    name: 'To Score a Hat-trick',
    description: 'Player scores 3 goals',
    category: 'player-bets',
    isSelectable: true,
    i18nKey: generateI18nKey('player-bets', 5),
    legacyType: 'scorer'
  },
  {
    id: 'player-booked',
    name: 'Player to Be Booked / Sent Off',
    description: 'Player receives card or red card',
    category: 'player-bets',
    isSelectable: true,
    i18nKey: generateI18nKey('player-bets', 6),
    legacyType: 'result'
  },
  {
    id: 'player-assist',
    name: 'Player to Assist',
    description: 'Player provides assist',
    category: 'player-bets',
    isSelectable: true,
    i18nKey: generateI18nKey('player-bets', 7),
    legacyType: 'scorer'
  },
  {
    id: 'player-shots',
    name: 'Player Shots (Total / On Target)',
    description: 'Player shot statistics',
    category: 'player-bets',
    isSelectable: true,
    i18nKey: generateI18nKey('player-bets', 8),
    legacyType: 'over_under'
  },
  {
    id: 'player-stats',
    name: 'Player Passes / Tackles / Interceptions',
    description: 'Player performance statistics',
    category: 'player-bets',
    isSelectable: true,
    i18nKey: generateI18nKey('player-bets', 9),
    legacyType: 'over_under'
  },
  {
    id: 'first-substituted',
    name: 'First Player Substituted',
    description: 'First player taken off',
    category: 'player-bets',
    isSelectable: true,
    i18nKey: generateI18nKey('player-bets', 10),
    legacyType: 'result'
  },

  // 5. Cards & Bookings
  {
    id: 'total-cards',
    name: 'Total Cards in Match (Over/Under)',
    description: 'Total yellow/red cards',
    category: 'cards-bookings',
    isSelectable: true,
    i18nKey: generateI18nKey('cards-bookings', 1),
    legacyType: 'over_under'
  },
  {
    id: 'team-cards',
    name: 'Team Total Cards',
    description: 'Cards for individual team',
    category: 'cards-bookings',
    isSelectable: true,
    i18nKey: generateI18nKey('cards-bookings', 2),
    legacyType: 'over_under'
  },
  {
    id: 'first-card',
    name: 'First Team to Receive a Card',
    description: 'Which team gets first card',
    category: 'cards-bookings',
    isSelectable: true,
    i18nKey: generateI18nKey('cards-bookings', 3),
    legacyType: 'result'
  },
  {
    id: 'first-player-carded',
    name: 'First Player to Be Carded',
    description: 'First player to receive card',
    category: 'cards-bookings',
    isSelectable: true,
    i18nKey: generateI18nKey('cards-bookings', 4),
    legacyType: 'result'
  },
  {
    id: 'red-card',
    name: 'Red Card in Match (Yes/No)',
    description: 'Will there be a red card',
    category: 'cards-bookings',
    isSelectable: true,
    i18nKey: generateI18nKey('cards-bookings', 5),
    legacyType: 'result'
  },
  {
    id: 'booking-points',
    name: 'Total Booking Points',
    description: 'Points based on cards (yellow=10, red=25)',
    category: 'cards-bookings',
    isSelectable: true,
    i18nKey: generateI18nKey('cards-bookings', 6),
    legacyType: 'over_under'
  },
  {
    id: 'player-booking-specials',
    name: 'Player Booking Specials',
    description: 'Specific player card markets',
    category: 'cards-bookings',
    isSelectable: true,
    i18nKey: generateI18nKey('cards-bookings', 7),
    legacyType: 'result'
  },

  // 6. Corners
  {
    id: 'total-corners',
    name: 'Total Corners in Match (Over/Under)',
    description: 'Total corner kicks',
    category: 'corners',
    isSelectable: true,
    i18nKey: generateI18nKey('corners', 1),
    legacyType: 'over_under'
  },
  {
    id: 'team-corners',
    name: 'Team Total Corners',
    description: 'Corners for individual team',
    category: 'corners',
    isSelectable: true,
    i18nKey: generateI18nKey('corners', 2),
    legacyType: 'over_under'
  },
  {
    id: 'first-corner',
    name: 'First Team to Win a Corner',
    description: 'Which team wins first corner',
    category: 'corners',
    isSelectable: true,
    i18nKey: generateI18nKey('corners', 3),
    legacyType: 'result'
  },
  {
    id: 'most-corners',
    name: 'Most Corners',
    description: 'Which team has more corners',
    category: 'corners',
    isSelectable: true,
    i18nKey: generateI18nKey('corners', 4),
    legacyType: 'result'
  },
  {
    id: 'corner-race',
    name: 'Corner Race',
    description: 'First to reach 3, 5, 7, etc. corners',
    category: 'corners',
    isSelectable: true,
    i18nKey: generateI18nKey('corners', 5),
    legacyType: 'over_under'
  },
  {
    id: 'corner-intervals',
    name: 'Corner Time Intervals',
    description: 'Will a corner occur between 0–15 minutes',
    category: 'corners',
    isSelectable: true,
    i18nKey: generateI18nKey('corners', 6),
    legacyType: 'over_under'
  },
  {
    id: 'odd-even-corners',
    name: 'Odd or Even Number of Corners',
    description: 'Odd or even corners',
    category: 'corners',
    isSelectable: true,
    i18nKey: generateI18nKey('corners', 7),
    legacyType: 'over_under'
  },

  // 7. Combination & Accumulator Bets
  {
    id: 'result-btts',
    name: 'Match Result + Both Teams to Score',
    description: 'Combined result and BTTS',
    category: 'combination',
    isSelectable: true,
    i18nKey: generateI18nKey('combination', 1),
    legacyType: 'both_teams_score'
  },
  {
    id: 'win-over-goals',
    name: 'Win + Over 2.5 Goals',
    description: 'Team win and over goals',
    category: 'combination',
    isSelectable: true,
    i18nKey: generateI18nKey('combination', 2),
    legacyType: 'over_under'
  },
  {
    id: 'scorecast',
    name: 'Scorecast',
    description: 'First Goalscorer + Correct Score',
    category: 'combination',
    isSelectable: true,
    i18nKey: generateI18nKey('combination', 3),
    legacyType: 'scorer'
  },
  {
    id: 'wincast',
    name: 'Wincast',
    description: 'First Goalscorer + Team to Win',
    category: 'combination',
    isSelectable: true,
    i18nKey: generateI18nKey('combination', 4),
    legacyType: 'scorer'
  },
  {
    id: 'bet-builder',
    name: 'Player to Score + Cards + Win (Bet Builder)',
    description: 'Multiple selections in one bet',
    category: 'combination',
    isSelectable: true,
    i18nKey: generateI18nKey('combination', 5),
    legacyType: 'result'
  },
  {
    id: 'same-game-multi',
    name: 'Same Game Multi / Bet Builder',
    description: 'Multiple outcomes from same match',
    category: 'combination',
    isSelectable: true,
    i18nKey: generateI18nKey('combination', 6),
    legacyType: 'result'
  },
  {
    id: 'accumulators',
    name: 'Multiple Match Accumulators',
    description: 'Doubles, Trebles, Accas',
    category: 'combination',
    isSelectable: true,
    i18nKey: generateI18nKey('combination', 7),
    legacyType: 'result'
  },

  // 8. Specials / Prop Bets
  {
    id: 'penalty-awarded',
    name: 'Penalty Awarded (Yes/No)',
    description: 'Will a penalty be awarded',
    category: 'specials',
    isSelectable: true,
    i18nKey: generateI18nKey('specials', 1),
    legacyType: 'result'
  },
  {
    id: 'penalty-missed',
    name: 'Penalty Missed',
    description: 'Will a penalty be missed',
    category: 'specials',
    isSelectable: true,
    i18nKey: generateI18nKey('specials', 2),
    legacyType: 'result'
  },
  {
    id: 'own-goal',
    name: 'Own Goal Scored',
    description: 'Will there be an own goal',
    category: 'specials',
    isSelectable: true,
    i18nKey: generateI18nKey('specials', 3),
    legacyType: 'result'
  },
  {
    id: 'woodwork-hit',
    name: 'Woodwork Hit (Yes/No)',
    description: 'Ball hits post/crossbar',
    category: 'specials',
    isSelectable: true,
    i18nKey: generateI18nKey('specials', 4),
    legacyType: 'result'
  },
  {
    id: 'var-intervention',
    name: 'VAR Intervention to Change Decision',
    description: 'VAR changes referee decision',
    category: 'specials',
    isSelectable: true,
    i18nKey: generateI18nKey('specials', 5),
    legacyType: 'result'
  },
  {
    id: 'penalty-save',
    name: 'Goalkeeper to Save a Penalty',
    description: 'GK saves penalty kick',
    category: 'specials',
    isSelectable: true,
    i18nKey: generateI18nKey('specials', 6),
    legacyType: 'result'
  },
  {
    id: 'shirt-number',
    name: 'Shirt Number of First Goalscorer (Over/Under)',
    description: 'Jersey number of first scorer',
    category: 'specials',
    isSelectable: true,
    i18nKey: generateI18nKey('specials', 7),
    legacyType: 'scorer'
  },
  {
    id: 'manager-booking',
    name: 'Manager Booking / Dismissal',
    description: 'Manager receives card',
    category: 'specials',
    isSelectable: true,
    i18nKey: generateI18nKey('specials', 8),
    legacyType: 'result'
  },

  // 9. Long-Term / Outright Bets
  {
    id: 'league-winner',
    name: 'League Winner',
    description: 'Which team wins the league',
    category: 'outright',
    isSelectable: true,
    i18nKey: generateI18nKey('outright', 1),
    legacyType: 'result'
  },
  {
    id: 'top-4-finish',
    name: 'Top 4 / Top 6 Finish',
    description: 'Team finishes in top positions',
    category: 'outright',
    isSelectable: true,
    i18nKey: generateI18nKey('outright', 2),
    legacyType: 'result'
  },
  {
    id: 'relegation',
    name: 'Relegation / Promotion',
    description: 'Team relegated or promoted',
    category: 'outright',
    isSelectable: true,
    i18nKey: generateI18nKey('outright', 3),
    legacyType: 'result'
  },
  {
    id: 'golden-boot',
    name: 'Golden Boot (Top Scorer)',
    description: 'League top scorer',
    category: 'outright',
    isSelectable: true,
    i18nKey: generateI18nKey('outright', 4),
    legacyType: 'scorer'
  },
  {
    id: 'player-tournament',
    name: 'Player of the Tournament / Season',
    description: 'Best player award',
    category: 'outright',
    isSelectable: true,
    i18nKey: generateI18nKey('outright', 5),
    legacyType: 'scorer'
  },
  {
    id: 'reach-final',
    name: 'To Reach Final / Semi-Final / Quarter-Final',
    description: 'Tournament progression',
    category: 'outright',
    isSelectable: true,
    i18nKey: generateI18nKey('outright', 6),
    legacyType: 'result'
  },
  {
    id: 'group-winner',
    name: 'Group Winner',
    description: 'Wins group stage',
    category: 'outright',
    isSelectable: true,
    i18nKey: generateI18nKey('outright', 7),
    legacyType: 'result'
  },
  {
    id: 'elimination-stage',
    name: 'Stage of Elimination',
    description: 'How far team progresses',
    category: 'outright',
    isSelectable: true,
    i18nKey: generateI18nKey('outright', 8),
    legacyType: 'result'
  },
  {
    id: 'top-assisting',
    name: 'Top Assisting Player / Clean Sheets',
    description: 'Most assists or clean sheets',
    category: 'outright',
    isSelectable: true,
    i18nKey: generateI18nKey('outright', 9),
    legacyType: 'scorer'
  },

  // 10. Advanced / Niche Markets
  {
    id: 'team-offsides',
    name: 'Team Offsides (Over/Under)',
    description: 'Offside statistics',
    category: 'advanced',
    isSelectable: true,
    i18nKey: generateI18nKey('advanced', 1),
    legacyType: 'over_under'
  },
  {
    id: 'team-fouls',
    name: 'Team Fouls Committed (Over/Under)',
    description: 'Foul statistics',
    category: 'advanced',
    isSelectable: true,
    i18nKey: generateI18nKey('advanced', 2),
    legacyType: 'over_under'
  },
  {
    id: 'expected-goals',
    name: 'Player xG (expected goals) Based Bets',
    description: 'Expected goals statistics',
    category: 'advanced',
    isSelectable: true,
    i18nKey: generateI18nKey('advanced', 3),
    legacyType: 'over_under'
  },
  {
    id: 'set-piece-first',
    name: 'First Throw-in / Goal Kick / Free Kick',
    description: 'First set piece event',
    category: 'advanced',
    isSelectable: true,
    i18nKey: generateI18nKey('advanced', 4),
    legacyType: 'result'
  },
  {
    id: 'extra-time',
    name: 'Match to Go to Extra Time / Penalties',
    description: 'For cup matches',
    category: 'advanced',
    isSelectable: true,
    i18nKey: generateI18nKey('advanced', 5),
    legacyType: 'result'
  },
  {
    id: 'golden-goal',
    name: 'Golden Goal (Extra Time)',
    description: 'First goal in extra time',
    category: 'advanced',
    isSelectable: true,
    i18nKey: generateI18nKey('advanced', 6),
    legacyType: 'result'
  },
  {
    id: 'to-qualify',
    name: 'To Qualify / Advance to Next Round',
    description: 'Progression over two legs',
    category: 'advanced',
    isSelectable: true,
    i18nKey: generateI18nKey('advanced', 7),
    legacyType: 'result'
  },
  {
    id: 'penalties-decided',
    name: 'Match Result Decided by Penalties',
    description: 'Match goes to penalty shootout',
    category: 'advanced',
    isSelectable: true,
    i18nKey: generateI18nKey('advanced', 8),
    legacyType: 'result'
  }
];

/**
 * Complete list of all bet dropdown items (categories + types)
 */
export const ALL_BET_DROPDOWN_ITEMS: BetDropdownItem[] = [
  ...BET_CATEGORIES,
  ...BET_TYPES
];

/**
 * Get bet types for a specific category
 */
export const getBetTypesForCategory = (categoryId: string): BetTypeOption[] => {
  return BET_TYPES.filter(betType => betType.category === categoryId);
};

/**
 * Get category by ID
 */
export const getCategoryById = (categoryId: string): BetCategory | undefined => {
  return BET_CATEGORIES.find(category => category.id === categoryId);
};

/**
 * Get bet type by ID
 */
export const getBetTypeById = (betTypeId: string): BetTypeOption | undefined => {
  return BET_TYPES.find(betType => betType.id === betTypeId);
};

/**
 * Search bet types by query string
 */
export const searchBetTypes = (query: string): BetTypeOption[] => {
  if (!query.trim()) return BET_TYPES;

  const lowercaseQuery = query.toLowerCase();
  return BET_TYPES.filter(betType =>
    betType.name.toLowerCase().includes(lowercaseQuery) ||
    betType.description.toLowerCase().includes(lowercaseQuery)
  );
};

/**
 * Convert legacy bet type to new format (for backward compatibility)
 */
export const convertLegacyBetType = (legacyType: string): BetTypeOption | undefined => {
  return BET_TYPES.find(betType => betType.legacyType === legacyType);
};
