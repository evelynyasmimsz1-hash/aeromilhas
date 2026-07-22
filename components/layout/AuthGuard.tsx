"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useProgramsStore } from "@/lib/stores/programs-store";
import { useTransactionsStore } from "@/lib/stores/transactions-store";
import { useAlertsStore } from "@/lib/stores/alerts-store";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { useSavedOffersStore } from "@/lib/stores/saved-offers-store";
import { getSubscription } from "@/lib/services/subscription";

export function AuthGuard({ children }: { children: ReactNode }) {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/entrar");
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    let cancelled = false;
    getSubscription(user.id).then((subscription) => {
      if (cancelled) return;
      setSubscriptionActive(subscription?.status === "active");
      setSubscriptionChecked(true);
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!subscriptionChecked || !subscriptionActive) return;
    useProgramsStore.getState().fetchPrograms();
    useTransactionsStore.getState().fetchTransactions();
    useAlertsStore.getState().fetchAlerts();
    useNotificationsStore.getState().fetchNotifications();
    useSavedOffersStore.getState().fetchSavedOfferIds();
  }, [subscriptionChecked, subscriptionActive]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !subscriptionChecked) return;
    if (!subscriptionActive) router.replace("/assinatura");
  }, [isLoading, isAuthenticated, subscriptionChecked, subscriptionActive, router]);

  if (isLoading || !isAuthenticated || !subscriptionChecked || !subscriptionActive) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" aria-hidden />
      </div>
    );
  }

  return <>{children}</>;
}
