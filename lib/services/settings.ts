import { supabase } from "@/lib/supabase/client";
import type { AppSettings } from "@/types";

type SettingsRow = {
  theme: AppSettings["theme"];
  email_notifications: boolean;
  push_notifications: boolean;
  offer_alerts: boolean;
  expiration_alerts: boolean;
  transfer_promotions: boolean;
};

function mapRow(row: SettingsRow): AppSettings {
  return {
    theme: row.theme,
    emailNotifications: row.email_notifications,
    pushNotifications: row.push_notifications,
    offerAlerts: row.offer_alerts,
    expirationAlerts: row.expiration_alerts,
    transferPromotions: row.transfer_promotions,
  };
}

function requireSupabase() {
  if (!supabase) throw new Error("Supabase não está configurado.");
  return supabase;
}

export async function getSettings(userId: string): Promise<AppSettings | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error || !data) return null;
  return mapRow(data as SettingsRow);
}

export async function updateSettings(
  userId: string,
  updates: Partial<AppSettings>,
): Promise<AppSettings> {
  const client = requireSupabase();
  const payload: Record<string, unknown> = {};
  if (updates.theme !== undefined) payload.theme = updates.theme;
  if (updates.emailNotifications !== undefined) payload.email_notifications = updates.emailNotifications;
  if (updates.pushNotifications !== undefined) payload.push_notifications = updates.pushNotifications;
  if (updates.offerAlerts !== undefined) payload.offer_alerts = updates.offerAlerts;
  if (updates.expirationAlerts !== undefined) payload.expiration_alerts = updates.expirationAlerts;
  if (updates.transferPromotions !== undefined) payload.transfer_promotions = updates.transferPromotions;

  const { data, error } = await client
    .from("settings")
    .update(payload)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return mapRow(data as SettingsRow);
}
