// Types
export type {
  Prediction,
  UserPrediction,
  PredictionOption,
  PredictionStatus,
  BetType,
  CreatePredictionData,
  UpdatePredictionData,
  ValidateResultResponse,
  PredictionWithParticipation
} from './types';

// Hooks
export { usePredictions } from './hooks/usePredictions';
export type { PredictionFilter } from './hooks/usePredictions';
export { useUserPrediction } from './hooks/useUserPrediction';

// Components
export { PredictionCard } from './components/PredictionCard';
export { PredictionList } from './components/PredictionList';
export { ParticipationBadge } from './components/ParticipationBadge';

// Services (for admin use)
export * as predictionService from './services/predictionService';

