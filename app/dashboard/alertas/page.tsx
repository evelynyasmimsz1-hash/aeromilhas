"use client";

import { useState } from "react";
import { BellOff, BellPlus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LinkButton } from "@/components/ui/LinkButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AlertCard } from "@/components/alerts/AlertCard";
import { EditAlertModal } from "@/components/alerts/EditAlertModal";
import { useAlertsStore } from "@/lib/stores/alerts-store";
import type { MilesAlert } from "@/types";

export default function AlertasPage() {
  const alerts = useAlertsStore((state) => state.alerts);
  const loaded = useAlertsStore((state) => state.loaded);
  const setStatus = useAlertsStore((state) => state.setStatus);
  const removeAlert = useAlertsStore((state) => state.removeAlert);

  const [editingAlert, setEditingAlert] = useState<MilesAlert | null>(null);
  const [deletingAlert, setDeletingAlert] = useState<MilesAlert | null>(null);

  const active = alerts.filter((alert) => alert.status === "active");
  const matched = alerts.filter((alert) => alert.status === "matched");
  const paused = alerts.filter((alert) => alert.status === "paused");

  function toggleStatus(alert: MilesAlert) {
    setStatus(alert.id, alert.status === "paused" ? "active" : "paused");
  }

  if (!loaded) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertas"
        description="Acompanhe rotas e receba avisos quando o preço em milhas cair."
        action={
          <LinkButton href="/dashboard/alertas/novo">
            <BellPlus className="h-4 w-4" aria-hidden />
            Criar alerta
          </LinkButton>
        }
      />

      {alerts.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="Nenhum alerta criado"
          description="Crie um alerta para ser avisado quando surgir uma boa oportunidade."
          action={<LinkButton href="/dashboard/alertas/novo">Criar alerta</LinkButton>}
        />
      ) : (
        <>
          {matched.length > 0 && (
            <AlertSection
              title="Ofertas encontradas"
              alerts={matched}
              onEdit={setEditingAlert}
              onToggle={toggleStatus}
              onDelete={setDeletingAlert}
            />
          )}
          {active.length > 0 && (
            <AlertSection
              title="Alertas ativos"
              alerts={active}
              onEdit={setEditingAlert}
              onToggle={toggleStatus}
              onDelete={setDeletingAlert}
            />
          )}
          {paused.length > 0 && (
            <AlertSection
              title="Alertas pausados"
              alerts={paused}
              onEdit={setEditingAlert}
              onToggle={toggleStatus}
              onDelete={setDeletingAlert}
            />
          )}
        </>
      )}

      {editingAlert && (
        <EditAlertModal open alert={editingAlert} onClose={() => setEditingAlert(null)} />
      )}

      <ConfirmDialog
        open={Boolean(deletingAlert)}
        title="Excluir alerta"
        description={
          deletingAlert
            ? `Tem certeza que deseja excluir o alerta de ${deletingAlert.origin} para ${deletingAlert.destination}?`
            : undefined
        }
        confirmLabel="Excluir"
        tone="danger"
        onConfirm={() => {
          if (deletingAlert) removeAlert(deletingAlert.id);
          setDeletingAlert(null);
        }}
        onCancel={() => setDeletingAlert(null)}
      />
    </div>
  );
}

function AlertSection({
  title,
  alerts,
  onEdit,
  onToggle,
  onDelete,
}: {
  title: string;
  alerts: MilesAlert[];
  onEdit: (alert: MilesAlert) => void;
  onToggle: (alert: MilesAlert) => void;
  onDelete: (alert: MilesAlert) => void;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-3 space-y-3">
        {alerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onEdit={() => onEdit(alert)}
            onToggleStatus={() => onToggle(alert)}
            onDelete={() => onDelete(alert)}
          />
        ))}
      </div>
    </section>
  );
}
