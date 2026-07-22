import { Pause, Pencil, Play, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  alertStatusLabel,
  cabinLabel,
  formatDate,
  formatMiles,
  formatRelativeTime,
  formatRoute,
} from "@/lib/utils/format";
import { loyaltyPrograms } from "@/data/loyalty-programs";
import type { MilesAlert } from "@/types";

export function AlertCard({
  alert,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  alert: MilesAlert;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}) {
  const programNames = alert.programIds
    .map((id) => loyaltyPrograms.find((program) => program.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-ink">{formatRoute(alert.origin, alert.destination)}</p>
          <p className="mt-1 text-sm text-ink-secondary">
            Até {formatMiles(alert.maximumMiles)} · {cabinLabel(alert.cabin)} · {alert.passengers}{" "}
            {alert.passengers === 1 ? "passageiro" : "passageiros"}
          </p>
          {programNames && <p className="mt-0.5 text-xs text-ink-muted">{programNames}</p>}
          {(alert.startDate || alert.endDate) && (
            <p className="mt-0.5 text-xs text-ink-muted">
              {alert.startDate ? formatDate(alert.startDate) : "Sem início definido"} —{" "}
              {alert.endDate ? formatDate(alert.endDate) : "Sem fim definido"}
            </p>
          )}
        </div>
        <AlertStatusBadge status={alert.status} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <p className="text-xs text-ink-muted">
          {alert.lastCheckedAt ? `Verificado ${formatRelativeTime(alert.lastCheckedAt)}` : "Ainda não verificado"}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onEdit} aria-label="Editar alerta">
            <Pencil className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onToggleStatus}
            aria-label={alert.status === "paused" ? "Ativar alerta" : "Pausar alerta"}
          >
            {alert.status === "paused" ? (
              <Play className="h-4 w-4" aria-hidden />
            ) : (
              <Pause className="h-4 w-4" aria-hidden />
            )}
          </Button>
          <Button variant="danger" size="sm" onClick={onDelete} aria-label="Excluir alerta">
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}

function AlertStatusBadge({ status }: { status: MilesAlert["status"] }) {
  if (status === "matched") return <Badge tone="success">{alertStatusLabel(status)}</Badge>;
  if (status === "active") return <Badge tone="primary">{alertStatusLabel(status)}</Badge>;
  return <Badge tone="neutral">{alertStatusLabel(status)}</Badge>;
}
