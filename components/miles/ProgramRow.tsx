import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatDate, formatMiles, formatRelativeTime } from "@/lib/utils/format";
import type { MilesProgram } from "@/types";

export function ProgramRow({ program }: { program: MilesProgram }) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3.5 pr-4 text-sm font-medium text-ink">{program.name}</td>
      <td className="py-3.5 pr-4 text-sm text-ink">{formatMiles(program.balance)}</td>
      <td className="py-3.5 pr-4 text-sm text-ink-secondary">
        {program.expiringMiles > 0 ? formatMiles(program.expiringMiles) : "—"}
      </td>
      <td className="py-3.5 pr-4 text-sm text-ink-secondary">
        {program.expirationDate ? formatDate(program.expirationDate) : "—"}
      </td>
      <td className="py-3.5 pr-4 text-sm text-ink-secondary">
        {formatRelativeTime(program.lastUpdatedAt)}
      </td>
      <td className="py-3.5 text-right">
        <Link
          href={`/dashboard/milhas/${program.id}`}
          aria-label={`Abrir detalhes de ${program.name}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary hover:bg-bg hover:text-ink"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </td>
    </tr>
  );
}
