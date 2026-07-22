import { supabase } from "@/lib/supabase/client";
import type { MilesProgram } from "@/types";

type ProgramRow = {
  id: string;
  name: string;
  balance: number;
  expiring_miles: number;
  expiration_date: string | null;
  account_number: string | null;
  notes: string | null;
  last_updated_at: string;
};

function mapRow(row: ProgramRow): MilesProgram {
  return {
    id: row.id,
    name: row.name,
    balance: row.balance,
    expiringMiles: row.expiring_miles,
    expirationDate: row.expiration_date ?? undefined,
    accountNumber: row.account_number ?? undefined,
    notes: row.notes ?? undefined,
    lastUpdatedAt: row.last_updated_at,
  };
}

function requireSupabase() {
  if (!supabase) throw new Error("Supabase não está configurado.");
  return supabase;
}

export async function getPrograms(): Promise<MilesProgram[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data.map(mapRow);
}

export async function addProgram(
  input: Omit<MilesProgram, "id" | "lastUpdatedAt">,
): Promise<MilesProgram> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("programs")
    .insert({
      name: input.name,
      balance: input.balance,
      expiring_miles: input.expiringMiles,
      expiration_date: input.expirationDate || null,
      account_number: input.accountNumber || null,
      notes: input.notes || null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data as ProgramRow);
}

export async function updateProgram(
  id: string,
  updates: Partial<MilesProgram>,
): Promise<MilesProgram> {
  const client = requireSupabase();
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.balance !== undefined) payload.balance = updates.balance;
  if (updates.expiringMiles !== undefined) payload.expiring_miles = updates.expiringMiles;
  if (updates.expirationDate !== undefined) payload.expiration_date = updates.expirationDate || null;
  if (updates.accountNumber !== undefined) payload.account_number = updates.accountNumber || null;
  if (updates.notes !== undefined) payload.notes = updates.notes || null;

  const { data, error } = await client.from("programs").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return mapRow(data as ProgramRow);
}

export async function removeProgram(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("programs").delete().eq("id", id);
  if (error) throw error;
}

export async function refreshProgramTimestamp(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client
    .from("programs")
    .update({ last_updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
