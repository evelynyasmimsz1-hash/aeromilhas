import { PreviewFrame } from "@/components/shared/PreviewFrame";
import { OfferStatusBadge } from "@/components/offers/OfferStatusBadge";

const previewOffers = [
  { route: "São Paulo → Lisboa", program: "LATAM Pass", miles: "42.000 milhas", quality: "good" as const },
  { route: "São Paulo → Miami", program: "Smiles", miles: "35.000 milhas", quality: "good" as const },
  { route: "Curitiba → Orlando", program: "TudoAzul", miles: "28.000 milhas", quality: "regular" as const },
];

export function OffersPreviewCard({ className }: { className?: string }) {
  return (
    <PreviewFrame className={className}>
      <div>
        <p className="text-sm font-medium text-ink">Ofertas</p>
        <p className="text-xs text-ink-secondary">Encontre as melhores oportunidades</p>
      </div>

      <div className="space-y-2">
        {previewOffers.map((offer) => (
          <div key={offer.route} className="rounded-xl bg-surface px-3.5 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-ink">{offer.route}</span>
              <OfferStatusBadge quality={offer.quality} />
            </div>
            <p className="mt-1 text-xs text-ink-secondary">
              {offer.program} · {offer.miles}
            </p>
          </div>
        ))}
      </div>
    </PreviewFrame>
  );
}
