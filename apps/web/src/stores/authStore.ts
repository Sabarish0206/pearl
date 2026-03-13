import { create } from 'zustand';
import type { AuthUser } from '@pearl/common';

interface AuthState {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  setCurrentUser: (user: AuthUser | null) => void;
  clearCurrentUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isAuthenticated: false,

  setCurrentUser: (user) =>
    set({ currentUser: user, isAuthenticated: user !== null }),

  clearCurrentUser: () =>
    set({ currentUser: null, isAuthenticated: false }),
}));
