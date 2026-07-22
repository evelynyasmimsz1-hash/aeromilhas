export type Airport = { code: string; city: string };

export const airports: Airport[] = [
  { code: "GRU", city: "São Paulo" },
  { code: "CGH", city: "São Paulo" },
  { code: "VCP", city: "São Paulo" },
  { code: "GIG", city: "Rio de Janeiro" },
  { code: "SDU", city: "Rio de Janeiro" },
  { code: "CNF", city: "Belo Horizonte" },
  { code: "BSB", city: "Brasília" },
  { code: "CWB", city: "Curitiba" },
  { code: "POA", city: "Porto Alegre" },
  { code: "SSA", city: "Salvador" },
  { code: "REC", city: "Recife" },
  { code: "FOR", city: "Fortaleza" },
  { code: "MIA", city: "Miami" },
  { code: "MCO", city: "Orlando" },
  { code: "JFK", city: "Nova York" },
  { code: "LIS", city: "Lisboa" },
  { code: "MAD", city: "Madri" },
  { code: "LHR", city: "Londres" },
  { code: "CDG", city: "Paris" },
  { code: "EZE", city: "Buenos Aires" },
  { code: "SCL", city: "Santiago" },
  { code: "CUN", city: "Cancún" },
];

export const destinationOptions = Array.from(
  new Map(airports.map((airport) => [airport.city, airport])).values(),
);
