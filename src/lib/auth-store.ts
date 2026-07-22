"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================================
// AUTH STORE — Admin authentication
// ============================================================

// Default admin credentials (production should use hashed password + DB)
export const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123",
  displayName: "Administrator",
};

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  loginAt: number | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      username: null,
      loginAt: null,
      login: (username: string, password: string) => {
        if (
          username.trim() === ADMIN_CREDENTIALS.username &&
          password === ADMIN_CREDENTIALS.password
        ) {
          set({
            isAuthenticated: true,
            username: username.trim(),
            loginAt: Date.now(),
          });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ isAuthenticated: false, username: null, loginAt: null });
      },
    }),
    {
      name: "dpp-admin-auth",
    }
  )
);
