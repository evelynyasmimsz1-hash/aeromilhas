"use client";

import { useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { getProfile } from "@/lib/services/profile";

/**
 * Fica escutando o estado de autenticação real do Supabase durante toda a
 * vida do app e mantém o auth-store sincronizado com ele.
 */
export function AuthProvider() {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function syncUser(userId: string | null) {
      if (!userId) {
        if (!cancelled) setUser(null);
        return;
      }
      const profile = await getProfile(userId);
      if (!cancelled) setUser(profile);
    }

    supabase.auth.getSession().then(({ data }) => {
      syncUser(data.session?.user.id ?? null);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session?.user.id ?? null);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
