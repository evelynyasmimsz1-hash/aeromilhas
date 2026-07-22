"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthRedirect } from "@/components/shared/AuthRedirect";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { logIn } from "@/lib/auth";
import { linkSubscription } from "@/lib/services/subscription";
import { loginSchema, type LoginValues } from "@/lib/validation/auth";

function EntrarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    try {
      const { userId } = await logIn(values.email, values.password);
      if (sessionId) {
        await linkSubscription(sessionId, userId).catch(() => undefined);
      }
      router.push("/dashboard");
    } catch {
      setFormError("E-mail ou senha inválidos.");
    }
  }

  return (
    <AuthShell tagline="Sua casa das milhas aéreas">
      <AuthRedirect />
      <AuthTabs />

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Senha"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        {formError && (
          <p role="alert" className="text-sm text-danger">
            {formError}
          </p>
        )}

        <div className="flex justify-end">
          <Link href="/recuperar-senha" className="text-sm font-medium text-primary hover:text-primary-hover">
            Esqueceu sua senha?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={isSubmitting}>
          Entrar
        </Button>
      </form>
    </AuthShell>
  );
}

export default function EntrarPage() {
  return (
    <Suspense fallback={null}>
      <EntrarForm />
    </Suspense>
  );
}
