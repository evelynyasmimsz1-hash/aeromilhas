"use client";

import { useState } from "react";
import { AlertTriangle, Layers, Plus, RefreshCcw, Wallet, PackageOpen } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ProgramRow } from "@/components/miles/ProgramRow";
import { ProgramCard } from "@/components/miles/ProgramCard";
import { AddProgramModal } from "@/components/miles/AddProgramModal";
import { useProgramsStore } from "@/lib/stores/programs-store";
import { formatMiles, formatRelativeTime } from "@/lib/utils/format";

export default function MinhasMilhasPage() {
  const programs = useProgramsStore((state) => state.programs);
  const loaded = useProgramsStore((state) => state.loaded);
  const refreshBalances = useProgramsStore((state) => state.refreshBalances);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);

  const totalBalance = programs.reduce((sum, program) => sum + program.balance, 0);
  const totalExpiring = programs.reduce((sum, program) => sum + program.expiringMiles, 0);
  const lastUpdate = programs
    .map((program) => program.lastUpdatedAt)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

  async function handleRefresh() {
    setRefreshing(true);
    await refreshBalances();
    setRefreshing(false);
    setJustRefreshed(true);
    setTimeout(() => setJustRefreshed(false), 3000);
  }

  if (!loaded) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Minhas milhas"
        description="Acompanhe seus saldos e vencimentos em um só lugar."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleRefresh} loading={refreshing}>
              <RefreshCcw className="h-4 w-4" aria-hidden />
              Atualizar saldos
            </Button>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden />
              Adicionar programa
            </Button>
          </div>
        }
      />

      {justRefreshed && (
        <p className="rounded-xl bg-success-surface px-4 py-2.5 text-sm text-success">
          Saldos atualizados agora.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard icon={Wallet} label="Saldo total" value={formatMiles(totalBalance)} />
        <MetricCard
          icon={AlertTriangle}
          label="Total a vencer"
          value={formatMiles(totalExpiring)}
          tone={totalExpiring > 0 ? "warning" : "neutral"}
        />
        <MetricCard icon={Layers} label="Programas conectados" value={String(programs.length)} />
      </div>

      <p className="text-xs text-ink-muted">
        {lastUpdate
          ? `Atualização geral ${formatRelativeTime(lastUpdate)} · dados informados manualmente`
          : "Dados informados manualmente"}
      </p>

      {programs.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="Nenhum programa cadastrado"
          description="Adicione um programa de fidelidade para começar a acompanhar seus saldos."
          action={<Button onClick={() => setModalOpen(true)}>Adicionar programa</Button>}
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-border bg-surface lg:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-xs font-medium uppercase tracking-wide text-ink-muted">
                  <th className="px-4 py-3 font-medium">Programa</th>
                  <th className="px-4 py-3 font-medium">Saldo</th>
                  <th className="px-4 py-3 font-medium">A vencer</th>
                  <th className="px-4 py-3 font-medium">Próxima expiração</th>
                  <th className="px-4 py-3 font-medium">Atualizado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="px-4">
                {programs.map((program) => (
                  <ProgramRow key={program.id} program={program} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2.5 lg:hidden">
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </>
      )}

      <AddProgramModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
