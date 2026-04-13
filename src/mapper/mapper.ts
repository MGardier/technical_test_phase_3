import { TCustomer, TOrder, TProduct, TPromotion, TShippingZone } from "../types";

export function mapCustomer(columns: string[]): TCustomer {
    return {
        id: columns[0],
        name: columns[1],
        level: columns[2] || 'BASIC',
        shipping_zone: columns[3] || 'ZONE1',
        currency: columns[4] || 'EUR',
    };
}


export function mapProduct(columns: string[]): TProduct {
    return {
        id: columns[0],
        name: columns[1],
        category: columns[2],
        price: parseFloat(columns[3]),
        weight: parseFloat(columns[4] || '1.0'),
        taxable: columns[5] === 'true',
    };
}



export function mapOrder(columns: string[]): TOrder {
    return {
        id: columns[0],
        customer_id: columns[1],
        product_id: columns[2],
        qty: parseInt(columns[3]),
        unit_price: parseFloat(columns[4]),
        date: columns[5],
        promo_code: columns[6] || '',
        time: columns[7] || '12:00',
    };
}

export function mapShippingZone(columns: string[]): TShippingZone {
    return {
        zone: columns[0],
        base: parseFloat(columns[1]),
        per_kg: parseFloat(columns[2] || '0.5'),
    };
}

export function mapPromotion(columns: string[]): TPromotion {
    return {
        code: columns[0],
        type: columns[1],
        value: columns[2],
        active: columns[3] !== 'false',
    };
}