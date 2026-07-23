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

// Acha onde o nome do programa aparece como cabeçalho de seção (sozinho na
// linha, ex: "Smiles\n- Ida: ..."), não uma menção de passagem no meio de
// uma frase ou dentro de um link (ex: "pd1a.com/smiles"). Cai pra última
// ocorrência qualquer só se nenhuma parecer um cabeçalho.
function sectionHeaderIndex(text: string, pattern: RegExp): number | undefined {
  const globalPattern = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);
  const matches = [...text.matchAll(globalPattern)];
  if (matches.length === 0) return undefined;

  const headerMatches = matches.filter((match) => {
    const afterText = text.slice(match.index! + match[0].length, match.index! + match[0].length + 3);
    return /^\s*\n/.test(afterText) || match.index! + match[0].length >= text.length;
  });

  const chosen = headerMatches.length > 0 ? headerMatches : matches;
  return chosen[chosen.length - 1].index;
}

// Textos com comparação entre programas (ex: Finnair vs Smiles) mencionam
// cada programa mais de uma vez — o cabeçalho de seção é onde estão os
// dados de verdade, não uma menção de passagem em outro lugar do texto.
function guessProgram(text: string): string | undefined {
  let best: { name: string; index: number } | undefined;
  for (const { pattern, name } of programAliases) {
    const index = sectionHeaderIndex(text, pattern);
    if (index !== undefined && (!best || index > best.index)) {
      best = { name, index };
    }
  }
  return best?.name;
}

function scopeToProgramSection(text: string, programName: string): string {
  const alias = programAliases.find((item) => item.name === programName);
  const index = alias ? sectionHeaderIndex(text, alias.pattern) : undefined;
  return index !== undefined ? text.slice(index) : text;
}

// Pega o primeiro número junto ao rótulo ("Ida: 72.700 a 75.100 milhas + R$
// 319,40") — quando há uma faixa ("a 75.100"), usa o valor inicial (o "a
// partir de"). A taxa em R$ é procurada só dentro da mesma linha, pra não
// pegar valor de outra parte do texto.
function extractLeg(text: string, label: "ida" | "volta"): { miles?: number; taxes?: number } {
  const milesRegex = new RegExp(`\\b${label}\\b\\s*:?\\s*(\\d{1,3}(?:\\.\\d{3})*)`, "i");

  for (const line of text.split("\n")) {
    const match = line.match(milesRegex);
    if (!match) continue;
    const taxMatch = line.match(/r\$\s*([\d.,]+)/i);
    return {
      miles: Math.round(parseBrazilianNumber(match[1])),
      taxes: taxMatch ? parseBrazilianNumber(taxMatch[1]) : undefined,
    };
  }

  return {};
}

function guessSimpleMiles(text: string): number | undefined {
  const thousandWord = text.match(/(\d+(?:[.,]\d+)?)\s*mil\s*milhas?/i);
  if (thousandWord) return Math.round(parseBrazilianNumber(thousandWord[1]) * 1000);

  const direct = text.match(/(\d{1,3}(?:\.\d{3})+|\d{4,6})\s*milhas?/i);
  return direct ? Math.round(parseBrazilianNumber(direct[1])) : undefined;
}

function guessSimpleTaxes(text: string): number | undefined {
  const match = text.match(/r\$\s*([\d.,]+)/i);
  return match ? parseBrazilianNumber(match[1]) : undefined;
}

// Quando o texto tem "Ida:"/"Volta:" explícitos, soma as duas pernas (é o
// total da viagem de ida e volta). Sem esses rótulos, não soma nada — pega
// só a primeira menção, pra não misturar números de seções diferentes
// (faixas de preço, comparação entre programas etc.).
function guessMilesAndTaxes(text: string, program?: string): { miles?: number; taxes?: number } {
  const scopedText = program ? scopeToProgramSection(text, program) : text;
  const ida = extractLeg(scopedText, "ida");
  const volta = extractLeg(scopedText, "volta");

  if (ida.miles !== undefined && volta.miles !== undefined) {
    const taxes = (ida.taxes ?? 0) + (volta.taxes ?? 0);
    return { miles: ida.miles + volta.miles, taxes: taxes > 0 ? taxes : undefined };
  }

  return { miles: guessSimpleMiles(text), taxes: guessSimpleTaxes(text) };
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
  const programName = guessProgram(text);

  const guess: Partial<AdminOfferInputForm> = {
    ...guessCities(text),
    programName,
    cabin: guessCabin(text),
    ...guessMilesAndTaxes(text, programName),
  };

  return Object.fromEntries(Object.entries(guess).filter(([, value]) => value !== undefined));
}
