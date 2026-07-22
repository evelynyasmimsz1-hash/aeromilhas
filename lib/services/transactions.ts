import { supabase } from "@/lib/supabase/client";
import type { MilesTransaction } from "@/types";

type TransactionRow = {
  id: string;
  program_id: string | null;
  type: MilesTransaction["type"];
  amount: number;
  description: string;
  date: string;
  balance_after: number | null;
};

function mapRow(row: TransactionRow): MilesTransaction {
  return {
    id: row.id,
    programId: row.program_id ?? "",
    type: row.type,
    amount: row.amount,
    description: row.description,
    date: row.date,
    balanceAfter: row.balance_after ?? undefined,
  };
}

function requireSupabase() {
  if (!supabase) throw new Error("Supabase não está configurado.");
  return supabase;
}

export async function getTransactions(): Promise<MilesTransaction[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });
  if (error || !data) return [];
  return data.map(mapRow);
}

export async function addTransaction(
  input: Omit<MilesTransaction, "id">,
): Promise<MilesTransaction> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("transactions")
    .insert({
      program_id: input.programId || null,
      type: input.type,
      amount: input.amount,
      description: input.description,
      date: input.date,
      balance_after: input.balanceAfter ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data as TransactionRow);
}
