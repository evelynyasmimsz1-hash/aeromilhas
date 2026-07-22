import { subHours } from "date-fns";
import type { CabinClass, SearchFlightResult } from "@/types";
import { airports } from "./airports";

const now = new Date();

function seedFromString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (Math.imul(31, hash) + value.charCodeAt(i)) | 0;
  }
  return hash;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const airlinesByProgram: Record<string, string> = {
  "LATAM Pass": "LATAM",
  Smiles: "GOL",
  TudoAzul: "Azul",
  "TAP Miles&Go": "TAP Portugal",
  "Iberia Plus": "Iberia",
};

const bookableProgramNames = Object.keys(airlinesByProgram);

const milesRangeByCabin: Record<CabinClass, [number, number]> = {
  economy: [14000, 46000],
  premium_economy: [35000, 66000],
  business: [70000, 115000],
};

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function airportCodeFor(city: string) {
  return airports.find((airport) => airport.city === city)?.code ?? city.slice(0, 3).toUpperCase();
}

/**
 * Sintetiza resultados plausíveis para qualquer par origem/destino que não
 * exista na lista curada, para que a busca nunca fique vazia por falta de dados.
 */
export function generateSearchResults(origin: string, destination: string): SearchFlightResult[] {
  const random = mulberry32(seedFromString(`${origin}->${destination}`));
  const resultCount = 2 + Math.floor(random() * 3);
  const cabinCycle: CabinClass[] = ["economy", "economy", "premium_economy", "business"];

  return Array.from({ length: resultCount }, (_, index) => {
    const programName = bookableProgramNames[Math.floor(random() * bookableProgramNames.length)];
    const cabin = cabinCycle[Math.floor(random() * cabinCycle.length)];
    const [minMiles, maxMiles] = milesRangeByCabin[cabin];
    const miles = Math.round((minMiles + random() * (maxMiles - minMiles)) / 500) * 500;
    const taxes = Math.round((miles * 0.0035 + random() * 60) / 5) * 5;
    const stops = random() > 0.55 ? 1 : 0;
    const durationMinutes = 120 + Math.round(random() * 600) + stops * 90;
    const departureHour = Math.floor(random() * 24);
    const departureMinute = Math.floor(random() * 12) * 5;
    const arrivalTotalMinutes = departureHour * 60 + departureMinute + durationMinutes;
    const arrivalHour = Math.floor(arrivalTotalMinutes / 60) % 24;
    const arrivalMinute = arrivalTotalMinutes % 60;

    const availabilityRoll = random();
    const availability: SearchFlightResult["availability"] =
      availabilityRoll > 0.8 ? "unavailable" : availabilityRoll > 0.55 ? "limited" : "available";

    const midpoint = (minMiles + maxMiles) / 2;
    const quality: SearchFlightResult["quality"] =
      miles < midpoint * 0.85 ? "good" : miles > midpoint * 1.1 ? "high" : "regular";

    return {
      id: `generated-${seedFromString(`${origin}->${destination}->${index}`)}`,
      programName,
      airline: airlinesByProgram[programName],
      origin,
      originAirport: airportCodeFor(origin),
      destination,
      destinationAirport: airportCodeFor(destination),
      departureTime: `${pad(departureHour)}:${pad(departureMinute)}`,
      arrivalTime: `${pad(arrivalHour)}:${pad(arrivalMinute)}`,
      durationMinutes,
      stops,
      miles,
      taxes,
      cabin,
      availability,
      quality,
    };
  });
}

