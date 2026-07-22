"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PricingPlan } from "@/types";

type OnboardingState = {
  name: string;
  selectedPlan: PricingPlan["id"] | null;
  hasPrograms: string | null;
  milesExpired: string | null;
  dreamDestinations: string[];
  setName: (name: string) => void;
  setSelectedPlan: (plan: PricingPlan["id"]) => void;
  setHasPrograms: (value: string) => void;
  setMilesExpired: (value: string) => void;
  toggleDreamDestination: (value: string) => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      name: "",
      selectedPlan: "lifetime",
      hasPrograms: null,
      milesExpired: null,
      dreamDestinations: [],

      setName: (name) => set({ name }),
      setSelectedPlan: (plan) => set({ selectedPlan: plan }),
      setHasPrograms: (value) => set({ hasPrograms: value }),
      setMilesExpired: (value) => set({ milesExpired: value }),
      toggleDreamDestination: (value) =>
        set((state) => ({
          dreamDestinations: state.dreamDestinations.includes(value)
            ? state.dreamDestinations.filter((item) => item !== value)
            : [...state.dreamDestinations, value],
        })),
    }),
    { name: "aeromilhas-onboarding" },
  ),
);
