"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, SearchX, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterChip } from "@/components/ui/FilterChip";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { FilterSheet } from "@/components/ui/FilterSheet";
import { OfferCard } from "@/components/offers/OfferCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { getOffers } from "@/lib/services/offers";
import { destinationOptions } from "@/data/airports";
import { cabinLabel } from "@/lib/utils/format";
import type { CabinClass, FlightOffer } from "@/types";

type QuickFilter = "all" | "national" | "international" | "business";
type SortOption = "recent" | "miles_asc" | "taxes_asc";

const PAGE_SIZE = 6;

export default function OfertasPage() {
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOffers().then((data) => {
      setOffers(data);
      setLoading(false);
    });
  }, []);

  const availablePrograms = useMemo(
    () => Array.from(new Set(offers.map((offer) => offer.programName))),
    [offers],
  );

  const [query, setQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [sort, setSort] = useState<SortOption>("recent");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [programs, setPrograms] = useState<string[]>([]);
  const [maxMiles, setMaxMiles] = useState("");
  const [cabin, setCabin] = useState<"all" | CabinClass>("all");
  const [goodOnly, setGoodOnly] = useState(false);

  const cabinFilter = quickFilter === "business" ? "business" : cabin;

  function toggleProgram(name: string) {
    setPrograms((prev) => (prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]));
  }

  function clearAdvancedFilters() {
    setOrigin("");
    setDestination("");
    setPrograms([]);
    setMaxMiles("");
    setCabin("all");
    setGoodOnly(false);
    setPage(1);
  }

  const filteredOffers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const max = maxMiles ? Number(maxMiles) : null;

    const result = offers.filter((offer) => {
      if (normalizedQuery) {
        const haystack = `${offer.origin} ${offer.destination} ${offer.programName}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }
      if (quickFilter === "national" && offer.international) return false;
      if (quickFilter === "international" && !offer.international) return false;
      if (cabinFilter !== "all" && offer.cabin !== cabinFilter) return false;
      if (origin && offer.origin !== origin) return false;
      if (destination && offer.destination !== destination) return false;
      if (programs.length > 0 && !programs.includes(offer.programName)) return false;
      if (max !== null && offer.miles > max) return false;
      if (goodOnly && offer.quality !== "good") return false;
      return true;
    });

    return result.sort((a, b) => {
      if (sort === "miles_asc") return a.miles - b.miles;
      if (sort === "taxes_asc") return a.taxes - b.taxes;
      return new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime();
    });
  }, [offers, query, quickFilter, cabinFilter, origin, destination, programs, maxMiles, goodOnly, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredOffers.length / PAGE_SIZE));
  const paginatedOffers = filteredOffers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function updateQuickFilter(value: QuickFilter) {
    setQuickFilter(value);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Ofertas" description="Encontre as melhores oportunidades." />

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          placeholder="Buscar destino ou companhia"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          aria-label="Buscar destino ou companhia"
        />
        <div className="flex gap-3">
          <Select
            label="Ordenar por"
            hideLabel
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="h-11 w-44"
          >
            <option value="recent">Mais recentes</option>
            <option value="miles_asc">Menos milhas</option>
            <option value="taxes_asc">Menores taxas</option>
          </Select>
          <Button variant="secondary" onClick={() => setFiltersOpen(true)} aria-label="Abrir filtros">
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <FilterChip label="Todas" active={quickFilter === "all"} onClick={() => updateQuickFilter("all")} />
        <FilterChip
          label="Nacionais"
          active={quickFilter === "national"}
          onClick={() => updateQuickFilter("national")}
        />
        <FilterChip
          label="Internacionais"
          active={quickFilter === "international"}
          onClick={() => updateQuickFilter("international")}
        />
        <FilterChip
          label="Executiva"
          active={quickFilter === "business"}
          onClick={() => updateQuickFilter("business")}
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : paginatedOffers.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Nenhuma oferta encontrada"
          description="Tente ajustar os filtros ou buscar por outro destino."
          action={
            <Button variant="secondary" onClick={() => { setQuery(""); updateQuickFilter("all"); clearAdvancedFilters(); }}>
              Limpar filtros
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </Button>
              <span className="text-sm text-ink-secondary">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                aria-label="Próxima página"
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          )}
        </>
      )}

      <FilterSheet
        open={filtersOpen}
        title="Filtros"
        onClose={() => setFiltersOpen(false)}
        onApply={() => {
          setPage(1);
          setFiltersOpen(false);
        }}
        onClear={clearAdvancedFilters}
      >
        <Select label="Origem" value={origin} onChange={(event) => setOrigin(event.target.value)}>
          <option value="">Qualquer origem</option>
          {destinationOptions.map((airport) => (
            <option key={airport.code} value={airport.city}>
              {airport.city}
            </option>
          ))}
        </Select>

        <Select label="Destino" value={destination} onChange={(event) => setDestination(event.target.value)}>
          <option value="">Qualquer destino</option>
          {destinationOptions.map((airport) => (
            <option key={airport.code} value={airport.city}>
              {airport.city}
            </option>
          ))}
        </Select>

        <div>
          <p className="text-sm font-medium text-ink">Programa</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {availablePrograms.map((program) => (
              <FilterChip
                key={program}
                label={program}
                active={programs.includes(program)}
                onClick={() => toggleProgram(program)}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="max-miles" className="text-sm font-medium text-ink">
            Máximo de milhas
          </label>
          <input
            id="max-miles"
            type="number"
            min={0}
            placeholder="Sem limite"
            value={maxMiles}
            onChange={(event) => setMaxMiles(event.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <Select label="Classe" value={cabin} onChange={(event) => setCabin(event.target.value as "all" | CabinClass)}>
          <option value="all">Todas as classes</option>
          <option value="economy">{cabinLabel("economy")}</option>
          <option value="premium_economy">{cabinLabel("premium_economy")}</option>
          <option value="business">{cabinLabel("business")}</option>
        </Select>

        <Checkbox
          id="good-only"
          label="Mostrar somente boas ofertas"
          checked={goodOnly}
          onChange={(event) => setGoodOnly(event.target.checked)}
        />
      </FilterSheet>
    </div>
  );
}
