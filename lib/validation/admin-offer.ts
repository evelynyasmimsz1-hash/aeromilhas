import { z } from "zod";

export const adminOfferSchema = z.object({
  origin: z.string().min(1, "Informe a origem"),
  originAirport: z.string().min(3, "Código IATA da origem (ex: GRU)").max(4),
  destination: z.string().min(1, "Informe o destino"),
  destinationAirport: z.string().min(3, "Código IATA do destino (ex: MIA)").max(4),
  miles: z.coerce.number().min(1, "Informe a quantidade de milhas"),
  taxes: z.coerce.number().min(0, "Informe as taxas"),
  programName: z.string().min(1, "Selecione o programa"),
  cabin: z.enum(["economy", "premium_economy", "business"]),
  quality: z.enum(["good", "regular", "high"]),
  imageUrl: z.string().url("URL de imagem inválida").optional().or(z.literal("")),
  departureDate: z.string().optional(),
  international: z.boolean(),
});

export type AdminOfferInputForm = z.input<typeof adminOfferSchema>;
export type AdminOfferValues = z.output<typeof adminOfferSchema>;
