"use client";

import { create } from "zustand";
import type { AppNotification } from "@/types";
import * as notificationsService from "@/lib/services/notifications";

type NotificationsState = {
  notifications: AppNotification[];
  loaded: boolean;
  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  reset: () => void;
};

export const useNotificationsStore = create<NotificationsState>()((set) => ({
  notifications: [],
  loaded: false,

  fetchNotifications: async () => {
    const notifications = await notificationsService.getNotifications();
    set({ notifications, loaded: true });
  },

  markRead: async (id) => {
    await notificationsService.markNotificationRead(id);
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    }));
  },

  markAllRead: async () => {
    await notificationsService.markAllNotificationsRead();
    set((state) => ({
      notifications: state.notifications.map((notification) => ({ ...notification, read: true })),
    }));
  },

  reset: () => set({ notifications: [], loaded: false }),
}));
