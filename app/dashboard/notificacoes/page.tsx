"use client";

import { isToday, isThisWeek } from "date-fns";
import { BellOff } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { NotificationItem } from "@/components/shared/NotificationItem";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import type { AppNotification } from "@/types";

export default function NotificacoesPage() {
  const notifications = useNotificationsStore((state) => state.notifications);
  const loaded = useNotificationsStore((state) => state.loaded);
  const markRead = useNotificationsStore((state) => state.markRead);
  const markAllRead = useNotificationsStore((state) => state.markAllRead);

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const today = sorted.filter((item) => isToday(new Date(item.createdAt)));
  const thisWeek = sorted.filter(
    (item) => !isToday(new Date(item.createdAt)) && isThisWeek(new Date(item.createdAt)),
  );
  const older = sorted.filter(
    (item) => !isToday(new Date(item.createdAt)) && !isThisWeek(new Date(item.createdAt)),
  );

  const hasUnread = notifications.some((item) => !item.read);

  if (!loaded) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificações"
        description="Fique por dentro de ofertas, vencimentos e novidades."
        action={
          hasUnread ? (
            <Button variant="secondary" size="sm" onClick={markAllRead}>
              Marcar todas como lidas
            </Button>
          ) : undefined
        }
      />

      {sorted.length === 0 ? (
        <EmptyState icon={BellOff} title="Nenhuma notificação" description="Você está em dia." />
      ) : (
        <div className="space-y-6">
          <NotificationGroup title="Hoje" items={today} onRead={markRead} />
          <NotificationGroup title="Esta semana" items={thisWeek} onRead={markRead} />
          <NotificationGroup title="Anteriores" items={older} onRead={markRead} />
        </div>
      )}
    </div>
  );
}

function NotificationGroup({
  title,
  items,
  onRead,
}: {
  title: string;
  items: AppNotification[];
  onRead: (id: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">{title}</h2>
      <div className="mt-2 divide-y divide-border rounded-2xl border border-border bg-surface px-2">
        {items.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} onRead={onRead} />
        ))}
      </div>
    </section>
  );
}
