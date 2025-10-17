// Types
export type {
  Prediction,
  UserPrediction,
  PredictionOption,
  PredictionStatus,
  BetType,
  BetCalculationType,
  CreatePredictionData,
  UpdatePredictionData,
  ValidateResultResponse,
  PredictionWithParticipation,
  PredictionStats,
  PredictionOptionStats
} from './types';

// Hooks
export { usePredictions } from './hooks/usePredictions';
export type { PredictionFilter } from './hooks/usePredictions';
export { useUserPrediction } from './hooks/useUserPrediction';
export { useUserPoints } from './hooks/useUserPoints';
export { usePredictionStats } from './hooks/usePredictionStats';

// Components
export { PredictionCard } from './components/PredictionCard';
export { PredictionList } from './components/PredictionList';
export { ParticipationBadge } from './components/ParticipationBadge';
export { BetAmountInput } from './components/BetAmountInput';
export { PredictionStatsDisplay } from './components/PredictionStatsDisplay';

// Services (for admin use)
export * as predictionService from './services/predictionService';
export * as predictionStatsService from './services/predictionStatsService';

