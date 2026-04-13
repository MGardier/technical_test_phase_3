import * as path from 'path';
import { CsvData } from '../types';
import { toRecord } from '../utils';

import {
    mapCustomer,
    mapOrder,
    mapProduct,
    mapPromotion,
    mapShippingZone,
} from './mappers';
import { parseCsv } from './parseCsv';


export function loadCsvData(dataDir: string): CsvData {
    const resolve = (filename: string) => path.join(dataDir, filename);

    return {
        customers: toRecord(
            parseCsv(resolve('customers.csv'), mapCustomer),
            c => c.id,
        ),
        products: toRecord(
            parseCsv(resolve('products.csv'), mapProduct),
            p => p.id,
        ),
        shippingZones: toRecord(
            parseCsv(resolve('shipping_zones.csv'), mapShippingZone),
            z => z.zone,
        ),
        promotions: toRecord(
            parseCsv(resolve('promotions.csv'), mapPromotion, true),
            p => p.code,
        ),
        orders: parseCsv(resolve('orders.csv'), mapOrder),
    };
}
