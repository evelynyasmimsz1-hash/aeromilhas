"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

type FilterSheetProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  onApply: () => void;
  onClear?: () => void;
  children: ReactNode;
};

export function FilterSheet({ open, title, onClose, onApply, onClear, children }: FilterSheetProps) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="flex h-full w-full max-w-sm flex-col bg-surface shadow-xl max-lg:mt-auto max-lg:h-[85vh] max-lg:max-w-full max-lg:rounded-t-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar filtros"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary hover:bg-bg"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">{children}</div>

        <div className="flex items-center gap-3 border-t border-border px-5 py-4">
          {onClear && (
            <Button variant="ghost" onClick={onClear} className="flex-1">
              Limpar
            </Button>
          )}
          <Button onClick={onApply} className="flex-1">
            Aplicar filtros
          </Button>
        </div>
      </div>
    </div>
  );
}
