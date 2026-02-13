import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState } from "@/types";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      _hasHydrated: false,
      setAuth: (user, token) => set({ user, token, isLoggedIn: !!token }),
      clearAuth: () => set({ user: null, token: null, isLoggedIn: false }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