export const mockSearchResults: SearchFlightResult[] = [
  {
    id: "search-1",
    programName: "Smiles",
    airline: "GOL",
    origin: "São Paulo",
    originAirport: "GRU",
    destination: "Miami",
    destinationAirport: "MIA",
    departureTime: "08:15",
    arrivalTime: "16:40",
    durationMinutes: 505,
    stops: 0,
    miles: 35000,
    taxes: 89,
    cabin: "economy",
    availability: "available",
    quality: "good",
  },
  {
    id: "search-2",
    programName: "LATAM Pass",
    airline: "LATAM",
    origin: "São Paulo",
    originAirport: "GRU",
    destination: "Miami",
    destinationAirport: "MIA",
    departureTime: "23:05",
    arrivalTime: "10:20",
    durationMinutes: 555,
    stops: 1,
    miles: 41000,
    taxes: 130,
    cabin: "economy",
    availability: "limited",
    quality: "regular",
  },
  {
    id: "search-3",
    programName: "TudoAzul",
    airline: "Azul",
    origin: "São Paulo",
    originAirport: "VCP",
    destination: "Miami",
    destinationAirport: "MIA",
    departureTime: "21:40",
    arrivalTime: "07:15",
    durationMinutes: 575,
    stops: 1,
    miles: 38000,
    taxes: 102,
    cabin: "economy",
    availability: "available",
    quality: "good",
  },
  {
    id: "search-4",
    programName: "LATAM Pass",
    airline: "LATAM",
    origin: "São Paulo",
    originAirport: "GRU",
    destination: "Lisboa",
    destinationAirport: "LIS",
    departureTime: "22:50",
    arrivalTime: "12:10",
    durationMinutes: 620,
    stops: 0,
    miles: 42000,
    taxes: 210,
    cabin: "economy",
    availability: "available",
    quality: "good",
  },
  {
    id: "search-5",
    programName: "TAP Miles&Go",
    airline: "TAP Portugal",
    origin: "São Paulo",
    originAirport: "GRU",
    destination: "Lisboa",
    destinationAirport: "LIS",
    departureTime: "19:30",
    arrivalTime: "08:50",
    durationMinutes: 620,
    stops: 0,
    miles: 47000,
    taxes: 245,
    cabin: "premium_economy",
    availability: "limited",
    quality: "regular",
  },
  {
    id: "search-6",
    programName: "Smiles",
    airline: "GOL",
    origin: "Rio de Janeiro",
    originAirport: "GIG",
    destination: "Buenos Aires",
    destinationAirport: "EZE",
    departureTime: "10:20",
    arrivalTime: "13:35",
    durationMinutes: 195,
    stops: 0,
    miles: 18000,
    taxes: 65,
    cabin: "economy",
    availability: "available",
    quality: "regular",
  },
  {
    id: "search-7",
    programName: "LATAM Pass",
    airline: "LATAM",
    origin: "São Paulo",
    originAirport: "GRU",
    destination: "Nova York",
    destinationAirport: "JFK",
    departureTime: "23:55",
    arrivalTime: "08:30",
    durationMinutes: 575,
    stops: 0,
    miles: 95000,
    taxes: 340,
    cabin: "business",
    availability: "limited",
    quality: "high",
  },
  {
    id: "search-8",
    programName: "TudoAzul",
    airline: "Azul",
    origin: "Brasília",
    originAirport: "BSB",
    destination: "Cancún",
    destinationAirport: "CUN",
    departureTime: "06:10",
    arrivalTime: "13:45",
    durationMinutes: 455,
    stops: 1,
    miles: 32000,
    taxes: 120,
    cabin: "economy",
    availability: "available",
    quality: "regular",
  },
  {
    id: "search-9",
    programName: "LATAM Pass",
    airline: "LATAM",
    origin: "Porto Alegre",
    originAirport: "POA",
    destination: "Santiago",
    destinationAirport: "SCL",
    departureTime: "14:05",
    arrivalTime: "17:50",
    durationMinutes: 225,
    stops: 0,
    miles: 15000,
    taxes: 55,
    cabin: "economy",
    availability: "available",
    quality: "good",
  },
  {
    id: "search-10",
    programName: "Iberia Plus",
    airline: "Iberia",
    origin: "São Paulo",
    originAirport: "GRU",
    destination: "Madri",
    destinationAirport: "MAD",
    departureTime: "17:15",
    arrivalTime: "08:05",
    durationMinutes: 590,
    stops: 0,
    miles: 60000,
    taxes: 250,
    cabin: "premium_economy",
    availability: "unavailable",
    quality: "regular",
  },
];

export const lastSearchUpdate = subHours(now, 1).toISOString();
