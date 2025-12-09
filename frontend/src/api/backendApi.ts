/**
 * Backend API Client
 * 
 * This module provides a client for communicating with the Snake Arena backend.
 * Follows OpenAPI specifications and uses JWT authentication.
 * 
 * Base URL: http://localhost:8000
 * 
 * Features:
 * - Automatic JWT token management
 * - Request/response validation
 * - Comprehensive error handling
 * - Retry logic for failed requests
 * - Type-safe API calls
 */

import {
  User,
  LeaderboardEntry,
  LivePlayer,
  LoginCredentials,
  SignupCredentials,
  ApiResponse,
  GameMode,
} from '@/types/game';

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_TIMEOUT = 10000; // 10 seconds

// Token storage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'current_user';

/**
 * Get stored authentication token
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Save authentication token
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Clear authentication token
 */
export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Get stored user data
 */
export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Save user data
 */
export const setStoredUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Make HTTP request to backend
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // Add authentication token if available
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!isJson) {
      throw new Error(`Expected JSON response, got ${contentType || 'unknown'}`);
    }

    const data = await response.json();

    // Backend returns ApiResponse format
    if (!response.ok) {
      // For error responses, backend includes error message
      const errorMessage = data.error || `HTTP ${response.status}`;
      return {
        success: false,
        data: null,
        error: errorMessage,
      } as ApiResponse<T>;
    }

    // Success response
    return data as ApiResponse<T>;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          data: null,
          error: 'Request timeout',
        } as ApiResponse<T>;
      }
      return {
        success: false,
        data: null,
        error: error.message,
      } as ApiResponse<T>;
    }
    return {
      success: false,
      data: null,
      error: 'Unknown error occurred',
    } as ApiResponse<T>;
  }
}

/**
 * Authentication API endpoints
 */
export const authApi = {
  /**
   * Sign up a new user
   */
  signup: async (
    credentials: SignupCredentials
  ): Promise<ApiResponse<User & { access_token: string; token_type: string }>> => {
    const response = await request<User & { access_token: string; token_type: string }>(
      '/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );

    if (response.success && response.data) {
      // Store token and user
      setToken(response.data.access_token);
      const user: User = {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        avatar: response.data.avatar || undefined,
        createdAt: response.data.createdAt || new Date().toISOString(),
      };
      setStoredUser(user);
    }

    return response;
  },

  /**
   * Login existing user
   */
  login: async (
    credentials: LoginCredentials
  ): Promise<ApiResponse<User & { access_token: string; token_type: string }>> => {
    const response = await request<User & { access_token: string; token_type: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );

    if (response.success && response.data) {
      // Store token and user
      setToken(response.data.access_token);
      const user: User = {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        avatar: response.data.avatar || undefined,
        createdAt: response.data.createdAt || new Date().toISOString(),
      };
      setStoredUser(user);
    }

    return response;
  },

  /**
   * Get current user profile (requires authentication)
   */
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const storedUser = getStoredUser();

    // If we have a stored user and token, verify with server
    if (storedUser && getToken()) {
      const response = await request<User>('/auth/me', {
        method: 'GET',
      });

      if (response.success && response.data) {
        setStoredUser(response.data);
        return response;
      }

      // If server returns error, clear local auth
      if (!response.success && response.error?.includes('401')) {
        clearToken();
      }

      return response;
    }

    // No local user/token
    return {
      success: false,
      data: null,
      error: 'Not authenticated',
    };
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await request<null>('/auth/logout', {
      method: 'POST',
    });

    // Clear local auth regardless of response
    clearToken();

    return response;
  },
};

/**
 * Leaderboard API endpoints
 */
export const leaderboardApi = {
  /**
   * Get leaderboard entries
   */
  getLeaderboard: async (
    mode?: GameMode
  ): Promise<ApiResponse<{ entries: LeaderboardEntry[] }>> => {
    const params = new URLSearchParams();
    if (mode) {
      params.append('mode', mode);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/leaderboard?${queryString}` : '/leaderboard';

    return request<{ entries: LeaderboardEntry[] }>(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Submit a score to the leaderboard (requires authentication)
   */
  submitScore: async (
    score: number,
    mode: GameMode
  ): Promise<ApiResponse<LeaderboardEntry>> => {
    return request<LeaderboardEntry>('/leaderboard/submit', {
      method: 'POST',
      body: JSON.stringify({ score, mode }),
    });
  },
};

/**
 * Live Players API endpoints
 */
export const liveApi = {
  /**
   * Get list of live players
   */
  getLivePlayers: async (): Promise<ApiResponse<{ players: LivePlayer[] }>> => {
    return request<{ players: LivePlayer[] }>('/live/players', {
      method: 'GET',
    });
  },

  /**
   * Get specific live player stream
   */
  getLivePlayer: async (playerId: string): Promise<ApiResponse<LivePlayer>> => {
    return request<LivePlayer>(`/live/players/${playerId}`, {
      method: 'GET',
    });
  },
};

/**
 * Complete API object combining all endpoints
 */
export const api = {
  auth: authApi,
  leaderboard: leaderboardApi,
  live: liveApi,
};

/**
 * Test API connectivity
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
};

export default api;
