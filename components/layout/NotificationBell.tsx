"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotificationsStore } from "@/lib/stores/notifications-store";

export function NotificationBell() {
  const unreadCount = useNotificationsStore(
    (state) => state.notifications.filter((notification) => !notification.read).length,
  );

  return (
    <Link
      href="/dashboard/notificacoes"
      aria-label={`Notificações${unreadCount > 0 ? `, ${unreadCount} não lidas` : ""}`}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-ink-secondary transition-colors hover:text-ink"
    >
      <Bell className="h-5 w-5" aria-hidden />
      {unreadCount > 0 && (
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" aria-hidden />
      )}
    </Link>
  );
}
