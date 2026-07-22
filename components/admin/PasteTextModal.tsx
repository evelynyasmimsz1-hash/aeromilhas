"use client";

import { useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cabinLabel, formatCurrency, formatMiles, formatRoute } from "@/lib/utils/format";
import { createOffer, parseOfferText, type AdminOfferInput } from "@/lib/services/offers";

export function PasteTextModal({
  open,
  onClose,
  secret,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  secret: string;
  onSaved: () => void;
}) {
  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsedOffers, setParsedOffers] = useState<AdminOfferInput[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setText("");
    setParsedOffers(null);
    setError(null);
    onClose();
  }

  async function handleParse() {
    if (!text.trim()) return;
    setParsing(true);
    setError(null);
    try {
      const offers = await parseOfferText(text, secret);
      setParsedOffers(offers);
    } catch {
      setError("Não consegui organizar esse texto. Verifique a senha ou tente reescrever.");
    } finally {
      setParsing(false);
    }
  }

  function removeParsedOffer(index: number) {
    setParsedOffers((prev) => prev?.filter((_, i) => i !== index) ?? null);
  }

  async function handleSaveAll() {
    if (!parsedOffers || parsedOffers.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      for (const offer of parsedOffers) {
        await createOffer(offer, secret);
      }
      onSaved();
      handleClose();
    } catch {
      setError("Erro ao salvar uma das ofertas. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title="Colar ofertas em texto" onClose={handleClose}>
      <div className="space-y-4">
        <div>
          <label htmlFor="paste-text" className="text-sm font-medium text-ink">
            Cole o texto com uma ou mais ofertas
          </label>
          <textarea
            id="paste-text"
            rows={5}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Ex: São Paulo para Lisboa por 42 mil milhas na LATAM Pass, classe econômica, taxa de uns R$ 210."
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {error && <p role="alert" className="text-sm text-danger">{error}</p>}

        {!parsedOffers && (
          <Button fullWidth onClick={handleParse} loading={parsing} disabled={!text.trim()}>
            <Sparkles className="h-4 w-4" aria-hidden />
            Organizar com IA
          </Button>
        )}

        {parsedOffers && (
          <div className="space-y-3">
            {parsedOffers.length === 0 ? (
              <p className="text-sm text-ink-secondary">Nenhuma oferta reconhecida nesse texto.</p>
            ) : (
              <div className="space-y-2">
                {parsedOffers.map((offer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {formatRoute(offer.origin, offer.destination)}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-secondary">
                        {offer.programName} · {formatMiles(offer.miles)} · {formatCurrency(offer.taxes)} ·{" "}
                        {cabinLabel(offer.cabin)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeParsedOffer(index)}
                      aria-label="Remover esta oferta da lista"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-secondary hover:bg-bg hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setParsedOffers(null)}>
                Tentar de novo
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveAll}
                loading={saving}
                disabled={parsedOffers.length === 0}
              >
                Salvar {parsedOffers.length > 0 ? `(${parsedOffers.length})` : ""}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
