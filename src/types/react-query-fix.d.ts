/**
 * Type fix for @tanstack/react-query compatibility with React 18
 * 
 * This resolves the conflict between @types/react@18 and @types/react-dom@19
 */
import '@tanstack/react-query';

declare module '@tanstack/react-query' {
  import type { ReactNode } from 'react';
  
  interface QueryClientProviderProps {
    client: any;
    children?: ReactNode;
  }
}

