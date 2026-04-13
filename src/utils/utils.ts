
export function toRecord<T>(items: T[], getKey: (item: T) => string): Record<string, T> {
    const record: Record<string, T> = {};
    for (const item of items) {
        record[getKey(item)] = item;
    }
    return record;
}