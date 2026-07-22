import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type FilterChipProps = {
  label: string;
  icon?: LucideIcon;
  active?: boolean;
  onClick?: () => void;
};

export function FilterChip({ label, icon: Icon, active, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-white"
          : "border-border bg-surface text-ink-secondary hover:border-primary/40 hover:text-ink",
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden />}
      {label}
    </button>
  );
}
