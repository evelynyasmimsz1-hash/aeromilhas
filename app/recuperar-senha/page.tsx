"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthRedirect } from "@/components/shared/AuthRedirect";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validation/auth";

export default function RecuperarSenhaPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit() {
    await new Promise((resolve) => setTimeout(resolve, 400));
    setSent(true);
  }

  return (
    <AuthShell>
      <AuthRedirect />
      {sent ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-surface text-success">
            <MailCheck className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="text-lg font-semibold text-ink">Verifique seu e-mail</h1>
          <p className="text-sm text-ink-secondary">
            Se esse e-mail estiver cadastrado, você vai receber um link para redefinir sua senha.
          </p>
          <Link href="/entrar" className="mt-2 text-sm font-medium text-primary hover:text-primary-hover">
            Voltar para o login
          </Link>
        </div>
      ) : (
        <>
          <Link
            href="/entrar"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Voltar
          </Link>
          <h1 className="text-lg font-semibold text-ink">Esqueceu sua senha?</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Input
              label="E-mail"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Button type="submit" fullWidth loading={isSubmitting}>
              Enviar link
            </Button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
