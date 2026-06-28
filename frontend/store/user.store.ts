/**
 * Authentication Store (Zustand)
 *
 * Tokens are managed entirely by httpOnly cookies (set by the backend).
 * Only non-sensitive user info (name, email, role) is persisted in localStorage.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthStore, User } from '@/features/auth/types/auth.types';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setAuth: (user: User) => {
        // Tokens live in httpOnly cookies — never stored client-side
        set({
          user,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setTokens: (_accessToken: string, _refreshToken: string) => {
        // Tokens are managed by httpOnly cookies — no-op here
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist user profile info — tokens live in httpOnly cookies
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper functions to access store outside components
export const getAuthState = () => useAuthStore.getState();
export const isAuthenticated = () => useAuthStore.getState().isAuthenticated;
export const getUser = () => useAuthStore.getState().user;
// Token helpers kept for interface compatibility — tokens are in cookies now
export const getAccessToken = () => null;
export const getRefreshToken = () => null;
