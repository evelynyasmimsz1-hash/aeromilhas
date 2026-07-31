// Cria uma sessão do Stripe Checkout pro plano escolhido.
//
// Duas formas de chamar:
// - Autenticado (usuário já tem conta, ex: assinatura vencida): o e-mail e
//   o user_id vêm do JWT verificado, nunca do body. success_url manda
//   direto pro /dashboard.
// - Sem sessão (fluxo novo: paga antes de criar conta): o body precisa
//   trazer o e-mail. Não existe user_id ainda, então o Customer é criado só
//   com e-mail e a assinatura fica sem dono até a conta ser criada e
//   vinculada via link-subscription. success_url manda pro /criar-conta com
//   o id da sessão, pra provar que o pagamento foi feito.
import { createClient } from "npm:@supabase/supabase-js";
import { createStripeClient, priceIdFromPlan, isValidCoupon, corsHeaders } from "../_shared/stripe.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const appUrl = Deno.env.get("APP_URL")!;

const stripe = createStripeClient();
const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return null;

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data } = await callerClient.auth.getUser();
  return data.user && data.user.email ? { id: data.user.id, email: data.user.email } : null;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await request.json().catch(() => null);
    const plan = body?.plan;
    if (plan !== "monthly" && plan !== "lifetime") {
      return Response.json({ error: "Plano inválido" }, { status: 400, headers: corsHeaders });
    }

    // O cupom nunca é confiado a partir do que o client mostrou — é
    // validado aqui de novo, e é essa validação que decide a Price usada.
    const hasCoupon = isValidCoupon(body?.coupon);

    const priceId = priceIdFromPlan(plan, hasCoupon);
    if (!priceId) {
      return Response.json(
        { error: `Price ID não configurado para o plano ${plan} (verifique os secrets de Price no Supabase)` },
        { status: 500, headers: corsHeaders },
      );
    }

    // vitalício é pagamento único (mode "payment"); mensal é assinatura
    // recorrente (mode "subscription") — o Stripe não deixa misturar os dois.
    const mode = plan === "lifetime" ? "payment" : "subscription";

    const authenticatedUser = await getAuthenticatedUser(request);

    if (authenticatedUser) {
      const { data: existing } = await adminClient
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", authenticatedUser.id)
        .maybeSingle();

      let customerId = existing?.stripe_customer_id ?? undefined;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: authenticatedUser.email,
          metadata: { supabase_user_id: authenticatedUser.id },
        });
        customerId = customer.id;
        await adminClient
          .from("subscriptions")
          .upsert({ user_id: authenticatedUser.id, stripe_customer_id: customerId, plan }, { onConflict: "user_id" });
      }

      const session = await stripe.checkout.sessions.create({
        mode,
        customer: customerId,
        client_reference_id: authenticatedUser.id,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${appUrl}/dashboard?checkout=success`,
        cancel_url: `${appUrl}/assinatura?checkout=cancel`,
        metadata: { supabase_user_id: authenticatedUser.id },
        ...(mode === "subscription"
          ? { subscription_data: { metadata: { supabase_user_id: authenticatedUser.id } } }
          : {}),
      });

      return Response.json({ url: session.url }, { headers: corsHeaders });
    }

    const email = body?.email;
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "E-mail inválido" }, { status: 400, headers: corsHeaders });
    }

    const session = await stripe.checkout.sessions.create({
      mode,
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/criar-conta?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/assinatura?checkout=cancel`,
      ...(mode === "payment" ? { customer_creation: "always" } : {}),
    });

    return Response.json({ url: session.url }, { headers: corsHeaders });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500, headers: corsHeaders },
    );
  }
});
