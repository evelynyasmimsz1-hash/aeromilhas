"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthRedirect } from "@/components/shared/AuthRedirect";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validation/auth";

export default function RedefinirSenhaPage() {
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) });

  async function onSubmit() {
    await new Promise((resolve) => setTimeout(resolve, 400));
    setDone(true);
  }

  return (
    <AuthShell>
      <AuthRedirect />
      {done ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-surface text-success">
            <CheckCircle2 className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="text-lg font-semibold text-ink">Senha redefinida</h1>
          <p className="text-sm text-ink-secondary">
            Sua senha foi atualizada com sucesso. Você já pode entrar com a nova senha.
          </p>
          <Link href="/entrar" className="mt-2 text-sm font-medium text-primary hover:text-primary-hover">
            Ir para o login
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-lg font-semibold text-ink">Criar nova senha</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Escolha uma nova senha para acessar sua conta.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
            <Button type="submit" fullWidth loading={isSubmitting}>
              Redefinir senha
            </Button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
