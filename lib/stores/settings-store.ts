"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeMode } from "@/types";

type ToggleKey =
  | "emailNotifications"
  | "pushNotifications"
  | "offerAlerts"
  | "expirationAlerts"
  | "transferPromotions";

type SettingsState = {
  theme: ThemeMode;
  emailNotifications: boolean;
  pushNotifications: boolean;
  offerAlerts: boolean;
  expirationAlerts: boolean;
  transferPromotions: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggle: (key: ToggleKey) => void;
  setValues: (values: Partial<Record<ToggleKey, boolean>>) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      emailNotifications: true,
      pushNotifications: true,
      offerAlerts: true,
      expirationAlerts: true,
      transferPromotions: false,

      setTheme: (theme) => set({ theme }),

      toggle: (key) => set((state) => ({ [key]: !state[key] }) as Partial<SettingsState>),

      setValues: (values) => set(values),
    }),
    { name: "aeromilhas-settings" },
  ),
);
