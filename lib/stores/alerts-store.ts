"use client";

import { create } from "zustand";
import type { MilesAlert } from "@/types";
import * as alertsService from "@/lib/services/alerts";

type AlertsState = {
  alerts: MilesAlert[];
  loaded: boolean;
  fetchAlerts: () => Promise<void>;
  addAlert: (alert: Omit<MilesAlert, "id" | "status">) => Promise<void>;
  updateAlert: (id: string, updates: Partial<MilesAlert>) => Promise<void>;
  setStatus: (id: string, status: MilesAlert["status"]) => Promise<void>;
  removeAlert: (id: string) => Promise<void>;
  reset: () => void;
};

export const useAlertsStore = create<AlertsState>()((set) => ({
  alerts: [],
  loaded: false,

  fetchAlerts: async () => {
    const alerts = await alertsService.getAlerts();
    set({ alerts, loaded: true });
  },

  addAlert: async (alert) => {
    const created = await alertsService.addAlert(alert);
    set((state) => ({ alerts: [created, ...state.alerts] }));
  },

  updateAlert: async (id, updates) => {
    const updated = await alertsService.updateAlert(id, updates);
    set((state) => ({
      alerts: state.alerts.map((alert) => (alert.id === id ? updated : alert)),
    }));
  },

  setStatus: async (id, status) => {
    const updated = await alertsService.updateAlert(id, { status });
    set((state) => ({
      alerts: state.alerts.map((alert) => (alert.id === id ? updated : alert)),
    }));
  },

  removeAlert: async (id) => {
    await alertsService.removeAlert(id);
    set((state) => ({ alerts: state.alerts.filter((alert) => alert.id !== id) }));
  },

  reset: () => set({ alerts: [], loaded: false }),
}));
