"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Bell, PackageOpen, Wallet } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { ExpirationAlert } from "@/components/dashboard/ExpirationAlert";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ProgramRow } from "@/components/miles/ProgramRow";
import { ProgramCard } from "@/components/miles/ProgramCard";
import { OfferCard } from "@/components/offers/OfferCard";
import { TransactionRow } from "@/components/miles/TransactionRow";
import { LinkButton } from "@/components/ui/LinkButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useProgramsStore } from "@/lib/stores/programs-store";
import { useAlertsStore } from "@/lib/stores/alerts-store";
import { useTransactionsStore } from "@/lib/stores/transactions-store";
import { getOffers } from "@/lib/services/offers";
import { daysUntil } from "@/lib/utils/format";
import type { FlightOffer } from "@/types";

export default function DashboardPage() {
  const programs = useProgramsStore((state) => state.programs);
  const programsLoaded = useProgramsStore((state) => state.loaded);
  const activeAlertsCount = useAlertsStore(
    (state) => state.alerts.filter((alert) => alert.status === "active").length,
  );
  const transactions = useTransactionsStore((state) => state.transactions);

  const [recommendedOffers, setRecommendedOffers] = useState<FlightOffer[]>([]);

  useEffect(() => {
    getOffers().then((offers) => setRecommendedOffers(offers.slice(0, 4)));
  }, []);

  const totalBalance = programs.reduce((sum, program) => sum + program.balance, 0);
  const totalExpiring = programs.reduce((sum, program) => sum + program.expiringMiles, 0);
  const nearestExpiring = programs
    .filter((program) => program.expiringMiles > 0 && program.expirationDate)
    .sort((a, b) => new Date(a.expirationDate!).getTime() - new Date(b.expirationDate!).getTime())[0];

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  function programName(id: string) {
    return programs.find((program) => program.id === id)?.name ?? "Programa";
  }

  if (!programsLoaded) return null;

  return (
    <div className="space-y-8">
      <DashboardHeader />

      <BalanceCard totalBalance={totalBalance} programCount={programs.length} />

      {nearestExpiring && (
        <ExpirationAlert
          miles={totalExpiring}
          days={daysUntil(nearestExpiring.expirationDate!)}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard icon={Wallet} label="Saldo total" value={`${totalBalance.toLocaleString("pt-BR")} milhas`} />
        <MetricCard
          icon={AlertTriangle}
          label="Milhas a vencer"
          value={`${totalExpiring.toLocaleString("pt-BR")} milhas`}
          tone={totalExpiring > 0 ? "warning" : "neutral"}
        />
        <MetricCard icon={Bell} label="Alertas ativos" value={String(activeAlertsCount)} />
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Programas conectados</h2>
          <LinkButton href="/dashboard/milhas" variant="ghost" size="sm">
            Ver todas
          </LinkButton>
        </div>

        {programs.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={PackageOpen}
              title="Nenhum programa cadastrado"
              description="Adicione um programa de fidelidade para começar a acompanhar seus saldos."
              action={<LinkButton href="/dashboard/milhas">Adicionar programa</LinkButton>}
            />
          </div>
        ) : (
          <>
            <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-border bg-surface lg:block">
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

            <div className="mt-4 space-y-2.5 lg:hidden">
              {programs.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
          </>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Ofertas recomendadas</h2>
          <LinkButton href="/dashboard/ofertas" variant="ghost" size="sm">
            Ver todas
          </LinkButton>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recommendedOffers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Movimentações recentes</h2>
          <LinkButton href="/dashboard/historico" variant="ghost" size="sm">
            Ver histórico completo
          </LinkButton>
        </div>
        <div className="mt-2 divide-y divide-border rounded-2xl border border-border bg-surface px-4">
          {recentTransactions.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              programName={programName(transaction.programId)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
