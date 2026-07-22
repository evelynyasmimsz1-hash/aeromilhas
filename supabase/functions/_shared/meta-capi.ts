// Envia o evento de compra pro Meta via Conversions API (lado servidor) —
// não depende do navegador do cliente, então não é bloqueado por
// ad-blocker/Safari como o Pixel tradicional seria. Se as credenciais não
// estiverem configuradas, simplesmente não faz nada (rastreamento é
// opcional, nunca deve quebrar o fluxo de pagamento).
const pixelId = Deno.env.get("META_PIXEL_ID");
const accessToken = Deno.env.get("META_ACCESS_TOKEN");

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function sendMetaPurchaseEvent(params: {
  email: string;
  value: number;
  currency: string;
  eventId: string;
  eventSourceUrl?: string;
}) {
  if (!pixelId || !accessToken) return;

  try {
    const hashedEmail = await sha256Hex(params.email);
    const response = await fetch(`https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${accessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [
          {
            event_name: "Purchase",
            event_time: Math.floor(Date.now() / 1000),
            event_id: params.eventId,
            action_source: "website",
            event_source_url: params.eventSourceUrl,
            user_data: { em: [hashedEmail] },
            custom_data: { currency: params.currency.toUpperCase(), value: params.value },
          },
        ],
      }),
    });
    if (!response.ok) {
      console.error("Meta Conversions API error:", await response.text());
    }
  } catch (error) {
    // Falha ao notificar o Meta nunca deve quebrar o registro do pagamento.
    console.error("Meta Conversions API request failed:", error);
  }
}
