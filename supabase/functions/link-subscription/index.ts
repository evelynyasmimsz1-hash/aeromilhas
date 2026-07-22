// Vincula uma assinatura já paga (identificada por session_id) à conta
// recém-criada (user_id). Não usa o JWT do usuário pra autenticar — a prova
// é o session_id, que só existe porque o Stripe confirmou um pagamento
// real. Antes de gravar, confere que o e-mail da conta bate com o e-mail
// que pagou, e que essa assinatura ainda não foi vinculada a outra conta.
import { createClient } from "npm:@supabase/supabase-js";
import { createStripeClient, planFromPriceId, corsHeaders } from "../_shared/stripe.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const stripe = createStripeClient();
const adminClient = createClient(supabaseUrl, serviceRoleKey);

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await request.json().catch(() => null);
    const sessionId = body?.session_id;
    const userId = body?.user_id;
    if (typeof sessionId !== "string" || typeof userId !== "string" || !sessionId || !userId) {
      return Response.json({ error: "Parâmetros inválidos" }, { status: 400, headers: corsHeaders });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items"] });
    if (session.payment_status !== "paid" || !session.customer_details?.email) {
      return Response.json({ error: "Pagamento não confirmado" }, { status: 400, headers: corsHeaders });
    }

    const { data: userResult, error: userError } = await adminClient.auth.admin.getUserById(userId);
    if (userError || !userResult.user?.email) {
      return Response.json(
        { error: `Usuário não encontrado (user_id=${userId}, detalhe=${userError?.message ?? "sem usuário retornado"})` },
        { status: 404, headers: corsHeaders },
      );
    }

    const paidEmail = session.customer_details.email.trim().toLowerCase();
    const accountEmail = userResult.user.email.trim().toLowerCase();
    if (paidEmail !== accountEmail) {
      return Response.json({ error: "E-mail não corresponde ao pagamento" }, { status: 403, headers: corsHeaders });
    }

    if (session.mode === "payment") {
      // Vitalício: pagamento único, sem objeto de assinatura no Stripe.
      const paymentIntentId = session.payment_intent as string;

      const { data: existing } = await adminClient
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_payment_intent_id", paymentIntentId)
        .maybeSingle();

      if (existing && existing.user_id !== userId) {
        return Response.json({ error: "Pagamento já vinculado a outra conta" }, { status: 409, headers: corsHeaders });
      }

      const priceId = session.line_items?.data[0]?.price?.id;

      const { error: upsertError } = await adminClient.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: null,
          stripe_payment_intent_id: paymentIntentId,
          plan: planFromPriceId(priceId),
          status: "active",
          current_period_end: null,
        },
        { onConflict: "user_id" },
      );

      if (upsertError) {
        return Response.json({ error: upsertError.message }, { status: 500, headers: corsHeaders });
      }

      return Response.json({ success: true }, { headers: corsHeaders });
    }

    // Mensal: assinatura recorrente.
    const subscriptionId = session.subscription as string;
    if (!subscriptionId) {
      return Response.json({ error: "Pagamento não confirmado" }, { status: 400, headers: corsHeaders });
    }

    const { data: existing } = await adminClient
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", subscriptionId)
      .maybeSingle();

    if (existing && existing.user_id !== userId) {
      return Response.json({ error: "Assinatura já vinculada a outra conta" }, { status: 409, headers: corsHeaders });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const status = subscription.status === "active" || subscription.status === "trialing" ? "active" : "incomplete";
    const currentPeriodEnd = subscription.items.data[0]?.current_period_end;

    const { error: upsertError } = await adminClient.from("subscriptions").upsert(
      {
        user_id: userId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscriptionId,
        stripe_payment_intent_id: null,
        plan: planFromPriceId(subscription.items.data[0]?.price.id),
        status,
        current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
      },
      { onConflict: "user_id" },
    );

    if (upsertError) {
      return Response.json({ error: upsertError.message }, { status: 500, headers: corsHeaders });
    }

    return Response.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500, headers: corsHeaders },
    );
  }
});
