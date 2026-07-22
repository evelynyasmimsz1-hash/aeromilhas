"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validation/auth";
import { updatePassword } from "@/lib/auth";
import { z } from "zod";

const changePasswordSchema = resetPasswordSchema.and(
  z.object({ currentPassword: z.string().min(1, "Informe sua senha atual") }),
);

type FormValues = ResetPasswordValues & { currentPassword: string };

export function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      await updatePassword(values.password);
      setDone(true);
    } catch {
      setFormError("Não foi possível atualizar sua senha. Tente novamente.");
    }
  }

  function handleClose() {
    reset();
    setDone(false);
    onClose();
  }

  return (
    <Modal open={open} title="Senha e segurança" onClose={handleClose}>
      {done ? (
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-surface text-success">
            <CheckCircle2 className="h-6 w-6" aria-hidden />
          </span>
          <p className="text-sm text-ink-secondary">Sua senha foi atualizada com sucesso.</p>
          <Button variant="secondary" onClick={handleClose}>
            Fechar
          </Button>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Senha atual"
            type="password"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            {...register("currentPassword")}
          />
          <Input
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            hint="Mínimo de 8 caracteres"
            error={errors.password?.message}
            {...register("password")}
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          {formError && (
            <p role="alert" className="text-sm text-danger">
              {formError}
            </p>
          )}
          <Button type="submit" fullWidth loading={isSubmitting}>
            Atualizar senha
          </Button>
        </form>
      )}
    </Modal>
  );
}
