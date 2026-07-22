import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

type AuthShellProps = {
  tagline?: string;
  children: ReactNode;
};

export function AuthShell({ tagline, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Link href="/" aria-label="Aeromilhas, início">
            <Logo />
          </Link>
          {tagline && <p className="mt-2 text-sm text-ink-secondary">{tagline}</p>}
        </div>
        <div className="mt-8 rounded-2xl border border-border bg-surface p-6">{children}</div>
      </div>
    </div>
  );
}
