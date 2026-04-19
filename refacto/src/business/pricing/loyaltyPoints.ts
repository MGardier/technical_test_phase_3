import { LOYALTY_RATIO } from '../../constants';
import { Order } from '../../types';

export function calculatingLoyaltyPoints(orders: Order[]): Record<string, number> {

    const points: Record<string, number> = {};
    for (const order of orders) {
        const previous = points[order.customer_id] ?? 0;
        points[order.customer_id] = previous + order.qty * order.unit_price * LOYALTY_RATIO;
    }
    return points;
}
