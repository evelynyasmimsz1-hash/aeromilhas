"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FilterChip } from "@/components/ui/FilterChip";
import { destinationOptions } from "@/data/airports";
import { loyaltyPrograms } from "@/data/loyalty-programs";
import { cabinLabel } from "@/lib/utils/format";
import { alertSchema, type AlertInput, type AlertValues } from "@/lib/validation/alert";

type AlertFormProps = {
  defaultValues?: Partial<AlertInput>;
  submitLabel?: string;
  onSubmit: (values: AlertValues) => void | Promise<void>;
};

export function AlertForm({ defaultValues, submitLabel = "Criar alerta", onSubmit }: AlertFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AlertInput, unknown, AlertValues>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      origin: "",
      destination: "",
      maximumMiles: 40000,
      cabin: "economy",
      programIds: [],
      passengers: 1,
      notificationFrequency: "instant",
      ...defaultValues,
    },
  });

  const programIds = useWatch({ control, name: "programIds" }) ?? [];

  function toggleProgram(id: string) {
    const current = programIds;
    setValue(
      "programIds",
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
      { shouldValidate: true },
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Origem" error={errors.origin?.message} {...register("origin")}>
          <option value="">Selecione a origem</option>
          {destinationOptions.map((airport) => (
            <option key={airport.code} value={airport.city}>
              {airport.city}
            </option>
          ))}
        </Select>
        <Select label="Destino" error={errors.destination?.message} {...register("destination")}>
          <option value="">Selecione o destino</option>
          {destinationOptions.map((airport) => (
            <option key={airport.code} value={airport.city}>
              {airport.city}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Início do período (opcional)" type="date" {...register("startDate")} />
        <Input label="Fim do período (opcional)" type="date" {...register("endDate")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Máximo de milhas"
          type="number"
          min={1}
          error={errors.maximumMiles?.message}
          {...register("maximumMiles")}
        />
        <Select label="Classe" {...register("cabin")}>
          <option value="economy">{cabinLabel("economy")}</option>
          <option value="premium_economy">{cabinLabel("premium_economy")}</option>
          <option value="business">{cabinLabel("business")}</option>
        </Select>
      </div>

      <div>
        <p className="text-sm font-medium text-ink">Programas de milhas</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {loyaltyPrograms
            .filter((program) => program.id !== "outro")
            .map((program) => (
              <FilterChip
                key={program.id}
                label={program.name}
                active={programIds.includes(program.id)}
                onClick={() => toggleProgram(program.id)}
              />
            ))}
        </div>
        {errors.programIds && <p className="mt-1.5 text-xs text-danger">{errors.programIds.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Passageiros" type="number" min={1} max={9} {...register("passengers")} />
        <Select label="Frequência das notificações" {...register("notificationFrequency")}>
          <option value="instant">Assim que encontrar</option>
          <option value="daily">Diariamente</option>
          <option value="weekly">Semanalmente</option>
        </Select>
      </div>

      <Button type="submit" fullWidth loading={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
