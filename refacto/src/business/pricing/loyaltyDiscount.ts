import { LOYALTY_DISCOUNT_TIERS } from '../../constants';

export function calculatingLoyaltyDiscount(points: number): number {
    const tier = LOYALTY_DISCOUNT_TIERS.find(t => points > t.threshold);
    if (!tier) return 0;
    return Math.min(points * tier.rate, tier.cap);
}
