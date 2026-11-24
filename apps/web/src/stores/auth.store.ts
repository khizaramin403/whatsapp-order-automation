import { create } from "zustand";
import type { Role, SupportedLanguage } from "@app/shared";

export type UserRole = Role;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  language: SupportedLanguage;
  avatar_key?: string | null;
  restaurantId: string | null;
  restaurant?: {
    id: string;
    name: string;
  } | null;
}

export interface AuthState {
  // In-memory only (never stored in localStorage as per PERFORMANCE.md and Section 10.3)
  accessToken: string | null;
  user: UserProfile | null;
  isInitialized: boolean;
  setAuth: (token: string, user: UserProfile) => void;
  setAccessToken: (token: string | null) => void;
  setUserLanguage: (language: SupportedLanguage) => void;
  setInitialized: (initialized: boolean) => void;
  clearAuth: () => void;
}

export const useAuth = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  isInitialized: false,
  setAuth: (accessToken, user) =>
    set({ accessToken, user, isInitialized: true }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setUserLanguage: (language) =>
    set((state) => ({
      user: state.user ? { ...state.user, language } : null,
    })),
  setInitialized: (isInitialized) => set({ isInitialized }),
  clearAuth: () => set({ accessToken: null, user: null, isInitialized: true }),
}));
