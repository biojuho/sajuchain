import type { SajuData } from '@/types';

export const SAJU_SCHEMA_VERSION = 1;
const LEGACY_SCHEMA_VERSION = 0;

export function normalizeSajuData(data: SajuData): SajuData {
    return {
        ...data,
        schemaVersion: typeof data.schemaVersion === 'number'
            ? data.schemaVersion
            : LEGACY_SCHEMA_VERSION,
    };
}

export function createCurrentSchemaSajuData(data: SajuData): SajuData {
    return {
        ...normalizeSajuData(data),
        schemaVersion: SAJU_SCHEMA_VERSION,
    };
}

export function needsSajuDataMigration(data: SajuData): boolean {
    return normalizeSajuData(data).schemaVersion !== SAJU_SCHEMA_VERSION;
}

export function migrateSajuDataToCurrentSchema(data: SajuData): SajuData {
    return createCurrentSchemaSajuData(data);
}
