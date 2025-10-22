import { useState, useMemo } from 'react';
import type { Prediction, BetType, BetCalculationType, PredictionStatus } from '../types';

export interface PredictionFilters {
  betTypes: string[]; // Changed to string[] to support extended_bet_type
  calculationType: BetCalculationType | 'all';
  competitions: string[];
  statuses: PredictionStatus[];
}

const defaultFilters: PredictionFilters = {
  betTypes: [],
  calculationType: 'all',
  competitions: [],
  statuses: ['open', 'closed']  // Include both open and closed by default
};

export const usePredictionFilters = (predictions: Prediction[]) => {
  const [filters, setFilters] = useState<PredictionFilters>(defaultFilters);

  // Get unique competitions from predictions
  const availableCompetitions = useMemo(() => {
    const comps = new Set(predictions.map(p => p.competition));
    return Array.from(comps).sort();
  }, [predictions]);

  // Get unique bet types from predictions (using extended_bet_type)
  const availableBetTypes = useMemo(() => {
    const types = new Set(predictions.map(p => p.extended_bet_type || p.bet_type));
    return Array.from(types).filter(Boolean); // Filter out null/undefined values
  }, [predictions]);

  // Filter predictions based on current filters
  const filteredPredictions = useMemo(() => {
    return predictions.filter(prediction => {
      // Filter by bet type (using extended_bet_type)
      const predictionBetType = prediction.extended_bet_type || prediction.bet_type;
      if (filters.betTypes.length > 0 && !filters.betTypes.includes(predictionBetType)) {
        return false;
      }

      // Filter by calculation type
      if (
        filters.calculationType !== 'all' &&
        prediction.bet_calculation_type !== filters.calculationType
      ) {
        return false;
      }

      // Filter by competition
      if (
        filters.competitions.length > 0 &&
        !filters.competitions.includes(prediction.competition)
      ) {
        return false;
      }

      // Filter by status
      if (filters.statuses.length > 0 && !filters.statuses.includes(prediction.status)) {
        return false;
      }

      return true;
    });
  }, [predictions, filters]);

  // Toggle bet type filter
  const toggleBetType = (betType: string) => {
    setFilters(prev => ({
      ...prev,
      betTypes: prev.betTypes.includes(betType)
        ? prev.betTypes.filter(t => t !== betType)
        : [...prev.betTypes, betType]
    }));
  };

  // Set calculation type filter
  const setCalculationType = (calculationType: BetCalculationType | 'all') => {
    setFilters(prev => ({ ...prev, calculationType }));
  };

  // Toggle competition filter
  const toggleCompetition = (competition: string) => {
    setFilters(prev => ({
      ...prev,
      competitions: prev.competitions.includes(competition)
        ? prev.competitions.filter(c => c !== competition)
        : [...prev.competitions, competition]
    }));
  };

  // Toggle status filter
  const toggleStatus = (status: PredictionStatus) => {
    setFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status]
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.betTypes.length > 0 ||
      filters.calculationType !== 'all' ||
      filters.competitions.length > 0 ||
      (filters.statuses.length !== 1 || filters.statuses[0] !== 'open')
    );
  }, [filters]);

  return {
    filters,
    filteredPredictions,
    availableCompetitions,
    availableBetTypes,
    toggleBetType,
    setCalculationType,
    toggleCompetition,
    toggleStatus,
    clearFilters,
    hasActiveFilters
  };
};

