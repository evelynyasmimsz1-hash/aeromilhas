import { supabase } from "@/lib/supabase/client";
import type { AppNotification } from "@/types";

type NotificationRow = {
  id: string;
  title: string;
  description: string;
  type: AppNotification["type"];
  read: boolean;
  href: string | null;
  created_at: string;
};

function mapRow(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    read: row.read,
    href: row.href ?? undefined,
    createdAt: row.created_at,
  };
}

function requireSupabase() {
  if (!supabase) throw new Error("Supabase não está configurado.");
  return supabase;
}

export async function getNotifications(): Promise<AppNotification[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(mapRow);
}

export async function markNotificationRead(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("notifications").update({ read: true }).eq("id", id);
  if (error) throw error;
}

export async function markAllNotificationsRead(): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("notifications").update({ read: true }).eq("read", false);
  if (error) throw error;
}
