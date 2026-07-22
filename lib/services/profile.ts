import { supabase } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  home_airport: string | null;
  favorite_destinations: string[];
  created_at: string;
};

function mapRow(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    homeAirport: row.home_airport ?? undefined,
    favoriteDestinations: row.favorite_destinations,
  };
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error || !data) return null;
  return mapRow(data as ProfileRow);
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, "name" | "homeAirport" | "favoriteDestinations">>,
): Promise<UserProfile> {
  if (!supabase) throw new Error("Supabase não configurado.");

  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.homeAirport !== undefined) payload.home_airport = updates.homeAirport;
  if (updates.favoriteDestinations !== undefined) {
    payload.favorite_destinations = updates.favoriteDestinations;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return mapRow(data as ProfileRow);
}
