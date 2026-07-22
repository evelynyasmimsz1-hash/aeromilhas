"use client";

import { useMemo, useState } from "react";
import { History } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { FilterChip } from "@/components/ui/FilterChip";
import { EmptyState } from "@/components/ui/EmptyState";
import { TransactionRow } from "@/components/miles/TransactionRow";
import { useTransactionsStore } from "@/lib/stores/transactions-store";
import { useProgramsStore } from "@/lib/stores/programs-store";
import { formatDate, formatMiles, transactionTypeLabel } from "@/lib/utils/format";
import type { MilesTransactionType } from "@/types";
import { cn } from "@/lib/utils/cn";

type FilterOption = "all" | MilesTransactionType;

const filterOptions: { value: FilterOption; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "transfer", label: "Transferências" },
  { value: "redemption", label: "Resgates" },
  { value: "bonus", label: "Bônus" },
  { value: "expiration", label: "Expirações" },
  { value: "adjustment", label: "Ajustes" },
];

export default function HistoricoPage() {
  const [filter, setFilter] = useState<FilterOption>("all");
  const transactions = useTransactionsStore((state) => state.transactions);
  const transactionsLoaded = useTransactionsStore((state) => state.loaded);
  const programs = useProgramsStore((state) => state.programs);

  function programName(id: string) {
    return programs.find((program) => program.id === id)?.name ?? "Programa";
  }

  const filteredTransactions = useMemo(() => {
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    if (filter === "all") return sorted;
    return sorted.filter((transaction) => transaction.type === filter);
  }, [transactions, filter]);

  if (!transactionsLoaded) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Histórico" description="Todas as movimentações das suas milhas." />

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {filterOptions.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            active={filter === option.value}
            onClick={() => setFilter(option.value)}
          />
        ))}
      </div>

      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon={History}
          title="Nenhuma movimentação encontrada"
          description="Ainda não há registros para este filtro."
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-border bg-surface lg:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-xs font-medium uppercase tracking-wide text-ink-muted">
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 font-medium">Programa</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Quantidade</th>
                  <th className="px-4 py-3 font-medium">Saldo após</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-border text-sm last:border-0">
                    <td className="px-4 py-3.5 text-ink-secondary">{formatDate(transaction.date)}</td>
                    <td className="px-4 py-3.5 font-medium text-ink">{transaction.description}</td>
                    <td className="px-4 py-3.5 text-ink-secondary">{programName(transaction.programId)}</td>
                    <td className="px-4 py-3.5 text-ink-secondary">{transactionTypeLabel(transaction.type)}</td>
                    <td
                      className={cn(
                        "px-4 py-3.5 font-medium",
                        transaction.amount > 0 ? "text-success" : "text-danger",
                      )}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {formatMiles(transaction.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-ink-secondary">
                      {transaction.balanceAfter !== undefined ? formatMiles(transaction.balanceAfter) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-border rounded-2xl border border-border bg-surface px-4 lg:hidden">
            {filteredTransactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                programName={programName(transaction.programId)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
