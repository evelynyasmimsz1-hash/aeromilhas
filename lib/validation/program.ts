import { z } from "zod";

export const addProgramSchema = z
  .object({
    programId: z.string().min(1, "Selecione um programa"),
    customName: z.string().optional(),
    balance: z.coerce.number().min(0, "Informe um saldo válido"),
    expiringMiles: z.coerce.number().min(0, "Informe um valor válido"),
    expirationDate: z.string().optional(),
    accountNumber: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => data.programId !== "outro" || Boolean(data.customName?.trim()), {
    message: "Informe o nome do programa",
    path: ["customName"],
  });

export type AddProgramInput = z.input<typeof addProgramSchema>;
export type AddProgramValues = z.output<typeof addProgramSchema>;

export const editProgramSchema = z.object({
  balance: z.coerce.number().min(0, "Informe um saldo válido"),
  expiringMiles: z.coerce.number().min(0, "Informe um valor válido"),
  expirationDate: z.string().optional(),
  accountNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type EditProgramInput = z.input<typeof editProgramSchema>;
export type EditProgramValues = z.output<typeof editProgramSchema>;

export const addTransactionSchema = z.object({
  type: z.enum(["transfer", "redemption", "bonus", "expiration", "adjustment"]),
  description: z.string().min(2, "Descreva a movimentação"),
  amount: z.coerce.number().refine((value) => value !== 0, "Informe uma quantidade diferente de zero"),
  date: z.string().min(1, "Informe a data"),
});

export type AddTransactionInput = z.input<typeof addTransactionSchema>;
export type AddTransactionValues = z.output<typeof addTransactionSchema>;
