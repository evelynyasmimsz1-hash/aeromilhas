"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { SettingsRow } from "@/components/shared/SettingsRow";
import { Modal } from "@/components/ui/Modal";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { ChangePasswordModal } from "@/components/profile/ChangePasswordModal";
import { PreferencesModal } from "@/components/profile/PreferencesModal";
import { useAuthStore } from "@/lib/stores/auth-store";
import { logOut } from "@/lib/auth";
import { userInitials } from "@/data/mock-user";
import { formatDateLong } from "@/lib/utils/format";

type InfoModalKey = "assinatura" | "sessoes" | "sobre" | null;

export default function PerfilPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [infoModal, setInfoModal] = useState<InfoModalKey>(null);

  if (!user) return null;

  async function handleLogout() {
    await logOut();
    router.push("/entrar");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Perfil" description="Gerencie seus dados e preferências." />

      <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5">
        <Avatar initials={userInitials(user.name)} size="lg" />
        <div>
          <p className="text-lg font-semibold text-ink">{user.name}</p>
          <p className="text-sm text-ink-secondary">{user.email}</p>
          <p className="mt-1 text-xs text-ink-muted">Conta criada em {formatDateLong(user.createdAt)}</p>
        </div>
      </div>

      <ProfileSection title="Conta">
        <SettingsRow label="Meus dados" onClick={() => setEditOpen(true)} />
        <SettingsRow label="Senha e segurança" onClick={() => setPasswordOpen(true)} />
        <SettingsRow label="Assinatura" onClick={() => setInfoModal("assinatura")} />
        <SettingsRow label="Sessões conectadas" onClick={() => setInfoModal("sessoes")} />
      </ProfileSection>

      <ProfileSection title="Preferências">
        <SettingsRow
          label="Idioma, moeda, aeroporto e destinos"
          onClick={() => setPreferencesOpen(true)}
        />
        <SettingsRow label="Notificações" href="/dashboard/configuracoes" />
      </ProfileSection>

      <ProfileSection title="Milhas">
        <SettingsRow label="Programas conectados" href="/dashboard/milhas" />
        <SettingsRow label="Alertas de ofertas" href="/dashboard/alertas" />
      </ProfileSection>

      <ProfileSection title="Outros">
        <SettingsRow label="Central de ajuda" href="/dashboard/ajuda" />
        <SettingsRow label="Sobre o Aeromilhas" onClick={() => setInfoModal("sobre")} />
        <SettingsRow label="Privacidade" href="/privacidade" />
        <SettingsRow label="Termos" href="/termos" />
        <SettingsRow label="Sair da conta" tone="danger" onClick={handleLogout} />
      </ProfileSection>

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
      <ChangePasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
      <PreferencesModal open={preferencesOpen} onClose={() => setPreferencesOpen(false)} />

      <Modal open={infoModal === "assinatura"} title="Assinatura" onClose={() => setInfoModal(null)}>
        <p className="text-sm text-ink-secondary">
          Você ainda não tem uma assinatura ativa. Escolha um plano para desbloquear alertas
          ilimitados e acompanhamento completo de vencimentos.
        </p>
      </Modal>

      <Modal open={infoModal === "sessoes"} title="Sessões conectadas" onClose={() => setInfoModal(null)}>
        <div className="rounded-xl border border-border bg-bg p-4">
          <p className="text-sm font-medium text-ink">Este dispositivo</p>
          <p className="mt-0.5 text-xs text-ink-secondary">Navegador web · Ativo agora</p>
        </div>
      </Modal>

      <Modal open={infoModal === "sobre"} title="Sobre o Aeromilhas" onClose={() => setInfoModal(null)}>
        <p className="text-sm text-ink-secondary">
          O Aeromilhas ajuda você a centralizar seus saldos de milhas, acompanhar vencimentos e
          encontrar as melhores oportunidades para viajar.
        </p>
      </Modal>
    </div>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">{title}</h2>
      <div className="mt-2 divide-y divide-border rounded-2xl border border-border bg-surface px-2">
        {children}
      </div>
    </section>
  );
}
