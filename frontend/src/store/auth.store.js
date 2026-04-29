import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),
      updateUser: (user) => set({ user }),
    }),
    { name: 'trackr-auth', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
);
