"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/auth/AuthShell";
import { PlanSelector } from "@/components/onboarding/PlanSelector";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/stores/auth-store";
import { logOut } from "@/lib/auth";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { createCheckoutSession } from "@/lib/services/subscription";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validation/auth";
import { pricingPlans } from "@/data/pricing-plans";
import type { PricingPlan } from "@/types";

// Mesmo código validado de novo no servidor (create-checkout-session) — a
// checagem aqui é só pra atualizar o preço exibido na hora, não é o que
// garante o desconto de verdade.
const VALID_COUPON = "VOUDEMILHAS";

export default function AssinaturaPage() {
  const router = useRouter();
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const onboardingPlan = useOnboardingStore((state) => state.selectedPlan);

  const [selectedPlan, setSelectedPlan] = useState<PricingPlan["id"] | null>(onboardingPlan);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const displayPlans = pricingPlans.map((plan) =>
    appliedCoupon && plan.couponPrice !== undefined ? { ...plan, price: plan.couponPrice } : plan,
  );

  function applyCoupon() {
    setCouponError(null);
    if (couponInput.trim().toUpperCase() === VALID_COUPON) {
      setAppliedCoupon(VALID_COUPON);
    } else {
      setCouponError("Cupom inválido.");
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" aria-hidden />
      </div>
    );
  }

  async function goToCheckout(email?: string) {
    if (!selectedPlan) return;
    setFormError(null);
    setSubmitting(true);
    try {
      const url = await createCheckoutSession(selectedPlan, email, appliedCoupon ?? undefined);
      window.location.href = url;
    } catch {
      setFormError("Não foi possível iniciar o pagamento. Tente novamente.");
      setSubmitting(false);
    }
  }

  function onSubmit(event: FormEvent) {
    if (isAuthenticated) {
      event.preventDefault();
      goToCheckout();
    } else {
      handleSubmit((values) => goToCheckout(values.email))(event);
    }
  }

  return (
    <AuthShell tagline="Escolha seu plano pra liberar o acesso">
      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <div>
          {appliedCoupon ? (
            <p className="text-sm text-success">Cupom {appliedCoupon} aplicado.</p>
          ) : (
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label="Cupom de desconto (opcional)"
                  placeholder="Ex: VOUDEMILHAS"
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value)}
                  error={couponError ?? undefined}
                />
              </div>
              <Button type="button" variant="secondary" onClick={applyCoupon} disabled={!couponInput.trim()}>
                Aplicar
              </Button>
            </div>
          )}
        </div>

        <PlanSelector plans={displayPlans} selected={selectedPlan} onSelect={setSelectedPlan} />

        {!isAuthenticated && (
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            {...register("email")}
          />
        )}

        {formError && (
          <p role="alert" className="text-sm text-danger">
            {formError}
          </p>
        )}

        <Button type="submit" fullWidth disabled={!selectedPlan} loading={submitting}>
          Ir para pagamento
        </Button>
      </form>

      {isAuthenticated ? (
        <button
          type="button"
          onClick={() => logOut().then(() => router.push("/entrar"))}
          className="mt-4 w-full text-center text-sm font-medium text-ink-secondary hover:text-ink"
        >
          Sair da conta
        </button>
      ) : (
        <p className="mt-4 text-center text-sm text-ink-secondary">
          Já tem conta?{" "}
          <Link href="/entrar" className="font-medium text-primary hover:text-primary-hover">
            Entrar
          </Link>
        </p>
      )}
    </AuthShell>
  );
}
