"use client";

import { useState } from "react";
import { AppPreviewCard } from "@/components/shared/AppPreviewCard";
import { OffersPreviewCard } from "./OffersPreviewCard";
import { AlertsPreviewCard } from "./AlertsPreviewCard";
import { cn } from "@/lib/utils/cn";

const tabs = [
  { id: "dashboard", label: "Início" },
  { id: "ofertas", label: "Ofertas" },
  { id: "alertas", label: "Alertas" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function AppTour() {
  const [active, setActive] = useState<TabId>("dashboard");

  return (
    <div className="w-full">
      <div className="mx-auto flex w-fit gap-1 rounded-xl bg-bg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            aria-pressed={active === tab.id}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
              active === tab.id ? "bg-surface text-primary shadow-sm" : "text-ink-secondary",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div key={active} className="animate-onboarding-step mt-6">
        {active === "dashboard" && <AppPreviewCard className="mx-auto w-full max-w-xs" />}
        {active === "ofertas" && <OffersPreviewCard className="mx-auto w-full max-w-xs" />}
        {active === "alertas" && <AlertsPreviewCard className="mx-auto w-full max-w-xs" />}
      </div>
    </div>
  );
}
