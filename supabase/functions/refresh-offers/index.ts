// Edge Function chamada uma vez por dia (via pg_cron, ver migrations/0002_schedule_refresh.sql).
// Substitui as ofertas com source = "auto" por um novo lote gerado, sem tocar
// nas ofertas cadastradas manualmente pelo painel de admin (source = "manual").
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type CabinClass = "economy" | "premium_economy" | "business";

const routes: { origin: string; originAirport: string; destination: string; destinationAirport: string; international: boolean }[] = [
  { origin: "São Paulo", originAirport: "GRU", destination: "Miami", destinationAirport: "MIA", international: true },
  { origin: "São Paulo", originAirport: "GRU", destination: "Lisboa", destinationAirport: "LIS", international: true },
  { origin: "Rio de Janeiro", originAirport: "GIG", destination: "Buenos Aires", destinationAirport: "EZE", international: true },
  { origin: "São Paulo", originAirport: "GRU", destination: "Nova York", destinationAirport: "JFK", international: true },
  { origin: "Brasília", originAirport: "BSB", destination: "Cancún", destinationAirport: "CUN", international: true },
  { origin: "Porto Alegre", originAirport: "POA", destination: "Santiago", destinationAirport: "SCL", international: true },
  { origin: "São Paulo", originAirport: "GRU", destination: "Madri", destinationAirport: "MAD", international: true },
  { origin: "São Paulo", originAirport: "GRU", destination: "Recife", destinationAirport: "REC", international: false },
  { origin: "Belo Horizonte", originAirport: "CNF", destination: "Fortaleza", destinationAirport: "FOR", international: false },
  { origin: "Curitiba", originAirport: "CWB", destination: "Orlando", destinationAirport: "MCO", international: true },
];

const programs = ["LATAM Pass", "Smiles", "TudoAzul", "TAP Miles&Go", "Iberia Plus"];
const cabins: CabinClass[] = ["economy", "economy", "economy", "premium_economy", "business"];

function randomBetween(min: number, max: number) {
  return Math.round((min + Math.random() * (max - min)) / 500) * 500;
}

function buildOffer() {
  const route = routes[Math.floor(Math.random() * routes.length)];
  const cabin = cabins[Math.floor(Math.random() * cabins.length)];
  const programName = programs[Math.floor(Math.random() * programs.length)];

  const milesRange: Record<CabinClass, [number, number]> = {
    economy: [14000, 46000],
    premium_economy: [35000, 66000],
    business: [70000, 115000],
  };
  const [min, max] = milesRange[cabin];
  const miles = randomBetween(min, max);
  const taxes = Math.round((miles * 0.0035 + Math.random() * 60) / 5) * 5;
  const midpoint = (min + max) / 2;
  const quality = miles < midpoint * 0.85 ? "good" : miles > midpoint * 1.1 ? "high" : "regular";

  const departureInDays = 15 + Math.floor(Math.random() * 80);
  const departureDate = new Date();
  departureDate.setDate(departureDate.getDate() + departureInDays);

  return {
    origin: route.origin,
    origin_airport: route.originAirport,
    destination: route.destination,
    destination_airport: route.destinationAirport,
    miles,
    taxes,
    currency: "BRL",
    program_name: programName,
    cabin,
    quality,
    international: route.international,
    departure_date: departureDate.toISOString().slice(0, 10),
    source: "auto",
  };
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { error: deleteError } = await supabase.from("offers").delete().eq("source", "auto");
  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500 });
  }

  const freshOffers = Array.from({ length: 12 }, buildOffer);
  const { error: insertError, data } = await supabase.from("offers").insert(freshOffers).select("id");
  if (insertError) {
    return Response.json({ error: insertError.message }, { status: 500 });
  }

  return Response.json({ inserted: data?.length ?? 0 });
});
