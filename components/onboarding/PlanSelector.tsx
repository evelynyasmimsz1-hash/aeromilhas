import { Check } from "lucide-react";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { PricingPlan } from "@/types";

type PlanSelectorProps = {
  plans: PricingPlan[];
  selected: PricingPlan["id"] | null;
  onSelect: (id: PricingPlan["id"]) => void;
};

export function PlanSelector({ plans, selected, onSelect }: PlanSelectorProps) {
  return (
    <div className="w-full space-y-3">
      {plans.map((plan) => {
        const active = selected === plan.id;
        const isOneTime = plan.billingPeriod === "pagamento único";
        return (
          <button
            key={plan.id}
            type="button"
            onClick={() => onSelect(plan.id)}
            aria-pressed={active}
            className={cn(
              "relative flex w-full items-center justify-between gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all",
              active
                ? "border-primary bg-surface-blue shadow-lg shadow-primary/15"
                : "border-border bg-surface hover:border-primary/40",
            )}
          >
            {plan.badge && (
              <span className="absolute -top-2.5 left-5 rounded-full bg-gradient-to-r from-primary to-secondary px-2.5 py-0.5 text-[11px] font-semibold text-white">
                {plan.badge}
              </span>
            )}
            <div>
              <p className="text-sm font-semibold text-ink">{plan.name}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                {plan.price !== null && formatPrice(plan.price)}
                {!isOneTime && <span className="text-sm font-normal text-ink-secondary"> /{plan.billingPeriod}</span>}
              </p>
              {plan.savingsLabel && <p className="mt-0.5 text-xs text-success">{plan.savingsLabel}</p>}
            </div>
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                active ? "border-primary bg-primary text-white" : "border-border bg-surface",
              )}
            >
              {active && <Check className="h-3.5 w-3.5" aria-hidden />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
