"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useProgramsStore } from "@/lib/stores/programs-store";
import { loyaltyPrograms } from "@/data/loyalty-programs";
import {
  addProgramSchema,
  type AddProgramInput,
  type AddProgramValues,
} from "@/lib/validation/program";

export function AddProgramModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addProgram = useProgramsStore((state) => state.addProgram);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddProgramInput, unknown, AddProgramValues>({
    resolver: zodResolver(addProgramSchema),
    defaultValues: { programId: "", balance: 0, expiringMiles: 0 },
  });

  const selectedProgramId = useWatch({ control, name: "programId" });

  async function onSubmit(values: AddProgramValues) {
    const catalogProgram = loyaltyPrograms.find((program) => program.id === values.programId);
    const name = values.programId === "outro" ? values.customName!.trim() : catalogProgram?.name ?? "Programa";

    await addProgram({
      name,
      balance: values.balance,
      expiringMiles: values.expiringMiles,
      expirationDate: values.expirationDate || undefined,
      accountNumber: values.accountNumber || undefined,
      notes: values.notes || undefined,
    });

    reset();
    onClose();
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Modal open={open} title="Adicionar programa" onClose={handleClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Select label="Programa" error={errors.programId?.message} {...register("programId")}>
          <option value="">Selecione um programa</option>
          {loyaltyPrograms.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </Select>

        {selectedProgramId === "outro" && (
          <Input label="Nome do programa" error={errors.customName?.message} {...register("customName")} />
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Saldo atual"
            type="number"
            min={0}
            error={errors.balance?.message}
            {...register("balance")}
          />
          <Input
            label="Milhas a vencer"
            type="number"
            min={0}
            error={errors.expiringMiles?.message}
            {...register("expiringMiles")}
          />
        </div>

        <Input
          label="Data de vencimento (opcional)"
          type="date"
          error={errors.expirationDate?.message}
          {...register("expirationDate")}
        />
        <Input label="Número da conta (opcional)" {...register("accountNumber")} />
        <Input label="Observações (opcional)" {...register("notes")} />

        <p className="text-xs text-ink-secondary">
          Seus dados são usados apenas para organizar seus saldos dentro do Aeromilhas.
        </p>

        <Button type="submit" fullWidth loading={isSubmitting}>
          Adicionar programa
        </Button>
      </form>
    </Modal>
  );
}
