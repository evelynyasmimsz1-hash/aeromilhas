import { Bell, MapPinned, Wallet } from "lucide-react";

const benefits = [
  {
    icon: Wallet,
    title: "Todos os saldos em um lugar",
    description: "Centralize seus programas de fidelidade e veja seu patrimônio em milhas de forma clara.",
  },
  {
    icon: Bell,
    title: "Alertas antes das milhas vencerem",
    description: "Acompanhe prazos de expiração e decida com antecedência o que fazer com suas milhas.",
  },
  {
    icon: MapPinned,
    title: "Ofertas alinhadas aos seus destinos",
    description: "Receba oportunidades de emissão relevantes para os lugares que você quer conhecer.",
  },
];

export function Benefits() {
  return (
    <section id="recursos" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="grid gap-6 sm:grid-cols-3">
        {benefits.map((benefit) => (
          <div key={benefit.title} className="rounded-2xl border border-border bg-surface p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-blue text-primary">
              <benefit.icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-ink">{benefit.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
