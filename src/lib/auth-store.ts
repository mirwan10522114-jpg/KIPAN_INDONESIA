"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================================
// AUTH STORE — Admin authentication
// ============================================================

// Default admin credentials (production should use hashed password + DB)
export const ADMIN_CREDENTIALS = [
  { username: "superadmin", password: "123", displayName: "Super Admin", role: "SUPER_ADMIN", wilayah: "Nasional" },
  { username: "nasional", password: "123", displayName: "Admin Nasional", role: "ADMIN_NASIONAL", wilayah: "Nasional" },
  { username: "provinsi", password: "123", displayName: "Admin Provinsi", role: "ADMIN_PROVINSI", wilayah: "Jawa Barat" },
  { username: "kabupaten", password: "123", displayName: "Admin Kab/Kota", role: "ADMIN_KABUPATEN", wilayah: "Kab. Bandung" },
];

interface AuthState {
  isAuthenticated: boolean;
  id: string | null;
  username: string | null;
  displayName: string | null;
  role: string | null;
  wilayah: string | null;
  loginAt: number | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  setAuthData: (data: Partial<AuthState>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      id: null,
      username: null,
      displayName: null,
      role: null,
      wilayah: null,
      loginAt: null,
      login: (username: string, password: string) => {
        const user = ADMIN_CREDENTIALS.find(
          (u) => u.username === username.trim() && u.password === password
        );
        if (user) {
          set({
            isAuthenticated: true,
            id: user.id || "dummy-id",
            username: user.username,
            displayName: user.displayName,
            role: user.role,
            wilayah: user.wilayah,
            loginAt: Date.now(),
          });
          return true;
        }
        return false;
      },
      setAuthData: (data: Partial<AuthState>) => {
        set({ ...data, isAuthenticated: true, loginAt: Date.now() });
      },
      logout: () => {
        set({ isAuthenticated: false, id: null, username: null, displayName: null, role: null, wilayah: null, loginAt: null });
      },
    }),
    {
      name: "dpp-admin-auth",
    }
  )
);
