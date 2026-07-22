"use client";

import { create } from "zustand";
import type { MilesProgram } from "@/types";
import * as programsService from "@/lib/services/programs";

type ProgramsState = {
  programs: MilesProgram[];
  loaded: boolean;
  fetchPrograms: () => Promise<void>;
  addProgram: (program: Omit<MilesProgram, "id" | "lastUpdatedAt">) => Promise<void>;
  updateProgram: (id: string, updates: Partial<MilesProgram>) => Promise<void>;
  removeProgram: (id: string) => Promise<void>;
  refreshBalances: () => Promise<void>;
  reset: () => void;
};

export const useProgramsStore = create<ProgramsState>()((set, get) => ({
  programs: [],
  loaded: false,

  fetchPrograms: async () => {
    const programs = await programsService.getPrograms();
    set({ programs, loaded: true });
  },

  addProgram: async (program) => {
    const created = await programsService.addProgram(program);
    set((state) => ({ programs: [...state.programs, created] }));
  },

  updateProgram: async (id, updates) => {
    const updated = await programsService.updateProgram(id, updates);
    set((state) => ({
      programs: state.programs.map((program) => (program.id === id ? updated : program)),
    }));
  },

  removeProgram: async (id) => {
    await programsService.removeProgram(id);
    set((state) => ({ programs: state.programs.filter((program) => program.id !== id) }));
  },

  refreshBalances: async () => {
    await get().fetchPrograms();
  },

  reset: () => set({ programs: [], loaded: false }),
}));
