import { WEEKEND_DAYS, WEEKEND_DISCOUNT_BONUS } from '../../constants';


// Bug legacy  : Si firstOrderDate est vide, dayOfWeek vaut 0 (dimanche) → le bonus est appliqué.
export function calculatingWeekendBonus(discount: number, firstOrderDate: string): number {
    const dayOfWeek = firstOrderDate ? new Date(firstOrderDate).getDay() : 0;
    if (WEEKEND_DAYS.includes(dayOfWeek)) {
        return discount * WEEKEND_DISCOUNT_BONUS;
    }
    return discount;
}
