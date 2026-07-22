import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ChoiceCardProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
};

export function ChoiceCard({ label, selected, onClick }: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center justify-between gap-4 rounded-2xl border-2 px-5 py-4 text-left text-sm font-medium transition-all",
        selected
          ? "border-primary bg-surface-blue text-ink shadow-lg shadow-primary/15"
          : "border-border bg-surface text-ink-secondary hover:border-primary/40",
      )}
    >
      {label}
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-primary bg-primary text-white" : "border-border bg-surface",
        )}
      >
        {selected && <Check className="h-3.5 w-3.5" aria-hidden />}
      </span>
    </button>
  );
}
