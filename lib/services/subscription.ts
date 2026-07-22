import { supabase } from "@/lib/supabase/client";
import { resolveFunctionError } from "@/lib/utils/supabase-error";
import type { Subscription } from "@/types";

type SubscriptionRow = {
  plan: Subscription["plan"];
  status: Subscription["status"];
  current_period_end: string | null;
};

function mapRow(row: SubscriptionRow): Subscription {
  return {
    plan: row.plan,
    status: row.status,
    currentPeriodEnd: row.current_period_end ?? undefined,
  };
}

export async function getSubscription(userId: string): Promise<Subscription | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data as SubscriptionRow);
}

export async function createCheckoutSession(plan: "monthly" | "lifetime", email?: string): Promise<string> {
  if (!supabase) throw new Error("Supabase não está configurado.");
  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: email ? { plan, email } : { plan },
  });
  if (error) throw await resolveFunctionError(error);
  return data.url as string;
}

export async function verifyCheckoutSession(
  sessionId: string,
): Promise<{ email: string; plan: Subscription["plan"] }> {
  if (!supabase) throw new Error("Supabase não está configurado.");
  const { data, error } = await supabase.functions.invoke("verify-checkout-session", {
    body: { session_id: sessionId },
  });
  if (error) throw await resolveFunctionError(error);
  return data as { email: string; plan: Subscription["plan"] };
}

export async function linkSubscription(sessionId: string, userId: string): Promise<void> {
  if (!supabase) throw new Error("Supabase não está configurado.");
  const { error } = await supabase.functions.invoke("link-subscription", {
    body: { session_id: sessionId, user_id: userId },
  });
  if (error) throw await resolveFunctionError(error);
}
