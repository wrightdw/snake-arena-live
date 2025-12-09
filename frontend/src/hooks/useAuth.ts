import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/mockApi';
import { AuthState, LoginCredentials, SignupCredentials, User } from '@/types/game';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const response = await api.auth.getCurrentUser();
      setAuthState({
        user: response.data,
        isAuthenticated: !!response.data,
        isLoading: false,
      });
    };
    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    const response = await api.auth.login(credentials);
    
    if (response.success && response.data) {
      setAuthState({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    }
    
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return { success: false, error: response.error || 'Login failed' };
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    const response = await api.auth.signup(credentials);
    
    if (response.success && response.data) {
      setAuthState({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    }
    
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return { success: false, error: response.error || 'Signup failed' };
  }, []);

  const logout = useCallback(async () => {
    await api.auth.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  return {
    ...authState,
    login,
    signup,
    logout,
  };
};
