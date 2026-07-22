"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { cabinLabel } from "@/lib/utils/format";
import { loyaltyPrograms } from "@/data/loyalty-programs";
import {
  adminOfferSchema,
  type AdminOfferInputForm,
  type AdminOfferValues,
} from "@/lib/validation/admin-offer";
import type { AdminOfferInput } from "@/lib/services/offers";

const bookablePrograms = loyaltyPrograms.filter((program) => program.id !== "outro");

export function OfferForm({
  defaultValues,
  submitLabel = "Salvar oferta",
  onSubmit,
}: {
  defaultValues?: Partial<AdminOfferInputForm>;
  submitLabel?: string;
  onSubmit: (values: AdminOfferInput) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminOfferInputForm, unknown, AdminOfferValues>({
    resolver: zodResolver(adminOfferSchema),
    defaultValues: {
      origin: "",
      originAirport: "",
      destination: "",
      destinationAirport: "",
      miles: 30000,
      taxes: 100,
      programName: bookablePrograms[0]?.name ?? "",
      cabin: "economy",
      quality: "good",
      imageUrl: "",
      international: true,
      ...defaultValues,
    },
  });

  async function handleFormSubmit(values: AdminOfferValues) {
    await onSubmit({ ...values, imageUrl: values.imageUrl || undefined });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Origem" error={errors.origin?.message} {...register("origin")} />
        <Input label="Aeroporto de origem" error={errors.originAirport?.message} {...register("originAirport")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Destino" error={errors.destination?.message} {...register("destination")} />
        <Input
          label="Aeroporto de destino"
          error={errors.destinationAirport?.message}
          {...register("destinationAirport")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Milhas" type="number" min={0} error={errors.miles?.message} {...register("miles")} />
        <Input label="Taxas (R$)" type="number" min={0} error={errors.taxes?.message} {...register("taxes")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select label="Programa" error={errors.programName?.message} {...register("programName")}>
          {bookablePrograms.map((program) => (
            <option key={program.id} value={program.name}>
              {program.name}
            </option>
          ))}
        </Select>
        <Select label="Classe" {...register("cabin")}>
          <option value="economy">{cabinLabel("economy")}</option>
          <option value="premium_economy">{cabinLabel("premium_economy")}</option>
          <option value="business">{cabinLabel("business")}</option>
        </Select>
      </div>

      <Select label="Selo de qualidade" {...register("quality")}>
        <option value="good">Bom preço</option>
        <option value="regular">Preço normal</option>
        <option value="high">Acima da média</option>
      </Select>

      <Input
        label="URL da imagem (opcional)"
        placeholder="https://..."
        error={errors.imageUrl?.message}
        {...register("imageUrl")}
      />
      <Input label="Data de embarque (opcional)" type="date" {...register("departureDate")} />

      <Checkbox id="international" label="Voo internacional" {...register("international")} />

      <Button type="submit" fullWidth loading={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
