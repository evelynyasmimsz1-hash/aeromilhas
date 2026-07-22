// Edge Function usada pelo painel de admin: recebe um texto livre descrevendo
// uma ou mais ofertas e devolve os campos já organizados, usando Claude com
// saída estruturada (JSON Schema) para garantir um formato previsível.
import Anthropic from "npm:@anthropic-ai/sdk";

const adminSecret = Deno.env.get("ADMIN_SECRET")!;
const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-secret",
};

const offerSchema = {
  type: "object",
  properties: {
    offers: {
      type: "array",
      items: {
        type: "object",
        properties: {
          origin: { type: "string", description: "Cidade de origem, ex: São Paulo" },
          originAirport: { type: "string", description: "Código IATA de 3 letras, ex: GRU" },
          destination: { type: "string", description: "Cidade de destino, ex: Lisboa" },
          destinationAirport: { type: "string", description: "Código IATA de 3 letras, ex: LIS" },
          miles: { type: "integer", description: "Quantidade de milhas necessárias" },
          taxes: { type: "number", description: "Taxas estimadas em reais (só o número)" },
          programName: {
            type: "string",
            enum: ["LATAM Pass", "Smiles", "TudoAzul", "TAP Miles&Go", "Iberia Plus"],
          },
          cabin: { type: "string", enum: ["economy", "premium_economy", "business"] },
          quality: {
            type: "string",
            enum: ["good", "regular", "high"],
            description: "good = bom preço, regular = preço normal, high = acima da média",
          },
          international: { type: "boolean" },
          departureDate: {
            type: ["string", "null"],
            description: "Data de embarque em formato YYYY-MM-DD, ou null se não mencionada",
          },
        },
        required: [
          "origin",
          "originAirport",
          "destination",
          "destinationAirport",
          "miles",
          "taxes",
          "programName",
          "cabin",
          "quality",
          "international",
          "departureDate",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["offers"],
  additionalProperties: false,
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.headers.get("x-admin-secret") !== adminSecret) {
    return Response.json({ error: "Não autorizado" }, { status: 401, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });
  }

  const { text } = await request.json();
  if (!text || typeof text !== "string" || !text.trim()) {
    return Response.json({ error: "Informe um texto com a(s) oferta(s)" }, { status: 400, headers: corsHeaders });
  }

  const client = new Anthropic({ apiKey: anthropicApiKey });

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4096,
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: offerSchema },
      },
      messages: [
        {
          role: "user",
          content:
            "Extraia todas as ofertas de passagens com milhas descritas no texto abaixo. " +
            "Se algum dado não estiver explícito, faça sua melhor estimativa razoável " +
            "(ex: código de aeroporto a partir do nome da cidade, se é voo nacional ou " +
            "internacional a partir do Brasil, e a qualidade da oferta a partir da " +
            "quantidade de milhas para a classe informada).\n\nTexto:\n" +
            text,
        },
      ],
    });

    const parsed = JSON.parse((message.content[0] as { text: string }).text);
    return Response.json(parsed, { headers: corsHeaders });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro ao interpretar o texto" },
      { status: 500, headers: corsHeaders },
    );
  }
});
