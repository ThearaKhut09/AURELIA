// Dual-currency helpers — safe on both server and client.
// Base prices are USD; KHR is display-only at a configurable rate.

export const KHR_RATE = Number(process.env.NEXT_PUBLIC_KHR_RATE ?? 4100);

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function usdToKhr(usd: number, rate: number = KHR_RATE): number {
  // Riel has no subunit in practice — round to the nearest 100.
  return Math.round((usd * rate) / 100) * 100;
}

export function formatKhr(khr: number): string {
  return `៛${new Intl.NumberFormat("en-US").format(khr)}`;
}

/** "$42.00 · ៛172,200" */
export function formatDual(usd: number, rate: number = KHR_RATE): string {
  return `${formatUsd(usd)} · ${formatKhr(usdToKhr(usd, rate))}`;
}

/** Frozen KHR display string for orders (stored at purchase time). */
export function khrDisplayFor(usd: number, rate: number = KHR_RATE): string {
  return formatKhr(usdToKhr(usd, rate));
}
