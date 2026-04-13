import * as fs from 'fs';
import * as path from 'path';
import {
    CURRENCY_RATES,
    DEFAULT_CURRENCY,
    DEFAULT_CUSTOMER_LEVEL,
    DEFAULT_PRODUCT_WEIGHT,
    DEFAULT_SHIPPING_FEE,
    DEFAULT_SHIPPING_PER_KG,
    DEFAULT_SHIPPING_ZONE,
    FREE_SHIPPING_THRESHOLD,
    HANDLING_DOUBLE_THRESHOLD,
    HANDLING_FEE,
    HANDLING_ITEM_THRESHOLD,
    HEAVY_WEIGHT_SURCHARGE_PER_KG,
    HEAVY_WEIGHT_THRESHOLD,
    HIGH_WEIGHT_THRESHOLD,
    LOYALTY_DISCOUNT_TIERS,
    LOYALTY_RATIO,
    MAX_DISCOUNT,
    MID_WEIGHT_SURCHARGE_PER_KG,
    MID_WEIGHT_THRESHOLD,
    MORNING_BONUS_RATE,
    MORNING_HOUR_LIMIT,
    REMOTE_ZONES,
    REMOTE_ZONE_SURCHARGE,
    TAX_RATE,
    VOLUME_DISCOUNT_TIERS,
    WEEKEND_DAYS,
    WEEKEND_DISCOUNT_BONUS,
} from './constants';
import { loadCsvData } from './csv/loadCsvData';
import { Currency, CustomerLevel, ShippingZoneId } from './types';



