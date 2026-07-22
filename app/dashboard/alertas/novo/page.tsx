"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AlertForm } from "@/components/alerts/AlertForm";
import { useAlertsStore } from "@/lib/stores/alerts-store";
import type { AlertInput, AlertValues } from "@/lib/validation/alert";
import type { CabinClass } from "@/types";

const validCabins: CabinClass[] = ["economy", "premium_economy", "business"];

function NovoAlertaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addAlert = useAlertsStore((state) => state.addAlert);

  const cabinParam = searchParams.get("classe");
  const defaultValues: Partial<AlertInput> = {
    origin: searchParams.get("origem") ?? "",
    destination: searchParams.get("destino") ?? "",
    cabin: validCabins.includes(cabinParam as CabinClass) ? (cabinParam as CabinClass) : "economy",
  };

  async function handleSubmit(values: AlertValues) {
    await addAlert({
      origin: values.origin,
      destination: values.destination,
      startDate: values.startDate,
      endDate: values.endDate,
      maximumMiles: values.maximumMiles,
      cabin: values.cabin,
      programIds: values.programIds,
      passengers: values.passengers,
      notificationFrequency: values.notificationFrequency,
    });
    router.push("/dashboard/alertas");
  }

  return (
    <div className="max-w-xl rounded-2xl border border-border bg-surface p-6">
      <AlertForm defaultValues={defaultValues} onSubmit={handleSubmit} />
    </div>
  );
}

export default function NovoAlertaPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/alertas"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Voltar para alertas
      </Link>
      <PageHeader title="Criar alerta" description="Avise-me quando encontrar uma boa oportunidade." />
      <Suspense fallback={null}>
        <NovoAlertaForm />
      </Suspense>
    </div>
  );
}
