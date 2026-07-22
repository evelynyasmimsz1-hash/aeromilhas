"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Logo } from "@/components/shared/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "aeromilhas-admin-secret";

export function useAdminSecret() {
  const [secret, setSecretState] = useState<string | null>(null);

  useEffect(() => {
    // sessionStorage só existe no navegador; precisa ser lido depois da montagem.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSecretState(sessionStorage.getItem(STORAGE_KEY));
  }, []);

  function setSecret(value: string) {
    sessionStorage.setItem(STORAGE_KEY, value);
    setSecretState(value);
  }

  function clearSecret() {
    sessionStorage.removeItem(STORAGE_KEY);
    setSecretState(null);
  }

  return { secret, setSecret, clearSecret };
}

export function AdminGate({
  secret,
  onSubmit,
  children,
}: {
  secret: string | null;
  onSubmit: (value: string) => void;
  children: ReactNode;
}) {
  const [value, setValue] = useState("");

  if (secret) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-col items-center text-center">
          <Logo />
          <p className="mt-2 text-sm text-ink-secondary">Painel de administração</p>
        </div>
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(value);
          }}
        >
          <Input
            label="Senha de admin"
            type="password"
            autoFocus
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <Button type="submit" fullWidth disabled={!value}>
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
