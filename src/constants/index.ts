import { CurrencyRates } from "../types/types";

// --- Tax ---
export const TAX_RATE = 0.2;

// --- Shipping ---
export const FREE_SHIPPING_THRESHOLD = 50;
export const DEFAULT_SHIPPING_FEE = 5.0;
export const HEAVY_WEIGHT_THRESHOLD = 20;
export const HEAVY_WEIGHT_SURCHARGE_PER_KG = 0.25;
export const REMOTE_ZONE_SURCHARGE = 1.2;
export const MID_WEIGHT_THRESHOLD = 5;
export const MID_WEIGHT_SURCHARGE_PER_KG = 0.3;
export const HIGH_WEIGHT_THRESHOLD = 10;

// --- Discounts ---
export const VOLUME_DISCOUNT_TIERS = [
  { threshold: 1000, rate: 0.20, requiresPremium: true },
  { threshold: 500, rate: 0.15 },
  { threshold: 100, rate: 0.10 },
  { threshold: 50, rate: 0.05 },
] as const;

export const MAX_DISCOUNT = 200;
export const WEEKEND_DISCOUNT_BONUS = 1.05;
export const MORNING_BONUS_RATE = 0.03;
export const MORNING_HOUR_LIMIT = 10;

// --- Loyalty ---
export const LOYALTY_RATIO = 0.01;
export const PREMIUM_THRESHOLD = 1000;

// --- Handling ---
export const HANDLING_FEE = 2.5;
export const HANDLING_ITEM_THRESHOLD = 10;
export const HANDLING_DOUBLE_THRESHOLD = 20;

// --- Currency ---
export const CURRENCY_RATES: CurrencyRates = {
  EUR: 1.0,
  USD: 1.1,
  GBP: 0.85,
} as const;