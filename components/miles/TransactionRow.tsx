import { ArrowDownLeft, ArrowUpRight, Gift, RefreshCcw, TimerOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatMiles, transactionTypeLabel } from "@/lib/utils/format";
import type { MilesTransaction } from "@/types";

const iconByType = {
  transfer: ArrowDownLeft,
  redemption: ArrowUpRight,
  bonus: Gift,
  expiration: TimerOff,
  adjustment: RefreshCcw,
};

export function TransactionRow({
  transaction,
  programName,
}: {
  transaction: MilesTransaction;
  programName: string;
}) {
  const Icon = iconByType[transaction.type];
  const positive = transaction.amount > 0;

  return (
    <div className="flex items-center gap-3 rounded-xl px-1 py-3">
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          positive ? "bg-success-surface text-success" : "bg-danger-surface text-danger",
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{transaction.description}</p>
        <p className="text-xs text-ink-secondary">
          {transactionTypeLabel(transaction.type)} · {programName} · {formatDate(transaction.date)}
        </p>
      </div>
      <span className={cn("shrink-0 text-sm font-semibold", positive ? "text-success" : "text-danger")}>
        {positive ? "+" : ""}
        {formatMiles(transaction.amount)}
      </span>
    </div>
  );
}
