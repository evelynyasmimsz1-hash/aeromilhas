import Link from "next/link";
import { ChevronRight, Plane } from "lucide-react";
import { formatDate, formatMiles, formatRelativeTime } from "@/lib/utils/format";
import type { MilesProgram } from "@/types";

export function ProgramCard({ program }: { program: MilesProgram }) {
  return (
    <Link
      href={`/dashboard/milhas/${program.id}`}
      className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-blue text-primary">
        <Plane className="h-4 w-4 -rotate-45" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{program.name}</p>
        <p className="text-sm text-ink-secondary">{formatMiles(program.balance)}</p>
        {program.expiringMiles > 0 && program.expirationDate && (
          <p className="mt-0.5 text-xs text-warning">
            {formatMiles(program.expiringMiles)} vencem em {formatDate(program.expirationDate)}
          </p>
        )}
        <p className="mt-0.5 text-xs text-ink-muted">
          Atualizado {formatRelativeTime(program.lastUpdatedAt)}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
    </Link>
  );
}
