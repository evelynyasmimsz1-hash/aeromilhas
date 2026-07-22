import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CabinClass, MilesAlertStatus, MilesTransactionType, OfferQuality } from "@/types";

export function formatMiles(value: number) {
  return `${new Intl.NumberFormat("pt-BR").format(value)} milhas`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value: string) {
  return format(new Date(value), "dd/MM/yyyy");
}

export function formatDateLong(value: string) {
  return format(new Date(value), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatRelativeTime(value: string) {
  return formatDistanceToNow(new Date(value), { addSuffix: true, locale: ptBR });
}

export function formatRoute(origin: string, destination: string) {
  return `${origin} → ${destination}`;
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins.toString().padStart(2, "0")}min`;
}

export function daysUntil(dateString: string) {
  const diff = new Date(dateString).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const cabinLabels: Record<CabinClass, string> = {
  economy: "Econômica",
  premium_economy: "Econômica premium",
  business: "Executiva",
};

export function cabinLabel(cabin: CabinClass) {
  return cabinLabels[cabin];
}

const qualityLabels: Record<OfferQuality, string> = {
  good: "Bom preço",
  regular: "Preço normal",
  high: "Acima da média",
};

export function offerQualityLabel(quality: OfferQuality) {
  return qualityLabels[quality];
}

const transactionLabels: Record<MilesTransactionType, string> = {
  transfer: "Transferência",
  redemption: "Resgate",
  bonus: "Bônus",
  expiration: "Expiração",
  adjustment: "Ajuste",
};

export function transactionTypeLabel(type: MilesTransactionType) {
  return transactionLabels[type];
}

const alertStatusLabels: Record<MilesAlertStatus, string> = {
  active: "Ativo",
  paused: "Pausado",
  matched: "Oferta encontrada",
};

export function alertStatusLabel(status: MilesAlertStatus) {
  return alertStatusLabels[status];
}
