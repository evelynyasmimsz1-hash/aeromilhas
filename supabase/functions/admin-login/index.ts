// Verifica e-mail + senha de admin no servidor antes de liberar o painel.
// O AdminGate antes só guardava o que a pessoa digitasse, sem checar nada —
// essa function é o que garante de verdade que só entra quem sabe o e-mail
// e a senha certos (comparados aqui, nunca no client).
const adminEmail = Deno.env.get("ADMIN_EMAIL")!;
const adminSecret = Deno.env.get("ADMIN_SECRET")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const body = await request.json().catch(() => null);
  const email = body?.email;
  const password = body?.password;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    email.trim().toLowerCase() !== adminEmail.trim().toLowerCase() ||
    password !== adminSecret
  ) {
    return Response.json({ error: "E-mail ou senha inválidos" }, { status: 401, headers: corsHeaders });
  }

  return Response.json({ success: true }, { headers: corsHeaders });
});
