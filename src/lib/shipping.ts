// Cambodian shipping configuration.
// Rates are USD, configurable per province; free above the threshold.

export const FREE_SHIPPING_THRESHOLD_USD = 50;

const PROVINCE_RATES: Record<string, number> = {
  "Phnom Penh": 2,
  "Siem Reap": 3.5,
  Battambang: 3.5,
  Kandal: 3,
  "Kampong Cham": 3.5,
  "Kampong Chhnang": 3.5,
  "Kampong Speu": 3.5,
  "Kampong Thom": 3.5,
  Kampot: 4,
  Kep: 4,
  "Koh Kong": 4,
  Kratie: 4.5,
  Mondulkiri: 5,
  "Oddar Meanchey": 5,
  Pailin: 4,
  "Preah Sihanouk": 4,
  "Preah Vihear": 4.5,
  "Prey Veng": 3.5,
  Pursat: 4,
  Ratanakiri: 5,
  "Siem Reap City": 3.5,
  "Stung Treng": 5,
  "Svay Rieng": 3.5,
  Takeo: 3.5,
  "Tbong Khmum": 4,
};

export const PROVINCES = Object.keys(PROVINCE_RATES).sort();

export function shippingRateFor(province: string): number {
  return PROVINCE_RATES[province] ?? 4;
}

export function shippingFor(province: string, subtotalUsd: number): number {
  if (subtotalUsd >= FREE_SHIPPING_THRESHOLD_USD) return 0;
  return shippingRateFor(province);
}
