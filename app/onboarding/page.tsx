"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Tag, Wallet } from "lucide-react";
import { AuthRedirect } from "@/components/shared/AuthRedirect";
import { Logo } from "@/components/shared/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { ValueSlide } from "@/components/onboarding/ValueSlide";
import { AppTour } from "@/components/onboarding/AppTour";
import { SocialProofCard } from "@/components/onboarding/SocialProofCard";
import { PlanSelector } from "@/components/onboarding/PlanSelector";
import { ChoiceCard } from "@/components/onboarding/ChoiceCard";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { pricingPlans } from "@/data/pricing-plans";

const NAME_STEP = 0;
const PROGRAMS_QUESTION_STEP = 1;
const EXPIRED_QUESTION_STEP = 3;
const DESTINATIONS_QUESTION_STEP = 5;
const ANALYZING_STEP = 7;
const TOUR_STEP = 8;
const SOCIAL_PROOF_STEP = 9;
const PAYWALL_STEP = 10;
const TOTAL_STEPS = 11;

const hasProgramsOptions = ["Sim, vários", "Sim, um ou dois", "Ainda não tenho"];
const milesExpiredOptions = ["Já perdi bastante", "Só um pouco", "Nunca perdi", "Não sei"];
const destinationOptions = ["Europa", "Estados Unidos", "Ásia", "América do Sul", "Ainda não sei"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const name = useOnboardingStore((state) => state.name);
  const setName = useOnboardingStore((state) => state.setName);
  const selectedPlan = useOnboardingStore((state) => state.selectedPlan);
  const setSelectedPlan = useOnboardingStore((state) => state.setSelectedPlan);
  const hasPrograms = useOnboardingStore((state) => state.hasPrograms);
  const setHasPrograms = useOnboardingStore((state) => state.setHasPrograms);
  const milesExpired = useOnboardingStore((state) => state.milesExpired);
  const setMilesExpired = useOnboardingStore((state) => state.setMilesExpired);
  const dreamDestinations = useOnboardingStore((state) => state.dreamDestinations);
  const toggleDreamDestination = useOnboardingStore((state) => state.toggleDreamDestination);

  const firstName = name.trim().split(" ")[0];

  useEffect(() => {
    if (step !== ANALYZING_STEP) return;
    const timer = setTimeout(() => {
      setStep((prev) => Math.min(TOTAL_STEPS - 1, prev + 1));
    }, 1600);
    return () => clearTimeout(timer);
  }, [step]);

  function goNext() {
    setStep((prev) => Math.min(TOTAL_STEPS - 1, prev + 1));
  }

  function goBack() {
    setStep((prev) => Math.max(0, prev - 1));
  }

  function handleContinue() {
    if (step === PAYWALL_STEP) {
      router.push("/assinatura");
      return;
    }
    goNext();
  }

  function socialProofCopy() {
    if (milesExpired === "Já perdi bastante" || milesExpired === "Só um pouco") {
      return {
        title: "Você não está sozinho",
        description:
          "Muita gente perde milhas por vencimento sem perceber. O Aeromilhas avisa antes, com tempo de sobra pra você decidir o que fazer.",
      };
    }
    if (hasPrograms === "Ainda não tenho") {
      return {
        title: "Começando do jeito certo",
        description:
          "Quem organiza as milhas desde o início aproveita muito mais oportunidades — vamos deixar tudo pronto pra sua primeira viagem.",
      };
    }
    return {
      title: "Você está em boa companhia",
      description: "Milhares de viajantes já organizam suas milhas no Aeromilhas.",
    };
  }

  const canContinue =
    (step !== NAME_STEP || name.trim().length > 1) &&
    (step !== PROGRAMS_QUESTION_STEP || hasPrograms !== null) &&
    (step !== EXPIRED_QUESTION_STEP || milesExpired !== null) &&
    (step !== DESTINATIONS_QUESTION_STEP || dreamDestinations.length > 0) &&
    (step !== PAYWALL_STEP || selectedPlan !== null);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AuthRedirect />
      <div className="glow-blob left-1/2 top-0 h-80 w-80 -translate-x-1/2 bg-primary" aria-hidden />
      <div className="glow-blob -right-10 top-1/3 h-64 w-64 bg-secondary" aria-hidden />

      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        {step > 0 ? (
          <button
            type="button"
            onClick={goBack}
            aria-label="Voltar"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-secondary hover:bg-bg hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <Logo showWordmark={false} />
        )}
      </div>

      <div className="mt-8">
        <OnboardingProgress step={step + 1} totalSteps={TOTAL_STEPS} />
      </div>

      <div key={step} className="animate-onboarding-step mt-8 flex flex-1 flex-col">
        {step === NAME_STEP && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Como podemos te chamar?
            </h1>
            <p className="mt-3 max-w-xs text-base leading-relaxed text-ink-secondary">
              Assim deixamos sua experiência no Aeromilhas com a sua cara.
            </p>
            <div className="mt-8 w-full max-w-xs text-left">
              <Input
                label="Seu nome"
                placeholder="Como você se chama?"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoFocus
              />
            </div>
          </div>
        )}

        {step === PROGRAMS_QUESTION_STEP && (
          <div className="flex flex-1 flex-col justify-center text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {firstName ? `${firstName}, você já tem programas de milhas?` : "Você já tem programas de milhas?"}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-ink-secondary">
              Assim já adaptamos sua experiência desde o início.
            </p>
            <div className="mt-8 space-y-3 text-left">
              {hasProgramsOptions.map((option) => (
                <ChoiceCard
                  key={option}
                  label={option}
                  selected={hasPrograms === option}
                  onClick={() => setHasPrograms(option)}
                />
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <ValueSlide
            icon={Wallet}
            title={firstName ? `Oi, ${firstName}! Vamos achar valor nas suas milhas.` : "Vamos achar valor nas suas milhas."}
            description="Todos os seus programas de fidelidade, num só lugar — sem planilha, sem senha compartilhada."
          />
        )}

        {step === EXPIRED_QUESTION_STEP && (
          <div className="flex flex-1 flex-col justify-center text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Você já perdeu milhas por vencimento?
            </h1>
            <p className="mt-3 text-base leading-relaxed text-ink-secondary">
              Milha vencida é dinheiro jogado fora — vamos evitar que isso aconteça de novo.
            </p>
            <div className="mt-8 space-y-3 text-left">
              {milesExpiredOptions.map((option) => (
                <ChoiceCard
                  key={option}
                  label={option}
                  selected={milesExpired === option}
                  onClick={() => setMilesExpired(option)}
                />
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <ValueSlide
            icon={Bell}
            title="Milha vencida é dinheiro jogado fora"
            description="A gente avisa antes do vencimento, com tempo de sobra pra você decidir o que fazer."
          />
        )}

        {step === DESTINATIONS_QUESTION_STEP && (
          <div className="flex flex-1 flex-col justify-center text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Pra onde você mais sonha viajar de milhas?
            </h1>
            <p className="mt-3 text-base leading-relaxed text-ink-secondary">Pode marcar mais de um destino.</p>
            <div className="mt-8 space-y-3 text-left">
              {destinationOptions.map((option) => (
                <ChoiceCard
                  key={option}
                  label={option}
                  selected={dreamDestinations.includes(option)}
                  onClick={() => toggleDreamDestination(option)}
                />
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <ValueSlide
            icon={Tag}
            title="A oferta certa, no momento certo"
            description="Passagens com milhas alinhadas aos destinos que você quer conhecer — sem precisar procurar."
          />
        )}

        {step === ANALYZING_STEP && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" aria-hidden />
            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Montando seu plano...
            </h1>
            <p className="mt-3 max-w-xs text-base leading-relaxed text-ink-secondary">
              Estamos organizando as melhores oportunidades com base nas suas respostas.
            </p>
          </div>
        )}

        {step === TOUR_STEP && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Veja como é simples
            </h1>
            <p className="mt-3 max-w-xs text-base leading-relaxed text-ink-secondary">
              Um painel único com seus saldos, vencimentos e as melhores ofertas.
            </p>
            <div className="mt-8 w-full">
              <AppTour />
            </div>
          </div>
        )}

        {step === SOCIAL_PROOF_STEP && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {socialProofCopy().title}
            </h1>
            <p className="mt-3 max-w-xs text-base leading-relaxed text-ink-secondary">
              {socialProofCopy().description}
            </p>
            <div className="mt-8 w-full">
              <SocialProofCard />
            </div>
          </div>
        )}

        {step === PAYWALL_STEP && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Escolha seu plano
            </h1>
            <p className="mt-2 max-w-xs text-sm text-ink-secondary">
              Acesso completo às ofertas, alertas e organização das suas milhas.
            </p>
            <div className="mt-6">
              <PlanSelector plans={pricingPlans} selected={selectedPlan} onSelect={setSelectedPlan} />
            </div>
          </div>
        )}
      </div>

      {step !== ANALYZING_STEP && (
        <div className="mt-8">
          <Button
            fullWidth
            onClick={handleContinue}
            disabled={!canContinue}
            className="h-12 text-base shadow-lg shadow-primary/25"
          >
            {step === PAYWALL_STEP ? "Assinar e continuar" : "Continuar"}
          </Button>
        </div>
      )}
      </div>
    </div>
  );
}
