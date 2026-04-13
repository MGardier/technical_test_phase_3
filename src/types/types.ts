// --- CSV value unions ---

export type TCustomerLevel = 'BASIC' | 'PREMIUM';
export type TCurrency = 'EUR' | 'USD' | 'GBP';
export type TShippingZoneId = 'ZONE1' | 'ZONE2' | 'ZONE3' | 'ZONE4';
export type TProductCategory = 'Electronics' | 'Furniture' | 'Stationery' | 'Accessories';
export type TPromotionType = 'PERCENTAGE' | 'FIXED';

// --- CSV row objects ---

export type TCustomer = {
  id: string;
  name: string;
  level: TCustomerLevel;
  shipping_zone: TShippingZoneId;
  currency: TCurrency;
};

export type TProduct = {
  id: string;
  name: string;
  category: TProductCategory;
  price: number;
  weight: number;
  taxable: boolean;
};

export type TOrder = {
  id: string;
  customer_id: string;
  product_id: string;
  qty: number;
  unit_price: number;
  date: string;
  promo_code: string;
  time: string;
};

export type TShippingZone = {
  zone: TShippingZoneId;
  base: number;
  per_kg: number;
};

export type TPromotion = {
  code: string;
  type: TPromotionType;
  value: string;
  active: boolean;
};

// --- Constants ---

export type TCurrencyRates = Record<TCurrency, number>;

// --- Utils ---

export type TCsvRowMapper<T> = (parts: string[]) => T;
