const steps = [
  {
    number: "1",
    title: "Adicione seus programas",
    description: "Cadastre os programas de fidelidade que você já utiliza, sem precisar informar senhas.",
  },
  {
    number: "2",
    title: "Organize seus saldos",
    description: "Veja quanto você tem, em quais programas e quando cada saldo vence.",
  },
  {
    number: "3",
    title: "Receba ofertas e alertas",
    description: "Acompanhe oportunidades de viagem e avisos de vencimento no momento certo.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="border-y border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Como funciona
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                {step.number}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
