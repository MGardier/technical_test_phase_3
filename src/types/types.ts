// --- CSV value unions ---

export type CustomerLevel = 'BASIC' | 'PREMIUM';
export type Currency = 'EUR' | 'USD' | 'GBP';
export type ShippingZoneId = 'ZONE1' | 'ZONE2' | 'ZONE3' | 'ZONE4';
export type ProductCategory = 'Electronics' | 'Furniture' | 'Stationery' | 'Accessories';
export type PromotionType = 'PERCENTAGE' | 'FIXED';

// --- CSV row objects ---

export type Customer = {
  id: string;
  name: string;
  level: CustomerLevel;
  shipping_zone: ShippingZoneId;
  currency: Currency;
};

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  weight: number;
  taxable: boolean;
};

export type Order = {
  id: string;
  customer_id: string;
  product_id: string;
  qty: number;
  unit_price: number;
  date: string;
  promo_code?: string;
  time: string;
};

export type ShippingZone = {
  zone: ShippingZoneId;
  base: number;
  per_kg: number;
};

export type Promotion = {
  code: string;
  type: PromotionType;
  value: number;
  active: boolean;
};

// --- Constants ---

export type CurrencyRates = Record<Currency, number>;

// --- CSV aggregate ---

export type CsvData = {
  customers: Record<string, Customer>;
  products: Record<string, Product>;
  shippingZones: Record<string, ShippingZone>;
  promotions: Record<string, Promotion>;
  orders: Order[];
};

// --- Utils ---

export type CsvRowMapper<T> = (parts: string[]) => T;
