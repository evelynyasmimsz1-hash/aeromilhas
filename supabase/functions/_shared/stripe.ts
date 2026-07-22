import Stripe from "npm:stripe";

export function createStripeClient() {
  return new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { httpClient: Stripe.createFetchHttpClient() });
}

// O secret STRIPE_PRICE_ANNUAL manteve esse nome por histórico (o plano era
// assinatura anual antes) — hoje o valor é a Price de pagamento único do
// plano vitalício. Trocar o nome do secret não traz benefício nenhum e só
// obrigaria a reconfigurar tudo de novo.
const priceIds: Record<"monthly" | "lifetime", string> = {
  monthly: Deno.env.get("STRIPE_PRICE_MONTHLY")!,
  lifetime: Deno.env.get("STRIPE_PRICE_ANNUAL")!,
};

export function planFromPriceId(priceId: string | undefined): "monthly" | "lifetime" | null {
  if (priceId === priceIds.monthly) return "monthly";
  if (priceId === priceIds.lifetime) return "lifetime";
  return null;
}

export function priceIdFromPlan(plan: "monthly" | "lifetime") {
  return priceIds[plan];
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
