"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsRow } from "@/components/shared/SettingsRow";
import { Switch } from "@/components/ui/Switch";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { deleteAccount } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/services/settings";
import type { AppSettings } from "@/types";

export default function ConfiguracoesPage() {
  const user = useAuthStore((state) => state.user);
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    getSettings(user.id).then(setSettings);
  }, [user]);

  async function toggle(key: keyof Omit<AppSettings, "theme">) {
    if (!user || !settings) return;
    const updated = await updateSettings(user.id, { [key]: !settings[key] });
    setSettings(updated);
  }

  async function handleDeleteAccount() {
    await deleteAccount();
    window.location.href = "/";
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Ajuste notificações, aparência e privacidade." />

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Notificações</h2>
        <div className="mt-2 divide-y divide-border rounded-2xl border border-border bg-surface px-2">
          <SettingsRow
            label="Notificações por e-mail"
            right={
              <Switch
                checked={settings.emailNotifications}
                onChange={() => toggle("emailNotifications")}
                label="Notificações por e-mail"
              />
            }
          />
          <SettingsRow
            label="Notificações push"
            right={
              <Switch
                checked={settings.pushNotifications}
                onChange={() => toggle("pushNotifications")}
                label="Notificações push"
              />
            }
          />
          <SettingsRow
            label="Alertas de ofertas"
            right={
              <Switch
                checked={settings.offerAlerts}
                onChange={() => toggle("offerAlerts")}
                label="Alertas de ofertas"
              />
            }
          />
          <SettingsRow
            label="Alertas de vencimento"
            right={
              <Switch
                checked={settings.expirationAlerts}
                onChange={() => toggle("expirationAlerts")}
                label="Alertas de vencimento"
              />
            }
          />
          <SettingsRow
            label="Promoções de transferência"
            right={
              <Switch
                checked={settings.transferPromotions}
                onChange={() => toggle("transferPromotions")}
                label="Promoções de transferência"
              />
            }
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Preferências gerais</h2>
        <div className="mt-2 divide-y divide-border rounded-2xl border border-border bg-surface px-2">
          <SettingsRow label="Moeda" right={<span className="text-sm text-ink-secondary">Real (BRL)</span>} />
          <SettingsRow
            label="Idioma"
            right={<span className="text-sm text-ink-secondary">Português (Brasil)</span>}
          />
          <SettingsRow
            label="Tema"
            right={
              <div className="flex gap-1 rounded-lg bg-bg p-1">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    theme === "light" ? "bg-surface text-primary shadow-sm" : "text-ink-secondary"
                  }`}
                >
                  Claro
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    theme === "system" ? "bg-surface text-primary shadow-sm" : "text-ink-secondary"
                  }`}
                >
                  Sistema
                </button>
              </div>
            }
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Privacidade</h2>
        <div className="mt-2 divide-y divide-border rounded-2xl border border-border bg-surface px-2">
          <SettingsRow label="Política de Privacidade" href="/privacidade" />
          <SettingsRow label="Termos de Uso" href="/termos" />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Zona de risco</h2>
        <div className="mt-2 rounded-2xl border border-danger/30 bg-surface px-2">
          <SettingsRow label="Excluir minha conta" tone="danger" onClick={() => setConfirmDeleteOpen(true)} />
        </div>
      </section>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Excluir conta"
        description="Essa ação é irreversível. Todos os seus dados, programas, alertas e histórico serão apagados permanentemente."
        confirmLabel="Excluir minha conta"
        tone="danger"
        confirmationWord="EXCLUIR"
        onConfirm={handleDeleteAccount}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}
