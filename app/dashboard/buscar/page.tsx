"use client";

import { useState } from "react";
import { ChevronDown, Minus, Plus, SearchX } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FilterChip } from "@/components/ui/FilterChip";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { Badge } from "@/components/ui/Badge";
import { OfferStatusBadge } from "@/components/offers/OfferStatusBadge";
import { destinationOptions } from "@/data/airports";
import { generateSearchResults, mockSearchResults } from "@/data/mock-search-results";
import { loyaltyPrograms } from "@/data/loyalty-programs";
import { cabinLabel, formatCurrency, formatDuration, formatMiles } from "@/lib/utils/format";
import type { CabinClass, SearchFlightResult } from "@/types";
import { cn } from "@/lib/utils/cn";

type TripType = "round_trip" | "one_way";
type SortOption = "miles_asc" | "taxes_asc" | "best_value" | "duration_asc";

export default function BuscarPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [tripType, setTripType] = useState<TripType>("round_trip");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [cabin, setCabin] = useState<CabinClass>("economy");
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("best_value");

  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [results, setResults] = useState<SearchFlightResult[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const canSearch = origin && destination && origin !== destination && departureDate;

  function toggleProgram(id: string) {
    setSelectedPrograms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSearch) return;

    setStatus("loading");
    setTimeout(() => {
      const routeResults = mockSearchResults.filter(
        (result) => result.origin === origin && result.destination === destination,
      );
      const pool = routeResults.length > 0 ? routeResults : generateSearchResults(origin, destination);

      const matches = pool.filter((result) => {
        if (cabin && result.cabin !== cabin) return false;
        if (selectedPrograms.length > 0) {
          const programNames = selectedPrograms.map(
            (id) => loyaltyPrograms.find((program) => program.id === id)?.name,
          );
          if (!programNames.includes(result.programName)) return false;
        }
        return true;
      });

      const sorted = [...matches].sort((a, b) => {
        if (sort === "miles_asc") return a.miles - b.miles;
        if (sort === "taxes_asc") return a.taxes - b.taxes;
        if (sort === "duration_asc") return a.durationMinutes - b.durationMinutes;
        return a.miles + a.taxes * 100 - (b.miles + b.taxes * 100);
      });

      setResults(sorted);
      setStatus("done");
    }, 600);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Buscar passagens" description="Encontre voos disponíveis usando suas milhas." />

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-surface p-5">
        <div className="flex gap-2">
          <FilterChip
            label="Ida e volta"
            active={tripType === "round_trip"}
            onClick={() => setTripType("round_trip")}
          />
          <FilterChip label="Somente ida" active={tripType === "one_way"} onClick={() => setTripType("one_way")} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Origem" value={origin} onChange={(event) => setOrigin(event.target.value)} required>
            <option value="">Selecione a origem</option>
            {destinationOptions.map((airport) => (
              <option key={airport.code} value={airport.city}>
                {airport.city} ({airport.code})
              </option>
            ))}
          </Select>
          <Select
            label="Destino"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            required
          >
            <option value="">Selecione o destino</option>
            {destinationOptions.map((airport) => (
              <option key={airport.code} value={airport.city}>
                {airport.city} ({airport.code})
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="departure-date" className="text-sm font-medium text-ink">
              Data de ida
            </label>
            <input
              id="departure-date"
              type="date"
              value={departureDate}
              onChange={(event) => setDepartureDate(event.target.value)}
              required
              className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {tripType === "round_trip" && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="return-date" className="text-sm font-medium text-ink">
                Data de volta
              </label>
              <input
                id="return-date"
                type="date"
                min={departureDate || undefined}
                value={returnDate}
                onChange={(event) => setReturnDate(event.target.value)}
                required
                className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium text-ink">Passageiros</p>
            <div className="flex h-11 items-center justify-between rounded-xl border border-border px-4">
              <span className="text-sm text-ink">{passengers}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPassengers((prev) => Math.max(1, prev - 1))}
                  aria-label="Remover passageiro"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-secondary hover:bg-bg"
                >
                  <Minus className="h-3.5 w-3.5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setPassengers((prev) => Math.min(9, prev + 1))}
                  aria-label="Adicionar passageiro"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-secondary hover:bg-bg"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            </div>
          </div>

          <Select label="Classe" value={cabin} onChange={(event) => setCabin(event.target.value as CabinClass)}>
            <option value="economy">{cabinLabel("economy")}</option>
            <option value="premium_economy">{cabinLabel("premium_economy")}</option>
            <option value="business">{cabinLabel("business")}</option>
          </Select>
        </div>

        <div>
          <p className="text-sm font-medium text-ink">Programas de milhas</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {loyaltyPrograms
              .filter((program) => program.id !== "outro")
              .map((program) => (
                <FilterChip
                  key={program.id}
                  label={program.name}
                  active={selectedPrograms.includes(program.id)}
                  onClick={() => toggleProgram(program.id)}
                />
              ))}
          </div>
        </div>

        <Button type="submit" fullWidth loading={status === "loading"} disabled={!canSearch}>
          Buscar com milhas
        </Button>
      </form>

      {status === "loading" && (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {status === "done" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-secondary">
              {results.length} {results.length === 1 ? "resultado encontrado" : "resultados encontrados"}
            </p>
            <Select
              label="Ordenar por"
              hideLabel
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="h-10 w-48"
            >
              <option value="best_value">Melhor custo-benefício</option>
              <option value="miles_asc">Menos milhas</option>
              <option value="taxes_asc">Menores taxas</option>
              <option value="duration_asc">Menor duração</option>
            </Select>
          </div>

          {results.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Nenhum voo encontrado"
              description="Tente outra data, destino ou programa de milhas."
            />
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <div key={result.id} className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {result.airline} · {result.programName}
                      </p>
                      <p className="mt-1 text-sm text-ink-secondary">
                        {result.departureTime} — {result.arrivalTime} · {formatDuration(result.durationMinutes)}
                        {result.stops === 0 ? " · Direto" : ` · ${result.stops} parada(s)`}
                      </p>
                    </div>
                    <OfferStatusBadge quality={result.quality} />
                  </div>

                  <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-ink">{formatMiles(result.miles)}</p>
                      <p className="text-xs text-ink-secondary">
                        + {formatCurrency(result.taxes)} de taxas · {cabinLabel(result.cabin)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <AvailabilityBadge availability={result.availability} />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setExpandedId((prev) => (prev === result.id ? null : result.id))}
                      >
                        Ver detalhes
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            expandedId === result.id && "rotate-180",
                          )}
                          aria-hidden
                        />
                      </Button>
                    </div>
                  </div>

                  {expandedId === result.id && (
                    <div className="mt-4 grid gap-3 border-t border-border pt-4 text-sm text-ink-secondary sm:grid-cols-2">
                      <p>
                        <span className="text-ink-muted">Origem:</span> {result.origin} ({result.originAirport})
                      </p>
                      <p>
                        <span className="text-ink-muted">Destino:</span> {result.destination} (
                        {result.destinationAirport})
                      </p>
                      <p>
                        <span className="text-ink-muted">Passageiros:</span> {passengers}
                      </p>
                      <p>
                        <span className="text-ink-muted">Disponibilidade:</span>{" "}
                        {availabilityLabel(result.availability)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function availabilityLabel(availability: SearchFlightResult["availability"]) {
  if (availability === "available") return "Disponível";
  if (availability === "limited") return "Poucos assentos";
  return "Indisponível";
}

function AvailabilityBadge({ availability }: { availability: SearchFlightResult["availability"] }) {
  if (availability === "available") return <Badge tone="success">Disponível</Badge>;
  if (availability === "limited") return <Badge tone="warning">Poucos assentos</Badge>;
  return <Badge tone="danger">Indisponível</Badge>;
}
