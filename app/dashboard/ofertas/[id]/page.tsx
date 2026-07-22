"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Bookmark, ExternalLink } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { OfferStatusBadge } from "@/components/offers/OfferStatusBadge";
import { OfferMilesTrend } from "@/components/offers/OfferMilesTrend";
import { useSavedOffersStore } from "@/lib/stores/saved-offers-store";
import { getOffers } from "@/lib/services/offers";
import type { FlightOffer } from "@/types";
import {
  cabinLabel,
  formatCurrency,
  formatDateLong,
  formatMiles,
  formatRelativeTime,
  formatRoute,
} from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export default function OfertaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [offers, setOffers] = useState<FlightOffer[] | null>(null);

  useEffect(() => {
    getOffers().then(setOffers);
  }, []);

  const savedOfferIds = useSavedOffersStore((state) => state.savedOfferIds);
  const toggleSaved = useSavedOffersStore((state) => state.toggleSaved);

  if (offers === null) return null;

  const offer = offers.find((item) => item.id === id);
  if (!offer) notFound();

  const saved = savedOfferIds.includes(offer.id);

  const alertParams = new URLSearchParams({
    origem: offer.origin,
    destino: offer.destination,
    classe: offer.cabin,
  }).toString();

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/ofertas"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Voltar para ofertas
      </Link>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {offer.imageUrl && (
          <div className="relative h-48 w-full sm:h-64">
            <Image src={offer.imageUrl} alt={offer.destination} fill className="object-cover" priority />
          </div>
        )}

        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-ink">
                {formatRoute(offer.origin, offer.destination)}
              </h1>
              <p className="mt-1 text-sm text-ink-secondary">
                {offer.originAirport} → {offer.destinationAirport} · {offer.programName}
              </p>
            </div>
            <OfferStatusBadge quality={offer.quality} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <DetailItem label="Milhas necessárias" value={formatMiles(offer.miles)} />
            <DetailItem label="Taxas estimadas" value={`${formatCurrency(offer.taxes)} por passageiro`} />
            <DetailItem label="Classe" value={cabinLabel(offer.cabin)} />
            <DetailItem label="Tipo de voo" value={offer.international ? "Internacional" : "Nacional"} />
            {offer.departureDate && (
              <DetailItem label="Data prevista de embarque" value={formatDateLong(offer.departureDate)} />
            )}
            <DetailItem label="Última atualização" value={formatRelativeTime(offer.lastUpdatedAt)} />
          </div>

          <div className="mt-6 rounded-xl border border-border bg-bg p-4">
            <OfferMilesTrend offerId={offer.id} currentMiles={offer.miles} />
          </div>

          <p className="mt-6 text-xs text-ink-secondary">
            Os valores podem mudar conforme a disponibilidade do programa de fidelidade.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://www.google.com/travel/flights"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses({ className: "sm:flex-1" })}
            >
              Ver disponibilidade
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
            <LinkButton
              href={`/dashboard/alertas/novo?${alertParams}`}
              variant="secondary"
              className="sm:flex-1"
            >
              Criar alerta
            </LinkButton>
            <Button
              variant="secondary"
              className={cn("sm:flex-1", saved && "border-primary text-primary")}
              onClick={() => toggleSaved(offer.id)}
            >
              <Bookmark className={cn("h-4 w-4", saved && "fill-primary")} aria-hidden />
              {saved ? "Oferta salva" : "Salvar oferta"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-secondary">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
