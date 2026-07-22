import Link from "next/link";
import { Bell, Plane, RefreshCcw, Timer } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatRelativeTime } from "@/lib/utils/format";
import type { AppNotification } from "@/types";

const iconByType = {
  offer: Plane,
  expiration: Timer,
  transfer: RefreshCcw,
  balance: Bell,
};

export function NotificationItem({
  notification,
  onRead,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
}) {
  const Icon = iconByType[notification.type];

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl px-3 py-3.5 transition-colors",
        !notification.read && "bg-surface-blue",
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-primary">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{notification.title}</p>
        <p className="mt-0.5 text-sm text-ink-secondary">{notification.description}</p>
        <p className="mt-1 text-xs text-ink-muted">{formatRelativeTime(notification.createdAt)}</p>
      </div>
      {!notification.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />}
    </div>
  );

  if (notification.href) {
    return (
      <Link href={notification.href} onClick={() => onRead(notification.id)}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className="w-full text-left" onClick={() => onRead(notification.id)}>
      {content}
    </button>
  );
}
