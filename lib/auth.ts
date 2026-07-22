"use client";

import { supabase } from "@/lib/supabase/client";
import { useProgramsStore } from "@/lib/stores/programs-store";
import { useTransactionsStore } from "@/lib/stores/transactions-store";
import { useAlertsStore } from "@/lib/stores/alerts-store";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { useSavedOffersStore } from "@/lib/stores/saved-offers-store";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase não está configurado. Adicione as credenciais no .env.local.");
  }
  return supabase;
}

export async function signUp(name: string, email: string, password: string) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw error;
  return { needsEmailConfirmation: !data.session, userId: data.user!.id };
}

export async function logIn(email: string, password: string) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { userId: data.user.id };
}

export async function logOut() {
  if (supabase) await supabase.auth.signOut();
  useProgramsStore.getState().reset();
  useTransactionsStore.getState().reset();
  useAlertsStore.getState().reset();
  useNotificationsStore.getState().reset();
  useSavedOffersStore.getState().reset();
}

export async function requestPasswordReset(email: string) {
  const client = requireSupabase();
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/redefinir-senha`,
  });
  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const client = requireSupabase();
  const { error } = await client.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function deleteAccount() {
  // A exclusão definitiva da conta (auth.users) exige a service_role key,
  // que nunca fica no client — por isso passa por uma Edge Function própria.
  const client = requireSupabase();
  const { error } = await client.functions.invoke("delete-account", { method: "POST" });
  if (error) throw error;
  await logOut();
}
