import { formatMiles } from "@/lib/utils/format";

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

export function OfferMilesTrend({ offerId, currentMiles }: { offerId: string; currentMiles: number }) {
  const random = mulberry32(seedFromString(offerId));
  const points = Array.from({ length: 5 }, () => {
    const variation = (random() - 0.5) * 0.3;
    return Math.round(currentMiles * (1 + variation));
  });
  points.push(currentMiles);

  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const width = 280;
  const height = 64;
  const stepX = width / (points.length - 1);

  const coords = points.map((value, index) => {
    const x = index * stepX;
    const y = height - ((value - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });

  return (
    <div>
      <p className="text-sm font-medium text-ink">Histórico do valor em milhas</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-16 w-full" preserveAspectRatio="none" aria-hidden>
        <polyline points={coords.join(" ")} fill="none" stroke="var(--color-primary)" strokeWidth={2} />
      </svg>
      <div className="mt-1 flex justify-between text-xs text-ink-muted">
        <span>Menor: {formatMiles(min)}</span>
        <span>Maior: {formatMiles(max)}</span>
      </div>
    </div>
  );
}
