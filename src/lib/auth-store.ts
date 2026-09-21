"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================================
// AUTH STORE — Admin authentication
// ============================================================

interface AuthState {
  isAuthenticated: boolean;
  id: string | null;
  username: string | null;
  displayName: string | null;
  role: string | null;
  wilayah: string | null;
  provinsiId: number | null;
  kabupatenId: number | null;
  loginAt: number | null;
  logout: () => void;
  setAuthData: (data: Partial<AuthState>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      id: null,
      username: null,
      displayName: null,
      role: null,
      wilayah: null,
      provinsiId: null,
      kabupatenId: null,
      loginAt: null,
      setAuthData: (data: Partial<AuthState>) => {
        set({ ...data, isAuthenticated: true, loginAt: Date.now() });
      },
      logout: () => {
        set({
          isAuthenticated: false,
          id: null,
          username: null,
          displayName: null,
          role: null,
          wilayah: null,
          provinsiId: null,
          kabupatenId: null,
          loginAt: null,
        });
      },
    }),
    {
      name: "dpp-admin-auth",
    }
  )
);
