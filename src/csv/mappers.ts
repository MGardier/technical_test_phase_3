import {
    DEFAULT_CURRENCY,
    DEFAULT_CUSTOMER_LEVEL,
    DEFAULT_ORDER_TIME,
    DEFAULT_PRODUCT_WEIGHT,
    DEFAULT_SHIPPING_PER_KG,
    DEFAULT_SHIPPING_ZONE,
} from '../constants';
import {
    Customer,
    CustomerLevel,
    Currency,
    Order,
    Product,
    ProductCategory,
    Promotion,
    PromotionType,
    ShippingZone,
    ShippingZoneId,
} from '../types/types';


export function mapCustomer(columns: string[]): Customer {
    return {
        id: columns[0],
        name: columns[1],
        level: (columns[2] || DEFAULT_CUSTOMER_LEVEL) as CustomerLevel,
        shipping_zone: (columns[3] || DEFAULT_SHIPPING_ZONE) as ShippingZoneId,
        currency: (columns[4] || DEFAULT_CURRENCY) as Currency,
    };
}

export function mapProduct(columns: string[]): Product {
    return {
        id: columns[0],
        name: columns[1],
        category: columns[2] as ProductCategory,
        price: parseFloat(columns[3]),
        weight: parseFloat(columns[4] || String(DEFAULT_PRODUCT_WEIGHT)),
        taxable: columns[5] === 'true',
    };
}

export function mapOrder(columns: string[]): Order {
    return {
        id: columns[0],
        customer_id: columns[1],
        product_id: columns[2],
        qty: parseInt(columns[3]),
        unit_price: parseFloat(columns[4]),
        date: columns[5],
        promo_code: columns[6] || undefined,
        time: columns[7] || DEFAULT_ORDER_TIME,
    };
}

export function mapShippingZone(columns: string[]): ShippingZone {
    return {
        zone: columns[0] as ShippingZoneId,
        base: parseFloat(columns[1]),
        per_kg: parseFloat(columns[2] || String(DEFAULT_SHIPPING_PER_KG)),
    };
}

export function mapPromotion(columns: string[]): Promotion {
    return {
        code: columns[0],
        type: columns[1] as PromotionType,
        value: parseFloat(columns[2]),
        active: columns[3] !== 'false',
    };
}
