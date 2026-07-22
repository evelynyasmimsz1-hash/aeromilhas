import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function PreviewFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-surface p-3 shadow-xl shadow-primary/10",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 px-2 pb-3">
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
      </div>
      <div className="space-y-4 rounded-2xl bg-bg p-4">{children}</div>
    </div>
  );
}
