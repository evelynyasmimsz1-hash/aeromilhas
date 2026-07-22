"use client";

import { create } from "zustand";
import type { UserProfile } from "@/types";

type AuthState = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
};

/**
 * Espelha a sessão real do Supabase Auth. Quem escreve aqui é o AuthProvider
 * (via onAuthStateChange) — as demais telas só leem esse estado e chamam as
 * funções de lib/auth.ts para efetivamente entrar, sair, cadastrar etc.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: Boolean(user), isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
