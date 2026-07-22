import { ArrowRight, Plane } from "lucide-react";
import { LinkButton } from "@/components/ui/LinkButton";
import { AppPreviewCard } from "@/components/shared/AppPreviewCard";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="glow-blob left-1/2 top-0 h-72 w-72 -translate-x-1/2 bg-primary sm:h-96 sm:w-96"
        aria-hidden
      />
      <div
        className="glow-blob right-0 top-40 h-64 w-64 bg-secondary"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-ink-secondary">
              <Plane className="h-3.5 w-3.5 text-primary" aria-hidden />
              Organização de milhas aéreas
            </span>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Do saldo esquecido à <span className="text-gradient-primary">sua próxima viagem</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-secondary">
              Centralize seus programas, acompanhe vencimentos e encontre as melhores
              oportunidades para voar gastando menos.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/onboarding" size="md" className="h-12 px-6 text-base shadow-lg shadow-primary/25">
                Começar agora
                <ArrowRight className="h-4 w-4" aria-hidden />
              </LinkButton>
              <LinkButton
                href="#como-funciona"
                variant="secondary"
                size="md"
                className="h-12 px-6 text-base"
              >
                Ver como funciona
              </LinkButton>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div
              className="glow-blob inset-0 h-full w-full bg-primary opacity-20"
              aria-hidden
            />
            <AppPreviewCard className="relative rotate-1 shadow-2xl shadow-primary/10" />
          </div>
        </div>
      </div>
    </section>
  );
}
