"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";

/** Manda quem já está logado direto pro app, sem passar de novo pelo onboarding ou login. */
export function AuthRedirect({ to = "/dashboard" }: { to?: string }) {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace(to);
  }, [isLoading, isAuthenticated, router, to]);

  return null;
}
