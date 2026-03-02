import { describe, expect, it } from 'vitest';

import {
    SAJU_SCHEMA_VERSION,
    createCurrentSchemaSajuData,
    migrateSajuDataToCurrentSchema,
    needsSajuDataMigration,
    normalizeSajuData,
} from '@/lib/saju-schema';
import type { SajuData } from '@/types';

function createBaseSajuData(overrides: Partial<SajuData> = {}): SajuData {
    return {
        birthDate: '1990-01-01',
        gender: 'M',
        fourPillars: {
            year: { heavenlyStem: '甲', earthlyBranch: '子' },
            month: { heavenlyStem: '丙', earthlyBranch: '寅' },
            day: { heavenlyStem: '庚', earthlyBranch: '午' },
            hour: { heavenlyStem: '壬', earthlyBranch: '申' },
        },
        ...overrides,
    };
}

describe('saju schema helpers', () => {
    it('normalizes missing schemaVersion to legacy version', () => {
        const normalized = normalizeSajuData(createBaseSajuData());

        expect(normalized.schemaVersion).toBe(0);
    });

    it('stamps current schema version for new records', () => {
        const data = createCurrentSchemaSajuData(createBaseSajuData());

        expect(data.schemaVersion).toBe(SAJU_SCHEMA_VERSION);
    });

    it('detects and migrates legacy records', () => {
        const legacy = createBaseSajuData({ schemaVersion: 0 });

        expect(needsSajuDataMigration(legacy)).toBe(true);

        const migrated = migrateSajuDataToCurrentSchema(legacy);
        expect(migrated.schemaVersion).toBe(SAJU_SCHEMA_VERSION);
        expect(needsSajuDataMigration(migrated)).toBe(false);
    });
});
