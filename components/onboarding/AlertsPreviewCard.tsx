import { PreviewFrame } from "@/components/shared/PreviewFrame";
import { Badge } from "@/components/ui/Badge";

const previewAlerts = [
  { route: "São Paulo → Lisboa", detail: "Até 45.000 milhas", status: "Oferta encontrada", tone: "success" as const },
  { route: "São Paulo → Miami", detail: "Até 40.000 milhas", status: "Ativo", tone: "primary" as const },
];

export function AlertsPreviewCard({ className }: { className?: string }) {
  return (
    <PreviewFrame className={className}>
      <div>
        <p className="text-sm font-medium text-ink">Alertas</p>
        <p className="text-xs text-ink-secondary">Avisamos quando o preço cair</p>
      </div>

      <div className="space-y-2">
        {previewAlerts.map((alert) => (
          <div key={alert.route} className="rounded-xl bg-surface px-3.5 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-ink">{alert.route}</span>
              <Badge tone={alert.tone}>{alert.status}</Badge>
            </div>
            <p className="mt-1 text-xs text-ink-secondary">{alert.detail}</p>
          </div>
        ))}
      </div>
    </PreviewFrame>
  );
}
