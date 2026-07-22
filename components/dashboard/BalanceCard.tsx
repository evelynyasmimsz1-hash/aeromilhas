import { Plane } from "lucide-react";
import { LinkButton } from "@/components/ui/LinkButton";
import { formatMiles } from "@/lib/utils/format";

type BalanceCardProps = {
  totalBalance: number;
  programCount: number;
};

export function BalanceCard({ totalBalance, programCount }: BalanceCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-hover p-6 text-white">
      <Plane className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 -rotate-45 text-white/10" aria-hidden />
      <p className="text-sm font-medium text-white/80">Saldo total</p>
      <p className="mt-1 text-4xl font-semibold tracking-tight">{formatMiles(totalBalance)}</p>
      <p className="mt-3 text-sm text-white/80">
        {programCount} {programCount === 1 ? "programa conectado" : "programas conectados"}
      </p>
      <LinkButton
        href="/dashboard/milhas"
        variant="secondary"
        size="sm"
        className="mt-5 border-0 bg-white text-primary hover:bg-white/90"
      >
        Ver minhas milhas
      </LinkButton>
    </div>
  );
}
