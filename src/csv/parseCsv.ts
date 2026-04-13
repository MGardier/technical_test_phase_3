import { TCsvRowMapper } from '../types/types';
import * as fs from 'fs';


export function parseCsv<T>(
    filePath : string ,
    mapRow :TCsvRowMapper<T>,
    isOptional : boolean = false  
): T[] {
    
    let data: string;
    try {
        data = fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
        if (isOptional) return [];
        throw e;
    }

    const lines = data.split('\n').filter(l => l.trim());
    const result: T[] = [];
    for (let i = 1; i < lines.length; i++) {
        try {
            result.push(mapRow(lines[i].split(',')));
        } catch {
            continue;
        }
    }
    return result;
}
