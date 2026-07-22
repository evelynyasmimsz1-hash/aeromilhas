import { z } from "zod";

export const alertSchema = z.object({
  origin: z.string().min(1, "Selecione a origem"),
  destination: z.string().min(1, "Selecione o destino"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maximumMiles: z.coerce.number().min(1, "Informe um limite de milhas"),
  cabin: z.enum(["economy", "premium_economy", "business"]),
  programIds: z.array(z.string()).min(1, "Selecione ao menos um programa"),
  passengers: z.coerce.number().min(1).max(9),
  notificationFrequency: z.enum(["instant", "daily", "weekly"]),
});

export type AlertInput = z.input<typeof alertSchema>;
export type AlertValues = z.output<typeof alertSchema>;
