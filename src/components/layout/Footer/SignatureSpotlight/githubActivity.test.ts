import { describe, expect, it } from 'vitest';
import {
    DAY_TEXTURE_DEPTH,
    decodeCachedActivity,
    encodeCachedActivity,
    isActivityFresh,
    keepRecentDays,
    mapDaysToCells,
    parseContributionLevels,
    toLocalIsoDate,
} from '@/components/layout/Footer/SignatureSpotlight/githubActivity';

describe('parseContributionLevels', () => {
    it('returns one level per day, oldest first', () => {
        expect(
            parseContributionLevels({
                total: { lastYear: 5 },
                contributions: [
                    { date: '2026-01-03', count: 4, level: 2 },
                    { date: '2026-01-01', count: 0, level: 0 },
                    { date: '2026-01-02', count: 9, level: 4 },
                ],
            })
        ).toEqual([0, 4, 2]);
    });

    it('rejects missing, empty or malformed responses', () => {
        expect(parseContributionLevels(null)).toBeNull();
        expect(parseContributionLevels({})).toBeNull();
        expect(parseContributionLevels({ contributions: [] })).toBeNull();
        expect(parseContributionLevels({ contributions: 'nope' })).toBeNull();
        expect(
            parseContributionLevels({
                contributions: [{ date: '2026-01-01', level: 7 }],
            })
        ).toBeNull();
        expect(
            parseContributionLevels({
                contributions: [{ date: '2026-01-01' }],
            })
        ).toBeNull();
    });
});

describe('cached activity', () => {
    it('round-trips through encode and decode', () => {
        const raw = encodeCachedActivity([0, 1, 4, 2], 1234);
        expect(decodeCachedActivity(raw)).toEqual({
            savedAt: 1234,
            levels: [0, 1, 4, 2],
        });
    });

    it('packs the levels as a short digit string', () => {
        expect(encodeCachedActivity([0, 1, 4], 1)).toBe(
            '{"savedAt":1,"levels":"014"}'
        );
    });

    it('ignores missing or corrupt entries', () => {
        expect(decodeCachedActivity(null)).toBeNull();
        expect(decodeCachedActivity('not json')).toBeNull();
        expect(
            decodeCachedActivity('{"savedAt":"1","levels":"01"}')
        ).toBeNull();
        expect(decodeCachedActivity('{"savedAt":1,"levels":"09"}')).toBeNull();
        expect(decodeCachedActivity('{"savedAt":1,"levels":""}')).toBeNull();
    });
});

describe('isActivityFresh', () => {
    const fourHours = 4 * 60 * 60 * 1000;

    it('is fresh inside the max age and stale after it', () => {
        expect(isActivityFresh(0, fourHours - 1, fourHours)).toBe(true);
        expect(isActivityFresh(0, fourHours, fourHours)).toBe(false);
    });

    it('treats a time stamp from the future as stale', () => {
        expect(isActivityFresh(10, 5, fourHours)).toBe(false);
    });
});

describe('mapDaysToCells', () => {
    // One row of 31 columns (x 0..30), so three days get ten columns each.
    const cells = Array.from({ length: 31 }, (_, column) => ({
        x: column,
        y: 0,
    }));
    const levelAt = (levels: number[], x: number) => levels[x];

    it('gives the middle of each day its real level, oldest on the left', () => {
        const levels = mapDaysToCells(cells, [4, 0, 2]);
        expect(levelAt(levels, 0)).toBeGreaterThanOrEqual(
            4 * (1 - DAY_TEXTURE_DEPTH)
        );
        expect(levelAt(levels, 15)).toBe(0);
        expect(levelAt(levels, 30)).toBeGreaterThanOrEqual(
            2 * (1 - DAY_TEXTURE_DEPTH)
        );
        expect(levelAt(levels, 30)).toBeLessThanOrEqual(2);
    });

    it('softens the border between a busy and a quiet day', () => {
        const levels = mapDaysToCells(cells, [0, 4, 0]);
        // Deep inside the quiet days nothing lights up.
        expect(levelAt(levels, 2)).toBe(0);
        expect(levelAt(levels, 28)).toBe(0);
        // At the borders (x 10 and 20) the level sits between the two days.
        for (const border of [10, 20]) {
            expect(levelAt(levels, border)).toBeGreaterThan(0.5);
            expect(levelAt(levels, border)).toBeLessThan(3.5);
        }
    });

    it('never goes above the busier of the two neighbouring days', () => {
        const levels = mapDaysToCells(cells, [1, 3, 2]);
        levels.forEach((level) => {
            expect(level).toBeGreaterThanOrEqual(0);
            expect(level).toBeLessThanOrEqual(3);
        });
    });

    it('is deterministic for the same data', () => {
        expect(mapDaysToCells(cells, [1, 2, 3])).toEqual(
            mapDaysToCells(cells, [1, 2, 3])
        );
    });

    it('returns all zeros when there are no days or cells', () => {
        expect(mapDaysToCells(cells, [])).toEqual(new Array(31).fill(0));
        expect(mapDaysToCells([], [1, 2])).toEqual([]);
    });

    it('is all zeros when every day was quiet', () => {
        expect(mapDaysToCells(cells, [0, 0, 0])).toEqual(new Array(31).fill(0));
    });
});

describe('recent days', () => {
    it('skips days after the last date', () => {
        expect(
            parseContributionLevels(
                {
                    contributions: [
                        { date: '2026-01-01', level: 1 },
                        { date: '2026-01-02', level: 2 },
                        { date: '2026-01-03', level: 3 },
                    ],
                },
                '2026-01-02'
            )
        ).toEqual([1, 2]);
    });

    it('keeps only the newest days', () => {
        expect(keepRecentDays([0, 1, 2, 3, 4], 3)).toEqual([2, 3, 4]);
        expect(keepRecentDays([1, 2], 30)).toEqual([1, 2]);
    });

    it('formats a local date the way the proxy does', () => {
        expect(toLocalIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
    });
});
