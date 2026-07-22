// Confirma junto ao Stripe que um session_id corresponde a um pagamento
// realmente concluído, e devolve o e-mail e o plano — usado pela tela
// /criar-conta pra travar o e-mail antes de criar a conta. Não precisa de
// autenticação: quem tem o session_id é porque acabou de pagar (o Stripe
// gerou esse id, não é adivinhável).
import { createStripeClient, planFromPriceId, corsHeaders } from "../_shared/stripe.ts";

const stripe = createStripeClient();

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await request.json().catch(() => null);
    const sessionId = body?.session_id;
    if (typeof sessionId !== "string" || !sessionId) {
      return Response.json({ error: "session_id ausente" }, { status: 400, headers: corsHeaders });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items"] });

    if (session.payment_status !== "paid" || !session.customer_details?.email) {
      return Response.json({ error: "Pagamento não confirmado" }, { status: 400, headers: corsHeaders });
    }

    const priceId = session.line_items?.data[0]?.price?.id;

    return Response.json(
      { email: session.customer_details.email, plan: planFromPriceId(priceId) },
      { headers: corsHeaders },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500, headers: corsHeaders },
    );
  }
});
