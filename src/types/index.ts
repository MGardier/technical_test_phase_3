
// --- Objects ---

export type TCustomer = any;
export type TOrder = any;
export type TProduct = any;
export type TShippingZone = any;
export type TPromotion = any;

// --- Constants ---
export type TCurrencyRates = {
  EUR: number,
  USD: number,
  GBP: number,
}


// --- Utils ---

export type TCsvRowMapper<T> = (parts: string[]) => T;
