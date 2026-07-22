"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTransactionsStore } from "@/lib/stores/transactions-store";
import { useProgramsStore } from "@/lib/stores/programs-store";
import { transactionTypeLabel } from "@/lib/utils/format";
import {
  addTransactionSchema,
  type AddTransactionInput,
  type AddTransactionValues,
} from "@/lib/validation/program";
import type { MilesTransactionType } from "@/types";

const types: MilesTransactionType[] = ["transfer", "redemption", "bonus", "expiration", "adjustment"];
const negativeByDefault: MilesTransactionType[] = ["redemption", "expiration"];

export function AddTransactionModal({
  open,
  onClose,
  programId,
  currentBalance,
}: {
  open: boolean;
  onClose: () => void;
  programId: string;
  currentBalance: number;
}) {
  const addTransaction = useTransactionsStore((state) => state.addTransaction);
  const updateProgram = useProgramsStore((state) => state.updateProgram);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddTransactionInput, unknown, AddTransactionValues>({
    resolver: zodResolver(addTransactionSchema),
    defaultValues: {
      type: "transfer",
      description: "",
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
    },
  });

  const type = useWatch({ control, name: "type" });

  async function onSubmit(values: AddTransactionValues) {
    const signedAmount = negativeByDefault.includes(values.type)
      ? -Math.abs(values.amount)
      : Math.abs(values.amount);
    const balanceAfter = currentBalance + signedAmount;

    await addTransaction({
      programId,
      type: values.type,
      description: values.description,
      amount: signedAmount,
      date: new Date(values.date).toISOString(),
      balanceAfter,
    });

    await updateProgram(programId, { balance: balanceAfter });

    reset();
    onClose();
  }

  return (
    <Modal open={open} title="Registrar movimentação" onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Select label="Tipo" {...register("type")}>
          {types.map((item) => (
            <option key={item} value={item}>
              {transactionTypeLabel(item)}
            </option>
          ))}
        </Select>

        <Input label="Descrição" error={errors.description?.message} {...register("description")} />

        <Input
          label={`Quantidade de milhas${negativeByDefault.includes(type) ? " (será subtraída)" : ""}`}
          type="number"
          min={0}
          error={errors.amount?.message}
          {...register("amount")}
        />

        <Input label="Data" type="date" error={errors.date?.message} {...register("date")} />

        <Button type="submit" fullWidth loading={isSubmitting}>
          Registrar movimentação
        </Button>
      </form>
    </Modal>
  );
}
