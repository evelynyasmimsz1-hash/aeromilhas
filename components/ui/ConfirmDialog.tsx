"use client";

import { useEffect, useState } from "react";
import { Button } from "./Button";
import { Input } from "./Input";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  confirmationWord?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "primary",
  confirmationWord,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [typedWord, setTypedWord] = useState("");

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") handleCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const isBlocked = Boolean(confirmationWord) && typedWord !== confirmationWord;

  function handleCancel() {
    setTypedWord("");
    onCancel();
  }

  function handleConfirm() {
    setTypedWord("");
    onConfirm();
  }

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
      onClick={handleCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="text-lg font-semibold text-ink">
          {title}
        </h2>
        {description && <p className="mt-2 text-sm text-ink-secondary">{description}</p>}

        {confirmationWord && (
          <div className="mt-4">
            <Input
              label={`Digite "${confirmationWord}" para confirmar`}
              value={typedWord}
              onChange={(event) => setTypedWord(event.target.value)}
              autoComplete="off"
            />
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={handleCancel}>
            {cancelLabel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={handleConfirm} disabled={isBlocked}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
