"use client";

import { Modal } from "@/components/ui/Modal";
import { AlertForm } from "@/components/alerts/AlertForm";
import { useAlertsStore } from "@/lib/stores/alerts-store";
import type { AlertValues } from "@/lib/validation/alert";
import type { MilesAlert } from "@/types";

export function EditAlertModal({
  open,
  onClose,
  alert,
}: {
  open: boolean;
  onClose: () => void;
  alert: MilesAlert;
}) {
  const updateAlert = useAlertsStore((state) => state.updateAlert);

  async function handleSubmit(values: AlertValues) {
    await updateAlert(alert.id, values);
    onClose();
  }

  return (
    <Modal open={open} title="Editar alerta" onClose={onClose}>
      <AlertForm
        submitLabel="Salvar alterações"
        onSubmit={handleSubmit}
        defaultValues={{
          origin: alert.origin,
          destination: alert.destination,
          startDate: alert.startDate?.slice(0, 10),
          endDate: alert.endDate?.slice(0, 10),
          maximumMiles: alert.maximumMiles,
          cabin: alert.cabin,
          programIds: alert.programIds,
          passengers: alert.passengers,
          notificationFrequency: alert.notificationFrequency,
        }}
      />
    </Modal>
  );
}
