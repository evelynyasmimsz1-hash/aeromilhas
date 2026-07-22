"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileNavItems } from "./nav-items";
import { cn } from "@/lib/utils/cn";

export function MobileBottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Navegação principal"
    >
      <div className="mx-auto flex max-w-md items-center justify-between px-2">
        {mobileNavItems.map((item, index) => {
          const active = isActive(item.href);
          const isCenter = index === 2;

          if (isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                className="flex flex-1 flex-col items-center justify-center py-2"
              >
                <span
                  className={cn(
                    "-mt-5 flex h-[52px] w-[52px] items-center justify-center rounded-full shadow-md shadow-primary/30 transition-colors",
                    active ? "bg-primary-hover" : "bg-primary",
                  )}
                >
                  <item.icon className="h-[22px] w-[22px] text-white" aria-hidden />
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium"
            >
              <item.icon
                className={cn("h-5 w-5", active ? "text-primary" : "text-ink-muted")}
                aria-hidden
              />
              <span className={active ? "text-primary" : "text-ink-muted"}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
