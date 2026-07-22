// Recebe eventos do Stripe e grava o status da assinatura em public.subscriptions.
// Implantada com --no-verify-jwt: o Stripe não manda um JWT do Supabase, então
// a autenticidade é garantida pela verificação de assinatura abaixo
// (Stripe-Signature + STRIPE_WEBHOOK_SECRET), não pelo verify_jwt padrão.
import { createClient } from "npm:@supabase/supabase-js";
import Stripe from "npm:stripe";
import { createStripeClient, planFromPriceId } from "../_shared/stripe.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const stripe = createStripeClient();
const cryptoProvider = Stripe.createSubtleCryptoProvider();
const adminClient = createClient(supabaseUrl, serviceRoleKey);

// Prefere o metadata (fluxo autenticado, já sabe o user_id na hora de criar
// a assinatura); se não tiver, procura uma linha já vinculada por
// link-subscription (fluxo "paga antes de criar conta"). Se nenhuma das
// duas existir ainda, não faz nada — o link-subscription é quem cria a
// linha quando a conta for criada.
async function resolveUserId(subscription: Stripe.Subscription): Promise<string | null> {
  const metadataUserId = subscription.metadata?.supabase_user_id;
  if (metadataUserId) return metadataUserId;

  const { data } = await adminClient
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  return data?.user_id ?? null;
}

async function upsertFromSubscription(subscription: Stripe.Subscription) {
  const userId = await resolveUserId(subscription);
  if (!userId) return;

  const status =
    subscription.status === "active" || subscription.status === "trialing"
      ? "active"
      : subscription.status === "canceled" || subscription.status === "unpaid"
        ? "canceled"
        : subscription.status === "past_due"
          ? "past_due"
          : "incomplete";

  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;

  await adminClient.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      plan: planFromPriceId(subscription.items.data[0]?.price.id),
      status,
      current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
    },
    { onConflict: "user_id" },
  );
}

Deno.serve(async (request) => {
  const signature = request.headers.get("Stripe-Signature");
  const body = await request.text();

  if (!signature) {
    return new Response("Assinatura ausente", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret, undefined, cryptoProvider);
  } catch {
    return new Response("Assinatura inválida", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode === "payment") {
        // Vitalício comprado por usuário já autenticado (ex: assinatura
        // vencida) — nesse caso o metadata já tem o user_id. Quando não tem
        // (fluxo "paga antes de criar conta"), quem grava é o link-subscription.
        const userId = session.metadata?.supabase_user_id;
        if (userId) {
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
          await adminClient.from("subscriptions").upsert(
            {
              user_id: userId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: null,
              stripe_payment_intent_id: session.payment_intent as string,
              plan: planFromPriceId(lineItems.data[0]?.price?.id),
              status: "active",
              current_period_end: null,
            },
            { onConflict: "user_id" },
          );
        }
        break;
      }

      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await upsertFromSubscription(subscription);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await upsertFromSubscription(event.data.object as Stripe.Subscription);
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        await adminClient
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", invoice.subscription as string);
      }
      break;
    }
  }

  return Response.json({ received: true });
});
