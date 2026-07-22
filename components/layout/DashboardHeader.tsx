"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuthStore } from "@/lib/stores/auth-store";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function DashboardHeader() {
  const user = useAuthStore((state) => state.user);
  const firstName = user?.name.split(" ")[0] ?? "";
  const today = capitalize(format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR }));

  return (
    <header className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Olá, {firstName}
        </h1>
        <p className="text-sm text-ink-secondary">{today}</p>
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
