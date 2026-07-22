"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { signUp } from "@/lib/auth";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { verifyCheckoutSession, linkSubscription } from "@/lib/services/subscription";

const createAccountSchema = z
  .object({
    name: z.string().min(2, "Informe seu nome completo"),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
    acceptTerms: z.literal(true, { error: "Você precisa aceitar os termos para continuar" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type CreateAccountValues = z.infer<typeof createAccountSchema>;

function CriarContaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const onboardingName = useOnboardingStore((state) => state.name);

  const [verifying, setVerifying] = useState(true);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [alreadyRegisteredEmail, setAlreadyRegisteredEmail] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      router.replace("/assinatura");
      return;
    }
    let cancelled = false;
    verifyCheckoutSession(sessionId)
      .then(({ email }) => {
        if (cancelled) return;
        setVerifiedEmail(email);
        setVerifying(false);
      })
      .catch(() => {
        if (cancelled) return;
        setVerifyError("Não conseguimos confirmar seu pagamento. Tente novamente.");
        setVerifying(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateAccountValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: { name: onboardingName },
  });

  async function onSubmit(values: CreateAccountValues) {
    if (!verifiedEmail || !sessionId) return;
    setFormError(null);
    try {
      const { needsEmailConfirmation, userId } = await signUp(values.name, verifiedEmail, values.password);
      await linkSubscription(sessionId, userId);
      if (needsEmailConfirmation) {
        setNeedsConfirmation(true);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.toLowerCase().includes("already registered") || message.toLowerCase().includes("already exists")) {
        setAlreadyRegisteredEmail(verifiedEmail);
      } else {
        setFormError(message || "Não foi possível criar sua conta. Tente novamente.");
      }
    }
  }

  if (verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" aria-hidden />
      </div>
    );
  }

  if (verifyError) {
    return (
      <AuthShell tagline="Sua casa das milhas aéreas">
        <div className="space-y-4 text-center">
          <p className="text-sm text-danger">{verifyError}</p>
          <Link href="/assinatura" className="text-sm font-medium text-primary hover:text-primary-hover">
            Voltar para escolher o plano
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (alreadyRegisteredEmail) {
    return (
      <AuthShell tagline="Sua casa das milhas aéreas">
        <div className="space-y-4 text-center">
          <p className="text-sm text-ink-secondary">
            Já existe uma conta com o e-mail {alreadyRegisteredEmail}. Faça login para liberar sua assinatura.
          </p>
          <Link
            href={`/entrar?session_id=${sessionId}`}
            className="inline-block text-sm font-medium text-primary hover:text-primary-hover"
          >
            Ir para o login
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (needsConfirmation) {
    return (
      <AuthShell tagline="Sua casa das milhas aéreas">
        <div className="space-y-2 text-center">
          <h2 className="text-lg font-semibold text-ink">Confirme seu e-mail</h2>
          <p className="text-sm text-ink-muted">
            Enviamos um link de confirmação para o seu e-mail. Confirme para acessar sua conta.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell tagline="Pagamento confirmado — só falta criar sua senha">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input label="Nome" autoComplete="name" error={errors.name?.message} {...register("name")} />
        <Input label="E-mail" type="email" value={verifiedEmail ?? ""} disabled />
        <Input
          label="Senha"
          type="password"
          autoComplete="new-password"
          hint="Mínimo de 8 caracteres"
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Checkbox
          id="accept-terms"
          error={errors.acceptTerms?.message}
          label={
            <>
              Ao continuar, você concorda com os{" "}
              <Link href="/termos" className="text-primary hover:text-primary-hover">
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link href="/privacidade" className="text-primary hover:text-primary-hover">
                Política de Privacidade
              </Link>
              .
            </>
          }
          {...register("acceptTerms")}
        />

        {formError && (
          <p role="alert" className="text-sm text-danger">
            {formError}
          </p>
        )}

        <Button type="submit" fullWidth loading={isSubmitting}>
          Criar conta
        </Button>
      </form>
    </AuthShell>
  );
}

export default function CriarContaPage() {
  return (
    <Suspense fallback={null}>
      <CriarContaForm />
    </Suspense>
  );
}
