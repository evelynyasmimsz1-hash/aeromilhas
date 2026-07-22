import { destinationOptions } from "@/data/airports";
import type { AdminOfferInputForm } from "@/lib/validation/admin-offer";

const brazilianAirportCodes = new Set([
  "GRU",
  "CGH",
  "VCP",
  "GIG",
  "SDU",
  "CNF",
  "BSB",
  "CWB",
  "POA",
  "SSA",
  "REC",
  "FOR",
]);

const programAliases: { pattern: RegExp; name: string }[] = [
  { pattern: /latam/i, name: "LATAM Pass" },
  { pattern: /smiles/i, name: "Smiles" },
  { pattern: /azul/i, name: "TudoAzul" },
  { pattern: /livelo/i, name: "Livelo" },
  { pattern: /esfera/i, name: "Esfera" },
  { pattern: /\btap\b/i, name: "TAP Miles&Go" },
  { pattern: /iberia/i, name: "Iberia Plus" },
];

function parseBrazilianNumber(raw: string): number {
  const cleaned = raw.trim();
  if (cleaned.includes(",")) {
    return Number(cleaned.replace(/\./g, "").replace(",", "."));
  }
  return Number(cleaned.replace(/\./g, ""));
}

function guessMiles(text: string): number | undefined {
  const thousandWord = text.match(/(\d+(?:[.,]\d+)?)\s*mil\s*milhas?/i);
  if (thousandWord) return Math.round(parseBrazilianNumber(thousandWord[1]) * 1000);

  const direct = text.match(/(\d{1,3}(?:\.\d{3})+|\d{4,6})\s*milhas?/i);
  if (direct) return Math.round(parseBrazilianNumber(direct[1]));

  return undefined;
}

function guessTaxes(text: string): number | undefined {
  const match = text.match(/r\$\s*([\d.,]+)/i);
  return match ? parseBrazilianNumber(match[1]) : undefined;
}

function guessProgram(text: string): string | undefined {
  return programAliases.find(({ pattern }) => pattern.test(text))?.name;
}

function guessCabin(text: string): AdminOfferInputForm["cabin"] | undefined {
  if (/premium/i.test(text)) return "premium_economy";
  if (/execut|business/i.test(text)) return "business";
  if (/econ[oô]mic/i.test(text)) return "economy";
  return undefined;
}

function guessCities(text: string): {
  origin?: string;
  originAirport?: string;
  destination?: string;
  destinationAirport?: string;
  international?: boolean;
} {
  const lowerText = text.toLowerCase();
  const matches = destinationOptions
    .map((airport) => ({ airport, index: lowerText.indexOf(airport.city.toLowerCase()) }))
    .filter(({ index }) => index !== -1)
    .sort((a, b) => a.index - b.index);

  if (matches.length === 0) return {};

  if (matches.length === 1) {
    const { airport } = matches[0];
    return {
      destination: airport.city,
      destinationAirport: airport.code,
      international: !brazilianAirportCodes.has(airport.code),
    };
  }

  const [from, to] = matches;
  return {
    origin: from.airport.city,
    originAirport: from.airport.code,
    destination: to.airport.city,
    destinationAirport: to.airport.code,
    international: !brazilianAirportCodes.has(to.airport.code),
  };
}

/**
 * Reconhece por padrão de texto (sem IA/API) o que der pra identificar numa
 * oferta colada em texto livre. Não tenta adivinhar tudo — o que não for
 * reconhecido fica de fora, pro admin completar manualmente no formulário.
 */
export function guessOfferFromText(text: string): Partial<AdminOfferInputForm> {
  const guess: Partial<AdminOfferInputForm> = {
    ...guessCities(text),
    programName: guessProgram(text),
    cabin: guessCabin(text),
  };

  const miles = guessMiles(text);
  if (miles !== undefined) guess.miles = miles;

  const taxes = guessTaxes(text);
  if (taxes !== undefined) guess.taxes = taxes;

  return Object.fromEntries(Object.entries(guess).filter(([, value]) => value !== undefined));
}
