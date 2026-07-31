import Stripe from "npm:stripe";

export function createStripeClient() {
  return new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { httpClient: Stripe.createFetchHttpClient() });
}

// O secret STRIPE_PRICE_ANNUAL manteve esse nome por histórico (o plano era
// assinatura anual antes) — hoje o valor é a Price de pagamento único do
// plano vitalício com cupom aplicado. Trocar o nome do secret não traz
// benefício nenhum e só obrigaria a reconfigurar tudo de novo.
const priceIds = {
  monthlyFull: Deno.env.get("STRIPE_PRICE_MONTHLY")!,
  monthlyCoupon: Deno.env.get("STRIPE_PRICE_MONTHLY_COUPON")!,
  lifetimeFull: Deno.env.get("STRIPE_PRICE_LIFETIME_FULL")!,
  lifetimeCoupon: Deno.env.get("STRIPE_PRICE_ANNUAL")!,
};

export const VALID_COUPON = "VOUDEMILHAS";

export function isValidCoupon(code: unknown): boolean {
  return typeof code === "string" && code.trim().toUpperCase() === VALID_COUPON;
}

export function planFromPriceId(priceId: string | undefined): "monthly" | "lifetime" | null {
  if (priceId === priceIds.monthlyFull || priceId === priceIds.monthlyCoupon) return "monthly";
  if (priceId === priceIds.lifetimeFull || priceId === priceIds.lifetimeCoupon) return "lifetime";
  return null;
}

export function priceIdFromPlan(plan: "monthly" | "lifetime", hasCoupon: boolean): string {
  if (plan === "monthly") return hasCoupon ? priceIds.monthlyCoupon : priceIds.monthlyFull;
  return hasCoupon ? priceIds.lifetimeCoupon : priceIds.lifetimeFull;
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
