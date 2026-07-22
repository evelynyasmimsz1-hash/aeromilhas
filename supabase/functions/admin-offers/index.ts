// Edge Function usada pelo painel de admin (/admin) do Aeromilhas para
// criar, editar e remover ofertas. Protegida por um segredo compartilhado
// (ADMIN_SECRET), configurado com:
//   supabase secrets set ADMIN_SECRET=escolha-uma-senha-forte
// O painel envia esse valor no header "x-admin-secret" em toda chamada.
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const adminSecret = Deno.env.get("ADMIN_SECRET")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-secret",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.headers.get("x-admin-secret") !== adminSecret) {
    return Response.json({ error: "Não autorizado" }, { status: 401, headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  if (request.method === "POST") {
    const payload = await request.json();
    const { error, data } = await supabase
      .from("offers")
      .insert({ ...payload, source: "manual" })
      .select()
      .single();
    if (error) return Response.json({ error: error.message }, { status: 400, headers: corsHeaders });
    return Response.json({ offer: data }, { headers: corsHeaders });
  }

  if (request.method === "PATCH") {
    const { id, ...updates } = await request.json();
    if (!id) return Response.json({ error: "id é obrigatório" }, { status: 400, headers: corsHeaders });
    const { error, data } = await supabase.from("offers").update(updates).eq("id", id).select().single();
    if (error) return Response.json({ error: error.message }, { status: 400, headers: corsHeaders });
    return Response.json({ offer: data }, { headers: corsHeaders });
  }

  if (request.method === "DELETE") {
    const { id } = await request.json();
    if (!id) return Response.json({ error: "id é obrigatório" }, { status: 400, headers: corsHeaders });
    const { error } = await supabase.from("offers").delete().eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 400, headers: corsHeaders });
    return Response.json({ success: true }, { headers: corsHeaders });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });
});
