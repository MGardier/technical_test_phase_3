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
        level: (columns[2] || 'BASIC') as CustomerLevel,
        shipping_zone: (columns[3] || 'ZONE1') as ShippingZoneId,
        currency: (columns[4] || 'EUR') as Currency,
    };
}

export function mapProduct(columns: string[]): Product {
    return {
        id: columns[0],
        name: columns[1],
        category: columns[2] as ProductCategory,
        price: parseFloat(columns[3]),
        weight: parseFloat(columns[4] || '1.0'),
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
        time: columns[7] || '12:00',
    };
}

export function mapShippingZone(columns: string[]): ShippingZone {
    return {
        zone: columns[0] as ShippingZoneId,
        base: parseFloat(columns[1]),
        per_kg: parseFloat(columns[2] || '0.5'),
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
