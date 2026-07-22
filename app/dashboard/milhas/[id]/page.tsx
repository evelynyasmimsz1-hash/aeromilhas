"use client";

import { use, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarClock, History, Pencil, Plus, RefreshCcw, Trash2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TransactionRow } from "@/components/miles/TransactionRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EditProgramModal } from "@/components/miles/EditProgramModal";
import { AddTransactionModal } from "@/components/miles/AddTransactionModal";
import { useProgramsStore } from "@/lib/stores/programs-store";
import { useTransactionsStore } from "@/lib/stores/transactions-store";
import { formatDate, formatMiles, formatRelativeTime } from "@/lib/utils/format";

export default function ProgramaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const program = useProgramsStore((state) => state.programs.find((item) => item.id === id));
  const programsLoaded = useProgramsStore((state) => state.loaded);
  const removeProgram = useProgramsStore((state) => state.removeProgram);
  const transactions = useTransactionsStore(
    (state) => state.transactions.filter((transaction) => transaction.programId === id),
  );

  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  if (!programsLoaded) return null;
  if (!program) notFound();

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  async function handleRemove() {
    await removeProgram(program!.id);
    router.push("/dashboard/milhas");
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/milhas"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Voltar para minhas milhas
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{program.name}</h1>
          {program.accountNumber && (
            <p className="mt-1 text-sm text-ink-secondary">Conta {program.accountNumber}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => setBalanceModalOpen(true)}>
            <RefreshCcw className="h-4 w-4" aria-hidden />
            Atualizar saldo
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setTransactionModalOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden />
            Registrar movimentação
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setEditModalOpen(true)}>
            <Pencil className="h-4 w-4" aria-hidden />
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => setConfirmRemoveOpen(true)}>
            <Trash2 className="h-4 w-4" aria-hidden />
            Remover
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard icon={Wallet} label="Saldo atual" value={formatMiles(program.balance)} />
        <MetricCard
          icon={CalendarClock}
          label="Próxima expiração"
          value={program.expirationDate ? formatDate(program.expirationDate) : "Sem previsão"}
          tone={program.expiringMiles > 0 ? "warning" : "neutral"}
        />
        <MetricCard icon={History} label="Última atualização" value={formatRelativeTime(program.lastUpdatedAt)} />
      </div>

      {program.expiringMiles > 0 && (
        <p className="rounded-xl bg-warning-surface px-4 py-2.5 text-sm text-warning">
          {formatMiles(program.expiringMiles)} próximas do vencimento
          {program.expirationDate ? ` em ${formatDate(program.expirationDate)}` : ""}.
        </p>
      )}

      {program.notes && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs font-medium text-ink-secondary">Observações</p>
          <p className="mt-1 text-sm text-ink">{program.notes}</p>
        </div>
      )}

      <section>
        <h2 className="text-lg font-semibold text-ink">Movimentações</h2>
        {sortedTransactions.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={History}
              title="Nenhuma movimentação registrada"
              description="Transferências, resgates e bônus deste programa vão aparecer aqui."
            />
          </div>
        ) : (
          <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface px-4">
            {sortedTransactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} programName={program.name} />
            ))}
          </div>
        )}
      </section>

      <EditProgramModal
        open={balanceModalOpen}
        onClose={() => setBalanceModalOpen(false)}
        program={program}
        title="Atualizar saldo"
      />
      <EditProgramModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        program={program}
        title="Editar programa"
      />
      <AddTransactionModal
        open={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        programId={program.id}
        currentBalance={program.balance}
      />
      <ConfirmDialog
        open={confirmRemoveOpen}
        title="Remover programa"
        description={`Tem certeza que deseja remover ${program.name}? Essa ação não pode ser desfeita.`}
        confirmLabel="Remover"
        tone="danger"
        onConfirm={handleRemove}
        onCancel={() => setConfirmRemoveOpen(false)}
      />
    </div>
  );
}
