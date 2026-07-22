"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useProgramsStore } from "@/lib/stores/programs-store";
import {
  editProgramSchema,
  type EditProgramInput,
  type EditProgramValues,
} from "@/lib/validation/program";
import type { MilesProgram } from "@/types";

type EditProgramModalProps = {
  open: boolean;
  onClose: () => void;
  program: MilesProgram;
  title?: string;
};

export function EditProgramModal({ open, onClose, program, title }: EditProgramModalProps) {
  const updateProgram = useProgramsStore((state) => state.updateProgram);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditProgramInput, unknown, EditProgramValues>({
    resolver: zodResolver(editProgramSchema),
    values: {
      balance: program.balance,
      expiringMiles: program.expiringMiles,
      expirationDate: program.expirationDate?.slice(0, 10) ?? "",
      accountNumber: program.accountNumber ?? "",
      notes: program.notes ?? "",
    },
  });

  async function onSubmit(values: EditProgramValues) {
    await updateProgram(program.id, {
      balance: values.balance,
      expiringMiles: values.expiringMiles,
      expirationDate: values.expirationDate || undefined,
      accountNumber: values.accountNumber || undefined,
      notes: values.notes || undefined,
    });
    onClose();
  }

  return (
    <Modal open={open} title={title ?? `Editar ${program.name}`} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
        <Input label="Data de vencimento (opcional)" type="date" {...register("expirationDate")} />
        <Input label="Número da conta (opcional)" {...register("accountNumber")} />
        <Input label="Observações (opcional)" {...register("notes")} />

        <Button type="submit" fullWidth loading={isSubmitting}>
          Salvar alterações
        </Button>
      </form>
    </Modal>
  );
}
