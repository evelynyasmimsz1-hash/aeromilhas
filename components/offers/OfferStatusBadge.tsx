import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { offerQualityLabel } from "@/lib/utils/format";
import type { OfferQuality } from "@/types";

const toneByQuality: Record<OfferQuality, BadgeTone> = {
  good: "success",
  regular: "neutral",
  high: "warning",
};

const iconByQuality: Record<OfferQuality, typeof TrendingDown> = {
  good: TrendingDown,
  regular: Minus,
  high: TrendingUp,
};

export function OfferStatusBadge({ quality }: { quality: OfferQuality }) {
  const Icon = iconByQuality[quality];
  return (
    <Badge tone={toneByQuality[quality]}>
      <Icon className="h-3 w-3" aria-hidden />
      {offerQualityLabel(quality)}
    </Badge>
  );
}
