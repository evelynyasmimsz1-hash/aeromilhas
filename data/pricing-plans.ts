import type { PricingPlan } from "@/types";

export const pricingPlans: PricingPlan[] = [
  {
    id: "monthly",
    name: "Mensal",
    price: 19.9,
    billingPeriod: "mês",
    features: [
      "Acesso completo à plataforma",
      "Alertas de ofertas",
      "Organização de programas",
      "Histórico de movimentações",
      "Acompanhamento de vencimentos",
    ],
  },
  {
    id: "lifetime",
    name: "Vitalício",
    price: 197,
    billingPeriod: "pagamento único",
    savingsLabel: "Pague uma vez, use para sempre — sem mensalidade",
    badge: "Mais escolhido",
    features: [
      "Acesso completo à plataforma",
      "Alertas de ofertas",
      "Organização de programas",
      "Histórico de movimentações",
      "Acompanhamento de vencimentos",
    ],
  },
];
