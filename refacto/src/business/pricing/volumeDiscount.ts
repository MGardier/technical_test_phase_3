import { VOLUME_DISCOUNT_TIERS } from '../../constants';
import { CustomerLevel } from '../../types';

export function calculatingVolumeDiscount(subtotal: number, level: CustomerLevel): number {
    const tier = VOLUME_DISCOUNT_TIERS.find(t => {
        if (subtotal <= t.threshold) return false;
        if ('requiresPremium' in t && t.requiresPremium && level !== 'PREMIUM') return false;
        return true;
    });
    return tier ? subtotal * tier.rate : 0;
}
