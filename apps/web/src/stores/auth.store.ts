import { create } from "zustand";
import type { Role } from "@app/shared";

export type UserRole = Role;

export interface UserProfile {
  name: string;
  role: UserRole;
  restaurantId: string;
}

export interface AuthState {
  // In-memory only (never stored in localStorage as per PERFORMANCE.md and Section 10.3)
  accessToken: string | null;
  user: UserProfile | null;
  setAuth: (token: string, user: UserProfile) => void;
  clearAuth: () => void;
  setRole: (role: UserRole) => void;
}

// Initial placeholder user for testing (matches Figure 1 Ali Raza / Owner)
const PLACEHOLDER_USER: UserProfile = {
  name: "Ali Raza",
  role: "owner",
  restaurantId: "rest-001",
};

export const useAuth = create<AuthState>()((set) => ({
  accessToken: "mock-placeholder-access-token",
  user: PLACEHOLDER_USER,
  setAuth: (accessToken, user) => set({ accessToken, user }),
  clearAuth: () => set({ accessToken: null, user: null }),
  setRole: (role) =>
    set((state) => ({
      user: state.user ? { ...state.user, role } : { name: "Test User", role, restaurantId: "rest-001" },
    })),
}));
