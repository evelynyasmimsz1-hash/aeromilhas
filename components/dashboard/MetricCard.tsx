import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type MetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: "neutral" | "warning" | "danger";
};

const toneClasses = {
  neutral: "bg-surface-blue text-primary",
  warning: "bg-warning-surface text-warning",
  danger: "bg-danger-surface text-danger",
};

export function MetricCard({ icon: Icon, label, value, tone = "neutral" }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", toneClasses[tone])}>
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <p className="mt-4 text-sm text-ink-secondary">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">{value}</p>
    </div>
  );
}
