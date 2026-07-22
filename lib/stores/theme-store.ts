"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeMode } from "@/types";

type ThemeState = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),
    }),
    { name: "aeromilhas-theme" },
  ),
);
