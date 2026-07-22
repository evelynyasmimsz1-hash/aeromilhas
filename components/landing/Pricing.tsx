import { Check } from "lucide-react";
import { LinkButton } from "@/components/ui/LinkButton";
import { Badge } from "@/components/ui/Badge";
import { pricingPlans } from "@/data/pricing-plans";
import { formatPrice } from "@/lib/utils/format";

export function Pricing() {
  return (
    <section id="planos" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Planos</h2>
        <p className="mt-2 text-sm text-ink-secondary">Escolha como acompanhar suas milhas.</p>
      </div>

      <div className="mx-auto mt-10 grid max-w-2xl gap-6 sm:grid-cols-2">
        {pricingPlans.map((plan) => (
          <div key={plan.id} className="flex flex-col rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
              {plan.savingsLabel && <Badge tone="success">Economize</Badge>}
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-ink">
              {plan.price === null ? "Em breve" : formatPrice(plan.price)}
              <span className="text-sm font-normal text-ink-secondary"> /{plan.billingPeriod}</span>
            </p>
            {plan.savingsLabel && <p className="mt-1 text-xs text-ink-secondary">{plan.savingsLabel}</p>}

            <ul className="mt-6 flex-1 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-ink-secondary">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>

            <LinkButton href="/onboarding" variant="secondary" className="mt-6">
              Começar agora
            </LinkButton>
          </div>
        ))}
      </div>
    </section>
  );
}
