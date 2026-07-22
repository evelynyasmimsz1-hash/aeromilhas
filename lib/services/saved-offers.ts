import { supabase } from "@/lib/supabase/client";

function requireSupabase() {
  if (!supabase) throw new Error("Supabase não está configurado.");
  return supabase;
}

export async function getSavedOfferIds(): Promise<string[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("saved_offers").select("offer_id");
  if (error || !data) return [];
  return data.map((row) => row.offer_id as string);
}

export async function saveOffer(offerId: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("saved_offers").insert({ offer_id: offerId });
  if (error) throw error;
}

export async function unsaveOffer(offerId: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("saved_offers").delete().eq("offer_id", offerId);
  if (error) throw error;
}
