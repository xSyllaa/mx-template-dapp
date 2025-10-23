/**
 * API Client for GalacticX Backend
 * Handles HTTP requests with JWT authentication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Get the JWT token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

/**
 * Generic API client with automatic JWT injection
 * @param endpoint - API endpoint (e.g., '/auth/login')
 * @param options - Fetch options
 * @returns Promise with typed response data
 */
export const apiClient = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Parse response body
    const data = await response.json();

    // Handle error responses
    if (!response.ok) {
      const errorMessage = data.error || data.message || 'API Error';
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // Network errors or JSON parsing errors
    if (error instanceof Error) {
      console.error(`[API Client] Error calling ${endpoint}:`, error.message);
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
};

/**
 * API Error class for typed error handling
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

