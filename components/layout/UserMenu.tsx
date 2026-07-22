"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/lib/stores/auth-store";
import { logOut } from "@/lib/auth";
import { userInitials } from "@/data/mock-user";

export function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu do usuário"
        className="flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <Avatar initials={userInitials(user.name)} size="sm" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-border bg-surface p-2 shadow-lg"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-secondary">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-border" />
          <Link
            href="/dashboard/perfil"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-secondary hover:bg-bg hover:text-ink"
          >
            <User className="h-4 w-4" aria-hidden />
            Perfil
          </Link>
          <Link
            href="/dashboard/configuracoes"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-secondary hover:bg-bg hover:text-ink"
          >
            <Settings className="h-4 w-4" aria-hidden />
            Configurações
          </Link>
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await logOut();
              router.push("/entrar");
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-danger hover:bg-danger-surface"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sair da conta
          </button>
        </div>
      )}
    </div>
  );
}
