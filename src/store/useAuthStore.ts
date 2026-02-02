import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  _hasHydrated: boolean; // 하이드레이션 완료 여부 추가
  setHasHydrated: (state: boolean) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      _hasHydrated: false, // 초기값 false
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      login: (token, user) => set({ token, user, isLoggedIn: true }),
      logout: () => set({ token: null, user: null, isLoggedIn: false }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        // 스토어가 로컬스토리지와 동기화된 직후 실행
        state?.setHasHydrated(true);
      },
    },
  ),
);
