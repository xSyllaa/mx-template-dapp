import { useEffect, useState } from 'react';

// État global pour synchroniser les hooks d'authentification
let globalAuthState = {
  isAuthenticated: false,
  isLoading: false,
  hasSigned: false,
  error: null as string | null
};

// Listeners pour notifier les changements
const listeners = new Set<() => void>();

export const useSupabaseAuthSync = () => {
  const [state, setState] = useState(globalAuthState);

  useEffect(() => {
    const updateState = () => setState({ ...globalAuthState });
    
    listeners.add(updateState);
    
    return () => {
      listeners.delete(updateState);
    };
  }, []);

  const updateGlobalState = (newState: Partial<typeof globalAuthState>) => {
    globalAuthState = { ...globalAuthState, ...newState };
    listeners.forEach(listener => listener());
  };

  return {
    ...state,
    updateGlobalState
  };
};
