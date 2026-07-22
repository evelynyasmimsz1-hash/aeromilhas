"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCcw, Sparkles } from "lucide-react";
import { AdminGate, useAdminSecret } from "@/components/admin/AdminGate";
import { OfferForm } from "@/components/admin/OfferForm";
import { PasteTextModal } from "@/components/admin/PasteTextModal";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getOffers, createOffer, updateOffer, deleteOffer, type AdminOfferInput } from "@/lib/services/offers";
import { formatCurrency, formatMiles, formatRoute } from "@/lib/utils/format";
import type { FlightOffer } from "@/types";

export default function AdminPage() {
  const { secret, setSecret, clearSecret } = useAdminSecret();

  return (
    <AdminGate secret={secret} onSubmit={setSecret}>
      {secret && <AdminDashboard secret={secret} onLogout={clearSecret} />}
    </AdminGate>
  );
}

function AdminDashboard({ secret, onLogout }: { secret: string; onLogout: () => void }) {
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<FlightOffer | null>(null);
  const [deletingOffer, setDeletingOffer] = useState<FlightOffer | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadOffers() {
    setLoading(true);
    const data = await getOffers();
    setOffers(data);
    setLoading(false);
  }

  useEffect(() => {
    getOffers().then((data) => {
      setOffers(data);
      setLoading(false);
    });
  }, []);

  async function handleCreate(values: AdminOfferInput) {
    try {
      setErrorMessage(null);
      await createOffer(values, secret);
      setFormOpen(false);
      await loadOffers();
    } catch {
      setErrorMessage("Senha incorreta ou erro ao salvar. Verifique e tente de novo.");
    }
  }

  async function handleUpdate(values: AdminOfferInput) {
    if (!editingOffer) return;
    try {
      setErrorMessage(null);
      await updateOffer(editingOffer.id, values, secret);
      setEditingOffer(null);
      await loadOffers();
    } catch {
      setErrorMessage("Senha incorreta ou erro ao salvar. Verifique e tente de novo.");
    }
  }

  async function handleDelete() {
    if (!deletingOffer) return;
    try {
      setErrorMessage(null);
      await deleteOffer(deletingOffer.id, secret);
      setDeletingOffer(null);
      await loadOffers();
    } catch {
      setErrorMessage("Senha incorreta ou erro ao excluir.");
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-ink">Supabase ainda não conectado</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local para usar o
          painel de admin com dados compartilhados de verdade entre todos os usuários.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Painel de ofertas</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Ofertas manuais nunca são substituídas pela atualização automática diária.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={loadOffers} aria-label="Recarregar">
            <RefreshCcw className="h-4 w-4" aria-hidden />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setPasteOpen(true)}>
            <Sparkles className="h-4 w-4" aria-hidden />
            Colar texto
          </Button>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden />
            Nova oferta
          </Button>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            Sair
          </Button>
        </div>
      </div>

      {errorMessage && (
        <p role="alert" className="mt-4 rounded-xl bg-danger-surface px-4 py-2.5 text-sm text-danger">
          {errorMessage}
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-ink-secondary">Carregando...</p>
      ) : offers.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Plus}
            title="Nenhuma oferta cadastrada"
            description="Adicione a primeira oferta manualmente."
          />
        </div>
      ) : (
        <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
          {offers.map((offer) => (
            <div key={offer.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-ink">
                    {formatRoute(offer.origin, offer.destination)}
                  </p>
                  <Badge tone={offer.source === "auto" ? "neutral" : "primary"}>
                    {offer.source === "auto" ? "Automática" : "Manual"}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-ink-secondary">
                  {offer.programName} · {formatMiles(offer.miles)} · {formatCurrency(offer.taxes)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditingOffer(offer)}>
                  Editar
                </Button>
                <Button variant="danger" size="sm" onClick={() => setDeletingOffer(offer)}>
                  Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={formOpen} title="Nova oferta" onClose={() => setFormOpen(false)}>
        <OfferForm onSubmit={handleCreate} submitLabel="Criar oferta" />
      </Modal>

      <PasteTextModal
        open={pasteOpen}
        onClose={() => setPasteOpen(false)}
        secret={secret}
        onSaved={loadOffers}
      />

      {editingOffer && (
        <Modal open title="Editar oferta" onClose={() => setEditingOffer(null)}>
          <OfferForm
            defaultValues={{
              origin: editingOffer.origin,
              originAirport: editingOffer.originAirport,
              destination: editingOffer.destination,
              destinationAirport: editingOffer.destinationAirport,
              miles: editingOffer.miles,
              taxes: editingOffer.taxes,
              programName: editingOffer.programName,
              cabin: editingOffer.cabin,
              quality: editingOffer.quality,
              imageUrl: editingOffer.imageUrl ?? "",
              departureDate: editingOffer.departureDate?.slice(0, 10),
              international: editingOffer.international,
            }}
            submitLabel="Salvar alterações"
            onSubmit={handleUpdate}
          />
        </Modal>
      )}

      <ConfirmDialog
        open={Boolean(deletingOffer)}
        title="Excluir oferta"
        description={
          deletingOffer
            ? `Remover a oferta ${formatRoute(deletingOffer.origin, deletingOffer.destination)}?`
            : undefined
        }
        confirmLabel="Excluir"
        tone="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeletingOffer(null)}
      />
    </div>
  );
}
