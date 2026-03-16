import { create } from 'zustand';
import type { AuthUser } from '@pearl/common';

interface AuthState {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setCurrentUser: (user: AuthUser | null) => void;
  clearCurrentUser: () => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,

  setCurrentUser: (user) =>
    set({ currentUser: user, isAuthenticated: user !== null }),

  clearCurrentUser: () =>
    set({ currentUser: null, isAuthenticated: false }),

  setIsLoading: (loading) =>
    set({ isLoading: loading }),
}));
