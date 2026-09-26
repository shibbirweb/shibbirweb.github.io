import { afterEach, describe, expect, it } from 'vitest';
import { formatDate } from '@/utils/formatDate';

const originalTimeZone = process.env.TZ;

afterEach(() => {
    process.env.TZ = originalTimeZone;
});

describe('formatDate', () => {
    it('formats an ISO date as a short US label', () => {
        expect(formatDate('2026-08-01')).toBe('Aug 1, 2026');
    });

    it('reads back the authored day west of UTC (no off-by-one)', () => {
        process.env.TZ = 'America/Los_Angeles';
        // Precondition: in this zone the UTC-midnight instant is the previous day.
        expect(new Date('2026-08-01T00:00:00Z').getDate()).toBe(31);
        expect(formatDate('2026-08-01')).toBe('Aug 1, 2026');
    });

    it('reads back the authored day east of UTC (no off-by-one)', () => {
        process.env.TZ = 'Asia/Dhaka';
        expect(formatDate('2026-01-01')).toBe('Jan 1, 2026');
    });

    it('returns an empty string for a missing or malformed date', () => {
        expect(formatDate('')).toBe('');
        expect(formatDate('someday')).toBe('');
    });
});
