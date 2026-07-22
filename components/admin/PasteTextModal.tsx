"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { guessOfferFromText } from "@/lib/utils/parse-offer-text";
import type { AdminOfferInputForm } from "@/lib/validation/admin-offer";

export function PasteTextModal({
  open,
  onClose,
  onParsed,
}: {
  open: boolean;
  onClose: () => void;
  onParsed: (guess: Partial<AdminOfferInputForm>) => void;
}) {
  const [text, setText] = useState("");

  function handleClose() {
    setText("");
    onClose();
  }

  function handleParse() {
    if (!text.trim()) return;
    const guess = guessOfferFromText(text);
    setText("");
    onParsed(guess);
  }

  return (
    <Modal open={open} title="Colar oferta em texto" onClose={handleClose}>
      <div className="space-y-4">
        <div>
          <label htmlFor="paste-text" className="text-sm font-medium text-ink">
            Cole o texto com a oferta
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

        <p className="text-xs text-ink-secondary">
          Preenchemos o que der pra reconhecer automaticamente no texto — confira e complete o
          restante no formulário.
        </p>

        <Button fullWidth onClick={handleParse} disabled={!text.trim()}>
          <Wand2 className="h-4 w-4" aria-hidden />
          Preencher formulário
        </Button>
      </div>
    </Modal>
  );
}
