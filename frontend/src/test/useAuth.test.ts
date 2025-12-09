import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/api/mockApi';

// Mock the API
vi.mock('@/api/mockApi', () => ({
  api: {
    auth: {
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
    },
  },
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.auth.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      success: true,
      error: null,
    });
  });

  describe('initialization', () => {
    it('should start with loading state', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
    });

    it('should check for existing session on mount', async () => {
      renderHook(() => useAuth());

      await waitFor(() => {
        expect(api.auth.getCurrentUser).toHaveBeenCalled();
      });
    });

    it('should set authenticated state if user exists', async () => {
      const mockUser = { id: '1', username: 'TestUser', email: 'test@example.com' };
      (api.auth.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockUser,
        success: true,
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toEqual(mockUser);
      });
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Wait for initial check to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should update state on successful login', async () => {
      const mockUser = { id: '1', username: 'TestUser', email: 'test@example.com' };
      (api.auth.login as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockUser,
        success: true,
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult: { success: boolean; error?: string };
      await act(async () => {
        loginResult = await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      expect(loginResult!.success).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should return error on failed login', async () => {
      (api.auth.login as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        success: false,
        error: 'Invalid credentials',
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult: { success: boolean; error?: string };
      await act(async () => {
        loginResult = await result.current.login({
          email: 'test@example.com',
          password: 'wrong',
        });
      });

      expect(loginResult!.success).toBe(false);
      expect(loginResult!.error).toBe('Invalid credentials');
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('signup', () => {
    beforeEach(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should update state on successful signup', async () => {
      const mockUser = { id: '1', username: 'NewUser', email: 'new@example.com' };
      (api.auth.signup as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockUser,
        success: true,
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let signupResult: { success: boolean; error?: string };
      await act(async () => {
        signupResult = await result.current.signup({
          username: 'NewUser',
          email: 'new@example.com',
          password: 'password123',
        });
      });

      expect(signupResult!.success).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should return error on failed signup', async () => {
      (api.auth.signup as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        success: false,
        error: 'Email already registered',
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let signupResult: { success: boolean; error?: string };
      await act(async () => {
        signupResult = await result.current.signup({
          username: 'NewUser',
          email: 'existing@example.com',
          password: 'password123',
        });
      });

      expect(signupResult!.success).toBe(false);
      expect(signupResult!.error).toBe('Email already registered');
    });
  });

  describe('logout', () => {
    it('should clear auth state on logout', async () => {
      const mockUser = { id: '1', username: 'TestUser', email: 'test@example.com' };
      (api.auth.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockUser,
        success: true,
        error: null,
      });
      (api.auth.logout as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        success: true,
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });
});
