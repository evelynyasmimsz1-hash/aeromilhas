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

// Mesmo mapeamento de data/destination-images.ts do app Next.js — duplicado
// aqui porque essa function roda num runtime Deno separado, sem acesso
// direto aos módulos do app.
const destinationImages: Record<string, string> = {
  Miami: "https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=800&q=80",
  Orlando: "https://images.unsplash.com/photo-1597466599360-3b9775841aec?w=800&q=80",
  Lisboa: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&q=80",
  Paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
  "Nova York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
  "Buenos Aires": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80",
  Santiago: "https://images.unsplash.com/photo-1689850543263-01a52ccc6943?w=800&q=80",
  Cancún: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800&q=80",
  Madri: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&q=80",
  Londres: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
};

function destinationImage(city: string) {
  return destinationImages[city] ?? destinationImages.Lisboa;
}

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
    image_url: destinationImage(route.destination),
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
