import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { mockOffers } from "@/data/mock-offers";
import type { CabinClass, FlightOffer, OfferQuality } from "@/types";

type OfferRow = {
  id: string;
  origin: string;
  origin_airport: string;
  destination: string;
  destination_airport: string;
  miles: number;
  taxes: number;
  currency: "BRL";
  program_name: string;
  cabin: CabinClass;
  quality: OfferQuality;
  image_url: string | null;
  departure_date: string | null;
  return_date: string | null;
  international: boolean;
  highlight: boolean | null;
  flash_deal_ends_at: string | null;
  source: "manual" | "auto";
  created_at: string;
  updated_at: string;
};

function mapRowToOffer(row: OfferRow): FlightOffer {
  return {
    id: row.id,
    origin: row.origin,
    originAirport: row.origin_airport,
    destination: row.destination,
    destinationAirport: row.destination_airport,
    miles: row.miles,
    taxes: Number(row.taxes),
    currency: row.currency,
    programName: row.program_name,
    cabin: row.cabin,
    quality: row.quality,
    imageUrl: row.image_url ?? undefined,
    departureDate: row.departure_date ?? undefined,
    returnDate: row.return_date ?? undefined,
    lastUpdatedAt: row.updated_at,
    international: row.international,
    highlight: row.highlight ?? undefined,
    source: row.source,
    flashDeal: row.flash_deal_ends_at ? { endsAt: row.flash_deal_ends_at } : undefined,
  };
}

export type AdminOfferInput = {
  origin: string;
  originAirport: string;
  destination: string;
  destinationAirport: string;
  miles: number;
  taxes: number;
  programName: string;
  cabin: CabinClass;
  quality: OfferQuality;
  imageUrl?: string;
  departureDate?: string;
  international: boolean;
};

function toRow(input: AdminOfferInput) {
  return {
    origin: input.origin,
    origin_airport: input.originAirport,
    destination: input.destination,
    destination_airport: input.destinationAirport,
    miles: input.miles,
    taxes: input.taxes,
    program_name: input.programName,
    cabin: input.cabin,
    quality: input.quality,
    image_url: input.imageUrl || null,
    departure_date: input.departureDate || null,
    international: input.international,
  };
}

/** Busca ofertas no Supabase quando configurado; usa os dados mockados como fallback. */
export async function getOffers(): Promise<FlightOffer[]> {
  if (!isSupabaseConfigured || !supabase) return mockOffers;

  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return mockOffers;
  return data.map(mapRowToOffer);
}

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase não está configurado. Adicione as credenciais no .env.local.");
  }
  return supabase;
}

export async function createOffer(input: AdminOfferInput, adminSecret: string) {
  const client = requireSupabase();
  const { data, error } = await client.functions.invoke("admin-offers", {
    method: "POST",
    headers: { "x-admin-secret": adminSecret },
    body: toRow(input),
  });
  if (error) throw error;
  return mapRowToOffer(data.offer as OfferRow);
}

export async function updateOffer(id: string, input: AdminOfferInput, adminSecret: string) {
  const client = requireSupabase();
  const { data, error } = await client.functions.invoke("admin-offers", {
    method: "PATCH",
    headers: { "x-admin-secret": adminSecret },
    body: { id, ...toRow(input) },
  });
  if (error) throw error;
  return mapRowToOffer(data.offer as OfferRow);
}

export async function deleteOffer(id: string, adminSecret: string) {
  const client = requireSupabase();
  const { error } = await client.functions.invoke("admin-offers", {
    method: "DELETE",
    headers: { "x-admin-secret": adminSecret },
    body: { id },
  });
  if (error) throw error;
}
