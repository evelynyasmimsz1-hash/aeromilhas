import { Star } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

const quotes = [
  { initials: "MF", name: "Marina F.", quote: "Achei uma passagem pra Lisboa 30% mais barata em milhas." },
  { initials: "RC", name: "Rafael C.", quote: "Nunca mais deixei milhas vencerem sem perceber." },
];

export function SocialProofCard() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className="h-5 w-5 fill-warning text-warning" aria-hidden />
        ))}
      </div>
      <p className="mt-2 text-sm font-medium text-ink">4.9 de 5 · +50 mil viajantes</p>

      <div className="mt-6 space-y-3">
        {quotes.map((item) => (
          <div key={item.name} className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-left">
            <Avatar initials={item.initials} size="sm" />
            <div>
              <p className="text-sm text-ink">“{item.quote}”</p>
              <p className="mt-1 text-xs text-ink-secondary">{item.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