// Fonction principale qui fait TOUT
function run(): string {

    
    const { customers, products, shippingZones, promotions, orders } = loadCsvData(
        path.join(__dirname, 'data'),
    );



    // Calcul des points de fidélité (première duplication)
    const loyaltyPoints: Record<string, number> = {};
    for (const o of orders) {
        const cid = o.customer_id;
        if (!loyaltyPoints[cid]) {
            loyaltyPoints[cid] = 0;
        }
        // Calcul basé sur le prix de commande
        loyaltyPoints[cid] += o.qty * o.unit_price * LOYALTY_RATIO;
    }

    // Groupement par client (logique métier mélangée avec aggregation)
    const totalsByCustomer: Record<string, any> = {};
    for (const o of orders) {
        const cid = o.customer_id;

        // Récupération du produit avec fallback
        const prod = products[o.product_id] || {};
        let basePrice = prod.price !== undefined ? prod.price : o.unit_price;

        // Application de la promo (logique complexe et bugguée)
        const promoCode = o.promo_code;
        let discountRate = 0;
        let fixedDiscount = 0;

        if (promoCode && promotions[promoCode]) {
            const promo = promotions[promoCode];
            if (promo.active) {
                if (promo.type === 'PERCENTAGE') {
                    discountRate = promo.value / 100;
                } else if (promo.type === 'FIXED') {
                    // Bug intentionnel: appliqué par ligne au lieu de global
                    fixedDiscount = promo.value;
                }
            }
        }

        // Calcul ligne avec réduction promo
        let lineTotal = o.qty * basePrice * (1 - discountRate) - fixedDiscount * o.qty;

        // Bonus matin (règle cachée basée sur l'heure)
        const hour = parseInt(o.time.split(':')[0]);
        let morningBonus = 0;
        if (hour < MORNING_HOUR_LIMIT) {
            morningBonus = lineTotal * MORNING_BONUS_RATE;
        }
        lineTotal = lineTotal - morningBonus;

        if (!totalsByCustomer[cid]) {
            totalsByCustomer[cid] = {
                subtotal: 0.0,
                items: [],
                weight: 0.0,
                promoDiscount: 0.0,
                morningBonus: 0.0
            };
        }

        totalsByCustomer[cid].subtotal += lineTotal;
        totalsByCustomer[cid].weight += (prod.weight || DEFAULT_PRODUCT_WEIGHT) * o.qty;
        totalsByCustomer[cid].items.push(o);
        totalsByCustomer[cid].morningBonus += morningBonus;
    }

    // Génération du rapport (mélange calculs + formatage + I/O)
    const outputLines: string[] = [];
    const jsonData: any[] = [];
    let grandTotal = 0.0;
    let totalTaxCollected = 0.0;

    // Tri par ID client (comportement à préserver)
    const sortedCustomerIds = Object.keys(totalsByCustomer).sort();

    for (const cid of sortedCustomerIds) {
        const cust = customers[cid] || {};
        const name = cust.name || 'Unknown';
        const level: CustomerLevel = cust.level || DEFAULT_CUSTOMER_LEVEL;
        const zone: ShippingZoneId = cust.shipping_zone || DEFAULT_SHIPPING_ZONE;
        const currency: Currency = cust.currency || DEFAULT_CURRENCY;

        const sub = totalsByCustomer[cid].subtotal;

        // Remise par paliers (tri descendant, premier match gagne)
        let disc = 0.0;
        const volumeTier = VOLUME_DISCOUNT_TIERS.find(
            tier => sub > tier.threshold && (!('requiresPremium' in tier && tier.requiresPremium) || level === 'PREMIUM'),
        );
        if (volumeTier) {
            disc = sub * volumeTier.rate;
        }

        // Bonus weekend (règle cachée basée sur la date)
        const firstOrderDate = totalsByCustomer[cid].items[0]?.date || '';
        const dayOfWeek = firstOrderDate ? new Date(firstOrderDate).getDay() : 0;
        if (WEEKEND_DAYS.includes(dayOfWeek)) {
            disc = disc * WEEKEND_DISCOUNT_BONUS;
        }

        // Calcul remise fidélité (tri descendant, premier match gagne)
        let loyaltyDiscount = 0.0;
        const pts = loyaltyPoints[cid] || 0;
        const loyaltyTier = LOYALTY_DISCOUNT_TIERS.find(tier => pts > tier.threshold);
        if (loyaltyTier) {
            loyaltyDiscount = Math.min(pts * loyaltyTier.rate, loyaltyTier.cap);
        }

        // Plafond de remise global (règle cachée)
        let totalDiscount = disc + loyaltyDiscount;
        if (totalDiscount > MAX_DISCOUNT) {
            totalDiscount = MAX_DISCOUNT;
            // On ajuste proportionnellement (logique complexe)
            const ratio = MAX_DISCOUNT / (disc + loyaltyDiscount);
            disc = disc * ratio;
            loyaltyDiscount = loyaltyDiscount * ratio;
        }

        // Calcul taxe (avec gestion spéciale par produit)
        const taxable = sub - totalDiscount;
        let tax = 0.0;

        // Vérifier si tous les produits sont taxables
        let allTaxable = true;
        for (const item of totalsByCustomer[cid].items) {
            const prod = products[item.product_id];
            if (prod && prod.taxable === false) {
                allTaxable = false;
                break;
            }
        }

        if (allTaxable) {
            tax = Math.round(taxable * TAX_RATE * 100) / 100; // Arrondi à 2 décimales
        } else {
            // Calcul taxe par ligne (plus complexe)
            for (const item of totalsByCustomer[cid].items) {
                const prod = products[item.product_id];
                if (prod && prod.taxable !== false) {
                    const itemTotal = item.qty * (prod.price || item.unit_price);
                    tax += itemTotal * TAX_RATE;
                }
            }
            tax = Math.round(tax * 100) / 100;
        }

        // Frais de port complexes (duplication #3)
        let ship = 0.0;
        const weight = totalsByCustomer[cid].weight;

        if (sub < FREE_SHIPPING_THRESHOLD) {
            const shipZone = shippingZones[zone] || { base: DEFAULT_SHIPPING_FEE, per_kg: DEFAULT_SHIPPING_PER_KG };
            const baseShip = shipZone.base;

            if (weight > HIGH_WEIGHT_THRESHOLD) {
                ship = baseShip + (weight - HIGH_WEIGHT_THRESHOLD) * shipZone.per_kg;
            } else if (weight > MID_WEIGHT_THRESHOLD) {
                ship = baseShip + (weight - MID_WEIGHT_THRESHOLD) * MID_WEIGHT_SURCHARGE_PER_KG;
            } else {
                ship = baseShip;
            }

            // Majoration pour livraison en zone éloignée
            if (REMOTE_ZONES.includes(zone)) {
                ship = ship * REMOTE_ZONE_SURCHARGE;
            }
        } else {
            // Livraison gratuite mais frais de manutention pour poids élevé
            if (weight > HEAVY_WEIGHT_THRESHOLD) {
                ship = (weight - HEAVY_WEIGHT_THRESHOLD) * HEAVY_WEIGHT_SURCHARGE_PER_KG;
            }
        }

        // Frais de gestion (paliers sur nombre d'items)
        let handling = 0.0;
        const itemCount = totalsByCustomer[cid].items.length;
        if (itemCount > HANDLING_ITEM_THRESHOLD) {
            handling = HANDLING_FEE;
        }
        if (itemCount > HANDLING_DOUBLE_THRESHOLD) {
            handling = HANDLING_FEE * 2;
        }

        // Conversion devise (fallback sur devise par défaut si inconnue)
        const currencyRate = CURRENCY_RATES[currency] ?? CURRENCY_RATES[DEFAULT_CURRENCY];

        const total = Math.round((taxable + tax + ship + handling) * currencyRate * 100) / 100;
        grandTotal += total;
        totalTaxCollected += tax * currencyRate;


        outputLines.push(`Customer: ${name} (${cid})`);
        outputLines.push(`Level: ${level} | Zone: ${zone} | Currency: ${currency}`);
        outputLines.push(`Subtotal: ${sub.toFixed(2)}`);
        outputLines.push(`Discount: ${totalDiscount.toFixed(2)}`);
        outputLines.push(`  - Volume discount: ${disc.toFixed(2)}`);
        outputLines.push(`  - Loyalty discount: ${loyaltyDiscount.toFixed(2)}`);
        if (totalsByCustomer[cid].morningBonus > 0) {
            outputLines.push(`  - Morning bonus: ${totalsByCustomer[cid].morningBonus.toFixed(2)}`);
        }
        outputLines.push(`Tax: ${(tax * currencyRate).toFixed(2)}`);
        outputLines.push(`Shipping (${zone}, ${weight.toFixed(1)}kg): ${ship.toFixed(2)}`);
        if (handling > 0) {
            outputLines.push(`Handling (${itemCount} items): ${handling.toFixed(2)}`);
        }
        outputLines.push(`Total: ${total.toFixed(2)} ${currency}`);
        outputLines.push(`Loyalty Points: ${Math.floor(pts)}`);
        outputLines.push('');

        // Export JSON en parallèle (side effect)
        jsonData.push({
            customer_id: cid,
            name: name,
            total: total,
            currency: currency,
            loyalty_points: Math.floor(pts)
        });
    }

    outputLines.push(`Grand Total: ${grandTotal.toFixed(2)} EUR`);
    outputLines.push(`Total Tax Collected: ${totalTaxCollected.toFixed(2)} EUR`);

    const result = outputLines.join('\n');

    // Side effects: print + file write
    console.log(result);

    // Export JSON surprise
    const outputPath = path.join(__dirname, 'output.json');
    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));

    return result;
}

// Point d'entrée
if (require.main === module) {
    run();
}

export { run };
