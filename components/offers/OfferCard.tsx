import Image from "next/image";
import { LinkButton } from "@/components/ui/LinkButton";
import { OfferStatusBadge } from "./OfferStatusBadge";
import { cabinLabel, formatCurrency, formatMiles, formatRoute } from "@/lib/utils/format";
import type { FlightOffer } from "@/types";

export function OfferCard({ offer }: { offer: FlightOffer }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="relative h-36 w-full">
        {offer.imageUrl && (
          <Image
            src={offer.imageUrl}
            alt={offer.destination}
            fill
            sizes="(min-width: 1024px) 320px, 100vw"
            className="object-cover"
          />
        )}
        <div className="absolute left-3 top-3">
          <OfferStatusBadge quality={offer.quality} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-base font-semibold text-ink">
          {formatRoute(offer.origin, offer.destination)}
        </p>
        <p className="mt-0.5 text-xs text-ink-secondary">
          {offer.programName} · {cabinLabel(offer.cabin)}
        </p>

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-lg font-semibold text-ink">{formatMiles(offer.miles)}</span>
        </div>
        <p className="text-xs text-ink-secondary">+ {formatCurrency(offer.taxes)} de taxas</p>

        <LinkButton
          href={`/dashboard/ofertas/${offer.id}`}
          variant="secondary"
          size="sm"
          className="mt-4"
        >
          Ver oferta
        </LinkButton>
      </div>
    </div>
  );
}
