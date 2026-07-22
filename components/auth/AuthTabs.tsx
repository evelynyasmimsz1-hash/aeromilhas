"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export function AuthTabs() {
  const pathname = usePathname();

  const tabs = [
    { label: "Entrar", href: "/entrar" },
    { label: "Criar conta", href: "/assinatura" },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-bg p-1">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-lg py-2 text-center text-sm font-medium transition-colors",
              active ? "bg-surface text-primary shadow-sm" : "text-ink-secondary",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
