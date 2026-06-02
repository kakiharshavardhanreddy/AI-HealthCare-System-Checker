"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { api } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { full_name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  setSession: (payload: { user: User; access_token: string; refresh_token: string }) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      setSession: (payload) =>
        set({
          user: payload.user,
          accessToken: payload.access_token,
          refreshToken: payload.refresh_token,
          isAuthenticated: true
        }),
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const result = await api.login({ email, password });
          get().setSession(result);
        } finally {
          set({ isLoading: false });
        }
      },
      register: async (payload) => {
        set({ isLoading: true });
        try {
          const result = await api.register(payload);
          get().setSession(result);
        } finally {
          set({ isLoading: false });
        }
      },
      logout: async () => {
        const token = get().accessToken;
        if (token) await api.logout(token).catch(() => undefined);
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      }
    }),
    { name: "healthai-auth" }
  )
);
