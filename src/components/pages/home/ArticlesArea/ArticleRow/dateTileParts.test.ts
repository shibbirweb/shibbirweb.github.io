import { describe, expect, it } from 'vitest';
import { dateTileParts } from '@/components/pages/home/ArticlesArea/ArticleRow/dateTileParts';

describe('dateTileParts', () => {
    it('splits a date into an upper-case month, a padded day and the year', () => {
        expect(dateTileParts('2026-08-01')).toEqual({
            month: 'AUG',
            day: '01',
            year: '2026',
        });
    });

    it('keeps two digit days as they are', () => {
        expect(dateTileParts('2026-07-10')).toEqual({
            month: 'JUL',
            day: '10',
            year: '2026',
        });
    });

    it('reads the authored date in UTC, so the last day of a year stays put', () => {
        expect(dateTileParts('2025-12-31')).toEqual({
            month: 'DEC',
            day: '31',
            year: '2025',
        });
    });

    it.each(['', 'not-a-date', '2026-13-45'])(
        'returns null for a missing or malformed date (%j)',
        (value) => {
            expect(dateTileParts(value)).toBeNull();
        }
    );
});
