import { AlertTriangle } from "lucide-react";
import { LinkButton } from "@/components/ui/LinkButton";
import { formatMiles } from "@/lib/utils/format";

export function ExpirationAlert({ miles, days }: { miles: number; days: number }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-warning/30 bg-warning-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
          <AlertTriangle className="h-4 w-4" aria-hidden />
        </span>
        <p className="text-sm font-medium text-ink">
          {formatMiles(miles)} vencem nos próximos {days} dias
        </p>
      </div>
      <LinkButton href="/dashboard/milhas" variant="secondary" size="sm" className="shrink-0">
        Ver vencimentos
      </LinkButton>
    </div>
  );
}
