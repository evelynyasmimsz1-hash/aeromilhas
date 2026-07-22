import { supabase } from "@/lib/supabase/client";
import type { MilesAlert } from "@/types";

type AlertRow = {
  id: string;
  origin: string;
  destination: string;
  maximum_miles: number;
  cabin: MilesAlert["cabin"];
  passengers: number;
  start_date: string | null;
  end_date: string | null;
  program_ids: string[];
  status: MilesAlert["status"];
  last_checked_at: string | null;
  notification_frequency: MilesAlert["notificationFrequency"];
};

function mapRow(row: AlertRow): MilesAlert {
  return {
    id: row.id,
    origin: row.origin,
    destination: row.destination,
    maximumMiles: row.maximum_miles,
    cabin: row.cabin,
    passengers: row.passengers,
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    programIds: row.program_ids,
    status: row.status,
    lastCheckedAt: row.last_checked_at ?? undefined,
    notificationFrequency: row.notification_frequency,
  };
}

function requireSupabase() {
  if (!supabase) throw new Error("Supabase não está configurado.");
  return supabase;
}

export async function getAlerts(): Promise<MilesAlert[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(mapRow);
}

export async function addAlert(input: Omit<MilesAlert, "id" | "status">): Promise<MilesAlert> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("alerts")
    .insert({
      origin: input.origin,
      destination: input.destination,
      maximum_miles: input.maximumMiles,
      cabin: input.cabin,
      passengers: input.passengers,
      start_date: input.startDate || null,
      end_date: input.endDate || null,
      program_ids: input.programIds,
      notification_frequency: input.notificationFrequency,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data as AlertRow);
}

export async function updateAlert(id: string, updates: Partial<MilesAlert>): Promise<MilesAlert> {
  const client = requireSupabase();
  const payload: Record<string, unknown> = {};
  if (updates.origin !== undefined) payload.origin = updates.origin;
  if (updates.destination !== undefined) payload.destination = updates.destination;
  if (updates.maximumMiles !== undefined) payload.maximum_miles = updates.maximumMiles;
  if (updates.cabin !== undefined) payload.cabin = updates.cabin;
  if (updates.passengers !== undefined) payload.passengers = updates.passengers;
  if (updates.startDate !== undefined) payload.start_date = updates.startDate || null;
  if (updates.endDate !== undefined) payload.end_date = updates.endDate || null;
  if (updates.programIds !== undefined) payload.program_ids = updates.programIds;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.lastCheckedAt !== undefined) payload.last_checked_at = updates.lastCheckedAt;
  if (updates.notificationFrequency !== undefined) {
    payload.notification_frequency = updates.notificationFrequency;
  }

  const { data, error } = await client.from("alerts").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return mapRow(data as AlertRow);
}

export async function removeAlert(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("alerts").delete().eq("id", id);
  if (error) throw error;
}
