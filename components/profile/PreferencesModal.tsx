"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/stores/auth-store";
import { updateProfile } from "@/lib/services/profile";
import { airports, destinationOptions } from "@/data/airports";

export function PreferencesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [homeAirport, setHomeAirport] = useState(user?.homeAirport ?? "");
  const [destinations, setDestinations] = useState<string[]>(user?.favoriteDestinations ?? []);

  function toggleDestination(city: string) {
    setDestinations((prev) => {
      if (prev.includes(city)) return prev.filter((item) => item !== city);
      if (prev.length >= 5) return prev;
      return [...prev, city];
    });
  }

  async function handleSave() {
    if (!user) return;
    const updated = await updateProfile(user.id, {
      homeAirport,
      favoriteDestinations: destinations,
    });
    setUser(updated);
    onClose();
  }

  return (
    <Modal open={open} title="Preferências" onClose={onClose}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-ink">Idioma</p>
            <p className="mt-0.5 text-ink-secondary">Português (Brasil)</p>
          </div>
          <div>
            <p className="font-medium text-ink">Moeda</p>
            <p className="mt-0.5 text-ink-secondary">Real (BRL)</p>
          </div>
        </div>

        <Select label="Aeroporto principal" value={homeAirport} onChange={(event) => setHomeAirport(event.target.value)}>
          <option value="">Selecione um aeroporto</option>
          {airports.map((airport) => (
            <option key={airport.code} value={airport.code}>
              {airport.city} ({airport.code})
            </option>
          ))}
        </Select>

        <div>
          <p className="text-sm font-medium text-ink">Destinos de interesse ({destinations.length}/5)</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {destinationOptions.map((destination) => {
              const selected = destinations.includes(destination.city);
              return (
                <button
                  key={destination.city}
                  type="button"
                  onClick={() => toggleDestination(destination.city)}
                  aria-pressed={selected}
                  className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                    selected
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-surface text-ink-secondary hover:border-primary/40"
                  }`}
                >
                  {destination.city}
                </button>
              );
            })}
          </div>
        </div>

        <Button fullWidth onClick={handleSave}>
          Salvar preferências
        </Button>
      </div>
    </Modal>
  );
}
