import { Bell, Plane } from "lucide-react";
import { PreviewFrame } from "./PreviewFrame";

const previewPrograms = [
  { name: "TudoAzul", miles: "23.456 milhas" },
  { name: "LATAM Pass", miles: "58.294 milhas" },
  { name: "Smiles", miles: "44.000 milhas" },
];

export function AppPreviewCard({ className }: { className?: string }) {
  return (
    <PreviewFrame className={className}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink">Olá, Bruno</p>
          <p className="text-xs text-ink-secondary">Veja suas milhas e ofertas</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-ink-secondary">
          <Bell className="h-4 w-4" aria-hidden />
        </span>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-hover p-5 text-white">
        <Plane className="pointer-events-none absolute -right-3 -top-3 h-24 w-24 -rotate-45 text-white/10" aria-hidden />
        <p className="text-xs font-medium text-white/80">Saldo total</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight">125.750 milhas</p>
        <p className="mt-3 text-xs text-white/80">3 programas conectados</p>
      </div>

      <div className="space-y-2">
        {previewPrograms.map((program) => (
          <div key={program.name} className="flex items-center justify-between rounded-xl bg-surface px-3.5 py-3">
            <span className="text-sm font-medium text-ink">{program.name}</span>
            <span className="text-sm text-ink-secondary">{program.miles}</span>
          </div>
        ))}
      </div>
    </PreviewFrame>
  );
}
